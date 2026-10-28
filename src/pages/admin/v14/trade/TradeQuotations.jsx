import { useState } from "react";
import {
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowRight,
  Filter,
  Eye,
  FileText,
  Download,
  Building2,
  Sparkles,
  PackageCheck,
} from "lucide-react";
import { useAdmin } from "../../AdminContext";
import RequestQuoteModal from "./RequestQuoteModal";
import ConvertQuoteModal from "./ConvertQuoteModal";
import { showToast } from "../../../../utils/sweetAlert";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80";

export default function TradeQuotations() {
  const { theme, tradeQuotations, approveQuote, products } = useAdmin();
  const isDark = theme === "dark";

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedQuoteForConvert, setSelectedQuoteForConvert] = useState(null);

  const resolveItemDetails = (item) => {
    const name =
      item.name ||
      item.product?.name ||
      item.title ||
      "Bespoke Atelier Creation";

    const sku =
      item.product?.sku ||
      item.sku ||
      "HOH-TRD-01";

    const category =
      item.product?.productType ||
      item.category ||
      item.product?.category?.name ||
      (typeof item.product?.category === "string" ? item.product?.category : "Wallpaper & Fabric");

    const matchedProd =
      products?.find(
        (p) =>
          (item.product?._id && (p._id === item.product._id || p.id === item.product._id)) ||
          (typeof item.product === "string" && (p._id === item.product || p.id === item.product)) ||
          p.name === name
      );

    const image =
      item.product?.images?.[0]?.url ||
      item.image ||
      item.product?.featuredImage ||
      item.product?.thumbnail ||
      matchedProd?.images?.[0]?.url ||
      matchedProd?.featuredImage ||
      FALLBACK_IMG;

    const quantity = Number(item.quantity) || 1;
    const unitPrice = Number(item.negotiatedPrice || item.unitPrice || matchedProd?.pricing?.retailPrice || 180);
    const origUnitPrice = Number(item.unitPrice || matchedProd?.pricing?.retailPrice || 180);
    const lineTotal = unitPrice * quantity;

    return {
      name,
      sku,
      category,
      image,
      quantity,
      unitPrice,
      origUnitPrice,
      lineTotal,
      hasConcession: item.negotiatedPrice && item.negotiatedPrice < origUnitPrice,
    };
  };

  const filteredQuotes = tradeQuotations.filter((q) => {
    const matchesFilter = filterStatus === "ALL" || q.status === filterStatus;
    const qNum = q.quoteNumber?.toLowerCase() || "";
    const notes = (q.customerNotes || "").toLowerCase();
    const adminRemarks = (q.adminNotes || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      qNum.includes(query) ||
      notes.includes(query) ||
      adminRemarks.includes(query) ||
      q.items?.some((it) => {
        const iName = (it.name || it.product?.name || "").toLowerCase();
        const iSku = (it.sku || it.product?.sku || "").toLowerCase();
        return iName.includes(query) || iSku.includes(query);
      });

    return matchesFilter && matchesSearch;
  });

  const handleDownloadSpec = (quote) => {
    showToast(`Quotation Specification #${quote.quoteNumber} downloaded.`);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Trade Quotations & Specifications
          </h1>
          <p className="text-xs text-[#627766] mt-0.5">
            Manage bespoke project quotations, negotiated concessions, and convert to workshop orders
          </p>
        </div>

        <button
          onClick={() => setRequestModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all flex items-center gap-2 shadow-sm shadow-[#3e7b52]/25 self-start sm:self-auto"
        >
          <Plus size={15} />
          Request New Quotation
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
          isDark
            ? "bg-[#141a15] border-[#253327]"
            : "bg-white border-[#e4ede5]"
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {["ALL", "REQUESTED", "NEGOTIATING", "APPROVED", "CONVERTED"].map((status) => {
            const count = tradeQuotations.filter((q) => status === "ALL" || q.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  filterStatus === status
                    ? "bg-[#3e7b52] text-white shadow-sm"
                    : isDark
                    ? "text-[#859b89] hover:bg-[#1f2b21] hover:text-white"
                    : "text-[#526956] hover:bg-[#edf6f0] hover:text-[#142617]"
                }`}
              >
                <span>{status}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterStatus === status
                      ? "bg-white/20 text-white"
                      : isDark
                      ? "bg-[#253327] text-[#859b89]"
                      : "bg-[#e2ede4] text-[#526956]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#859b89]"
          />
          <input
            type="text"
            placeholder="Search quotes, SKUs, creations..."
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

      {/* Quotes Cards Grid */}
      <div className="space-y-5">
        {filteredQuotes.length === 0 ? (
          <div
            className={`p-12 text-center rounded-2xl border transition-colors ${
              isDark ? "bg-[#141a15] border-[#253327]" : "bg-white border-[#e4ede5]"
            }`}
          >
            <FileSpreadsheet size={36} className="mx-auto text-[#3e7b52] mb-3 opacity-60" />
            <h3 className="font-bold text-sm">
              {filterStatus === "APPROVED"
                ? "No Approved Quotations Currently"
                : "No Quotations Found"}
            </h3>
            <p className="text-xs text-[#627766] mt-1 max-w-sm mx-auto">
              {filterStatus === "APPROVED"
                ? "Quotations approved by the House of Hackney Atelier will appear here with full specifications and 1-click workshop order conversion."
                : "You haven't requested any project quotes matching your filter criteria yet. Click below to specify custom rolls, fabrics, and quantities."}
            </p>
            <button
              onClick={() => setRequestModalOpen(true)}
              className="mt-4 px-5 py-2 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus size={14} /> Request Project Quotation
            </button>
          </div>
        ) : (
          filteredQuotes.map((quote) => {
            const grandTotal =
              quote.grandTotal || quote.negotiatedSubtotal || quote.subtotal || 0;
            const subtotal = quote.subtotal || grandTotal;
            const discount = quote.discount || (quote.negotiatedSubtotal ? Math.max(0, subtotal - quote.negotiatedSubtotal) : 0);

            return (
              <div
                key={quote._id}
                className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                  isDark
                    ? "bg-[#141a15] border-[#253327] hover:border-[#334636]"
                    : "bg-white border-[#e4ede5] hover:border-[#c9dece] shadow-sm"
                }`}
              >
                {/* approved banner */}
                {quote.status === "APPROVED" && (
                  <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 size={18} />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          Quotation Approved by House of Hackney Atelier
                        </p>
                        <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                          This bespoke trade specification has been officially verified. Ready for immediate workshop commission conversion.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setSelectedQuoteForConvert(quote)}
                        className="px-4 py-2 rounded-full bg-[#3e7b52] hover:bg-[#346a45] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <CheckCircle2 size={14} /> Convert to Order
                      </button>
                    </div>
                  </div>
                )}

                {/* Top Reference Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-inherit">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#3e7b52]/10 text-[#3e7b52] flex items-center justify-center font-bold">
                      <FileSpreadsheet size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-[#3e7b52]">
                          {quote.quoteNumber}
                        </span>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            quote.status === "APPROVED"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : quote.status === "NEGOTIATING"
                              ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              : quote.status === "CONVERTED"
                              ? "bg-[#3e7b52]/15 text-[#3e7b52]"
                              : "bg-blue-500/15 text-blue-600"
                          }`}
                        >
                          {quote.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#627766] mt-0.5">
                        Submitted on {new Date(quote.createdAt).toLocaleDateString()} · {quote.items?.length || 0} Specified Item(s)
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-left lg:text-right">
                      <span className="text-xs text-[#627766] block">Quotation Value</span>
                      <span className="text-lg font-bold text-[#142617] dark:text-[#f2f7f3]">
                        £{grandTotal.toLocaleString()}
                      </span>
                      {discount > 0 && (
                        <span className="text-[11px] text-[#3e7b52] block font-semibold">
                          (Includes £{discount.toLocaleString()} Atelier concession)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {quote.status === "APPROVED" && (
                        <button
                          onClick={() => setSelectedQuoteForConvert(quote)}
                          className="px-4 py-2 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <CheckCircle2 size={14} /> Convert to Order
                        </button>
                      )}

                      {quote.status === "NEGOTIATING" && (
                        <button
                          onClick={() => approveQuote(quote._id)}
                          className="px-4 py-2 rounded-full border border-[#3e7b52] text-[#3e7b52] hover:bg-[#3e7b52] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          Approve Concession
                        </button>
                      )}

                      {quote.status === "CONVERTED" && (
                        <span className="px-3 py-1.5 rounded-full bg-[#edf6f0] dark:bg-[#1d271f] font-mono text-xs font-bold text-[#3e7b52] flex items-center gap-1.5">
                          <PackageCheck size={14} /> {quote.convertedOrderNumber || (typeof quote.convertedOrder === "object" ? quote.convertedOrder?.orderNumber : quote.convertedOrder) || "Converted to Order"}
                        </span>
                      )}

                      <button
                        onClick={() => handleDownloadSpec(quote)}
                        className={`p-2 rounded-full border transition-colors ${
                          isDark
                            ? "border-[#253327] hover:bg-[#1f2b21] text-[#859b89]"
                            : "border-[#e4ede5] hover:bg-[#f5f9f6] text-[#526956]"
                        }`}
                        title="Download Specification PDF"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Specified Catalog Items Breakdown */}
                <div className="pt-4 space-y-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-[#627766]">
                    Specified Catalog Creations & Roll Quantities ({quote.items?.length || 0})
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {quote.items?.map((rawItem, idx) => {
                      const item = resolveItemDetails(rawItem);
                      return (
                        <div
                          key={idx}
                          className={`p-3 rounded-xl border flex items-center gap-3 transition-colors ${
                            isDark
                              ? "bg-[#182119] border-[#243326]"
                              : "bg-[#f9fbf9] border-[#e2ece4]"
                          }`}
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-13 h-13 sm:w-14 sm:h-14 rounded-lg object-cover border border-inherit shrink-0 bg-neutral-200"
                            onError={(e) => {
                              e.target.src = FALLBACK_IMG;
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-bold text-xs truncate" title={item.name}>
                              {item.name}
                            </p>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="font-mono text-[10px] text-[#859b89]">
                                {item.sku}
                              </span>
                              <span className="text-[10px] text-[#627766]">·</span>
                              <span className="text-[10px] font-medium text-[#3e7b52]">
                                {item.category}
                              </span>
                            </div>
                            <div className="flex items-center justify-between mt-1 text-xs">
                              <span className="text-[11px] font-semibold text-[#627766]">
                                Qty: {item.quantity}
                              </span>
                              <div className="text-right">
                                <span className="font-bold text-[#3e7b52]">
                                  £{item.lineTotal.toLocaleString()}
                                </span>
                                {item.hasConcession && (
                                  <span className="text-[10px] line-through text-[#859b89] block -mt-0.5">
                                    £{(item.origUnitPrice * item.quantity).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* notes */}
                {(quote.customerNotes || quote.adminNotes) && (
                  <div className="mt-4 pt-3 border-t border-inherit grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {quote.customerNotes && (
                      <div
                        className={`p-3 rounded-xl ${
                          isDark ? "bg-[#1d271f]" : "bg-[#f4f7f4]"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold text-[#627766] block mb-1">
                          Client Scope Notes
                        </span>
                        <p className="text-[#627766] dark:text-[#a5b9a8] leading-relaxed">
                          {quote.customerNotes}
                        </p>
                      </div>
                    )}
                    {quote.adminNotes && (
                      <div
                        className={`p-3 rounded-xl border ${
                          isDark
                            ? "bg-[#1c291f] border-[#2d4231] text-[#9eb6a3]"
                            : "bg-[#edf6f0] border-[#d2e4d6] text-[#2c5237]"
                        }`}
                      >
                        <span className="text-[10px] uppercase font-bold text-[#3e7b52] block mb-1">
                          Atelier Concession Remarks
                        </span>
                        <p className="leading-relaxed">{quote.adminNotes}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <RequestQuoteModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />
      <ConvertQuoteModal
        quote={selectedQuoteForConvert}
        isOpen={Boolean(selectedQuoteForConvert)}
        onClose={() => setSelectedQuoteForConvert(null)}
      />
    </div>
  );
}
