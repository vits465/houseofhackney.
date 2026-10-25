import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Award,
  CreditCard,
  FileSpreadsheet,
  Check,
  X,
  MessageSquare,
  ExternalLink,
  Search,
  Building2,
  DollarSign,
  AlertCircle,
  Sliders,
} from "lucide-react";
import { useAdmin } from "../../AdminContext";

export default function AdminTradeReview() {
  const {
    theme,
    pendingApplications,
    tradeQuotations,
    reviewApplication,
    negotiateQuote,
  } = useAdmin();
  const isDark = theme === "dark";

  const [activeSubTab, setActiveSubTab] = useState("applications"); // 'applications' | 'quotes' | 'credits'
  const [selectedAppForReview, setSelectedAppForReview] = useState(null);
  const [selectedQuoteForNegotiate, setSelectedQuoteForNegotiate] = useState(null);

  // Application review modal form state
  const [assignedTier, setAssignedTier] = useState("tier_gold");
  const [assignedCredit, setAssignedCredit] = useState(50000);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewingAction, setReviewingAction] = useState(false);

  // Quote negotiation modal state
  const [negotiatedDiscount, setNegotiatedDiscount] = useState(500);
  const [adminNotes, setAdminNotes] = useState("");
  const [negotiatingAction, setNegotiatingAction] = useState(false);

  const handleReviewSubmit = async (status) => {
    if (!selectedAppForReview) return;
    setReviewingAction(true);
    try {
      await reviewApplication(selectedAppForReview._id, {
        status,
        tierId: assignedTier,
        creditLimit: assignedCredit,
        rejectionReason: status === "REJECTED" ? rejectionReason : "",
      });
      setSelectedAppForReview(null);
    } finally {
      setReviewingAction(false);
    }
  };

  const handleNegotiateSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuoteForNegotiate) return;
    setNegotiatingAction(true);
    try {
      const negotiatedItems = (selectedQuoteForNegotiate.items || []).map((it) => ({
        itemId: it._id,
        negotiatedPrice: it.negotiatedPrice || it.unitPrice,
        quantity: it.quantity,
      }));

      await negotiateQuote(selectedQuoteForNegotiate._id, {
        negotiatedItems,
        discount: Number(negotiatedDiscount) || 0,
        adminNotes,
      });
      setSelectedQuoteForNegotiate(null);
    } finally {
      setNegotiatingAction(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Trade & B2B Atelier Management
          </h1>
          <p className="text-xs text-[#627766] mt-0.5">
            Review design studio trade applications, approve credit lines, and negotiate quotation pricing
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div
        className={`p-1.5 rounded-full border max-w-fit flex items-center gap-1 transition-colors ${
          isDark
            ? "bg-[#1d271f] border-[#2e3f31]"
            : "bg-[#f5f9f6] border-[#dce8df]"
        }`}
      >
        <button
          onClick={() => setActiveSubTab("applications")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all relative ${
            activeSubTab === "applications"
              ? "bg-[#3e7b52] text-white shadow-sm"
              : isDark
              ? "text-[#859b89] hover:text-white"
              : "text-[#526956] hover:text-[#142617]"
          }`}
        >
          Pending Applications ({pendingApplications.length})
        </button>

        <button
          onClick={() => setActiveSubTab("quotes")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all relative ${
            activeSubTab === "quotes"
              ? "bg-[#3e7b52] text-white shadow-sm"
              : isDark
              ? "text-[#859b89] hover:text-white"
              : "text-[#526956] hover:text-[#142617]"
          }`}
        >
          Customer Quotations ({tradeQuotations.length})
        </button>

        <button
          onClick={() => setActiveSubTab("credits")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all relative ${
            activeSubTab === "credits"
              ? "bg-[#3e7b52] text-white shadow-sm"
              : isDark
              ? "text-[#859b89] hover:text-white"
              : "text-[#526956] hover:text-[#142617]"
          }`}
        >
          B2B Credit Limits
        </button>
      </div>

      {/* TAB 1: PENDING TRADE APPLICATIONS */}
      {activeSubTab === "applications" && (
        <div className="space-y-4">
          {pendingApplications.length === 0 ? (
            <div
              className={`p-12 rounded-2xl border text-center ${
                isDark ? "bg-[#141a15] border-[#253327]" : "bg-white border-[#e4ede5]"
              }`}
            >
              <Check size={32} className="mx-auto text-[#3e7b52] mb-3" />
              <p className="font-bold text-sm">All Trade Applications Reviewed</p>
              <p className="text-xs text-[#627766] mt-1">
                No pending design studio registrations awaiting atelier tier assignment.
              </p>
            </div>
          ) : (
            pendingApplications.map((app) => (
              <div
                key={app._id}
                className={`p-6 rounded-2xl border transition-all ${
                  isDark
                    ? "bg-[#141a15] border-[#253327]"
                    : "bg-white border-[#e4ede5] shadow-sm"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-[#3e7b52]/10 text-[#3e7b52] flex items-center justify-center shrink-0">
                      <Building2 size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold tracking-tight">
                          {app.company?.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#627766] mt-0.5">
                        Applicant: {app.user?.firstName} {app.user?.lastName} ({app.user?.email}) · {app.company?.phone}
                      </p>
                      <p className="text-xs text-[#627766] mt-0.5">
                        Business: {app.company?.businessType} · Reg: {app.company?.registrationNumber} · VAT: {app.company?.taxId}
                      </p>
                      <p className="text-xs font-semibold text-[#3e7b52] mt-1.5">
                        Estimated Annual Spend: {app.annualSpendEstimate}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end lg:self-center">
                    <button
                      onClick={() => {
                        setSelectedAppForReview(app);
                        setAssignedCredit(50000);
                      }}
                      className="px-4 py-2 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <ShieldCheck size={14} /> Review & Assign Tier
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: QUOTATION NEGOTIATIONS */}
      {activeSubTab === "quotes" && (
        <div className="space-y-4">
          {tradeQuotations.map((quote) => (
            <div
              key={quote._id}
              className={`p-6 rounded-2xl border transition-all ${
                isDark
                  ? "bg-[#141a15] border-[#253327]"
                  : "bg-white border-[#e4ede5] shadow-sm"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#3e7b52]/10 text-[#3e7b52] flex items-center justify-center shrink-0">
                    <FileSpreadsheet size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-bold text-[#3e7b52]">
                        {quote.quoteNumber}
                      </span>
                      <span className="text-xs font-bold">
                        · {quote.companyName || "Kensington Heritage"}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          quote.status === "APPROVED"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : quote.status === "NEGOTIATING"
                            ? "bg-amber-500/15 text-amber-600"
                            : "bg-[#3e7b52]/15 text-[#3e7b52]"
                        }`}
                      >
                        {quote.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#627766] mt-1">
                      {quote.items?.length} Items · Subtotal: £{quote.subtotal?.toLocaleString()} · Current Total: £{(quote.grandTotal || quote.subtotal)?.toLocaleString()}
                    </p>
                    {quote.customerNotes && (
                      <p className="text-xs text-[#627766] italic mt-1 max-w-xl">
                        &quot;{quote.customerNotes}&quot;
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedQuoteForNegotiate(quote);
                      setNegotiatedDiscount(quote.discount || 500);
                      setAdminNotes(quote.adminNotes || "");
                    }}
                    className="px-4 py-2 rounded-full border border-[#3e7b52] text-[#3e7b52] hover:bg-[#3e7b52] hover:text-white text-xs font-bold transition-all flex items-center gap-1.5"
                  >
                    <Sliders size={14} /> Negotiate Concession
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: B2B CREDIT LIMITS */}
      {activeSubTab === "credits" && (
        <div
          className={`rounded-2xl border p-6 overflow-hidden ${
            isDark ? "bg-[#141a15] border-[#253327]" : "bg-white border-[#e4ede5]"
          }`}
        >
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className={`border-b text-[11px] font-semibold uppercase tracking-wider text-[#627766] ${
                  isDark ? "border-[#253327]" : "border-[#edf2ee]"
                }`}
              >
                <th className="pb-3 pl-2">Design Firm</th>
                <th className="pb-3">Credit Limit</th>
                <th className="pb-3">Used Balance</th>
                <th className="pb-3">Available Line</th>
                <th className="pb-3">Payment Term</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-[#202c22]" : "divide-[#edf2ee]"
              }`}
            >
              {[
                { name: "Kensington Heritage Interiors Ltd", limit: 50000, used: 13580, term: "NET_30", status: "ACTIVE" },
                { name: "Belgravia Design Guild", limit: 100000, used: 62400, term: "NET_60", status: "ACTIVE" },
                { name: "Soho House & Co Studio", limit: 150000, used: 88900, term: "NET_60", status: "ACTIVE" },
              ].map((crd, idx) => (
                <tr key={idx} className="hover:bg-[#f8fbf9] dark:hover:bg-[#1a231b]">
                  <td className="py-3.5 pl-2 font-bold">{crd.name}</td>
                  <td className="py-3.5 font-bold">£{crd.limit.toLocaleString()}</td>
                  <td className="py-3.5 text-[#859b89]">£{crd.used.toLocaleString()}</td>
                  <td className="py-3.5 font-bold text-[#3e7b52]">
                    £{(crd.limit - crd.used).toLocaleString()}
                  </td>
                  <td className="py-3.5 font-mono text-xs">{crd.term}</td>
                  <td className="py-3.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600">
                      {crd.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Application Modal */}
      {selectedAppForReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${
              isDark
                ? "bg-[#141a15] border-[#253327] text-white"
                : "bg-white border-[#dce8df] text-[#142617]"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <h3 className="text-base font-bold">
                Review: {selectedAppForReview.company?.name}
              </h3>
              <button
                onClick={() => setSelectedAppForReview(null)}
                className="p-1 text-[#859b89] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1">
                  Assign Trade Tier
                </label>
                <select
                  value={assignedTier}
                  onChange={(e) => setAssignedTier(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none font-medium ${
                    isDark
                      ? "bg-[#1f2c21] border-[#314633] text-white"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                  }`}
                >
                  <option value="tier_bronze">Tier 1: Trade Standard (15% OFF - £10,000 Credit)</option>
                  <option value="tier_silver">Tier 2: Trade Silver (20% OFF - £25,000 Credit)</option>
                  <option value="tier_gold">Tier 3: Trade Gold (25% OFF - £50,000 Credit)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1">
                  Approved Credit Limit (£ GBP)
                </label>
                <input
                  type="number"
                  value={assignedCredit}
                  onChange={(e) => setAssignedCredit(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                    isDark
                      ? "bg-[#1f2c21] border-[#314633] text-white"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1">
                  Rejection Reason (if rejecting)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unverified business registration number."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none ${
                    isDark
                      ? "bg-[#1f2c21] border-[#314633] text-white"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-inherit">
              <button
                type="button"
                onClick={() => handleReviewSubmit("REJECTED")}
                disabled={reviewingAction}
                className="px-4 py-2 rounded-full border border-rose-500 text-rose-500 hover:bg-rose-500 hover:text-white text-xs font-bold transition-all"
              >
                Reject Application
              </button>
              <button
                type="button"
                onClick={() => handleReviewSubmit("APPROVED")}
                disabled={reviewingAction}
                className="px-6 py-2 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Check size={14} /> Approve & Grant Access
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Negotiate Quote Modal */}
      {selectedQuoteForNegotiate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form
            onSubmit={handleNegotiateSubmit}
            className={`w-full max-w-lg rounded-2xl border p-6 space-y-4 shadow-2xl ${
              isDark
                ? "bg-[#141a15] border-[#253327] text-white"
                : "bg-white border-[#dce8df] text-[#142617]"
            }`}
          >
            <div className="flex items-center justify-between pb-3 border-b border-inherit">
              <h3 className="text-base font-bold">
                Negotiate: {selectedQuoteForNegotiate.quoteNumber}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedQuoteForNegotiate(null)}
                className="p-1 text-[#859b89] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1">
                  Volume Concession Discount (£ GBP)
                </label>
                <input
                  type="number"
                  value={negotiatedDiscount}
                  onChange={(e) => setNegotiatedDiscount(e.target.value)}
                  className={`w-full p-2.5 rounded-lg border outline-none font-bold ${
                    isDark
                      ? "bg-[#1f2c21] border-[#314633] text-white"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1">
                  Atelier Remark to Client
                </label>
                <textarea
                  rows="3"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Concession granted for commercial contract volume."
                  className={`w-full p-2.5 rounded-lg border outline-none resize-none ${
                    isDark
                      ? "bg-[#1f2c21] border-[#314633] text-white"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                  }`}
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-inherit">
              <button
                type="button"
                onClick={() => setSelectedQuoteForNegotiate(null)}
                className="px-4 py-2 rounded-full border border-inherit text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={negotiatingAction}
                className="px-6 py-2 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Check size={14} /> Send Negotiated Quote
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
