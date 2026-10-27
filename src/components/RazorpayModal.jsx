import { useEffect } from "react";
import { initiateRazorpayCheckout } from "../services/razorpayFrontend";

/**
 * Razorpay Standard Web Checkout Component
 * Triggers official Razorpay payment modal with order creation and signature verification
 */
export default function RazorpayModal({
  isOpen,
  onClose,
  amount,
  currency = "INR",
  user = null,
  shippingAddress = null,
  onSuccess,
}) {
  useEffect(() => {
    if (isOpen) {
      initiateRazorpayCheckout({
        amount,
        currency,
        user,
        shippingAddress,
        onSuccess: (paymentData) => {
          if (onSuccess) {
            onSuccess(paymentData);
          }
          if (onClose) {
            onClose();
          }
        },
        onError: (err) => {
          console.error("Razorpay Checkout Error:", err);
          if (onClose) {
            onClose();
          }
        },
        onDismiss: () => {
          if (onClose) {
            onClose();
          }
        },
      });
    }
  }, [isOpen, amount, currency, user, onSuccess, onClose]);

  return null;
}
