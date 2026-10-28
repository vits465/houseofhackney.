import { memo, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Globe,
  LogOut,
  User,
} from "lucide-react";
import { logoutUser } from "../../features/auth/authActions";
import { showConfirm, showToast } from "../../utils/sweetAlert";

const shopCategories = [
  "WALLPAPER",
  "FABRIC",
  "CURTAINS & BLINDS",
  "CARPETS & FLOORING",
  "HOME DECOR",
  "FURNISHINGS",
  "APOTHECARY",
];

const categorySlugMap = {
  WALLPAPER: "wallpaper",
  FABRIC: "fabric",
  "CURTAINS & BLINDS": "curtains-blinds",
  "CARPETS & FLOORING": "carpets-flooring",
  "HOME DECOR": "home-decor",
  FURNISHINGS: "furnishings",
  APOTHECARY: "apothecary",
};

const categoryPath = (category) => {
  const slug =
    categorySlugMap[category] ||
    category.toLowerCase().replaceAll(" & ", "-").replaceAll(" ", "-");
  return `/shop/${slug}`;
};

const inspirationSections = [
  {
    name: "GALLERY",
    links: [
      { label: "View All Gallery", to: "/inspiration?tab=gallery" },
      { label: "Bedroom", to: "/products?search=bedroom" },
      { label: "Living Room", to: "/products?search=living+room" },
      { label: "Hallway", to: "/products?search=hallway" },
      { label: "Kitchen & Dining", to: "/products?search=dining" },
      { label: "Bathroom", to: "/products?search=bathroom" },
    ],
  },
  {
    name: "STORIES",
    links: [
      { label: "View All Stories", to: "/inspiration?tab=stories" },
      { label: "How-to Guides", to: "/inspiration?tab=guides" },
      { label: "Expert Tips", to: "/inspiration?tab=tips" },
      { label: "Interior Makeover", to: "/inspiration?tab=makeover" },
      { label: "Regeneration", to: "/our-house?tab=regenerative" },
    ],
  },
  {
    name: "AURAS",
    links: [
      { label: "Discover the Auras", to: "/inspiration?tab=auras" },
      { label: "Book a Design Consultation", to: "/design-services" },
      { label: "Aura 01: To Dream", to: "/products?colour=neutrals&mood=dream" },
      { label: "Aura 02: To Renew", to: "/products?colour=greens&mood=renew" },
      { label: "Auras 03: To Flourish", to: "/products?colour=pinks&mood=flourish" },
      { label: "Aura 04: To Nurture", to: "/products?colour=yellows&mood=nurture" },
    ],
  },
];

const ourHouseSections = [
  {
    name: "ABOUT",
    links: [
      { label: "Our Story", to: "/our-house?tab=story" },
      { label: "Our Materials", to: "/our-house?tab=materials" },
      { label: "Our Design Services", to: "/design-services" },
      { label: "Events", to: "/our-house?tab=events" },
      { label: "London Showroom", to: "/our-house?tab=london" },
      { label: "New York Showroom", to: "/our-house?tab=newyork" },
      { label: "Castle of Trematon", to: "/our-house?tab=trematon" },
    ],
  },
  {
    name: "OUR IMPACT",
    links: [
      { label: "Our Regenerative Journey", to: "/our-house?tab=regenerative" },
      { label: "Impact Report 2025", to: "/our-house?tab=report" },
      { label: "Certifications & Awards", to: "/our-house?tab=certifications" },
      { label: "Investing in Nature", to: "/our-house?tab=nature" },
      { label: "Materials & Makers", to: "/our-house?tab=makers" },
      { label: "Activism & Influence", to: "/our-house?tab=activism" },
      { label: "Governance & Culture", to: "/our-house?tab=governance" },
    ],
  },
];

