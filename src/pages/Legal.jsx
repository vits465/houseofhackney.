import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShieldCheck, FileText, Cookie, Eye } from "lucide-react";

const LEGAL_SECTIONS = [
  {
    id: "privacy",
    title: "Privacy Policy",
    icon: ShieldCheck,
    path: "/privacy",
    lastUpdated: "October 2026",
    content: (
      <div className="space-y-6 text-xs sm:text-sm text-[#4a4c46] leading-relaxed">
        <p>
          At House of Hackney, we are committed to safeguarding the privacy and personal data of our
          esteemed patrons, interior designers, and visitors to our digital sanctuary. This policy outlines
          how we collect, process, and protect your information in accordance with the UK Data Protection Act
          and the General Data Protection Regulation (GDPR).
        </p>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          1. Information We Collect
        </h3>
        <p>
          When you place a commission for wallpapers, fabrics, or bespoke furnishings, or register for a
          Patron Account, we collect your name, residential and delivery addresses, email address, telephone
          number, and payment tokens handled via our encrypted payment gateways.
        </p>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          2. How We Use Your Data
        </h3>
        <p>
          Your personal data is utilized strictly for the fulfilment of your bespoke orders, communicating
          dispatch updates from our English print mills, administering trade accounts, and providing
          personalized interior styling consultations. We do not sell or lease patron data to third-party brokers.
        </p>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          3. Security & Data Retention
        </h3>
        <p>
          All transactions are secured with 256-bit SSL encryption. We retain patron commission histories
          to assist with re-orders and color matching across dye lots, until such time as you request
          permanent deletion under your statutory rights.
        </p>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          4. Contact Our Data Protection Officer
        </h3>
        <p>
          For data access requests or privacy inquiries, please contact our legal team at{" "}
          <span className="font-semibold text-[#171713]">legal@houseofhackney.com</span>.
        </p>
      </div>
    ),
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    icon: FileText,
    path: "/terms",
    lastUpdated: "October 2026",
    content: (
      <div className="space-y-6 text-xs sm:text-sm text-[#4a4c46] leading-relaxed">
        <p>
          Welcome to House of Hackney. These Terms and Conditions govern your acquisition of luxury
          wallpapers, fabrics, furniture, and bespoke interior services through our online boutique and
          ateliers.
        </p>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          1. Bespoke Printing & Batch Tolerances
        </h3>
        <p>
          Our wallpapers and textiles are crafted using traditional British methods and FSC-certified papers.
          Subtle variations in dye lots may occur between printing batches. We strongly encourage calculating
          all requirements accurately to ensure paper is supplied from the same production batch.
        </p>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          2. Pricing & Currency
        </h3>
        <p>
          Prices are displayed in British Pounds Sterling (£ GBP), US Dollars ($ USD), or Euros (€ EUR).
          All applicable UK Value Added Tax (VAT) is included where indicated. International duties are
          settled transparently at checkout.
        </p>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          3. Cancellation & Returns Policy
        </h3>
        <p>
          Standard unopened wallpaper rolls may be returned within 28 days. Cut-to-order fabrics, custom
          upholstered sofas, and made-to-measure curtains are non-refundable once cutting or manufacturing has commenced.
        </p>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          4. Intellectual Property
        </h3>
        <p>
          All iconic prints (including ARTEMIS, PLANTASIA, ZEUS, and HOLLYHOCKS) and bespoke artwork are the
          exclusive intellectual property of House of Hackney Ltd. Unauthorized commercial reproduction is
          strictly prohibited.
        </p>
      </div>
    ),
  },
  {
    id: "cookies",
    title: "Cookie Preferences",
    icon: Cookie,
    path: "/cookies",
    lastUpdated: "October 2026",
    content: (
      <div className="space-y-6 text-xs sm:text-sm text-[#4a4c46] leading-relaxed">
        <p>
          We employ cookies and similar technologies to ensure seamless shopping navigation, retain items in
          your shopping bag, remember your preferred currency, and evaluate site analytics to enhance the patron experience.
        </p>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          1. Essential Cookies
        </h3>
        <p>
          These are required for basic core functionality, including session restoration, secure user authentication,
          and shopping cart persistence. These cannot be disabled.
        </p>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          2. Experience & Performance Cookies
        </h3>
        <p>
          Used to analyze patron navigation patterns and load times, helping us refine our collections and
          enhance responsive performance across mobile and desktop devices.
        </p>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          3. Managing Preferences
        </h3>
        <p>
          You may alter your browser cookie settings at any time to block non-essential cookies, though
          certain interactive styling tools may experience reduced functionality.
        </p>
      </div>
    ),
  },
  {
    id: "accessibility",
    title: "Accessibility Statement",
    icon: Eye,
    path: "/accessibility",
    lastUpdated: "October 2026",
    content: (
      <div className="space-y-6 text-xs sm:text-sm text-[#4a4c46] leading-relaxed">
        <p>
          House of Hackney believes that the beauty of nature and pattern should be accessible to all. We
          strive to adhere to the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards across
          our digital platform.
        </p>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          1. Accessibility Features
        </h3>
        <ul className="list-disc pl-5 space-y-2">
          <li>High-contrast text modes conforming to readable ratios against our vintage parchment palettes</li>
          <li>Descriptive alt text for all botanical prints, wallpaper patterns, and fabric collections</li>
          <li>Keyboard navigability across main navigation, megamenu, search, and user profile tabs</li>
          <li>ARIA labels on all interactive icons and screen reader support</li>
        </ul>

        <h3 className="font-serif text-lg text-[#171713] font-medium pt-2">
          2. Feedback & Support
        </h3>
        <p>
          If you encounter any difficulty navigating our boutique, please contact our accessibility liaison
          at <span className="font-semibold text-[#171713]">accessibility@houseofhackney.com</span> for
          immediate assistance.
        </p>
      </div>
    ),
  },
];

