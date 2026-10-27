import Razorpay from "razorpay";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

function getRazorpayInstance() {
  const key_id = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret) {
    const error = new Error("Razorpay credentials are not configured in environment variables");
    error.statusCode = 500;
    throw error;
  }

  return new Razorpay({
    key_id,
    key_secret,
  });
}

/**
 * Creates a Razorpay Order
 * @param {Object} params - { amount, currency, receipt }
 * @returns {Promise<{ order_id: string, amount: number, currency: string, id: string }>}
 */
export async function handleCreateOrder({ amount, currency = "INR", receipt }) {
  if (amount === undefined || amount === null || isNaN(Number(amount))) {
    const error = new Error("Invalid amount parameter");
    error.statusCode = 400;
    throw error;
  }

  const numAmount = Math.round(Number(amount));

  if (numAmount < 100) {
    const error = new Error("Amount must be at least 100 paise");
    error.statusCode = 400;
    throw error;
  }

  try {
    const razorpay = getRazorpayInstance();
    const orderOptions = {
      amount: numAmount,
      currency: currency || "INR",
      receipt: receipt || `receipt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };

    const order = await razorpay.orders.create(orderOptions);

    return {
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      id: order.id,
    };
  } catch (error) {
    // Check if error is authentication failure (401)
    if (
      error.statusCode === 401 ||
      error.status === 401 ||
      (error.error && error.error.code === "BAD_REQUEST_ERROR" && error.statusCode === 401) ||
      error.message?.toLowerCase().includes("auth")
    ) {
      const authErr = new Error("Razorpay authentication failed");
      authErr.statusCode = 401;
      throw authErr;
    }

    if (!error.statusCode) {
      error.statusCode = 500;
    }
    throw error;
  }
}

/**
 * Verifies Razorpay payment signature
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * @param {Object} params - { order_id, payment_id, razorpay_signature }
 * @returns {{ success: boolean, message: string }}
 */
export function handleVerifyPayment({ order_id, payment_id, razorpay_signature }) {
  if (!order_id || !payment_id || !razorpay_signature) {
    const error = new Error("Missing required fields: order_id, payment_id, and razorpay_signature are required");
    error.statusCode = 400;
    throw error;
  }

  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_secret) {
    const error = new Error("RAZORPAY_KEY_SECRET is not configured");
    error.statusCode = 500;
    throw error;
  }

  const generated_signature = crypto
    .createHmac("sha256", key_secret)
    .update(`${order_id}|${payment_id}`)
    .digest("hex");

  if (generated_signature !== razorpay_signature) {
    const error = new Error("Payment signature verification failed");
    error.statusCode = 400;
    throw error;
  }

  return {
    success: true,
    message: "Payment signature verified successfully",
    order_id,
    payment_id,
  };
}
