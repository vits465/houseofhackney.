import { X, Printer, User, MapPin, Mail, CreditCard, ShieldCheck } from "lucide-react";
import { useAdmin } from "../AdminContext";

export default function OrderDetailModal() {
  const { selectedOrder, setSelectedOrder, theme, updateOrderStatus } =
    useAdmin();
  const isDark = theme === "dark";

  if (!selectedOrder) return null;

  const orderId =
    selectedOrder.id ||
    selectedOrder.orderNumber ||
    selectedOrder.code ||
    selectedOrder._id ||
    "HOH-ORDER";

  const handleStatusChange = (newStatus) => {
    if (updateOrderStatus) {
      updateOrderStatus(orderId, newStatus);
    }
    if (setSelectedOrder) {
      setSelectedOrder((prev) => (prev ? { ...prev, fulfillmentStatus: newStatus, status: newStatus } : null));
    }
  };

  // Safe client fields
  const clientName =
    selectedOrder.client?.name ||
    (selectedOrder.user?.firstName
      ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName || ""}`.trim()
      : selectedOrder.user?.name) ||
    selectedOrder.shippingAddress?.fullName ||
    selectedOrder.customer?.name ||
    "House of Hackney Patron";

  const clientEmail =
    selectedOrder.client?.email ||
    selectedOrder.user?.email ||
    selectedOrder.shippingAddress?.email ||
    selectedOrder.customer?.email ||
    "patron@houseofhackney.com";

  const clientTier =
    selectedOrder.client?.tier ||
    selectedOrder.user?.tier ||
    selectedOrder.tier ||
    (selectedOrder.paymentMethod?.includes("RAZORPAY")
      ? "Razorpay Verified"
      : "VIP Patron");

  const clientAvatar =
    selectedOrder.client?.avatar ||
    selectedOrder.user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=3e7b52&color=fff`;

  const clientLocation =
    selectedOrder.client?.location ||
    (selectedOrder.shippingAddress
      ? [
          selectedOrder.shippingAddress.addressLine1,
          selectedOrder.shippingAddress.city,
          selectedOrder.shippingAddress.postalCode,
          selectedOrder.shippingAddress.country,
        ]
          .filter(Boolean)
          .join(", ")
      : "") ||
    "London, United Kingdom";

  const placedDate =
    selectedOrder.timestamp ||
    selectedOrder.date ||
    (selectedOrder.createdAt
      ? new Date(selectedOrder.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Recent");

  const fulfillmentStatus =
    selectedOrder.fulfillmentStatus ||
    selectedOrder.status ||
    selectedOrder.orderStatus ||
    "CONFIRMED";

  const paymentStatus =
    selectedOrder.paymentStatus ||
    (selectedOrder.paymentId ? "Paid via Razorpay" : "Paid");

  const paymentMethod =
    selectedOrder.paymentMethod ||
    (selectedOrder.paymentId ? `Razorpay (${selectedOrder.paymentId})` : "Online Payment");

  // Normalized items
  const rawItems =
    selectedOrder.items ||
    selectedOrder.orderItems ||
    selectedOrder.products ||
    [];

  const items = (Array.isArray(rawItems) ? rawItems : []).map((item) => {
    const name =
      item.name ||
      item.title ||
      item.product?.name ||
      item.product?.title ||
      "House of Hackney Creation";
    const qty = Number(item.qty || item.quantity || 1);
    const price = Number(item.price || item.unitPrice || item.sellingPrice || 0);
    const variant =
      item.variant ||
      item.variantTitle ||
      (Array.isArray(item.variantAttributes)
        ? item.variantAttributes.map((v) => v.value).filter(Boolean).join(" / ")
        : "") ||
      "Bespoke Commission";
    const image =
      item.image ||
      item.product?.image ||
      item.product?.media?.[0]?.url ||
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0";

    return { name, qty, price, variant, image };
  });

  const subtotal =
    Number(selectedOrder.subtotal) ||
    (items.length > 0
      ? items.reduce((sum, i) => sum + i.price * i.qty, 0)
      : Number(selectedOrder.totalAmount || selectedOrder.total || selectedOrder.grandTotal || 0));

  const discount = Number(
    selectedOrder.discount ??
    selectedOrder.discountAmount ??
    selectedOrder.coupon?.discountAmount ??
    0
  );
  const couponCode = selectedOrder.couponCode || selectedOrder.coupon?.code || null;

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const vat = discountedSubtotal > 0 ? discountedSubtotal * 0.2 : 0;
  const shipping = items.length > 0 ? 45.0 : 0;
  const grandTotal = discountedSubtotal + vat + shipping;

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
              {orderId}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#eaf5ed] text-[#347847] dark:bg-[#25392a] dark:text-[#7ec792]">
              {clientTier}
            </span>
            <span
              className={`text-xs ${
                isDark ? "text-[#8a9d8e]" : "text-[#788c7e]"
              }`}
            >
              Placed {placedDate}
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
                  {fulfillmentStatus}
                </span>
                <span className="text-xs opacity-60 font-mono">
                  ({paymentStatus})
                </span>
              </div>
            </div>

            {/* Change Status Buttons */}
            <div className="flex items-center gap-1.5 text-xs font-sans">
              <span className="opacity-70 text-[11px] mr-1 hidden md:inline">
                Update:
              </span>
              {["In Production", "PROCESSING", "Dispatched", "SHIPPED", "Delivered", "DELIVERED"].map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-full border font-semibold transition-all ${
                    fulfillmentStatus?.toLowerCase() === st.toLowerCase()
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
                  src={clientAvatar}
                  alt={clientName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-[#4a8b5e]/40"
                />
                <div>
                  <h4 className="font-sans font-bold text-sm">
                    {clientName}
                  </h4>
                  <p
                    className={`text-xs flex items-center gap-1.5 mt-0.5 ${
                      isDark ? "text-[#8a9d8e]" : "text-[#627766]"
                    }`}
                  >
                    <Mail size={12} />
                    <span>{clientEmail}</span>
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
                {clientLocation}
              </p>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  isDark ? "text-[#8a9d8e]" : "text-[#627766]"
                }`}
              >
                {selectedOrder.notes ||
                  "Standard insured atelier courier delivery."}
              </p>
              {selectedOrder.paymentId && (
                <p className="text-[11px] font-mono text-[#3e7b52] dark:text-[#7ec792] mt-2 flex items-center gap-1">
                  <ShieldCheck size={13} />
                  <span>Razorpay ID: {selectedOrder.paymentId}</span>
                </p>
              )}
            </div>
          </div>

          {/* Ordered Items List */}
          <div>
            <h4 className="text-xs font-mono tracking-widest uppercase text-[#3e7b52] dark:text-[#74b886] mb-3 font-semibold">
              PIECES & CREATIONS ({items.length})
            </h4>
            <div className="space-y-2.5">
              {items.length === 0 ? (
                <p className="text-xs text-stone-500 py-3 text-center">No individual items recorded for this commission.</p>
              ) : (
                items.map((item, idx) => (
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
                ))
              )}
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
              <span className="opacity-70">Payment Method:</span>
              <span className="font-bold text-[#3e7b52] dark:text-[#7ec792]">{paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="opacity-70">Atelier Subtotal:</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-[#2d5022] dark:text-[#7ec792]">
                <span className="font-semibold">
                  Voucher Discount {couponCode ? `(${couponCode})` : ""}:
                </span>
                <span className="font-bold">-£{discount.toFixed(2)}</span>
              </div>
            )}
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
            className="px-4 py-1.5 rounded-full bg-[#1e2a21] hover:bg-[#2b3b2f] text-white font-sans font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
