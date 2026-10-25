import { useState } from "react";
import { X, Printer, User, MapPin, Mail } from "lucide-react";
import { useAdmin } from "../AdminContext";

export default function OrderDetailModal() {
  const { selectedOrder, setSelectedOrder, theme, updateOrderStatus } =
    useAdmin();
  const isDark = theme === "dark";

  if (!selectedOrder) return null;

  const handleStatusChange = (newStatus) => {
    updateOrderStatus(selectedOrder.id, newStatus);
  };

  const subtotal = selectedOrder.items.reduce(
    (sum, i) => sum + i.price * i.qty,
    0
  );
  const vat = subtotal * 0.2;
  const shipping = 45.0;
  const grandTotal = subtotal + vat + shipping;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={() => setSelectedOrder(null)}
      />

      <div
        className={`relative w-full max-w-3xl max-h-[90vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isDark
            ? "bg-[#18201a] border-[#293a2c] text-[#f2f7f3]"
            : "bg-white border-[#e2ece4] text-[#1e2a21]"
        }`}
      >
        {/* Header */}
        <div
          className={`px-6 py-4 border-b flex items-center justify-between ${
            isDark ? "border-[#293a2c]" : "border-[#e5ede6]"
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono text-base font-bold text-[#3e7b52] dark:text-[#74b886]">
              {selectedOrder.id}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eaf5ed] text-[#347847]">
              {selectedOrder.client.tier}
            </span>
            <span
              className={`text-xs ${
                isDark ? "text-[#8a9d8e]" : "text-[#788c7e]"
              }`}
            >
              Placed {selectedOrder.timestamp}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className={`p-2 rounded-xl border text-xs transition-colors flex items-center gap-1.5 ${
                isDark
                  ? "bg-[#141a15] border-[#253327] hover:bg-[#212c23]"
                  : "bg-[#f5f9f6] border-[#d8e6dc] text-[#2d5538] hover:bg-[#eaf3ed]"
              }`}
              title="Print Order Sheet"
            >
              <Printer size={15} />
              <span className="hidden sm:inline">Print Sheet</span>
            </button>

            <button
              onClick={() => setSelectedOrder(null)}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark
                  ? "bg-[#141a15] border-[#253327]"
                  : "bg-[#f5f9f6] border-[#d8e6dc]"
              }`}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin">
          {/* Status Bar */}
          <div
            className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDark
                ? "bg-[#141a15] border-[#253327]"
                : "bg-[#f5f9f6] border-[#d8e6dc]"
            }`}
          >
            <div>
              <span className="text-[10px] font-mono tracking-widest uppercase text-[#3e7b52] dark:text-[#74b886] font-semibold">
                FULFILLMENT STATUS
              </span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#4a8b5e] animate-pulse" />
                <span className="font-sans font-bold text-base">
                  {selectedOrder.fulfillmentStatus}
                </span>
                <span className="text-xs opacity-60 font-mono">
                  ({selectedOrder.paymentStatus})
                </span>
              </div>
            </div>

            {/* Change Status Buttons */}
            <div className="flex items-center gap-1.5 text-xs font-sans">
              <span className="opacity-70 text-[11px] mr-1 hidden md:inline">
                Update:
              </span>
              {["In Production", "Dispatched", "Delivered"].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-full border font-semibold transition-all ${
                    selectedOrder.fulfillmentStatus === st
                      ? "bg-[#3e7b52] text-white border-[#3e7b52] shadow-sm shadow-[#3e7b52]/20"
                      : isDark
                      ? "bg-[#212c23] border-[#344737] text-[#8a9d8e] hover:text-[#f2f7f3]"
                      : "bg-white border-[#d8e6dc] text-[#2d5538] hover:bg-[#f2f8f4]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Patron Client Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 rounded-2xl border ${
                isDark
                  ? "bg-[#141a15] border-[#253327]"
                  : "bg-[#fcfdfc] border-[#e7f0e9]"
              }`}
            >
              <div className="flex items-center gap-2 mb-3 text-[10px] font-mono tracking-wider uppercase text-[#3e7b52] dark:text-[#74b886] font-semibold">
                <User size={13} />
                <span>Patron Credentials</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={selectedOrder.client.avatar}
                  alt={selectedOrder.client.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-[#4a8b5e]/40"
                />
                <div>
                  <h4 className="font-sans font-bold text-sm">
                    {selectedOrder.client.name}
                  </h4>
                  <p
                    className={`text-xs flex items-center gap-1.5 mt-0.5 ${
                      isDark ? "text-[#8a9d8e]" : "text-[#627766]"
                    }`}
                  >
                    <Mail size={12} />
                    <span>{selectedOrder.client.email}</span>
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 rounded-2xl border ${
                isDark
                  ? "bg-[#141a15] border-[#253327]"
                  : "bg-[#fcfdfc] border-[#e7f0e9]"
              }`}
            >
              <div className="flex items-center gap-2 mb-3 text-[10px] font-mono tracking-wider uppercase text-[#3e7b52] dark:text-[#74b886] font-semibold">
                <MapPin size={13} />
                <span>Delivery Address</span>
              </div>
              <p className="text-xs font-sans font-bold">
                {selectedOrder.client.location}
              </p>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  isDark ? "text-[#8a9d8e]" : "text-[#627766]"
                }`}
              >
                {selectedOrder.notes ||
                  "Standard insured atelier courier delivery."}
              </p>
            </div>
          </div>

          {/* Ordered Items List */}
          <div>
            <h4 className="text-xs font-mono tracking-widest uppercase text-[#3e7b52] dark:text-[#74b886] mb-3 font-semibold">
              PIECES & CREATIONS ({selectedOrder.items.length})
            </h4>
            <div className="space-y-2.5">
              {selectedOrder.items.map((item, idx) => (
                <div
                  key={idx}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border ${
                    isDark
                      ? "bg-[#141a15] border-[#253327]"
                      : "bg-[#fcfdfc] border-[#e7f0e9]"
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src =
                          "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0";
                      }}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-black/10 bg-black/5"
                    />
                    <div>
                      <p className="text-sm font-sans font-bold text-[#1e2a21] dark:text-[#f2f7f3]">
                        {item.name}
                      </p>
                      <span className="text-xs font-mono text-[#3e7b52] dark:text-[#74b886]">
                        {item.variant}
                      </span>
                      <p
                        className={`text-xs mt-0.5 ${
                          isDark ? "text-[#8a9d8e]" : "text-[#627766]"
                        }`}
                      >
                        Qty: {item.qty} &times; £{item.price.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <span className="font-mono font-bold text-sm">
                    £{(item.price * item.qty).toLocaleString("en-GB", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Breakdown Summary */}
          <div
            className={`p-4 rounded-2xl border space-y-2 text-xs font-mono ${
              isDark
                ? "bg-[#141a15] border-[#253327]"
                : "bg-[#f5f9f6] border-[#d8e6dc]"
            }`}
          >
            <div className="flex justify-between">
              <span className="opacity-70">Atelier Subtotal:</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">
                Delivery (Insured White-Glove):
              </span>
              <span>£{shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">UK VAT (20%):</span>
              <span>£{vat.toFixed(2)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-current/15 font-bold text-base text-[#3e7b52] dark:text-[#74b886]">
              <span className="font-sans">Total Commission:</span>
              <span>£{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-3.5 border-t flex items-center justify-between text-xs ${
            isDark
              ? "bg-[#141a15] border-[#293a2c] text-[#7f9183]"
              : "bg-[#f5f9f6] border-[#e5ede6] text-[#788c7e]"
          }`}
        >
          <span>House of Hackney Atelier V14 CMS</span>
          <button
            onClick={() => setSelectedOrder(null)}
            className="px-4 py-1.5 rounded-full bg-[#1e2a21] hover:bg-[#2b3b2f] text-white font-sans font-bold uppercase tracking-wider transition-colors"
          >
            Close Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
