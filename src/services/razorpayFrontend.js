import axios from "axios";
import { showError, showToast, showLoading, closeAlert } from "../utils/sweetAlert";

/**
 * Ensures Razorpay Checkout script is loaded
 */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Calls backend to create Razorpay Order
 * Endpoint: POST /api/create-order
 * @param {Object} params - { amount, currency, receipt }
 * @returns {Promise<{ order_id: string, amount: number, currency: string }>}
 */
export async function createRazorpayOrder({ amount, currency = "INR", receipt }) {
  // Amount in subunits (paise) - minimum 100 paise
  const amountInPaise = Math.max(100, Math.round(Number(amount)));

  try {
    const response = await axios.post("/api/create-order", {
      amount: amountInPaise,
      currency: currency || "INR",
      receipt: receipt || `rcpt_${Date.now()}`,
    });

    const data = response.data;
    const order_id = data.order_id || data.id;

    if (!order_id) {
      throw new Error(data.message || "Failed to obtain order_id from backend");
    }

    return {
      order_id,
      amount: data.amount,
      currency: data.currency || currency,
    };
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Error creating Razorpay order";
    throw new Error(errorMsg);
  }
}

/**
 * Calls backend to verify payment signature
 * Endpoint: POST /api/verify-payment
 * @param {Object} paymentData - { order_id, payment_id, razorpay_signature }
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function verifyRazorpayPayment({ order_id, payment_id, razorpay_signature }) {
  try {
    const response = await axios.post("/api/verify-payment", {
      order_id,
      payment_id,
      razorpay_signature,
      razorpay_order_id: order_id,
      razorpay_payment_id: payment_id,
    });

    return response.data;
  } catch (error) {
    const errorMsg =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Payment verification failed";
    throw new Error(errorMsg);
  }
}

/**
 * Initiates Razorpay Standard Web Checkout
 * @param {Object} options
 * @param {number} options.amount - In rupees or currency units (will be converted to paise)
 * @param {string} options.currency - e.g. "INR", "GBP"
 * @param {Object} options.user - Logged in user info for prefill
 * @param {Function} options.onSuccess - Callback on verified success
 * @param {Function} options.onError - Callback on failure or verification error
 * @param {Function} options.onDismiss - Callback when user closes/dismisses modal
 */
export async function initiateRazorpayCheckout({
  amount,
  currency = "INR",
  user = null,
  shippingAddress = null,
  onSuccess,
  onError,
  onDismiss,
}) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded || !window.Razorpay) {
    const err = new Error("Razorpay SDK failed to load. Please check your internet connection.");
    showError("Payment Gateway Error", err.message);
    if (onError) onError(err);
    return;
  }

  const keyId = import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    const err = new Error("Razorpay Key ID is not configured (VITE_RAZORPAY_KEY_ID missing in .env).");
    showError("Configuration Missing", err.message);
    if (onError) onError(err);
    return;
  }

  showLoading("Initiating secure payment...");

  try {
    // 1. Convert amount to paise (subunits)
    // If amount is small (e.g. 50.00), multiply by 100 => 5000 paise
    // If amount is already in subunits (>= 100 paise), keep it
    const amountInPaise = amount < 100 ? Math.round(amount * 100) : Math.round(amount * 100);
    const finalPaise = Math.max(100, amountInPaise);

    // 2. Call backend create-order endpoint
    const order = await createRazorpayOrder({
      amount: finalPaise,
      currency,
      receipt: `rcpt_${Date.now()}`,
    });

    closeAlert();

    // 3. Configure Razorpay modal options
    const patronName =
      shippingAddress?.fullName ||
      (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.name || "House of Hackney Patron");
    const patronEmail = shippingAddress?.email || user?.email || "patron@houseofhackney.com";
    const patronPhone = shippingAddress?.phone || user?.phone || "9999999999";

    const options = {
      key: keyId,
      amount: order.amount,
      currency: order.currency,
      name: "House of Hackney London",
      description: "Luxury Furnishings & Wallpapers",
      image: "/favicon.svg",
      order_id: order.order_id,
      handler: async function (response) {
        showLoading("Verifying payment signature...");

        try {
          // Send razorpay_payment_id, razorpay_order_id, razorpay_signature to verify endpoint
          const verifyResult = await verifyRazorpayPayment({
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          closeAlert();

          if (verifyResult.success) {
            if (onSuccess) {
              onSuccess({
                ...response,
                order_id: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                amount: order.amount,
                currency: order.currency,
                method: "RAZORPAY",
              });
            }
          } else {
            throw new Error(verifyResult.message || "Payment verification failed");
          }
        } catch (verifyError) {
          closeAlert();
          showError("Verification Failed", verifyError.message || "Payment signature could not be verified.");
          if (onError) onError(verifyError);
        }
      },
      prefill: {
        name: patronName,
        email: patronEmail,
        contact: patronPhone,
      },
      notes: {
        address: shippingAddress?.addressLine1
          ? `${shippingAddress.addressLine1}, ${shippingAddress.city || ""} ${shippingAddress.postalCode || ""}`.trim()
          : "House of Hackney London",
      },
      theme: {
        color: "#0c2340",
      },
      modal: {
        // Handle modal dismiss (user cancelled)
        ondismiss: function () {
          closeAlert();
          showToast("Payment window closed", "info");
          if (onDismiss) onDismiss();
        },
      },
    };

    const rzp = new window.Razorpay(options);

    // Handle payment.failed event
    rzp.on("payment.failed", function (response) {
      closeAlert();
      const failureReason = response.error?.description || response.error?.reason || "Payment could not be completed.";
      showError("Payment Failed", failureReason);
      if (onError) onError(new Error(failureReason));
    });

    // Open Razorpay Standard Checkout modal
    rzp.open();
  } catch (error) {
    closeAlert();
    showError("Checkout Error", error.message || "Could not initialize checkout. Please try again.");
    if (onError) onError(error);
  }
}
