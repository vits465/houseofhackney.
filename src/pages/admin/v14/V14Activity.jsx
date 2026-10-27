import { useState } from "react";
import { Search, Filter, MoreVertical, ShoppingBag, Eye } from "lucide-react";
import { useAdmin } from "../AdminContext";

export default function V14Activity() {
  const { theme, orders, setSelectedOrder } = useAdmin();
  const isDark = theme === "dark";
  const [search, setSearch] = useState("");

  const dynamicActivities = (orders || []).map((ord) => {
    const id = ord.orderNumber || ord.code || (ord._id ? `ORD-${ord._id.slice(-6).toUpperCase()}` : "ORD-0001");
    const itemName = ord.items?.[0]?.product?.name || ord.items?.[0]?.name || "Bespoke Creation";
    const qty = ord.items?.[0]?.quantity || 1;
    const patronName = ord.shippingAddress?.fullName || ord.user?.name || ord.customer?.name || "Atelier Patron";
    const category = ord.shippingMethod || ord.items?.[0]?.product?.category?.name || "Bespoke Furnishing";
    const amount = Number(ord.totalAmount || ord.grandTotal || ord.totalPrice || ord.total) || 0;
    const status = (ord.status || "CONFIRMED").toUpperCase();
    const dateFormatted = ord.createdAt
      ? new Date(ord.createdAt).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "Recent";

    return {
      id,
      activity: `${itemName} (x${qty}) — ${patronName}`,
      category,
      price: `£${amount.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      status,
      date: dateFormatted,
      rawOrder: ord,
    };
  });

  const filtered = dynamicActivities.filter(
    (a) =>
      a.activity.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-sans font-bold tracking-tight ${
              isDark ? "text-[#f2f7f3]" : "text-[#142617]"
            }`}
          >
            Activity Log & Transactions
          </h1>
          <p
            className={`text-xs sm:text-sm mt-1 font-sans ${
              isDark ? "text-[#9db3a1]" : "text-[#526956]"
            }`}
          >
            Comprehensive live telemetry of atelier orders, commissions, and transfers ({orders.length} records).
          </p>
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#859b89]" />
          <input
            type="text"
            placeholder="Search transaction, item, or client..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-9 pr-3 py-2 rounded-full border text-xs outline-none ${
              isDark
                ? "bg-[#141a15] border-[#253327] text-white placeholder-[#556957]"
                : "bg-white border-[#d8e6dc] text-[#142617] placeholder-[#95a898] shadow-xs"
            }`}
          />
        </div>
      </div>

      <div
        className={`p-6 rounded-3xl border shadow-sm ${
          isDark
            ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
            : "bg-white border-[#e2ece5] text-[#142617]"
        }`}
      >
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left text-xs font-sans">
            <thead>
              <tr
                className={`border-b text-[11px] font-semibold uppercase ${
                  isDark
                    ? "border-[#293a2c] text-[#9db3a1]"
                    : "border-[#e2ece5] text-[#526956]"
                }`}
              >
                <th className="py-3 px-3">Transaction ID</th>
                <th className="py-3 px-3">Activity & Details</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Price</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Timestamp</th>
                <th className="py-3 px-3 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-[#212c23]" : "divide-[#edf4ee]"
              }`}
            >
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#627766]">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShoppingBag size={28} className="opacity-40 text-[#3e7b52]" />
                      <p className="font-semibold text-sm">No transactions found</p>
                      <p className="text-xs">Live transactions will appear here when orders are placed.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((act) => (
                  <tr
                    key={act.id}
                    onClick={() => setSelectedOrder && setSelectedOrder(act.rawOrder)}
                    className={`transition-colors cursor-pointer ${
                      isDark ? "hover:bg-[#1f2921]" : "hover:bg-[#f7faf8]"
                    }`}
                  >
                    <td className="py-3.5 px-3 font-mono font-medium text-[#2f6f43] dark:text-[#7ec792]">
                      {act.id}
                    </td>
                    <td
                      className={`py-3.5 px-3 font-semibold ${
                        isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                      }`}
                    >
                      {act.activity}
                    </td>
                    <td
                      className={`py-3.5 px-3 ${
                        isDark ? "text-[#9db3a1]" : "text-[#526956]"
                      }`}
                    >
                      {act.category}
                    </td>
                    <td
                      className={`py-3.5 px-3 font-mono font-bold ${
                        isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                      }`}
                    >
                      {act.price}
                    </td>
                    <td className="py-3.5 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                          act.status === "DELIVERED" || act.status === "CONFIRMED" || act.status === "PAID"
                            ? "bg-[#eaf5ed] text-[#285735]"
                            : act.status === "SHIPPED"
                            ? "bg-blue-500/15 text-blue-600"
                            : "bg-amber-500/15 text-amber-600"
                        }`}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {act.status}
                      </span>
                    </td>
                    <td
                      className={`py-3.5 px-3 text-[11px] ${
                        isDark ? "text-[#9db3a1]" : "text-[#526956]"
                      }`}
                    >
                      {act.date}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedOrder && setSelectedOrder(act.rawOrder);
                        }}
                        className="p-1.5 rounded-xl hover:bg-current/10 text-[#3e7b52]"
                        title="View Full Order"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