export default function Legal({ defaultTopic }) {
  const location = useLocation();

  const activeTopic = useMemo(() => {
    if (defaultTopic) return defaultTopic;
    const path = location.pathname.toLowerCase();
    if (path.includes("terms")) return "terms";
    if (path.includes("cookies")) return "cookies";
    if (path.includes("accessibility")) return "accessibility";
    return "privacy";
  }, [location.pathname, defaultTopic]);

  const currentSection =
    LEGAL_SECTIONS.find((s) => s.id === activeTopic) || LEGAL_SECTIONS[0];

  return (
    <div className="min-h-screen bg-[#f6f3ec] text-[#171713] pb-24">
      {/* Top Banner */}
      <div className="border-b border-[#dedbd4] bg-[#faf8f4] py-12 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="text-[11px] font-semibold tracking-[2px] uppercase text-[#c29b38]">
            LEGAL, POLICY & GOVERNANCE
          </span>
          <h1 className="mt-2 font-serif text-3xl sm:text-4xl font-medium tracking-tight text-[#171713]">
            {currentSection.title}
          </h1>
          <p className="mt-2 text-xs text-[#77746c]">
            Last updated: {currentSection.lastUpdated} &bull; House of Hackney Ltd.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
          {/* Policy Navigation (4 cols) */}
          <aside className="md:col-span-4">
            <div className="sticky top-28 rounded-2xl border border-[#dedbd4] bg-white p-3 shadow-xs space-y-1">
              <div className="px-3 py-2 text-[10px] font-semibold tracking-wider uppercase text-[#88857d]">
                POLICY SANCTUARY
              </div>

              {LEGAL_SECTIONS.map((sec) => {
                const Icon = sec.icon;
                const isActive = sec.id === activeTopic;

                return (
                  <Link
                    key={sec.id}
                    to={sec.path}
                    className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold tracking-wider transition-all ${
                      isActive
                        ? "bg-[#394132] text-white shadow-sm"
                        : "text-[#555] hover:bg-[#f6f3ec] hover:text-[#171713]"
                    }`}
                  >
                    <Icon size={16} />
                    <span>{sec.title}</span>
                  </Link>
                );
              })}

              <div className="mt-4 border-t border-[#dedbd4] pt-4 px-3 text-[11px] text-[#77746c]">
                <p>Need legal assistance?</p>
                <Link
                  to="/help"
                  className="mt-1 font-semibold text-[#394132] hover:underline block"
                >
                  Contact Client Concierge &rarr;
                </Link>
              </div>
            </div>
          </aside>

          {/* Policy Document Content (8 cols) */}
          <main className="md:col-span-8">
            <div className="rounded-2xl border border-[#dedbd4] bg-white p-6 sm:p-10 shadow-xs">
              <h2 className="font-serif text-2xl text-[#171713] border-b border-[#dedbd4] pb-4">
                {currentSection.title}
              </h2>

              <div className="mt-6">{currentSection.content}</div>

              <div className="mt-10 border-t border-[#dedbd4] pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-[#77746c]">
                <span>Registered in England & Wales &bull; Co. No. 07255140</span>
                <Link
                  to="/"
                  className="font-semibold text-[#394132] hover:underline uppercase tracking-wider"
                >
                  Return to Storefront
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
