import {
  Building2,
  Award,
  ShieldCheck,
  CreditCard,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  FileCheck,
  UserCheck,
} from "lucide-react";
import { useAdmin } from "../../AdminContext";

export default function TradeCompanyProfile() {
  const { theme, tradeProfile, tradeCredit, authUser } = useAdmin();
  const isDark = theme === "dark";

  const companyName = tradeProfile?.company?.name || authUser?.companyName || (authUser?.name ? `${authUser.name} Studio Ltd` : "Atelier Design Studio Ltd");
  const email = tradeProfile?.company?.email || authUser?.email || "trade@houseofhackney.com";
  const regNumber = tradeProfile?.company?.registrationNumber || `GB-${(authUser?._id || "9823145").slice(-7).toUpperCase()}`;

  const company = tradeProfile?.company || {
    name: companyName,
    registrationNumber: regNumber,
    taxId: `GB${(authUser?._id || "123456789").slice(-9).toUpperCase()}`,
    businessType: "Architectural & Interior Design Studio",
    email,
    phone: authUser?.phone || "+44 (0) 20 7739 3901",
    address: "St. Michael's Church, Mark Street, Shoreditch, London EC2A 4ER, United Kingdom",
  };

  const tier = tradeProfile?.tier || {
    displayName: "Trade Gold Patron",
    discountPercentage: 25,
    creditLimit: 50000,
    paymentTerm: "NET_30",
  };

  const perks = [
    "25% Wholesale Margin across all collections",
    "Complimentary Full-Width Wallpaper & Memo Fabric Samples",
    "Dedicated Senior Atelier Account Concierge (London)",
    "Bespoke recolouring and commercial fire certification support",
    "NET_30 credit line invoicing with priority dispatch reserves",
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
          Company Profile & Trade Membership
        </h1>
        <p className="text-xs text-[#627766] mt-0.5">
          Verified professional account credentials, tax registration, and active atelier privileges
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Identity Card */}
        <div
          className={`lg:col-span-2 rounded-2xl border p-6 transition-colors ${
            isDark
              ? "bg-[#141a15] border-[#253327]"
              : "bg-white border-[#e4ede5]"
          }`}
        >
          <div className="flex items-center gap-3 pb-5 border-b border-inherit">
            <div className="w-12 h-12 rounded-2xl bg-[#3e7b52]/15 text-[#3e7b52] flex items-center justify-center font-bold">
              <Building2 size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold tracking-tight">{company.name}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3e7b52] text-white">
                  <ShieldCheck size={11} /> Verified
                </span>
              </div>
              <p className="text-xs text-[#627766] mt-0.5">{company.businessType}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-5 text-xs">
            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? "bg-[#19221a] border-[#263728]" : "bg-[#f8fbf9] border-[#e2ece4]"
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-[#627766] block mb-1">
                Company Registration No.
              </span>
              <span className="font-mono font-bold text-sm text-[#3e7b52]">
                {company.registrationNumber}
              </span>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? "bg-[#19221a] border-[#263728]" : "bg-[#f8fbf9] border-[#e2ece4]"
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-[#627766] block mb-1">
                VAT / Tax Identification
              </span>
              <span className="font-mono font-bold text-sm">{company.taxId}</span>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? "bg-[#19221a] border-[#263728]" : "bg-[#f8fbf9] border-[#e2ece4]"
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-[#627766] block mb-1 flex items-center gap-1.5">
                <Mail size={12} /> Billing Email
              </span>
              <span className="font-medium">{company.email}</span>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                isDark ? "bg-[#19221a] border-[#263728]" : "bg-[#f8fbf9] border-[#e2ece4]"
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-[#627766] block mb-1 flex items-center gap-1.5">
                <Phone size={12} /> Contact Telephone
              </span>
              <span className="font-medium">{company.phone}</span>
            </div>

            <div
              className={`sm:col-span-2 p-3.5 rounded-xl border ${
                isDark ? "bg-[#19221a] border-[#263728]" : "bg-[#f8fbf9] border-[#e2ece4]"
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-[#627766] block mb-1 flex items-center gap-1.5">
                <MapPin size={12} /> Registered Studio & Billing Address
              </span>
              <span className="font-medium leading-relaxed">{company.address}</span>
            </div>
          </div>
        </div>

        {/* Tier Privileges Summary */}
        <div
          className={`rounded-2xl border p-6 flex flex-col justify-between transition-colors ${
            isDark
              ? "bg-[#141a15] border-[#253327]"
              : "bg-white border-[#e4ede5]"
          }`}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-[#3e7b52]/15 text-[#3e7b52] flex items-center justify-center font-bold">
                <Award size={16} />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">{tier.displayName}</h3>
                <span className="text-[10px] text-[#3e7b52] font-bold">
                  {tier.discountPercentage}% Wholesale Margin
                </span>
              </div>
            </div>

            <div className="space-y-2.5 mt-5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#627766] block">
                Your Approved Privileges:
              </span>
              {perks.map((perk, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <CheckCircle2 size={14} className="text-[#3e7b52] shrink-0 mt-0.5" />
                  <span className="text-[#627766] dark:text-[#a0b5a3] leading-relaxed">
                    {perk}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`mt-6 p-4 rounded-xl border text-xs ${
              isDark
                ? "bg-[#1a271d] border-[#293d2c]"
                : "bg-[#edf6f0] border-[#d4e6d7]"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <UserCheck size={14} className="text-[#3e7b52]" />
              <strong className="text-[#3e7b52]">Dedicated Concierge</strong>
            </div>
            <p className="text-[11px] text-[#627766] leading-relaxed">
              Senior Atelier Manager: Rupert Sterling
              <br />
              Direct: +44 20 7739 3901
              <br />
              Email: trade@houseofhackney.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
