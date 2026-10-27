import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath, URL } from "node:url";
import dotenv from "dotenv";

dotenv.config();

function razorpayDevServerPlugin() {
  return {
    name: "razorpay-dev-server",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? req.url.split("?")[0] : "";
        if (req.method === "POST" && (url === "/api/create-order" || url === "/api/verify-payment")) {
          let body = "";
          req.on("data", (chunk) => {
            body += chunk;
          });
          req.on("end", async () => {
            try {
              const parsedBody = body ? JSON.parse(body) : {};
              res.setHeader("Content-Type", "application/json");

              if (url === "/api/create-order") {
                const { handleCreateOrder } = await import("./server/razorpay.js");
                const order = await handleCreateOrder(parsedBody);
                res.statusCode = 200;
                res.end(JSON.stringify(order));
              } else if (url === "/api/verify-payment") {
                const { handleVerifyPayment } = await import("./server/razorpay.js");
                const order_id = parsedBody.order_id || parsedBody.razorpay_order_id;
                const payment_id = parsedBody.payment_id || parsedBody.razorpay_payment_id;
                const razorpay_signature = parsedBody.razorpay_signature || parsedBody.signature;
                const result = handleVerifyPayment({ order_id, payment_id, razorpay_signature });
                res.statusCode = 200;
                res.end(JSON.stringify(result));
              }
            } catch (err) {
              res.statusCode = err.statusCode || 500;
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ success: false, message: err.message, error: err.message }));
            }
          });
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  // Ensure RAZORPAY keys are available in process.env for the dev server
  process.env.RAZORPAY_KEY_ID = env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID;
  process.env.RAZORPAY_KEY_SECRET = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

  return {
    plugins: [react(), tailwindcss(), razorpayDevServerPlugin()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
        components: fileURLToPath(new URL("./src/components", import.meta.url)),
        componets: fileURLToPath(new URL("./src/components", import.meta.url)),
      },
    },
  };
});