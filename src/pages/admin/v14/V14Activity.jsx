import { useState } from "react";
import { Search, Filter, MoreVertical } from "lucide-react";
import { useAdmin } from "../AdminContext";
import { V14_ACTIVITIES } from "./v14Data";

export default function V14Activity() {
  const { theme } = useAdmin();
  const isDark = theme === "dark";
  const [search, setSearch] = useState("");

  const filtered = V14_ACTIVITIES.filter(
    (a) =>
      a.activity.toLowerCase().includes(search.toLowerCase()) ||
      a.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
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
          Comprehensive telemetry of all atelier orders, commissions, and transfers.
        </p>
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
                <th className="py-3 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-[#212c23]" : "divide-[#edf4ee]"
              }`}
            >
              {filtered.map((act) => (
                <tr
                  key={act.id}
                  className={`transition-colors ${
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
                        act.status === "Completed"
                          ? "bg-[#eaf5ed] text-[#285735]"
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
                    <button className="p-1 rounded hover:bg-current/10">
                      <MoreVertical size={14} className="opacity-50" />
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
