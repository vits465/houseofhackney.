import express from "express";
import dotenv from "dotenv";
import { handleCreateOrder, handleVerifyPayment } from "./server/razorpay.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", service: "Razorpay Checkout Backend" });
});

/**
 * STEP 1: BACKEND - Create Order
 * Endpoint: POST /api/create-order
 * Request: { amount (paise), currency, receipt }
 * Return: { order_id, amount, currency }
 * Minimum amount: 100 paise
 */
app.post("/api/create-order", async (req, res) => {
  try {
    const { amount, currency, receipt } = req.body;
    const order = await handleCreateOrder({ amount, currency, receipt });
    return res.status(200).json(order);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message,
      error: error.message,
    });
  }
});

/**
 * STEP 3: BACKEND - Verify Signature
 * Endpoint: POST /api/verify-payment
 * Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * Compare generated signature with razorpay_signature
 * Return success only if signatures match
 */
app.post("/api/verify-payment", (req, res) => {
  try {
    const order_id = req.body.order_id || req.body.razorpay_order_id;
    const payment_id = req.body.payment_id || req.body.razorpay_payment_id;
    const razorpay_signature = req.body.razorpay_signature || req.body.signature;

    const result = handleVerifyPayment({ order_id, payment_id, razorpay_signature });
    return res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    return res.status(status).json({
      success: false,
      message: error.message,
      error: error.message,
    });
  }
});

// Start server if run directly
const isDirectRun = process.argv[1] && (process.argv[1].endsWith("server.js") || process.argv[1].includes("server"));
if (isDirectRun && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Razorpay backend server running on http://localhost:${PORT}`);
  });
}

export default app;
