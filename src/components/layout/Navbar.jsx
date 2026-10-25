import { memo } from "react";
import { Link } from "react-router-dom";
import MegaMenu from "./MegaMenu";

const shopCategories = [
  "Wallpaper",
  "Fabric",
  "Curtains & Blinds",
  "Carpets & Flooring",
  "Home Decor",
  "Furnishings",
  "Apothecary",
];

const inspirationCategories = [
  "Gallery",
  "Stories",
  "Auras",
];

const ourHouseCategories = [
  "About",
  "Our Impact",
];

const categorySlugMap = {
  Wallpaper: "wallpaper",
  Fabric: "fabric",
  "Curtains & Blinds": "curtains-blinds",
  "Carpets & Flooring": "carpets-flooring",
  "Home Decor": "home-decor",
  Furnishings: "furnishings",
  Apothecary: "apothecary",
  Gallery: "gallery",
  Stories: "stories",
  Auras: "auras",
  About: "about",
  "Our Impact": "our-impact",
};

function getItemPath(tab, item) {
  const slug = categorySlugMap[item] || item.toLowerCase().replace(/\s+/g, "-");
  if (tab === "INSPIRATION") {
    return `/inspiration?tab=${slug}`;
  }
  if (tab === "OUR HOUSE") {
    return `/our-house?tab=${slug}`;
  }
  return `/shop/${slug}`;
}

function Navbar({
  activeNavTab = "SHOP",
  activeCategory = null,
  setActiveCategory = () => {},
}) {
  let navItems = shopCategories;
  if (activeNavTab === "INSPIRATION") {
    navItems = inspirationCategories;
  } else if (activeNavTab === "OUR HOUSE") {
    navItems = ourHouseCategories;
  }

  return (
    <nav
      aria-label={`${activeNavTab} sub-navigation`}
      className="relative z-40 hidden border-t border-[#dedbd4]/80 bg-[#f6f3ec] lg:block transition-all duration-300"
      onMouseLeave={() => setActiveCategory(null)}
    >
      <div className="flex min-h-[56px] items-center justify-center gap-7 px-5 xl:gap-11">
        {navItems.map((item) => {
          const isActive = activeCategory === item;
          return (
            <Link
              key={item}
              to={getItemPath(activeNavTab, item)}
              onMouseEnter={() => setActiveCategory(item)}
              onFocus={() => setActiveCategory(item)}
              onClick={() => setActiveCategory(null)}
              className={`relative whitespace-nowrap py-3.5 text-[11px] xl:text-[12px] tracking-[1.3px] uppercase font-medium transition-colors ${
                isActive
                  ? "text-black font-semibold"
                  : "text-[#2e312b] hover:text-black"
              }`}
            >
              {item}
              {/* Subtle underline bar indicator */}
              <span
                className={`absolute bottom-0 left-0 right-0 h-[2px] bg-black transition-all duration-300 ${
                  isActive ? "opacity-100 scale-x-100" : "opacity-0 scale-x-0"
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Megamenu dropdown */}
      {activeCategory && (
        <MegaMenu
          tab={activeNavTab}
          category={activeCategory}
          onClose={() => setActiveCategory(null)}
        />
      )}
    </nav>
  );
}

export default memo(Navbar);
