import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, Send, ShoppingBag } from "lucide-react";
import { useAdmin } from "../../AdminContext";
import { showToast } from "../../../../utils/sweetAlert";

const CATALOG_ITEMS = [
  { id: "prod_01", name: "ARTEMIS Wallpaper - Wild Flora Noir", category: "Wallpaper", retailPrice: 220, unit: "Roll" },
  { id: "prod_02", name: "BABYLON Velvet Upholstery - Moss Green", category: "Fabric", retailPrice: 185, unit: "Meter" },
  { id: "prod_03", name: "TRELLIS Silk Fringe Cushion - Heritage Gold", category: "Accessories", retailPrice: 160, unit: "Piece" },
  { id: "prod_04", name: "PHANTASIA Jacquard Fabric - Sage Lapis", category: "Fabric", retailPrice: 240, unit: "Meter" },
  { id: "prod_05", name: "HOLLYHOCKS British Heritage Velvet - Spring", category: "Fabric", retailPrice: 210, unit: "Meter" },
  { id: "prod_06", name: "ZELLIGE Handcrafted Tile - Emerald Gloss", category: "Tiles", retailPrice: 195, unit: "Sq Metre" },
];

export default function RequestQuoteModal({ isOpen, onClose, initialProduct = null }) {
  const { theme, tradeProfile, requestQuote, products } = useAdmin();
  const isDark = theme === "dark";

  const discountPercent = tradeProfile?.tier?.discountPercentage || 25;

  const catalogOptions = useMemo(() => {
    if (products && products.length > 0) {
      return products.map((p) => ({
        id: p._id || p.id,
        name: p.name || p.title,
        category: typeof p.category === "string" ? p.category : p.category?.name || "Decor",
        retailPrice: Number(p.pricing?.retailPrice || p.price || 195),
        unit: "Roll / Piece",
      }));
    }
    return CATALOG_ITEMS;
  }, [products]);

  const [items, setItems] = useState([
    {
      productId: "prod_01",
      name: "ARTEMIS Wallpaper - Wild Flora Noir",
      unitPrice: 220,
      quantity: 10,
    },
  ]);
  const [customerNotes, setCustomerNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialProduct) {
      setItems([
        {
          productId: initialProduct._id || initialProduct.id,
          name: initialProduct.name,
          unitPrice: Number(initialProduct.pricing?.retailPrice || initialProduct.price || 220),
          quantity: 5,
        },
      ]);
    } else if (items.length === 0 || items[0]?.productId === "prod_01") {
      const first = catalogOptions[0] || CATALOG_ITEMS[0];
      setItems([
        {
          productId: first.id,
          name: first.name,
          unitPrice: first.retailPrice,
          quantity: 10,
        },
      ]);
    }
  }, [isOpen, initialProduct]);

  if (!isOpen) return null;

  const addItemRow = () => {
    const available = catalogOptions.find((c) => !items.some((i) => i.productId === c.id)) || catalogOptions[0];
    setItems((prev) => [
      ...prev,
      {
        productId: available.id,
        name: available.name,
        unitPrice: available.retailPrice,
        quantity: 5,
      },
    ]);
  };

  const removeItemRow = (idx) => {
    if (items.length <= 1) {
      showToast("At least one product item is required for quotation.");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleProductChange = (idx, prodId) => {
    const selected = catalogOptions.find((c) => c.id === prodId) || CATALOG_ITEMS.find((c) => c.id === prodId);
    if (!selected) return;
    setItems((prev) =>
      prev.map((item, i) =>
        i === idx
          ? {
              ...item,
              productId: selected.id,
              name: selected.name,
              unitPrice: selected.retailPrice,
            }
          : item
      )
    );
  };

  const handleQtyChange = (idx, qty) => {
    const validQty = Math.max(1, parseInt(qty) || 1);
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, quantity: validQty } : item))
    );
  };

  const retailSubtotal = items.reduce(
    (acc, it) => acc + (it.unitPrice || 0) * (it.quantity || 1),
    0
  );
  const tradeEstSubtotal = retailSubtotal * (1 - discountPercent / 100);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await requestQuote({
        items: items.map((it) => ({
          product: it.productId,
          name: it.name,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          total: it.unitPrice * it.quantity,
        })),
        customerNotes,
      });
      onClose();
    } finally {
      setSubmitting(false);
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
          className={`relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden z-10 max-h-[90vh] flex flex-col ${
            isDark
              ? "bg-[#141a15] border-[#253327] text-[#f2f7f3]"
              : "bg-white border-[#dce8df] text-[#142617]"
          }`}
        >
          
          <div className="px-6 py-5 border-b border-inherit flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#3e7b52]/15 text-[#3e7b52] flex items-center justify-center">
                <ShoppingBag size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">Request Trade Quotation</h3>
                <p className="text-xs text-[#627766] mt-0.5">
                  Exclusive B2B Atelier pricing & bespoke quantity concession
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

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
            {/* Patron Tier Discount Banner */}
            <div
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                isDark
                  ? "bg-[#1d271f] border-[#2e3f31] text-[#9db3a1]"
                  : "bg-[#edf6f0] border-[#d4e6d7] text-[#2c5237]"
              }`}
            >
              <span>
                Your Account Tier:{" "}
                <strong className="text-[#3e7b52] font-bold">
                  {tradeProfile?.tier?.displayName || "Trade Gold Patron"}
                </strong>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#3e7b52] text-white font-semibold text-[11px]">
                {discountPercent}% Wholesale Concession
              </span>
            </div>

            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#627766]">
                  Select Products & Desired Quantities
                </label>
                <button
                  type="button"
                  onClick={addItemRow}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#3e7b52] hover:underline"
                >
                  <Plus size={14} /> Add Product
                </button>
              </div>

              <div className="space-y-2.5">
                {items.map((row, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                      isDark
                        ? "bg-[#182119] border-[#243326]"
                        : "bg-[#f9fbf9] border-[#e2ece4]"
                    }`}
                  >
                    {/* Product Select */}
                    <div className="flex-1 min-w-[200px]">
                      <select
                        value={row.productId}
                        onChange={(e) => handleProductChange(idx, e.target.value)}
                        className={`w-full px-3 py-2 text-xs rounded-lg border outline-none font-medium ${
                          isDark
                            ? "bg-[#1f2c21] border-[#314633] text-white"
                            : "bg-white border-[#d8e6dc] text-[#142617]"
                        }`}
                      >
                        {CATALOG_ITEMS.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} (£{cat.retailPrice} / {cat.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="w-24">
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={row.quantity}
                          onChange={(e) => handleQtyChange(idx, e.target.value)}
                          className={`w-full px-3 py-2 text-xs rounded-lg border outline-none font-bold text-center ${
                            isDark
                              ? "bg-[#1f2c21] border-[#314633] text-white"
                              : "bg-white border-[#d8e6dc] text-[#142617]"
                          }`}
                        />
                      </div>
                    </div>

                    
                    <div className="w-24 text-right">
                      <p className="text-xs font-bold text-[#3e7b52]">
                        £{(row.unitPrice * row.quantity).toLocaleString()}
                      </p>
                      <p className="text-[10px] text-[#627766]">Retail est.</p>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => removeItemRow(idx)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Remove product"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#627766] mb-1.5">
                Project Scope & Delivery Notes (Optional)
              </label>
              <textarea
                rows="3"
                value={customerNotes}
                onChange={(e) => setCustomerNotes(e.target.value)}
                placeholder="e.g. Specifying for Kensington boutique residential salon. Required delivery by early November. Bespoke fabric swatch requested."
                className={`w-full px-3.5 py-2.5 text-xs rounded-xl border outline-none resize-none ${
                  isDark
                    ? "bg-[#182119] border-[#243326] text-white placeholder-[#556957]"
                    : "bg-[#f9fbf9] border-[#e2ece4] text-[#142617] placeholder-[#95a898]"
                }`}
              />
            </div>

            {/* Estimated Total Calculation */}
            <div
              className={`p-4 rounded-xl border space-y-2 ${
                isDark
                  ? "bg-[#1c271e] border-[#2c3d2e]"
                  : "bg-[#edf6f0] border-[#d4e6d7]"
              }`}
            >
              <div className="flex justify-between text-xs text-[#627766]">
                <span>Standard Retail Value:</span>
                <span>£{retailSubtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-[#3e7b52] font-medium">
                <span>Tier Trade Discount ({discountPercent}%):</span>
                <span>-£{(retailSubtotal - tradeEstSubtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-bold border-t border-inherit pt-2">
                <span>Estimated Quotation Total:</span>
                <span className="text-[#3e7b52]">
                  £{Math.round(tradeEstSubtotal).toLocaleString()}
                </span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2.5 rounded-full text-xs font-semibold border transition-colors ${
                  isDark
                    ? "border-[#2e3f31] text-[#9db3a1] hover:text-white"
                    : "border-[#d8e6dc] text-[#526956] hover:text-[#142617]"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2.5 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Send size={14} />
                {submitting ? "Submitting..." : "Submit Quotation Request"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
