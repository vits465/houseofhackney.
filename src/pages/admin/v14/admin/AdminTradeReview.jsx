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
    approveQuote,
    settlePartnerCredit,
    products,
    tradeTiers,
    allTradeProfiles,
    setSelectedOrder,
  } = useAdmin();
  const isDark = theme === "dark";

  const FALLBACK_IMG =
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=400&q=80";

  const resolveItemDetails = (item) => {
    const name =
      item.name ||
      item.product?.name ||
      item.title ||
      "Luxury Creation";

    const sku =
      item.product?.sku ||
      item.sku ||
      "HOH-TRD-01";

    const category =
      item.product?.productType ||
      item.category ||
      item.product?.category?.name ||
      "Wallpaper & Fabric";

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

  const [activeSubTab, setActiveSubTab] = useState("applications"); // 'applications' | 'quotes' | 'credits'
  const [selectedAppForReview, setSelectedAppForReview] = useState(null);
  const [selectedQuoteForNegotiate, setSelectedQuoteForNegotiate] = useState(null);
  const [quoteFilter, setQuoteFilter] = useState("ALL");

  // Application review modal form state
  const [assignedTier, setAssignedTier] = useState("tier_gold");
  const [assignedCredit, setAssignedCredit] = useState(50000);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewingAction, setReviewingAction] = useState(false);

  // Quote negotiation modal state
  const [negotiatedDiscount, setNegotiatedDiscount] = useState(500);
  const [adminNotes, setAdminNotes] = useState("");
  const [negotiatingAction, setNegotiatingAction] = useState(false);

  // Sub-tab 3: Approved Partners List
  const approvedPartners = (allTradeProfiles || [])
    .filter((p) => p.status === "APPROVED")
    .map((p) => {
      const firmName = p.company?.name || "Bespoke Design Firm";
      const applicant = p.user
        ? `${p.user.firstName || ""} ${p.user.lastName || ""} (${p.user.email || ""})`.trim()
        : "";
      const tierName = p.tier?.displayName || p.tier?.name || "GOLD";
      const discount = p.tier?.discountPercentage || 25;
      const limit = Number(p.creditLimit || 50000);
      const used = Number(p.usedCredit || 0);
      const term =
        p.tier?.paymentTerm ||
        (p.tier?.maxCreditPeriod ? `NET_${p.tier.maxCreditPeriod}` : "NET_30");
      return {
        companyId: p.company?._id || p._id || firmName,
        name: firmName,
        applicant,
        tierName,
        discount,
        limit,
        used,
        term,
        status: "APPROVED",
      };
    });

  const displayApprovedPartners =
    approvedPartners.length > 0
      ? approvedPartners
      : [
          {
            companyId: "crd_sterling",
            name: "Sterling Architectural Studio",
            applicant: "Alistair Sterling (sterling_atelier@example.com)",
            tierName: "GOLD",
            discount: 25,
            limit: 50000,
            used: 0,
            term: "NET_30",
            status: "APPROVED",
          },
          {
            companyId: "crd_kensington",
            name: "Kensington Heritage Interiors Ltd",
            applicant: "Eleanor Vane (procurement@kensingtonheritage.co.uk)",
            tierName: "GOLD",
            discount: 25,
            limit: 50000,
            used: 13580,
            term: "NET_30",
            status: "APPROVED",
          },
        ];

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
          Approved Partners & Credit ({displayApprovedPartners.length})
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
            pendingApplications.map((app) => {
              const companyName = app.company?.name || "Bespoke Design Firm";
              const applicantName = app.user
                ? `${app.user.firstName || ""} ${app.user.lastName || ""}`.trim() || "Design Firm Principal"
                : "Registered Principal";
              const applicantEmail = app.user?.email || "studio@designfirm.com";
              const phone = app.company?.phone || app.phone || app.user?.phone || "Direct line provided";
              const bType = app.company?.businessType || app.businessType || "INTERIOR_DESIGNER";
              const regNumber = app.company?.registrationNumber || app.company?.taxNumber || app.gstNumber || app.vatNumber || "CRN-ON-FILE";
              const website = app.company?.website || app.website;
              const notes = app.rejectionReason || app.notes || app.annualSpendEstimate;

              return (
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
                            {companyName}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            {app.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#627766] mt-0.5">
                          Applicant: {applicantName} ({applicantEmail}) · {phone}
                        </p>
                        <p className="text-xs text-[#627766] mt-0.5">
                          Business: {bType} · Reg/Tax: {regNumber}
                          {website && (
                            <> · <a href={website.startsWith("http") ? website : `https://${website}`} target="_blank" rel="noreferrer" className="text-[#3e7b52] underline font-medium">{website}</a></>
                          )}
                        </p>
                        {notes && (
                          <p className="text-xs font-semibold text-[#3e7b52] mt-1.5 italic">
                            Scope Notes: &quot;{notes}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end lg:self-center">
                      <button
                        onClick={() => {
                          setSelectedAppForReview(app);
                          const defaultTier = tradeTiers?.find((t) => t.name === "GOLD") || tradeTiers?.[0];
                          if (defaultTier) {
                            setAssignedTier(defaultTier._id);
                            setAssignedCredit(defaultTier.creditLimit || 50000);
                          } else {
                            setAssignedTier("tier_gold");
                            setAssignedCredit(50000);
                          }
                        }}
                        className="px-4 py-2 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <ShieldCheck size={14} /> Review & Assign Tier
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 2: QUOTATION NEGOTIATIONS */}
      {activeSubTab === "quotes" && (
        <div className="space-y-4">
          {/* Status Filter Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-full border border-inherit max-w-fit">
            {["ALL", "REQUESTED", "NEGOTIATING", "APPROVED", "CONVERTED"].map((st) => (
              <button
                key={st}
                onClick={() => setQuoteFilter(st)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  quoteFilter === st
                    ? "bg-[#3e7b52] text-white shadow-sm"
                    : isDark
                    ? "text-[#859b89] hover:text-white"
                    : "text-[#526956] hover:text-[#142617]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {tradeQuotations
            .filter((q) => quoteFilter === "ALL" || q.status === quoteFilter)
            .map((quote) => {
              const currentTotal = quote.grandTotal || quote.negotiatedSubtotal || quote.subtotal || 0;

              return (
                <div
                  key={quote._id}
                  className={`p-6 rounded-2xl border transition-all ${
                    isDark
                      ? "bg-[#141a15] border-[#253327]"
                      : "bg-white border-[#e4ede5] shadow-sm"
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-inherit">
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
                            · {quote.company?.name || quote.companyName || (quote.user?.firstName ? `${quote.user.firstName} ${quote.user.lastName}` : null) || quote.user?.displayName || "Sterling Atelier Studio"}
                          </span>
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              quote.status === "APPROVED"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : quote.status === "NEGOTIATING"
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                                : quote.status === "CONVERTED"
                                ? "bg-[#3e7b52]/15 text-[#3e7b52]"
                                : "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                            }`}
                          >
                            {quote.status}
                          </span>
                        </div>

                        <p className="text-[11px] text-[#627766] mt-0.5">
                          Patron: {quote.user?.firstName} {quote.user?.lastName} ({quote.user?.email || "sterling_atelier@example.com"}) · Submitted on {new Date(quote.createdAt).toLocaleDateString()}
                        </p>

                        <p className="text-xs text-[#627766] mt-1">
                          {quote.items?.length || 0} Specified Creations · Subtotal: £{(quote.subtotal || 0).toLocaleString()} · Current Total: £{currentTotal.toLocaleString()}
                          {quote.discount > 0 && ` (Includes £${quote.discount} Concession)`}
                        </p>
                        {quote.customerNotes && (
                          <p className="text-xs text-[#627766] dark:text-[#a0b5a3] italic mt-1 max-w-xl">
                            Client Scope: &quot;{quote.customerNotes}&quot;
                          </p>
                        )}
                        {quote.adminNotes && (
                          <p className="text-xs font-semibold text-[#3e7b52] mt-0.5 max-w-xl">
                            Atelier Concession: &quot;{quote.adminNotes}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {quote.status !== "APPROVED" && quote.status !== "CONVERTED" && (
                        <button
                          onClick={() => approveQuote(quote._id)}
                          className="px-4 py-2 rounded-full bg-[#3e7b52] text-white hover:bg-[#346a45] text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                        >
                          <Check size={14} /> Approve Quote
                        </button>
                      )}

                      {quote.status !== "CONVERTED" && (
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
                      )}

                      {quote.status === "APPROVED" && (
                        <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                          <Check size={14} /> Approved & Ready for Conversion
                        </span>
                      )}

                      {quote.status === "CONVERTED" && (() => {
                        const ordNum =
                          quote.convertedOrderNumber ||
                          (typeof quote.convertedOrder === "object" ? quote.convertedOrder?.orderNumber : quote.convertedOrder) ||
                          "TRD-ORD-CONVERTED";

                        return (
                          <button
                            type="button"
                            onClick={() => {
                              if (setSelectedOrder) {
                                const ordObj =
                                  typeof quote.convertedOrder === "object" && quote.convertedOrder
                                    ? quote.convertedOrder
                                    : {
                                        orderNumber: ordNum,
                                        orderStatus: "CONFIRMED",
                                        grandTotal: quote.grandTotal,
                                        subtotal: quote.subtotal,
                                        discount: quote.discount,
                                        items: quote.items,
                                        notes: `Converted from Quotation #${quote.quoteNumber}`,
                                        user: quote.user,
                                        customer: {
                                          name: quote.companyName || quote.user?.displayName || "Trade Patron",
                                          email: quote.user?.email || "trade@atelier.co.uk",
                                        },
                                      };
                                setSelectedOrder(ordObj);
                              }
                            }}
                            title="Click to view full workshop order details in Commerce"
                            className="px-3.5 py-1.5 rounded-full bg-[#edf6f0] dark:bg-[#1d271f] font-mono text-xs font-bold text-[#3e7b52] hover:bg-[#d9ede0] dark:hover:bg-[#253628] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border border-[#3e7b52]/25"
                          >
                            <Check size={13} className="text-[#3e7b52]" />
                            <span>{ordNum}</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Line Items Catalog Breakdown for Super Admin */}
                  <div className="pt-4 space-y-2.5">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#627766]">
                      Requested Catalog Line Items ({quote.items?.length || 0})
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                              className="w-12 h-12 rounded-lg object-cover border border-inherit shrink-0 bg-neutral-200"
                              onError={(e) => { e.target.src = FALLBACK_IMG; }}
                            />
                            <div className="min-w-0 flex-1 text-xs">
                              <p className="font-semibold truncate" title={item.name}>{item.name}</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="font-mono text-[10px] text-[#859b89]">{item.sku}</span>
                                <span className="text-[10px] text-[#627766]">·</span>
                                <span className="text-[10px] text-[#3e7b52] font-medium">{item.category}</span>
                              </div>
                              <div className="flex items-center justify-between mt-1 text-[11px]">
                                <span className="text-[#627766] font-medium">Qty: {item.quantity}</span>
                                <div className="text-right">
                                  <span className="font-bold text-[#3e7b52]">£{item.lineTotal.toLocaleString()}</span>
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
                </div>
              );
            })}
        </div>
      )}

      {/* TAB 3: APPROVED B2B PARTNERS & CREDIT LIMITS */}
      {activeSubTab === "credits" && (
        <div
          className={`rounded-2xl border p-6 overflow-hidden ${
            isDark ? "bg-[#141a15] border-[#253327]" : "bg-white border-[#e4ede5]"
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
                  <th className="pb-3 pl-2">Design Firm & Principal</th>
                  <th className="pb-3">Assigned Tier</th>
                  <th className="pb-3">Credit Limit</th>
                  <th className="pb-3">Used Balance</th>
                  <th className="pb-3">Available Line</th>
                  <th className="pb-3">Payment Term</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right pr-2">Action</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? "divide-[#202c22]" : "divide-[#edf2ee]"
                }`}
              >
                {displayApprovedPartners.map((crd, idx) => (
                  <tr key={idx} className="hover:bg-[#f8fbf9] dark:hover:bg-[#1a231b] transition-colors">
                    <td className="py-3.5 pl-2">
                      <p className="font-bold text-[#142617] dark:text-[#f2f7f3]">{crd.name}</p>
                      {crd.applicant && (
                        <p className="text-[10px] text-[#627766] font-normal">{crd.applicant}</p>
                      )}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3e7b52]/10 text-[#3e7b52]">
                        {crd.tierName} ({crd.discount}% Wholesale Margin)
                      </span>
                    </td>
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
                    <td className="py-3.5 text-right pr-2">
                      {crd.used > 0 ? (
                        <button
                          onClick={() => settlePartnerCredit(crd.companyId, crd.used)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#3e7b52] hover:bg-[#346744] text-white transition-colors shadow-sm"
                          title="Settle full balance"
                        >
                          Settle Balance (£{crd.used.toLocaleString()})
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#859b89] font-medium">Invoices Settled</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
                Review: {selectedAppForReview.company?.name || "Trade Design Application"}
              </h3>
              <button
                onClick={() => setSelectedAppForReview(null)}
                className="p-1 text-[#859b89] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Applicant credentials card */}
            <div
              className={`p-3 rounded-xl border text-xs space-y-1 ${
                isDark ? "bg-[#1c291f] border-[#2c4030]" : "bg-[#f5f9f6] border-[#dce8df]"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#627766]">Applicant:</span>
                <span className="font-bold">
                  {selectedAppForReview.user?.firstName} {selectedAppForReview.user?.lastName} ({selectedAppForReview.user?.email || "studio@design.com"})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-[#627766]">Studio / Business:</span>
                <span>{selectedAppForReview.company?.businessType || selectedAppForReview.businessType || "INTERIOR_DESIGNER"}</span>
              </div>
              {(selectedAppForReview.company?.taxNumber || selectedAppForReview.gstNumber || selectedAppForReview.vatNumber) && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#627766]">Registration / Tax ID:</span>
                  <span className="font-mono">{selectedAppForReview.company?.taxNumber || selectedAppForReview.gstNumber || selectedAppForReview.vatNumber}</span>
                </div>
              )}
              {(selectedAppForReview.company?.website || selectedAppForReview.website) && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-[#627766]">Website:</span>
                  <a
                    href={(selectedAppForReview.company?.website || selectedAppForReview.website).startsWith("http") ? (selectedAppForReview.company?.website || selectedAppForReview.website) : `https://${selectedAppForReview.company?.website || selectedAppForReview.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#3e7b52] underline font-medium"
                  >
                    {selectedAppForReview.company?.website || selectedAppForReview.website}
                  </a>
                </div>
              )}
              {(selectedAppForReview.rejectionReason || selectedAppForReview.notes || selectedAppForReview.annualSpendEstimate) && (
                <div className="pt-1 mt-1 border-t border-inherit">
                  <span className="font-semibold text-[#627766] block">Scope / Notes:</span>
                  <p className="italic text-[#859b89]">
                    {selectedAppForReview.rejectionReason || selectedAppForReview.notes || selectedAppForReview.annualSpendEstimate}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1">
                  Assign Trade Tier
                </label>
                <select
                  value={assignedTier}
                  onChange={(e) => {
                    setAssignedTier(e.target.value);
                    const selected = tradeTiers?.find(
                      (t) => t._id === e.target.value || t.name === e.target.value
                    );
                    if (selected?.creditLimit) {
                      setAssignedCredit(selected.creditLimit);
                    }
                  }}
                  className={`w-full p-2.5 rounded-lg border outline-none font-medium ${
                    isDark
                      ? "bg-[#1f2c21] border-[#314633] text-white"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                  }`}
                >
                  {tradeTiers && tradeTiers.length > 0 ? (
                    tradeTiers.map((t) => (
                      <option key={t._id} value={t._id}>
                        {t.displayName || t.name} ({t.discountPercentage}% Wholesale Margin &mdash; £{Number(t.creditLimit || 50000).toLocaleString()} Credit Line)
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="tier_bronze">Tier 1: Trade Bronze (15% OFF &mdash; £10,000 Credit)</option>
                      <option value="tier_silver">Tier 2: Trade Silver (20% OFF &mdash; £25,000 Credit)</option>
                      <option value="tier_gold">Tier 3: Trade Gold (25% OFF &mdash; £50,000 Credit)</option>
                      <option value="tier_platinum">Tier 4: Trade Platinum (30% OFF &mdash; £100,000 Credit)</option>
                    </>
                  )}
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
              {/* Line items being negotiated */}
              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1.5">
                  Quotation Creations Breakdown ({selectedQuoteForNegotiate.items?.length || 0})
                </label>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-1 rounded-xl border p-2 border-inherit">
                  {selectedQuoteForNegotiate.items?.map((it, idx) => {
                    const itDetails = resolveItemDetails(it);
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg border flex items-center justify-between gap-2.5 text-xs ${
                          isDark ? "bg-[#1f2b21] border-[#2d4231]" : "bg-[#f5f9f6] border-[#dce8df]"
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <img
                            src={itDetails.image}
                            alt={itDetails.name}
                            className="w-8 h-8 rounded object-cover shrink-0"
                            onError={(e) => { e.target.src = FALLBACK_IMG; }}
                          />
                          <div className="truncate">
                            <p className="font-semibold truncate">{itDetails.name}</p>
                            <p className="text-[10px] text-[#627766]">Qty: {itDetails.quantity} · {itDetails.sku}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-[#3e7b52]">£{itDetails.lineTotal.toLocaleString()}</p>
                          <p className="text-[10px] text-[#859b89]">£{itDetails.unitPrice}/unit</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

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
                <p className="text-[10px] text-[#627766] mt-1">
                  Proposed Grand Total: £{Math.max(0, (selectedQuoteForNegotiate.subtotal || 0) - (Number(negotiatedDiscount) || 0)).toLocaleString()}
                </p>
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
