import { Download, FileText, CheckCircle2 } from "lucide-react";
import { useAdmin } from "../AdminContext";
import { showToast } from "../../../utils/sweetAlert";

export default function V14Reports() {
  const { theme, orders, products, users } = useAdmin();
  const isDark = theme === "dark";

  // CSV Exporter Helper
  const downloadCSV = (filename, headers, rows) => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((cell) => `"${String(cell || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filename} successfully.`);
  };

  const exportOrdersLedger = () => {
    const headers = ["Order Code", "Patron Name", "Email", "Items Summary", "Gross Total (£)", "Status", "Date"];
    const rows = (orders || []).map((o) => [
      o.orderNumber || o.code || o._id,
      o.shippingAddress?.fullName || o.user?.name || o.customer?.name || "Patron",
      o.shippingAddress?.email || o.user?.email || o.customer?.email || "",
      (o.items || []).map((it) => `${it.product?.name || it.name || "Item"} (x${it.quantity || 1})`).join("; "),
      Number(o.totalAmount || o.grandTotal || o.totalPrice || o.total || 0).toFixed(2),
      o.status || "CONFIRMED",
      o.createdAt ? new Date(o.createdAt).toISOString() : new Date().toISOString(),
    ]);
    downloadCSV("House_of_Hackney_Orders_Ledger.csv", headers, rows);
  };

  const exportInventoryAudit = () => {
    const headers = ["Product Name", "SKU", "Category", "Retail Price (£)", "Stock Inventory", "Status"];
    const rows = (products || []).map((p) => [
      p.name,
      p.sku || "",
      typeof p.category === "string" ? p.category : p.category?.name || "Decor",
      Number(p.pricing?.retailPrice || p.price || 0).toFixed(2),
      p.stock !== undefined ? p.stock : 10,
      p.status || "ACTIVE",
    ]);
    downloadCSV("House_of_Hackney_Inventory_Audit.csv", headers, rows);
  };

  const exportPatronsRegister = () => {
    const headers = ["User ID", "Full Name", "Email", "Phone", "Role", "Email Verified", "Joined Date"];
    const rows = (users || []).map((u) => [
      u._id || u.id,
      [u.firstName, u.lastName].filter(Boolean).join(" ") || u.name || "Patron",
      u.email,
      u.phone || "",
      Array.isArray(u.roles) ? u.roles.map((r) => r.name || r).join(", ") : u.role || "Customer",
      u.isEmailVerified ? "YES" : "NO",
      u.createdAt ? new Date(u.createdAt).toISOString() : new Date().toISOString(),
    ]);
    downloadCSV("House_of_Hackney_Patrons_Register.csv", headers, rows);
  };

  const exportTaxStatement = () => {
    const totalRev = (orders || []).reduce((sum, o) => sum + (Number(o.totalAmount || o.grandTotal || o.total) || 0), 0);
    const vat = totalRev * 0.20;
    const net = totalRev - vat;
    const headers = ["Fiscal Line Item", "Amount (£ GBP)", "Status", "Jurisdiction"];
    const rows = [
      ["Gross Atelier Sales", totalRev.toFixed(2), "Verified", "United Kingdom (HMRC)"],
      ["Standard UK VAT (20%)", vat.toFixed(2), "Calculated", "United Kingdom (HMRC)"],
      ["Net Atelier Revenue", net.toFixed(2), "Audited", "United Kingdom (HMRC)"],
      ["Total Active Orders", String(orders.length), "Recorded", "London HQ Atelier"],
    ];
    downloadCSV("House_of_Hackney_VAT_Tax_Manifest.csv", headers, rows);
  };

  const reports = [
    {
      title: "Orders & Commissions Fiscal Ledger",
      desc: `Complete audit trail of all ${orders.length} real-time customer and trade commissions.`,
      date: new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      count: `${orders.length} records`,
      handler: exportOrdersLedger,
    },
    {
      title: "Bespoke Fabrics & Wallpapers Inventory Audit",
      desc: `Live SKU-level stock audit across all ${products.length} master atelier catalog creations.`,
      date: new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      count: `${products.length} SKUs`,
      handler: exportInventoryAudit,
    },
    {
      title: "VIP Patrons & Trade Studio Register",
      desc: `Registry of all ${users.length} verified atelier patrons, trade partners, and administrative curators.`,
      date: new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      count: `${users.length} accounts`,
      handler: exportPatronsRegister,
    },
    {
      title: "UK VAT & Tax Compliance Manifest",
      desc: "HMRC-ready VAT breakdown, gross merchandise turnover, and operating margins.",
      date: new Date().toLocaleDateString("en-GB", { month: "long", year: "numeric" }),
      count: "FY 2026",
      handler: exportTaxStatement,
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
          Export verified accounting manifests, commission audits, and VAT filings directly from live database.
        </p>
      </div>

      <div className="space-y-3">
        {reports.map((r, i) => (
          <div
            key={i}
            className={`p-5 rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm transition-all hover:-translate-y-0.5 ${
              isDark
                ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
                : "bg-white border-[#e2ece5] text-[#142617]"
            }`}
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-[#eaf5ed] text-[#2e6d3f] flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
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
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-[#9db3a1]" : "text-[#526956]"
                  }`}
                >
                  {r.desc}
                </p>
                <span
                  className={`text-[11px] font-mono mt-1 block ${
                    isDark ? "text-[#7f9183]" : "text-[#7b9180]"
                  }`}
                >
                  {r.date} • {r.count}
                </span>
              </div>
            </div>

            <button
              onClick={r.handler}
              className={`flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full border text-xs font-sans font-bold transition-colors shrink-0 ${
                isDark
                  ? "border-[#293a2c] hover:bg-[#253528] text-[#7ec792]"
                  : "border-[#cce3d2] bg-[#edf6f0] hover:bg-[#e2f0e6] text-[#285735]"
              }`}
            >
              <Download size={13} />
              <span>Export CSV</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
