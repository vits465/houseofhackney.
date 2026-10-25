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
} from "lucide-react";
import { useAdmin } from "../../AdminContext";
import RequestQuoteModal from "./RequestQuoteModal";
import ConvertQuoteModal from "./ConvertQuoteModal";

export default function TradeQuotations() {
  const { theme, tradeQuotations, approveQuote } = useAdmin();
  const isDark = theme === "dark";

  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedQuoteForConvert, setSelectedQuoteForConvert] = useState(null);
  const [activeQuoteDetail, setActiveQuoteDetail] = useState(null);

  const filteredQuotes = tradeQuotations.filter((q) => {
    const matchesFilter = filterStatus === "ALL" || q.status === filterStatus;
    const matchesSearch =
      q.quoteNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.customerNotes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.items?.some((it) => it.name?.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header bar */}
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
          {["ALL", "REQUESTED", "NEGOTIATING", "APPROVED", "CONVERTED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                filterStatus === status
                  ? "bg-[#3e7b52] text-white shadow-sm"
                  : isDark
                  ? "text-[#859b89] hover:bg-[#1f2b21] hover:text-white"
                  : "text-[#526956] hover:bg-[#edf6f0] hover:text-[#142617]"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#859b89]"
          />
          <input
            type="text"
            placeholder="Search quotations..."
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
      <div className="space-y-4">
        {filteredQuotes.map((quote) => {
          const grandTotal =
            quote.grandTotal || quote.negotiatedSubtotal || quote.subtotal || 0;

          return (
            <div
              key={quote._id}
              className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                isDark
                  ? "bg-[#141a15] border-[#253327] hover:border-[#334636]"
                  : "bg-white border-[#e4ede5] hover:border-[#c9dece] shadow-sm"
              }`}
            >
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
                      Submitted on {new Date(quote.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-left lg:text-right">
                    <span className="text-xs text-[#627766] block">Quotation Value</span>
                    <span className="text-lg font-bold text-[#142617] dark:text-[#f2f7f3]">
                      £{grandTotal.toLocaleString()}
                    </span>
                    {quote.discount > 0 && (
                      <span className="text-[11px] text-[#3e7b52] block font-semibold">
                        (Includes £{quote.discount} volume concession)
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
                      <span className="px-3 py-1.5 rounded-full bg-[#edf6f0] dark:bg-[#1d271f] font-mono text-xs font-bold text-[#3e7b52]">
                        {quote.convertedOrderNumber || "Converted to Order"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Items List Breakdown */}
              <div className="pt-4 space-y-2">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#627766]">
                  Specified Line Items ({quote.items?.length || 0})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {quote.items?.map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex justify-between items-center ${
                        isDark
                          ? "bg-[#182119] border-[#243326]"
                          : "bg-[#f9fbf9] border-[#e2ece4]"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <p className="font-semibold truncate">{item.name}</p>
                        <p className="text-[10px] text-[#627766]">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-[#3e7b52]">
                          £{((item.negotiatedPrice || item.unitPrice) * item.quantity).toLocaleString()}
                        </p>
                        {item.negotiatedPrice && (
                          <p className="text-[9px] line-through text-[#859b89]">
                            £{(item.unitPrice * item.quantity).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
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
        })}
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
