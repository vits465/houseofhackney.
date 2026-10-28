import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  HelpCircle,
  Truck,
  Layers,
  Scissors,
  RotateCcw,
  Briefcase,
  MapPin,
  Clock,
  Send,
  Sparkles,
  Phone,
  ArrowRight,
} from "lucide-react";
import { showSuccess, showError, showLoading, closeAlert } from "../utils/sweetAlert";

const FAQ_CATEGORIES = [
  {
    id: "orders",
    label: "Orders & Despatch",
    icon: Truck,
    faqs: [
      {
        q: "How long will my order take to arrive?",
        a: "All House of Hackney wallpapers and fabrics are printed to order in England to minimize waste. Wallpaper rolls and fabrics typically dispatch within 3–5 working days. Bespoke furniture and made-to-measure curtains take 4–6 weeks. UK deliveries arrive within 1–2 days of dispatch; international orders arrive via DHL Express within 3–5 business days.",
      },
      {
        q: "Where is my parcel despatched from?",
        a: "Our wallpapers are printed in Loughborough, England, and fabrics are woven in traditional English and Scottish heritage mills. Finished orders are dispatched directly from our English fulfilment house with tracked courier service.",
      },
      {
        q: "Can I amend or cancel my order after placing it?",
        a: "Because all designs are printed bespoke for each patron, please contact our concierge within 2 hours of placing your order if you require changes. Once production begins at the mill, cancellations may incur a re-stocking administration fee.",
      },
      {
        q: "Do you ship internationally?",
        a: "Yes, we ship to over 80 countries worldwide via carbon-neutral DHL Express. All duties and local taxes are calculated at checkout so there are no unexpected customs charges upon delivery.",
      },
    ],
  },
  {
    id: "wallpaper",
    label: "Wallpaper & Hanging",
    icon: Layers,
    faqs: [
      {
        q: "How do I calculate how many rolls of wallpaper I need?",
        a: "Measure the total width and height of the walls you wish to cover. Our standard rolls measure 52cm wide by 10.05m long. We strongly recommend using our complimentary wallpaper calculator or contacting our Design Concierge with your room dimensions before ordering to account for pattern repeats.",
      },
      {
        q: "What type of paste should I use?",
        a: "We recommend using a premium ready-mixed, solvent-free tub paste suitable for non-woven wallpapers. Our wallpapers are 'paste-the-wall', making installation substantially easier and cleaner than traditional paste-the-paper products.",
      },
      {
        q: "Are your wallpapers environmentally certified?",
        a: "Yes. All our wallpapers are printed on sustainably sourced, FSC-certified paper using non-toxic water-based inks. Furthermore, for every roll purchased, House of Hackney purchases and protects 35 square metres of endangered rainforest through the World Land Trust.",
      },
    ],
  },
  {
    id: "fabrics",
    label: "Fabrics & Upholstery",
    icon: Scissors,
    faqs: [
      {
        q: "Are your fabrics suitable for heavy upholstery?",
        a: "Yes. Our British cotton velvets, jacquards, and linen blends feature high Martindale rub counts (ranging from 30,000 to 50,000+ rubs), making them ideal for both residential and commercial upholstery.",
      },
      {
        q: "Can I order fabric samples before committing?",
        a: "Absolutely. We encourage patrons to order A4 fabric and wallpaper swatches to observe how the natural light in your home brings out the rich botanical tones.",
      },
      {
        q: "How should I clean and care for House of Hackney velvets?",
        a: "We recommend specialist dry cleaning for all luxury velvets and woven jacquards. For spot treatment, gently dab with a clean, dry, lint-free cloth—never rub or apply harsh detergents.",
      },
    ],
  },
  {
    id: "returns",
    label: "Returns & Exchanges",
    icon: RotateCcw,
    faqs: [
      {
        q: "What is your returns policy?",
        a: "Unopened wallpaper rolls in their original cellophane packaging and home accessories may be returned within 28 days of delivery for a full refund. Made-to-measure curtains, custom furniture, and cut-to-order fabric lengths cannot be returned unless faulty.",
      },
      {
        q: "How do I initiate a return?",
        a: "You can initiate a return directly from your Patron Profile under 'My Orders', or by emailing concierge@houseofhackney.com with your Order Commission number.",
      },
    ],
  },
  {
    id: "trade",
    label: "Trade & Designers",
    icon: Briefcase,
    faqs: [
      {
        q: "How do I qualify for a House of Hackney Trade Account?",
        a: "We partner with licensed interior designers, architects, and luxury hospitality studios. You can submit your portfolio and VAT/tax number through our Trade Concierge application form located in your account portal.",
      },
      {
        q: "What are the benefits of a Trade Account?",
        a: "Trade partners receive exclusive commercial discounts (20% to 30%), complimentary A4 cuttings, bespoke scale alterations, and a dedicated project manager at our London studio.",
      },
    ],
  },
];

