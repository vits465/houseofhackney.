import { Download, FileText } from "lucide-react";
import { useAdmin } from "../AdminContext";
import { showToast } from "../../../utils/sweetAlert";

export default function V14Reports() {
  const { theme } = useAdmin();
  const isDark = theme === "dark";

  const reports = [
    {
      title: "Monthly Gross Revenue & P&L Statement",
      date: "April 2026",
      size: "2.4 MB",
    },
    {
      title: "Bespoke Fabrics & Wallpapers Inventory Audit",
      date: "Q1 2026",
      size: "5.1 MB",
    },
    {
      title: "VIP Trade Accounts Commission Breakdown",
      date: "March 2026",
      size: "1.8 MB",
    },
    {
      title: "Tax Compliance & UK VAT Filing",
      date: "FY 2025-26",
      size: "3.2 MB",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-sans font-bold tracking-tight ${
            isDark ? "text-[#f2f7f3]" : "text-[#142617]"
          }`}
        >
          Financial & Audit Reports
        </h1>
        <p
          className={`text-xs sm:text-sm mt-1 font-sans ${
            isDark ? "text-[#9db3a1]" : "text-[#526956]"
          }`}
        >
          Export verified accounting manifests, commission audits, and VAT filings.
        </p>
      </div>

      <div className="space-y-3">
        {reports.map((r, i) => (
          <div
            key={i}
            className={`p-5 rounded-3xl border flex items-center justify-between shadow-sm transition-all hover:-translate-y-0.5 ${
              isDark
                ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
                : "bg-white border-[#e2ece5] text-[#142617]"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#eaf5ed] text-[#2e6d3f] flex items-center justify-center">
                <FileText size={18} />
              </div>
              <div>
                <h4
                  className={`font-sans font-bold text-sm ${
                    isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                  }`}
                >
                  {r.title}
                </h4>
                <span
                  className={`text-xs ${
                    isDark ? "text-[#9db3a1]" : "text-[#526956]"
                  }`}
                >
                  {r.date} • {r.size}
                </span>
              </div>
            </div>

            <button
              onClick={() => showToast(`Downloading ${r.title}...`)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full border text-xs font-sans font-bold transition-colors ${
                isDark
                  ? "border-[#293a2c] hover:bg-[#253528] text-[#7ec792]"
                  : "border-[#cce3d2] bg-[#edf6f0] hover:bg-[#e2f0e6] text-[#285735]"
              }`}
            >
              <Download size={13} />
              <span>Download</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
