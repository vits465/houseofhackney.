import { useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  CreditCard,
  FileSpreadsheet,
  Package,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useAdmin } from "../../AdminContext";
import RequestQuoteModal from "./RequestQuoteModal";
import ConvertQuoteModal from "./ConvertQuoteModal";
import UpgradeTierModal from "./UpgradeTierModal";

export default function TradeOverview() {
  const {
    theme,
    tradeProfile,
    tradeCredit,
    tradeQuotations,
    setActiveTab,
    approveQuote,
    authUser,
  } = useAdmin();
  const isDark = theme === "dark";

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedQuoteForConvert, setSelectedQuoteForConvert] = useState(null);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

  const companyName = tradeProfile?.company?.name || authUser?.companyName || (authUser?.name ? `${authUser.name} Studio Ltd` : "Atelier Design Studio Ltd");
  const company = tradeProfile?.company || {
    name: companyName,
    businessType: "Interior Design Studio",
    registrationNumber: `GB-${(authUser?._id || "9823145").slice(-7).toUpperCase()}`,
  };

  const tier = tradeProfile?.tier || {
    displayName: "Trade Gold Patron",
    discountPercentage: 25,
    paymentTerm: "NET_30",
  };

  const credit = tradeCredit || {
    totalCredit: 50000,
    usedCredit: 0,
    availableCredit: 50000,
    paymentTerm: "NET_30",
  };

  const creditUsagePct = Math.round(
    ((credit.usedCredit || 0) / (credit.totalCredit || 50000)) * 100
  );

  const pendingQuotesCount = tradeQuotations.filter(
    (q) => q.status === "REQUESTED" || q.status === "NEGOTIATING"
  ).length;

  const approvedQuotesCount = tradeQuotations.filter(
    (q) => q.status === "APPROVED"
  ).length;

  return (
    <div className="space-y-6">
      {/* hero welcome & partner status banner */}
      <div
        className={`relative overflow-hidden rounded-3xl p-6 sm:p-8 border shadow-sm transition-colors duration-300 ${
          isDark
            ? "bg-gradient-to-br from-[#162318] via-[#1a291d] to-[#121c14] border-[#253928] text-white"
            : "bg-gradient-to-br from-[#edf6f0] via-[#f4faf5] to-[#ffffff] border-[#d8e8dc] text-[#142617]"
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#3e7b52] text-white shadow-sm">
                <ShieldCheck size={13} />
                Verified B2B Partner
              </span>
              <span
                className={`text-xs font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                  isDark
                    ? "border-[#2e4231] text-[#8fa894]"
                    : "border-[#d0e0d3] text-[#4a6b51]"
                }`}
              >
                Reg: {company.registrationNumber}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {company.name}
            </h1>
            <p
              className={`text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed ${
                isDark ? "text-[#9cb5a2]" : "text-[#506854]"
              }`}
            >
              Welcome to your dedicated House of Hackney B2B Trade Portal. Access
              exclusive wholesale tiers, manage project quotations, and utilize your
              approved net payment credit line.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setUpgradeModalOpen(true)}
              className="px-4 py-2.5 rounded-full border border-[#3e7b52]/50 bg-[#3e7b52]/15 hover:bg-[#3e7b52]/25 text-[#3e7b52] dark:text-[#7ec792] text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <Sparkles size={14} />
              Upgrade Tier
            </button>
            <button
              onClick={() => setRequestModalOpen(true)}
              className="px-5 py-2.5 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all flex items-center gap-2 shadow-sm shadow-[#3e7b52]/25"
            >
              <Plus size={15} />
              Request New Quotation
            </button>
            <button
              onClick={() => setActiveTab("trade-catalog")}
              className={`px-5 py-2.5 rounded-full border text-xs font-semibold transition-all flex items-center gap-2 ${
                isDark
                  ? "border-[#2e4231] bg-[#1a291d] text-white hover:bg-[#223526]"
                  : "border-[#cfe0d3] bg-white text-[#142617] hover:bg-[#edf6f0]"
              }`}
            >
              <Package size={15} />
              Wholesale Catalog
            </button>
          </div>
        </div>
      </div>

      {/* 4 key b2b metrics cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Tier Card */}
        <div
          onClick={() => setUpgradeModalOpen(true)}
          className={`p-5 rounded-2xl border transition-all cursor-pointer group hover:scale-[1.01] hover:shadow-md ${
            isDark
              ? "bg-[#141a15] border-[#253327] hover:border-[#3e7b52]/60"
              : "bg-white border-[#e4ede5] hover:border-[#3e7b52]/60"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#627766]">
              Trade Tier
            </span>
            <div className="w-8 h-8 rounded-full bg-[#3e7b52]/10 text-[#3e7b52] flex items-center justify-center group-hover:bg-[#3e7b52] group-hover:text-white transition-colors">
              <Award size={16} />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold tracking-tight text-[#3e7b52]">
              {tier.discountPercentage}% OFF
            </p>
            <span className="text-[10px] uppercase font-bold text-[#3e7b52] group-hover:underline flex items-center gap-0.5">
              Upgrade <ChevronRight size={11} />
            </span>
          </div>
          <p
            className={`text-xs mt-1 font-medium ${
              isDark ? "text-[#9db3a1]" : "text-[#526956]"
            }`}
          >
            {tier.displayName || tier.name}
          </p>
        </div>

        {/* Credit Limit */}
        <div
          className={`p-5 rounded-2xl border transition-colors ${
            isDark
              ? "bg-[#141a15] border-[#253327]"
              : "bg-white border-[#e4ede5]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#627766]">
              Available Credit
            </span>
            <div className="w-8 h-8 rounded-full bg-[#3e7b52]/10 text-[#3e7b52] flex items-center justify-center">
              <CreditCard size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight">
            £{(credit.availableCredit || 0).toLocaleString()}
          </p>
          <div className="mt-2.5">
            <div className="h-1.5 w-full bg-[#dbe7de] dark:bg-[#253928] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#3e7b52] rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, creditUsagePct)}%` }}
              />
            </div>
            <p className="text-[10px] text-[#627766] mt-1.5 flex justify-between font-mono">
              <span>Used: £{(credit.usedCredit || 0).toLocaleString()}</span>
              <span>Limit: £{(credit.totalCredit || 50000).toLocaleString()}</span>
            </p>
          </div>
        </div>

        {/* Quotations Pipeline */}
        <div
          className={`p-5 rounded-2xl border transition-colors ${
            isDark
              ? "bg-[#141a15] border-[#253327]"
              : "bg-white border-[#e4ede5]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#627766]">
              Quotations Pipeline
            </span>
            <div className="w-8 h-8 rounded-full bg-[#3e7b52]/10 text-[#3e7b52] flex items-center justify-center">
              <FileSpreadsheet size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight">
            {tradeQuotations.length} Active
          </p>
          <p
            className={`text-xs mt-1 font-medium ${
              isDark ? "text-[#9db3a1]" : "text-[#526956]"
            }`}
          >
            {approvedQuotesCount} Ready to Convert · {pendingQuotesCount} In Review
          </p>
        </div>

        {/* Payment Term */}
        <div
          className={`p-5 rounded-2xl border transition-colors ${
            isDark
              ? "bg-[#141a15] border-[#253327]"
              : "bg-white border-[#e4ede5]"
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#627766]">
              Payment Terms
            </span>
            <div className="w-8 h-8 rounded-full bg-[#3e7b52]/10 text-[#3e7b52] flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold tracking-tight text-[#3e7b52]">
            {credit.paymentTerm || "NET_30"}
          </p>
          <p
            className={`text-xs mt-1 font-medium ${
              isDark ? "text-[#9db3a1]" : "text-[#526956]"
            }`}
          >
            Invoiced on dispatch · Auto-settle
          </p>
        </div>
      </div>

      {/* quotation pipeline section with live conversion */}
      <div
        className={`rounded-2xl border p-6 transition-colors ${
          isDark
            ? "bg-[#141a15] border-[#253327]"
            : "bg-white border-[#e4ede5]"
        }`}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-bold tracking-tight">Active Quotations Pipeline</h2>
            <p className="text-xs text-[#627766] mt-0.5">
              Review custom pricing proposals, negotiated concessions, and convert to active orders
            </p>
          </div>
          <button
            onClick={() => setActiveTab("trade-quotes")}
            className="text-xs font-bold text-[#3e7b52] hover:underline flex items-center gap-1"
          >
            View All Quotes <ChevronRight size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr
                className={`border-b text-[11px] font-semibold uppercase tracking-wider text-[#627766] ${
                  isDark ? "border-[#253327]" : "border-[#edf2ee]"
                }`}
              >
                <th className="pb-3 pl-2">Quote #</th>
                <th className="pb-3">Items Spec</th>
                <th className="pb-3">Retail Value</th>
                <th className="pb-3">Trade Quoted Total</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y ${
                isDark ? "divide-[#202c22]" : "divide-[#edf2ee]"
              }`}
            >
              {tradeQuotations.map((quote) => {
                const total =
                  quote.grandTotal || quote.negotiatedSubtotal || quote.subtotal || 0;

                return (
                  <tr
                    key={quote._id}
                    className={`transition-colors ${
                      isDark ? "hover:bg-[#1a231b]" : "hover:bg-[#f8fbf9]"
                    }`}
                  >
                    <td className="py-3.5 pl-2 font-mono font-bold text-[#3e7b52]">
                      {quote.quoteNumber}
                    </td>
                    <td className="py-3.5">
                      <div className="font-medium">
                        {quote.items?.length || 1} Products Listed
                      </div>
                      <div className="text-[11px] text-[#627766] truncate max-w-xs">
                        {quote.items?.[0]?.name}
                        {quote.items?.length > 1 && ` + ${quote.items.length - 1} more`}
                      </div>
                    </td>
                    <td className="py-3.5 line-through text-[#859b89]">
                      £{(quote.subtotal || total).toLocaleString()}
                    </td>
                    <td className="py-3.5 font-bold text-[#142617] dark:text-[#f2f7f3]">
                      £{total.toLocaleString()}
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
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
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      {quote.status === "APPROVED" && (
                        <button
                          onClick={() => setSelectedQuoteForConvert(quote)}
                          className="px-3 py-1.5 rounded-full bg-[#3e7b52] text-white text-[11px] font-bold hover:bg-[#346a45] transition-all inline-flex items-center gap-1 shadow-sm"
                        >
                          <CheckCircle2 size={13} /> Convert to Order
                        </button>
                      )}

                      {quote.status === "NEGOTIATING" && (
                        <button
                          onClick={() => approveQuote(quote._id)}
                          className="px-3 py-1.5 rounded-full border border-[#3e7b52] text-[#3e7b52] hover:bg-[#3e7b52] hover:text-white text-[11px] font-bold transition-all inline-flex items-center gap-1"
                        >
                          Approve Quote
                        </button>
                      )}

                      {quote.status === "CONVERTED" && (
                        <span className="text-[11px] font-mono text-[#627766]">
                          {quote.convertedOrderNumber || (typeof quote.convertedOrder === "object" ? quote.convertedOrder?.orderNumber : quote.convertedOrder) || "Order Dispatched"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <UpgradeTierModal
        isOpen={upgradeModalOpen}
        onClose={() => setUpgradeModalOpen(false)}
      />
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
