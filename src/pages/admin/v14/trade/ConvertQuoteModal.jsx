import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, Truck, CreditCard } from "lucide-react";
import { useAdmin } from "../../AdminContext";

export default function ConvertQuoteModal({ quote, isOpen, onClose }) {
  const { theme, tradeCredit, convertQuoteToOrder } = useAdmin();
  const isDark = theme === "dark";

  const [shippingAddress, setShippingAddress] = useState({
    street: "14 Kensington Church Street",
    city: "London",
    postalCode: "W8 4EP",
    country: "United Kingdom",
    recipientName: "Kensington Heritage Procurement",
    phone: "+44 20 7946 0912",
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen || !quote) return null;

  const totalAmount = quote.grandTotal || quote.negotiatedSubtotal || quote.subtotal || 0;
  const availableCredit = tradeCredit?.availableCredit || 36420;
  const hasEnoughCredit = availableCredit >= totalAmount;

  const handleConvert = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await convertQuoteToOrder(quote._id, shippingAddress);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden z-10 flex flex-col ${
            isDark
              ? "bg-[#141a15] border-[#253327] text-[#f2f7f3]"
              : "bg-white border-[#dce8df] text-[#142617]"
          }`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-inherit flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#3e7b52]/15 text-[#3e7b52] flex items-center justify-center">
                <CheckCircle size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">Convert Quotation to Order</h3>
                <p className="text-xs text-[#627766] mt-0.5">
                  Confirm shipping details for {quote.quoteNumber}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? "hover:bg-[#1d271f] text-[#859b89]" : "hover:bg-[#edf6f0] text-[#627766]"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleConvert} className="p-6 space-y-4.5">
            {/* Credit Line Status Bar */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                hasEnoughCredit
                  ? isDark
                    ? "bg-[#1d271f] border-[#2e3f31] text-[#9db3a1]"
                    : "bg-[#edf6f0] border-[#d4e6d7] text-[#2c5237]"
                  : "bg-rose-50 border-rose-200 text-rose-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <CreditCard size={15} />
                <span>
                  Available B2B Credit: <strong>£{availableCredit.toLocaleString()}</strong>
                </span>
              </div>
              <span className="font-bold text-[#3e7b52]">
                Order Total: £{totalAmount.toLocaleString()}
              </span>
            </div>

            {/* Shipping Address Inputs */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#627766]">
                <Truck size={14} /> Shipping Destination
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#627766] mb-1">
                  Recipient / Attention
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.recipientName}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, recipientName: e.target.value })
                  }
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark
                      ? "bg-[#1f2c21] border-[#314633] text-white"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#627766] mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={shippingAddress.street}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, street: e.target.value })
                  }
                  className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                    isDark
                      ? "bg-[#1f2c21] border-[#314633] text-white"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                  }`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#627766] mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark
                        ? "bg-[#1f2c21] border-[#314633] text-white"
                        : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-[#627766] mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                    }
                    className={`w-full px-3 py-2 text-xs rounded-lg border outline-none ${
                      isDark
                        ? "bg-[#1f2c21] border-[#314633] text-white"
                        : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Terms Notice */}
            <p className="text-[11px] text-[#627766] leading-relaxed">
              Upon conversion, this order will be scheduled for atelier fulfillment under your
              approved payment terms (<strong>{tradeCredit?.paymentTerm || "NET_30"}</strong>).
              Your credit limit will be reserved immediately.
            </p>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-inherit">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                  isDark
                    ? "border-[#2e3f31] text-[#9db3a1] hover:text-white"
                    : "border-[#d8e6dc] text-[#526956] hover:text-[#142617]"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <CheckCircle size={14} />
                {loading ? "Converting..." : "Confirm & Place Order"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