export default function HelpFaq() {
  const [activeCategory, setActiveCategory] = useState("orders");
  const [openAccordion, setOpenAccordion] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    topic: "Order Commission",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Filter FAQs by search query if present
  const displayedFaqs = useMemo(() => {
    if (!searchQuery.trim()) {
      const cat = FAQ_CATEGORIES.find((c) => c.id === activeCategory);
      return cat ? cat.faqs : [];
    }

    const q = searchQuery.toLowerCase().trim();
    const matches = [];
    FAQ_CATEGORIES.forEach((cat) => {
      cat.faqs.forEach((faq) => {
        if (faq.q.toLowerCase().includes(q) || faq.a.toLowerCase().includes(q)) {
          matches.push({ ...faq, category: cat.label });
        }
      });
    });
    return matches;
  }, [searchQuery, activeCategory]);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) {
      showError("Validation Error", "Please fill in your name, email, and message.");
      return;
    }

    try {
      setSubmitting(true);
      showLoading("Sending dispatch to House of Hackney concierge...");
      await new Promise((res) => setTimeout(res, 800));
      closeAlert();
      showSuccess(
        "Message Received",
        "Thank you for contacting House of Hackney. A design concierge will respond to your inquiry within 24 hours."
      );
      setContactForm({
        name: "",
        email: "",
        topic: "Order Commission",
        message: "",
      });
    } catch {
      closeAlert();
      showError("Submission failed", "Please try again or email us directly at concierge@houseofhackney.com.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f3ec] text-[#171713] pb-24">
      {/* Hero Header */}
      <div className="border-b border-[#dedbd4] bg-[#faf8f4] py-14 sm:py-20 text-center relative overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <span className="text-[11px] font-semibold tracking-[2.5px] uppercase text-[#c29b38]">
            CLIENT CONCIERGE & ADVISORY
          </span>
          <h1 className="mt-3 font-serif text-3xl sm:text-5xl font-medium tracking-tight text-[#171713]">
            How May Our House Assist You?
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-xs sm:text-sm text-[#66645e] leading-relaxed">
            Find guidance on bespoke English prints, wallpaper hanging formulas, fabric care,
            and international parcel despatches.
          </p>

          
          <div className="relative mx-auto mt-8 max-w-lg">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#99968e]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search inquiries (e.g. rolls needed, velvet care, returns)..."
              className="w-full rounded-2xl border border-[#dedbd4] bg-white pl-12 pr-4 py-3.5 text-xs sm:text-sm text-[#171713] placeholder-[#99968e] shadow-xs focus:border-[#394132] focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#888] hover:text-[#111]"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* FAQ Navigation & Accordions (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {!searchQuery && (
              <div className="flex flex-wrap gap-2 border-b border-[#dedbd4] pb-4">
                {FAQ_CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isActive = activeCategory === cat.id;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setActiveCategory(cat.id);
                        setOpenAccordion(null);
                      }}
                      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider transition-all ${
                        isActive
                          ? "bg-[#394132] text-white shadow-sm"
                          : "bg-white text-[#555] border border-[#dedbd4] hover:bg-[#faf8f4] hover:text-[#171713]"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {searchQuery && (
              <div className="text-xs text-[#77746c]">
                Showing {displayedFaqs.length} results for &ldquo;{searchQuery}&rdquo;:
              </div>
            )}

            {/* Accordion Questions */}
            <div className="space-y-3">
              {displayedFaqs.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#dedbd4] bg-white p-12 text-center">
                  <HelpCircle size={38} className="mx-auto text-[#bbb8b0]" />
                  <p className="mt-3 font-serif text-lg text-[#171713]">
                    No answers match your search
                  </p>
                  <p className="mt-1 text-xs text-[#77746c]">
                    Please contact our concierge team directly below.
                  </p>
                </div>
              ) : (
                displayedFaqs.map((faq, index) => {
                  const isOpen = openAccordion === index;

                  return (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#dedbd4] bg-white shadow-2xs overflow-hidden transition-all"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenAccordion(isOpen ? null : index)}
                        className="flex w-full items-center justify-between gap-4 p-5 text-left text-xs sm:text-sm font-semibold text-[#171713] hover:text-[#394132] transition-colors"
                      >
                        <span className="font-serif text-base">{faq.q}</span>
                        <ChevronDown
                          size={18}
                          className={`shrink-0 text-[#88857d] transition-transform duration-300 ${
                            isOpen ? "rotate-180 text-[#394132]" : ""
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="border-t border-[#f2efe9] bg-[#faf8f4]/60 px-5 py-4 text-xs sm:text-sm text-[#55534c] leading-relaxed animate-fadeIn">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Quick Links Card */}
            <div className="mt-8 rounded-2xl border border-[#dedbd4] bg-[#faf8f4] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="font-serif text-lg font-medium text-[#171713]">
                  Bespoke Decor Consultation
                </h4>
                <p className="text-xs text-[#66645e] mt-1">
                  Book a 1-to-1 complimentary session with our interior design experts.
                </p>
              </div>

              <Link
                to="/design-services"
                className="inline-flex items-center gap-2 rounded-xl bg-[#394132] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#282e23] shrink-0"
              >
                <span>BOOK SESSION</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Concierge Contact Form & Showroom Hours (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-2xl border border-[#dedbd4] bg-white p-6 sm:p-7 shadow-xs">
              <div className="flex items-center gap-2 text-[#c29b38]">
                <Sparkles size={16} />
                <span className="text-[10px] font-semibold uppercase tracking-[1.5px]">
                  DIRECT ADVISORY
                </span>
              </div>

              <h3 className="mt-1 font-serif text-xl text-[#171713]">
                Message Our Concierge
              </h3>
              <p className="text-xs text-[#77746c] mt-1">
                Receive personalized advice from our English design specialists.
              </p>

              <form onSubmit={handleContactSubmit} className="mt-5 space-y-4">
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#55534c]">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Lady Eleanor Vance"
                    className="mt-1 w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#55534c]">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                    placeholder="eleanor@vanceinteriors.com"
                    className="mt-1 w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#55534c]">
                    Inquiry Topic
                  </label>
                  <select
                    value={contactForm.topic}
                    onChange={(e) => setContactForm({ ...contactForm, topic: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-[#dedbd4] bg-white px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
                  >
                    <option value="Order Commission">Order Commission Status</option>
                    <option value="Wallpaper Calculation">Wallpaper Quantity Calculation</option>
                    <option value="Fabric Samples">Fabric & Swatch Inquiries</option>
                    <option value="Made to Measure">Made-to-Measure Drapery</option>
                    <option value="Trade Application">Trade & B2B Partnerships</option>
                    <option value="General Inquiry">General Patron Advisory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#55534c]">
                    Message *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                    placeholder="Provide details of your inquiry or room dimensions..."
                    className="mt-1 w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#394132] py-3 text-xs font-semibold uppercase tracking-[1px] text-white hover:bg-[#282e23] disabled:opacity-50 transition-all shadow-sm"
                >
                  <Send size={13} />
                  <span>{submitting ? "SENDING..." : "DISPATCH INQUIRY"}</span>
                </button>
              </form>
            </div>

            {/* showrooms */}
            <div className="rounded-2xl border border-[#dedbd4] bg-white p-6 shadow-xs space-y-4">
              <h4 className="font-serif text-lg font-medium text-[#171713]">
                Showrooms & Ateliers
              </h4>

              <div className="space-y-3 text-xs text-[#55534c]">
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-[#394132] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#171713]">Castle of Trematon</p>
                    <p>St. Michael’s, Cornwall, PL12 4QW, UK</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-[#394132] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#171713]">London Showroom</p>
                    <p>123 Hackney Road, London, E2 8NA</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock size={16} className="text-[#394132] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#171713]">Concierge Hours</p>
                    <p>Monday – Friday: 9:00am – 6:00pm GMT</p>
                    <p>Saturday: 10:00am – 5:00pm GMT</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Phone size={16} className="text-[#394132] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#171713]">Telephone Concierge</p>
                    <p>+44 (0) 20 7739 3901</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
