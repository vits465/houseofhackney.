import { useState } from "react";
import { Package, Search, Download, Clock, CheckCircle2, Truck, ExternalLink } from "lucide-react";
import { useAdmin } from "../../AdminContext";
import { showToast } from "../../../../utils/sweetAlert";

const TRADE_ORDERS_LIST = [
  {
    id: "TRD-ORD-49210",
    date: "10 Oct 2026",
    quoteRef: "QUO-660144-1290",
    itemsSummary: "30m HOLLYHOCKS British Heritage Velvet",
    total: 4725,
    paymentTerm: "NET_30",
    paymentStatus: "INVOICED",
    fulfillmentStatus: "DISPATCHED",
    trackingNumber: "DHL-GB-8839210",
    invoicePdf: "#invoice-49210",
  },
  {
    id: "TRD-ORD-38102",
    date: "28 Sep 2026",
    quoteRef: "QUO-551029-9941",
    itemsSummary: "18 Rolls ARTEMIS Wild Flora Wallpaper + 8 Cushions",
    total: 3960,
    paymentTerm: "NET_30",
    paymentStatus: "PAID",
    fulfillmentStatus: "DELIVERED",
    trackingNumber: "DHL-GB-7719240",
    invoicePdf: "#invoice-38102",
  },
  {
    id: "TRD-ORD-22901",
    date: "14 Aug 2026",
    quoteRef: "QUO-440192-3321",
    itemsSummary: "50m BABYLON Velvet + Zellige Tile Suite",
    total: 8240,
    paymentTerm: "NET_30",
    paymentStatus: "PAID",
    fulfillmentStatus: "DELIVERED",
    trackingNumber: "DHL-GB-6612049",
    invoicePdf: "#invoice-22901",
  },
];

export default function TradeOrders() {
  const { theme, setSelectedOrder } = useAdmin();
  const isDark = theme === "dark";

  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = TRADE_ORDERS_LIST.filter(
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
            Track atelier production, courier dispatch, and settle invoices under your NET_30 terms
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

      {/* Orders Table */}
      <div
        className={`rounded-2xl border p-5 sm:p-6 transition-colors overflow-hidden ${
          isDark
            ? "bg-[#141a15] border-[#253327]"
            : "bg-white border-[#e4ede5]"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className={`border-b text-[11px] font-semibold uppercase tracking-wider text-[#627766] ${
                  isDark ? "border-[#253327]" : "border-[#edf2ee]"
                }`}
              >
                <th className="pb-3 pl-2">Order Ref</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Items Summary</th>
                <th className="pb-3">Invoice Total</th>
                <th className="pb-3">Terms & Payment</th>
                <th className="pb-3">Fulfillment</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-[#202c22]" : "divide-[#edf2ee]"
              }`}
            >
              {filteredOrders.map((ord) => (
                <tr
                  key={ord.id}
                  className={`transition-colors ${
                    isDark ? "hover:bg-[#1a231b]" : "hover:bg-[#f8fbf9]"
                  }`}
                >
                  <td className="py-3.5 pl-2">
                    <p className="font-mono font-bold text-[#3e7b52]">{ord.id}</p>
                    <p className="text-[10px] text-[#627766]">Quote: {ord.quoteRef}</p>
                  </td>
                  <td className="py-3.5 font-medium">{ord.date}</td>
                  <td className="py-3.5 max-w-xs truncate font-medium">
                    {ord.itemsSummary}
                  </td>
                  <td className="py-3.5 font-bold text-sm">
                    £{ord.total.toLocaleString()}
                  </td>
                  <td className="py-3.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[11px] font-bold text-[#3e7b52]">
                        {ord.paymentTerm}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ord.paymentStatus === "PAID"
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {ord.paymentStatus}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        ord.fulfillmentStatus === "DELIVERED"
                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                          : "bg-blue-500/15 text-blue-600"
                      }`}
                    >
                      <Truck size={12} /> {ord.fulfillmentStatus}
                    </span>
                    <p className="text-[10px] font-mono text-[#859b89] mt-0.5">
                      {ord.trackingNumber}
                    </p>
                  </td>
                  <td className="py-3.5 pr-2 text-right">
                    <button
                      onClick={() => handleDownloadInvoice(ord.id)}
                      className="px-3 py-1.5 rounded-full border border-[#3e7b52] text-[#3e7b52] hover:bg-[#3e7b52] hover:text-white text-[11px] font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                    >
                      <Download size={12} /> VAT Invoice
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
