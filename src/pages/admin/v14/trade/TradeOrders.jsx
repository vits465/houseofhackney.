import { useState, useMemo } from "react";
import { Package, Search, Download, Clock, CheckCircle2, Truck, Eye } from "lucide-react";
import { useAdmin } from "../../AdminContext";
import { showToast } from "../../../../utils/sweetAlert";

export default function TradeOrders() {
  const { theme, orders, setSelectedOrder } = useAdmin();
  const isDark = theme === "dark";
  const [searchQuery, setSearchQuery] = useState("");

  const dynamicTradeOrders = useMemo(() => {
    return (orders || []).map((ord) => {
      const id = ord.orderNumber || ord.code || (ord._id ? `TRD-ORD-${ord._id.slice(-5).toUpperCase()}` : "TRD-ORD-01");
      const date = ord.createdAt
        ? new Date(ord.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
        : "Recent";
      const quoteRef = ord.quotationRef || `QUO-${(ord._id || "123").slice(-6).toUpperCase()}`;
      const itemsSummary = (ord.items || [])
        .map((it) => `${it.product?.name || it.name || "Bespoke Creation"} (x${it.quantity || 1})`)
        .join(", ") || "Atelier Furnishing Selection";
      const total = Number(ord.totalAmount || ord.grandTotal || ord.totalPrice || ord.total) || 0;
      const paymentTerm = ord.paymentTerm || "NET_30";
      const paymentStatus = (ord.paymentStatus || ord.status || "CONFIRMED").toUpperCase();
      const fulfillmentStatus = (ord.fulfillmentStatus || ord.status || "CONFIRMED").toUpperCase();
      const trackingNumber = ord.trackingNumber || `DHL-GB-${(ord._id || "999").slice(-7).toUpperCase()}`;

      return {
        id,
        date,
        quoteRef,
        itemsSummary,
        total,
        paymentTerm,
        paymentStatus,
        fulfillmentStatus,
        trackingNumber,
        invoicePdf: `#invoice-${id}`,
        rawOrder: ord,
      };
    });
  }, [orders]);

  const filteredOrders = dynamicTradeOrders.filter(
    (ord) =>
      ord.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.itemsSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ord.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadInvoice = (orderId) => {
    showToast(`Downloading official VAT invoice for ${orderId}...`);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            My Trade B2B Orders & Invoices
          </h1>
          <p className="text-xs text-[#627766] mt-0.5">
            Track live atelier production, courier dispatch, and settle invoices under your NET_30 terms
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
          isDark
            ? "bg-[#141a15] border-[#253327]"
            : "bg-white border-[#e4ede5]"
        }`}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-[#627766]">
          Showing {filteredOrders.length} B2B Trade Orders
        </span>

        <div className="relative min-w-[240px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#859b89]"
          />
          <input
            type="text"
            placeholder="Search order #, items, or tracking..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded-full border text-xs outline-none ${
              isDark
                ? "bg-[#1d271f] border-[#2e3f31] text-white placeholder-[#556957]"
                : "bg-[#f5f9f6] border-[#dce8df] text-[#142617] placeholder-[#95a898]"
            }`}
          />
        </div>
      </div>

      {/* Orders List / Cards */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div
            className={`p-12 text-center rounded-2xl border ${
              isDark ? "bg-[#141a15] border-[#253327]" : "bg-white border-[#e4ede5]"
            }`}
          >
            <Package size={32} className="mx-auto text-[#627766] mb-2 opacity-50" />
            <p className="text-sm font-semibold">No trade orders found</p>
            <p className="text-xs text-[#627766] mt-1">
              Your trade orders and white-glove dispatches will appear here in real time.
            </p>
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => setSelectedOrder && setSelectedOrder(ord.rawOrder)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                isDark
                  ? "bg-[#141a15] border-[#253327] hover:border-[#3e7b52]"
                  : "bg-white border-[#e4ede5] hover:border-[#3e7b52]"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#3e7b52]">
                      {ord.id}
                    </span>
                    <span className="text-xs text-[#627766]">• {ord.date}</span>
                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-md ${
                        isDark ? "bg-[#1d271f] text-[#859b89]" : "bg-[#edf6f0] text-[#285735]"
                      }`}
                    >
                      {ord.quoteRef}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm">{ord.itemsSummary}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#627766]">
                    <span className="flex items-center gap-1 font-mono">
                      <Truck size={12} />
                      {ord.trackingNumber}
                    </span>
                    <span>• Terms: {ord.paymentTerm}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 lg:self-center">
                  <div className="text-right mr-2">
                    <span className="text-xs text-[#627766] block">Net Invoiced</span>
                    <span className="font-bold text-base font-mono">
                      £{ord.total.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      ord.paymentStatus === "PAID"
                        ? "bg-[#eaf5ed] text-[#285735]"
                        : "bg-amber-500/15 text-amber-600"
                    }`}
                  >
                    <CheckCircle2 size={12} />
                    {ord.paymentStatus}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      ord.fulfillmentStatus === "DELIVERED"
                        ? "bg-[#eaf5ed] text-[#285735]"
                        : ord.fulfillmentStatus === "DISPATCHED" || ord.fulfillmentStatus === "SHIPPED"
                        ? "bg-blue-500/15 text-blue-600"
                        : "bg-amber-500/15 text-amber-600"
                    }`}
                  >
                    <Clock size={12} />
                    {ord.fulfillmentStatus}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadInvoice(ord.id);
                    }}
                    className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isDark
                        ? "border-[#2e3f31] hover:bg-[#1d271f] text-[#859b89]"
                        : "border-[#dce8df] hover:bg-[#f5f9f6] text-[#285735]"
                    }`}
                    title="Download Official VAT Invoice PDF"
                  >
                    <Download size={13} />
                    <span className="hidden sm:inline">VAT Invoice</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
