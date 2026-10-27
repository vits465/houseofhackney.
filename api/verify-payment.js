import { handleVerifyPayment } from "../server/razorpay.js";

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed. Use POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const {
      order_id,
      payment_id,
      razorpay_signature,
      razorpay_order_id,
      razorpay_payment_id,
      signature,
    } = body;

    const resolvedOrderId = order_id || razorpay_order_id;
    const resolvedPaymentId = payment_id || razorpay_payment_id;
    const resolvedSignature = razorpay_signature || signature;

    const result = handleVerifyPayment({
      order_id: resolvedOrderId,
      payment_id: resolvedPaymentId,
      razorpay_signature: resolvedSignature,
    });

    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message,
      error: error.message,
    });
  }
}
