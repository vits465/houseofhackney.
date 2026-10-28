import { X, Printer, User, MapPin, Mail, ShieldCheck } from "lucide-react";
import { useAdmin } from "../AdminContext";

export default function OrderDetailModal() {
  const { selectedOrder, setSelectedOrder, theme, updateOrderStatus } =
    useAdmin();
  const isDark = theme === "dark";

  if (!selectedOrder) return null;

  const orderId =
    typeof selectedOrder.orderNumber === "string" && selectedOrder.orderNumber
      ? selectedOrder.orderNumber
      : typeof selectedOrder.code === "string" && selectedOrder.code
      ? selectedOrder.code
      : typeof selectedOrder.id === "string" && selectedOrder.id
      ? selectedOrder.id
      : typeof selectedOrder._id === "string" && selectedOrder._id
      ? selectedOrder._id
      : "HOH-ORDER";

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
    typeof selectedOrder.client?.name === "string"
      ? selectedOrder.client.name
      : selectedOrder.user?.firstName
      ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName || ""}`.trim()
      : typeof selectedOrder.user?.name === "string"
      ? selectedOrder.user.name
      : typeof selectedOrder.shippingAddress?.fullName === "string"
      ? selectedOrder.shippingAddress.fullName
      : typeof selectedOrder.customer?.name === "string"
      ? selectedOrder.customer.name
      : "House of Hackney Patron";

  const clientEmail =
    typeof selectedOrder.client?.email === "string"
      ? selectedOrder.client.email
      : typeof selectedOrder.user?.email === "string"
      ? selectedOrder.user.email
      : typeof selectedOrder.shippingAddress?.email === "string"
      ? selectedOrder.shippingAddress.email
      : typeof selectedOrder.customer?.email === "string"
      ? selectedOrder.customer.email
      : "patron@houseofhackney.com";

  const clientTier =
    typeof selectedOrder.client?.tier === "string"
      ? selectedOrder.client.tier
      : typeof selectedOrder.user?.tier === "string"
      ? selectedOrder.user.tier
      : typeof selectedOrder.tier === "string"
      ? selectedOrder.tier
      : String(selectedOrder.paymentMethod || "").includes("RAZORPAY")
      ? "Verified Razorpay Patron"
      : "VIP Patron";

  const clientAvatar =
    typeof selectedOrder.client?.avatar === "string"
      ? selectedOrder.client.avatar
      : typeof selectedOrder.user?.avatar === "string"
      ? selectedOrder.user.avatar
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(clientName)}&background=3e7b52&color=fff`;

  const clientLocation =
    typeof selectedOrder.client?.location === "string"
      ? selectedOrder.client.location
      : selectedOrder.shippingAddress
      ? [
          selectedOrder.shippingAddress.addressLine1,
          selectedOrder.shippingAddress.city,
          selectedOrder.shippingAddress.postalCode,
          selectedOrder.shippingAddress.country,
        ]
          .filter(Boolean)
          .join(", ")
      : "London, United Kingdom";

  const placedDate =
    typeof selectedOrder.timestamp === "string"
      ? selectedOrder.timestamp
      : typeof selectedOrder.date === "string"
      ? selectedOrder.date
      : selectedOrder.createdAt
      ? new Date(selectedOrder.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Recent";

  const rawStatus = selectedOrder.fulfillmentStatus || selectedOrder.status || selectedOrder.orderStatus;
  const fulfillmentStatus = typeof rawStatus === "string" ? rawStatus : "CONFIRMED";

  const paymentStatus =
    typeof selectedOrder.paymentStatus === "string"
      ? selectedOrder.paymentStatus
      : selectedOrder.paymentId
      ? "PAID"
      : "PAID";

  const paymentMethod =
    typeof selectedOrder.paymentMethod === "string"
      ? selectedOrder.paymentMethod
      : selectedOrder.paymentId
      ? `Razorpay (${selectedOrder.paymentId})`
      : "Online Payment";

  // Normalized items with 100% object safety
  const rawItems =
    selectedOrder.items ||
    selectedOrder.orderItems ||
    selectedOrder.products ||
    [];

  const items = (Array.isArray(rawItems) ? rawItems : []).map((item) => {
    const name =
      typeof item.name === "string"
        ? item.name
        : typeof item.title === "string"
        ? item.title
        : typeof item.product === "object" && item.product !== null
        ? item.product.name || item.product.title
        : "House of Hackney Creation";

    const qty = Number(item.qty || item.quantity || 1);
    const price = Number(item.price || item.unitPrice || item.sellingPrice || 0);

    const rawVariant = item.variant || item.variantTitle;
    const variant =
      typeof rawVariant === "string"
        ? rawVariant
        : typeof rawVariant === "object" && rawVariant !== null
        ? rawVariant.title || rawVariant.name || rawVariant.sku || "Bespoke Commission"
        : Array.isArray(item.variantAttributes)
        ? item.variantAttributes.map((v) => (typeof v === "object" ? v.value || v.name : v)).filter(Boolean).join(" / ")
        : "Bespoke Commission";

    const image =
      typeof item.image === "string"
        ? item.image
        : typeof item.product?.image === "string"
        ? item.product.image
        : typeof item.product?.media?.[0]?.url === "string"
        ? item.product.media[0].url
        : "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0";

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
  const couponCode = typeof selectedOrder.couponCode === "string" ? selectedOrder.couponCode : selectedOrder.coupon?.code || null;

  const discountedSubtotal = Math.max(0, subtotal - discount);
  const vat = discountedSubtotal > 0 ? discountedSubtotal * 0.2 : 0;
  const shipping = items.length > 0 ? 45.0 : 0;
  const grandTotal = discountedSubtotal + vat + shipping;

  const STATUS_STAGES = [
    { id: "IN_PRODUCTION", label: "In Production" },
    { id: "PROCESSING", label: "Processing" },
    { id: "DISPATCHED", label: "Dispatched" },
    { id: "DELIVERED", label: "Delivered" },
    { id: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0"
        onClick={() => setSelectedOrder(null)}
      />

      <div
        className={`relative w-full max-w-3xl sm:max-w-4xl max-h-[92vh] rounded-3xl border shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-10 ${
          isDark
            ? "bg-[#162018] border-[#293d2c] text-[#f2f7f3]"
            : "bg-white border-[#dce8df] text-[#142617]"
        }`}
      >
        {/* Header Bar */}
        <div
          className={`px-5 sm:px-7 py-4 border-b flex items-center justify-between gap-3 ${
            isDark ? "border-[#293d2c] bg-[#121b14]" : "border-[#e5ede6] bg-[#f9fbf9]"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 min-w-0">
            <span
              className="font-mono text-sm sm:text-base font-bold text-[#3e7b52] dark:text-[#74b886] truncate max-w-[180px] sm:max-w-none"
              title={String(orderId)}
            >
              {String(orderId)}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#eaf5ed] text-[#347847] dark:bg-[#25392a] dark:text-[#7ec792]">
              {String(clientTier)}
            </span>
            <span
              className={`text-xs ${
                isDark ? "text-[#8a9d8e]" : "text-[#788c7e]"
              } hidden sm:inline`}
            >
              Placed {String(placedDate)}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => window.print()}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? "bg-[#18231a] border-[#293d2c] text-[#8a9d8e] hover:bg-[#223326] hover:text-white"
                  : "bg-white border-[#d8e6dc] text-[#2d5538] hover:bg-[#eaf3ed]"
              }`}
              title="Print Order Sheet"
            >
              <Printer size={14} />
              <span className="hidden sm:inline">Print Sheet</span>
            </button>

            <button
              onClick={() => setSelectedOrder(null)}
              className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                isDark
                  ? "bg-[#18231a] border-[#293d2c] text-[#8a9d8e] hover:bg-[#223326] hover:text-white"
                  : "bg-white border-[#d8e6dc] text-[#627766] hover:bg-[#f0f5f1]"
              }`}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Scrollable Content (NO HORIZONTAL OVERFLOW) */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-5 sm:p-7 space-y-6">
          {/* Fulfillment Status Banner & Controls */}
          <div
            className={`p-4 sm:p-5 rounded-2xl border transition-all ${
              isDark
                ? "bg-[#121a14] border-[#253628]"
                : "bg-[#f5f9f6] border-[#d8e6dc]"
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-inherit/40">
              <div>
                <span className="text-[10px] font-mono tracking-widest uppercase text-[#3e7b52] dark:text-[#74b886] font-bold">
                  FULFILLMENT STATUS
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4a8b5e] animate-pulse" />
                  <span className="font-sans font-bold text-base sm:text-lg tracking-tight">
                    {String(fulfillmentStatus)}
                  </span>
                  <span className="text-xs opacity-60 font-mono">
                    ({String(paymentStatus)})
                  </span>
                </div>
              </div>

              {/* Status Transition Select Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#627766] hidden sm:inline">
                  Change:
                </span>
                <select
                  value={String(fulfillmentStatus).toUpperCase()}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold outline-none cursor-pointer ${
                    isDark
                      ? "bg-[#1a261c] border-[#314534] text-white"
                      : "bg-white border-[#d4e4d7] text-[#1e2a21]"
                  }`}
                >
                  <option value="IN_PRODUCTION">In Production</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="DISPATCHED">Dispatched</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* 1-Click Status Stage Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-3.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#627766] mr-1">
                Quick Stages:
              </span>
              {STATUS_STAGES.map((st) => {
                const isActive =
                  String(fulfillmentStatus).toUpperCase() === st.id ||
                  String(fulfillmentStatus).toLowerCase() === st.label.toLowerCase();

                return (
                  <button
                    key={st.id}
                    onClick={() => handleStatusChange(st.id)}
                    className={`px-3.5 py-1 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#3e7b52] text-white border-[#3e7b52] shadow-sm font-semibold ring-2 ring-[#3e7b52]/30"
                        : isDark
                        ? "bg-[#18231a] border-[#293d2c] text-[#8a9d8e] hover:text-white hover:border-[#3e7b52]"
                        : "bg-white border-[#d8e6dc] text-[#34533a] hover:bg-[#f0f6f2] hover:border-[#3e7b52]"
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Patron Client Details Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              className={`p-4 sm:p-5 rounded-2xl border ${
                isDark
                  ? "bg-[#121a14] border-[#253628]"
                  : "bg-[#fcfdfc] border-[#e7f0e9]"
              }`}
            >
              <div className="flex items-center gap-2 mb-3 text-[10px] font-mono tracking-wider uppercase text-[#3e7b52] dark:text-[#74b886] font-bold">
                <User size={13} />
                <span>Patron Credentials</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={clientAvatar}
                  alt={clientName}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-[#4a8b5e]/40 flex-shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h4 className="font-sans font-bold text-sm truncate">
                    {clientName}
                  </h4>
                  <p
                    className={`text-xs flex items-center gap-1.5 mt-0.5 truncate ${
                      isDark ? "text-[#8a9d8e]" : "text-[#627766]"
                    }`}
                  >
                    <Mail size={12} className="flex-shrink-0" />
                    <span className="truncate">{clientEmail}</span>
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`p-4 sm:p-5 rounded-2xl border ${
                isDark
                  ? "bg-[#121a14] border-[#253628]"
                  : "bg-[#fcfdfc] border-[#e7f0e9]"
              }`}
            >
              <div className="flex items-center gap-2 mb-3 text-[10px] font-mono tracking-wider uppercase text-[#3e7b52] dark:text-[#74b886] font-bold">
                <MapPin size={13} />
                <span>Delivery Address</span>
              </div>
              <p className="text-xs font-sans font-bold leading-snug">
                {String(clientLocation)}
              </p>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  isDark ? "text-[#8a9d8e]" : "text-[#627766]"
                }`}
              >
                {typeof selectedOrder.notes === "string" && selectedOrder.notes
                  ? selectedOrder.notes
                  : "Standard insured atelier courier delivery."}
              </p>
              {selectedOrder.paymentId && (
                <p className="text-[11px] font-mono text-[#3e7b52] dark:text-[#7ec792] mt-2 flex items-center gap-1 truncate">
                  <ShieldCheck size={13} className="flex-shrink-0" />
                  <span className="truncate">Razorpay ID: {String(selectedOrder.paymentId)}</span>
                </p>
              )}
            </div>
          </div>

          {/* Ordered Items List */}
          <div>
            <h4 className="text-xs font-mono tracking-widest uppercase text-[#3e7b52] dark:text-[#74b886] mb-3 font-bold">
              PIECES & CREATIONS ({items.length})
            </h4>
            <div className="space-y-3">
              {items.length === 0 ? (
                <p className="text-xs text-stone-500 py-4 text-center">
                  No individual items recorded for this commission.
                </p>
              ) : (
                items.map((item, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl border ${
                      isDark
                        ? "bg-[#121a14] border-[#253628]"
                        : "bg-[#fcfdfc] border-[#e7f0e9]"
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      <img
                        src={item.image}
                        alt={item.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0";
                        }}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-black/10 bg-black/5 flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-sans font-bold text-[#1e2a21] dark:text-[#f2f7f3] truncate">
                          {String(item.name)}
                        </p>
                        <span className="text-xs font-mono text-[#3e7b52] dark:text-[#74b886] block truncate">
                          {String(item.variant)}
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

                    <span className="font-mono font-bold text-sm sm:text-base flex-shrink-0">
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
            className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 text-xs font-mono ${
              isDark
                ? "bg-[#121a14] border-[#253628]"
                : "bg-[#f5f9f6] border-[#d8e6dc]"
            }`}
          >
            <div className="flex justify-between">
              <span className="opacity-70">Payment Method:</span>
              <span className="font-bold text-[#3e7b52] dark:text-[#7ec792]">{String(paymentMethod)}</span>
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
            <div className="flex justify-between pt-2.5 border-t border-current/15 font-bold text-base sm:text-lg text-[#3e7b52] dark:text-[#74b886]">
              <span className="font-sans">Total Commission:</span>
              <span>£{grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Bar */}
        <div
          className={`px-5 sm:px-7 py-3.5 border-t flex items-center justify-between text-xs ${
            isDark
              ? "bg-[#121b14] border-[#293d2c] text-[#7f9183]"
              : "bg-[#f9fbf9] border-[#e5ede6] text-[#788c7e]"
          }`}
        >
          <span>House of Hackney Atelier V14 CMS</span>
          <button
            onClick={() => setSelectedOrder(null)}
            className="px-5 py-2 rounded-xl bg-[#1e2a21] hover:bg-[#2b3b2f] text-white font-sans font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer"
          >
            Close Sheet
          </button>
        </div>
      </div>
    </div>
  );
}