function MobileMenu({ isOpen, onClose, activeTab = "SHOP", setActiveTab = () => {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeCategory, setActiveCategory] = useState(null);
  const { user, isAuthenticated } = useSelector((state) => state.auth || {});

  const isTradePartner = Boolean(
    user?.isTradeAccount ||
    user?.accountType === "BUSINESS" ||
    user?.tradeProfile ||
    user?.roles?.some((r) => {
      const s = typeof r === "string" ? r.toLowerCase() : r.slug?.toLowerCase() || "";
      return s.includes("trade");
    })
  );

  const isAdminStaff = Boolean(
    user?.roles?.some((r) => {
      const s = typeof r === "string" ? r.toLowerCase() : r.slug?.toLowerCase() || "";
      return s.includes("admin") || s.includes("manager");
    })
  );

  const closeMenu = () => {
    setActiveCategory(null);
    onClose?.();
  };

  // Automatically close mobile menu when navigating
  useEffect(() => {
    if (isOpen) {
      closeMenu();
    }
  }, [location.pathname]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMobileLogout = async () => {
    const result = await showConfirm(
      "Leave our House?",
      "Are you sure you want to sign out of your account?"
    );
    if (!result.isConfirmed) return;

    try {
      await logoutUser();
      showToast("Signed out successfully");
      closeMenu();
      navigate("/login", { replace: true });
    } catch {
      // Ignored
    }
  };

  const handleTabSwitch = (tab) => {
    setActiveCategory(null);
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-[9999] lg:hidden">
      {/* Dark overlay */}
      <button
        type="button"
        aria-label="Close navigation"
        onClick={closeMenu}
        className="absolute inset-0 h-full w-full bg-black/65"
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
        className="absolute inset-y-0 left-0 flex w-[88%] max-w-[680px] flex-col bg-white text-black shadow-2xl sm:w-[72%]"
      >
        {/* Drawer header tabs */}
        <div className="flex shrink-0 items-center justify-between gap-2 px-5 py-5 sm:px-8 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleTabSwitch("SHOP")}
              className={`rounded-xl px-4 py-2.5 text-xs tracking-[1px] font-medium transition-all ${
                activeTab === "SHOP"
                  ? "bg-[#394132] text-white"
                  : "text-[#2e312b] hover:underline"
              }`}
            >
              SHOP
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("INSPIRATION")}
              className={`rounded-xl px-4 py-2.5 text-xs tracking-[1px] font-medium transition-all ${
                activeTab === "INSPIRATION"
                  ? "bg-[#394132] text-white"
                  : "text-[#2e312b] hover:underline"
              }`}
            >
              INSPIRATION
            </button>

            <button
              type="button"
              onClick={() => handleTabSwitch("OUR HOUSE")}
              className={`rounded-xl px-4 py-2.5 text-xs tracking-[1px] font-medium transition-all ${
                activeTab === "OUR HOUSE"
                  ? "bg-[#394132] text-white"
                  : "text-[#2e312b] hover:underline"
              }`}
            >
              OUR HOUSE
            </button>
          </div>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            className="grid h-10 w-10 shrink-0 place-items-center"
          >
            <X size={28} strokeWidth={1.3} />
          </button>
        </div>

        {/* Scrollable category area */}
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-4 sm:px-9">
          {/* shop mode */}
          {activeTab === "SHOP" && (
            activeCategory ? (
              <div>
                <button
                  type="button"
                  onClick={() => setActiveCategory(null)}
                  className="mb-6 flex items-center gap-2 py-3 text-sm text-[#2e312b]"
                >
                  <ChevronLeft size={20} />
                  Back to categories
                </button>

                <h2 className="mb-7 font-serif text-3xl sm:text-5xl">
                  {activeCategory}
                </h2>

                {[
                  `All ${activeCategory.toLowerCase()}`,
                  "Bestsellers",
                  "New In",
                  "By Colour",
                  "By Style",
                  "By Collection",
                ].map((item, index) => {
                  let to = categoryPath(activeCategory);
                  if (index === 1) to = `${categoryPath(activeCategory)}&filter=bestseller`;
                  else if (index === 2) to = `${categoryPath(activeCategory)}&sort=newest`;
                  else if (index === 3) to = `${categoryPath(activeCategory)}&filter=all-colours`;
                  else if (index === 4) to = `${categoryPath(activeCategory)}&filter=all-styles`;
                  else if (index === 5) to = `${categoryPath(activeCategory)}&filter=all-collections`;

                  return (
                    <Link
                      key={item}
                      to={to}
                      onClick={closeMenu}
                      className="block border-b border-gray-100 py-4 font-serif text-lg sm:text-xl hover:underline"
                    >
                      {item}
                    </Link>
                  );
                })}
              </div>
            ) : (
              <nav aria-label="Mobile shop categories">
                {shopCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className="flex w-full items-center justify-between gap-4 py-3.5 text-left font-serif text-[clamp(24px,5vw,42px)] leading-tight tracking-[-0.5px] hover:opacity-60"
                  >
                    <span>{category}</span>
                    <ChevronRight size={22} strokeWidth={1.3} className="shrink-0 text-gray-400" />
                  </button>
                ))}
              </nav>
            )
          )}

          {/* inspiration mode */}
          {activeTab === "INSPIRATION" && (
            <div className="space-y-6">
              {inspirationSections.map((section) => (
                <div key={section.name} className="border-b border-gray-100 pb-5">
                  <h3 className="mb-3 font-serif text-2xl tracking-tight text-[#171713]">
                    {section.name}
                  </h3>
                  <div className="space-y-2.5 pl-1">
                    {section.links.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        onClick={closeMenu}
                        className="block text-base text-[#2e312b] hover:underline py-1"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* our house mode */}
          {activeTab === "OUR HOUSE" && (
            <div className="space-y-6">
              {ourHouseSections.map((section) => (
                <div key={section.name} className="border-b border-gray-100 pb-5">
                  <h3 className="mb-3 font-serif text-2xl tracking-tight text-[#171713]">
                    {section.name}
                  </h3>
                  <div className="space-y-2.5 pl-1">
                    {section.links.map((link) => (
                      <Link
                        key={link.label}
                        to={link.to}
                        onClick={closeMenu}
                        className="block text-base text-[#2e312b] hover:underline py-1"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom account and currency options */}
        <div className="shrink-0 border-t border-gray-100 bg-[#fbf9f5] px-6 pb-6 pt-5 sm:px-9">
          {isAuthenticated ? (
            <div className="mb-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-[#394132] uppercase">
                <div className="flex items-center gap-1.5">
                  <User size={14} />
                  <span>Patron: {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Sanctuary Member"}</span>
                </div>
                <button
                  type="button"
                  onClick={handleMobileLogout}
                  className="flex items-center gap-1 text-[#b83232] hover:underline cursor-pointer font-medium text-[11px]"
                >
                  <LogOut size={12} />
                  <span>Sign Out</span>
                </button>
              </div>

              {/* Quick links to Sanctuary sections */}
              <div className="grid grid-cols-2 gap-2 text-xs font-medium pt-1">
                <Link
                  to="/profile/overview"
                  onClick={closeMenu}
                  className="rounded-lg bg-white px-2.5 py-1.5 border border-gray-200 text-[#171713] hover:border-[#394132] transition"
                >
                  Overview
                </Link>
                <Link
                  to="/profile/orders"
                  onClick={closeMenu}
                  className="rounded-lg bg-white px-2.5 py-1.5 border border-gray-200 text-[#171713] hover:border-[#394132] transition"
                >
                  My Orders
                </Link>
                <Link
                  to="/wishlist"
                  onClick={closeMenu}
                  className="rounded-lg bg-white px-2.5 py-1.5 border border-gray-200 text-[#171713] hover:border-[#394132] transition"
                >
                  Saved Wishlist
                </Link>
                <Link
                  to="/profile/addresses"
                  onClick={closeMenu}
                  className="rounded-lg bg-white px-2.5 py-1.5 border border-gray-200 text-[#171713] hover:border-[#394132] transition"
                >
                  Residences
                </Link>
                <Link
                  to="/profile/details"
                  onClick={closeMenu}
                  className="rounded-lg bg-white px-2.5 py-1.5 border border-gray-200 text-[#171713] hover:border-[#394132] transition"
                >
                  Personal Details
                </Link>
                <Link
                  to="/profile/trade"
                  onClick={closeMenu}
                  className="rounded-lg bg-[#c29b38]/10 px-2.5 py-1.5 border border-[#c29b38]/30 text-[#8a681c] font-semibold hover:bg-[#c29b38]/20 transition"
                >
                  Trade Concierge
                </Link>
                {isTradePartner && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="rounded-lg bg-[#2d3326] px-2.5 py-1.5 text-white font-semibold hover:bg-[#3e7b52] transition flex items-center justify-between"
                  >
                    <span>B2B Trade Portal</span>
                    <span>→</span>
                  </Link>
                )}
                {!isTradePartner && isAdminStaff && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className="rounded-lg bg-[#171713] px-2.5 py-1.5 text-white font-semibold hover:bg-[#3e7b52] transition flex items-center justify-between"
                  >
                    <span>Admin Dashboard</span>
                    <span>→</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-4 flex items-center gap-4 text-sm font-medium">
              <Link
                to="/login"
                onClick={closeMenu}
                className="underline underline-offset-4 text-[#171713] hover:text-[#394132]"
              >
                Sign In / Register
              </Link>
              <Link
                to="/wishlist"
                onClick={closeMenu}
                className="underline underline-offset-4 text-[#171713] hover:text-[#394132]"
              >
                Saved Wishlist
              </Link>
            </div>
          )}

          <div className="flex items-center gap-3 text-xs text-[#555248]">
            <Globe size={16} strokeWidth={1.4} />
            <span>Region / Currency: Intl / GBP</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default memo(MobileMenu);
