import { memo, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  X,
  ChevronRight,
  ChevronLeft,
  Globe,
} from "lucide-react";

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
  const [activeCategory, setActiveCategory] = useState(null);
  const { isAuthenticated } = useSelector((state) => state.auth || {});

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

  const closeMenu = () => {
    setActiveCategory(null);
    onClose?.();
  };

  const handleTabSwitch = (tab) => {
    setActiveCategory(null);
    setActiveTab(tab);
  };

  return (
    <div className="fixed inset-0 z-[100] md:hidden">
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
          {/* 1. SHOP MODE */}
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

          {/* 2. INSPIRATION MODE */}
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

          {/* 3. OUR HOUSE MODE */}
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
        <div className="shrink-0 border-t border-gray-100 px-6 pb-6 pt-5 sm:px-9">
          <Link
            to={isAuthenticated ? "/account" : "/login"}
            onClick={closeMenu}
            className="mb-5 inline-block text-base font-medium underline underline-offset-4"
          >
            {isAuthenticated ? "My Patron Account" : "Login / Register"}
          </Link>

          <div className="flex items-center gap-3 text-sm text-[#2e312b]">
            <Globe size={18} strokeWidth={1.4} />
            <span>Region / Currency: Intl / GBP</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default memo(MobileMenu);
