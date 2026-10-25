import { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

// SHOP MENU DATA
const shopMenuData = {
  Wallpaper: {
    heading: "WALLPAPER",
    links: [
      "All Wallpaper",
      "Bestsellers",
      "New In",
      "Bespoke",
      "Free Interior Design Services",
    ],
    colours: ["Greens", "Pinks", "Yellows", "Blues", "Neutrals", "Blacks"],
    styles: ["Floral", "Foliage", "Animal", "Striped", "William Morris", "Mural"],
    collections: ["ARTEMIS", "ARTIST'S STRIPE", "HOLLYHOCKS", "PLANTASIA", "ZEUS"],
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80",
  },

  Fabric: {
    heading: "FABRIC",
    links: ["All Fabric", "Bestsellers", "New In", "Velvet", "Linen"],
    colours: ["Greens", "Pinks", "Yellows", "Blues", "Neutrals", "Blacks"],
    styles: ["Floral", "Botanical", "Animal", "Geometric", "Stripes", "Plain"],
    collections: ["ARTEMIS", "HOLLYHOCKS", "PLANTASIA", "ZEUS"],
    image:
      "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=600&q=80",
  },

  "Curtains & Blinds": {
    heading: "CURTAINS & BLINDS",
    links: ["All Curtains & Blinds", "Made to Measure", "Roman Blinds"],
    colours: ["Greens", "Pinks", "Yellows", "Blues", "Neutrals"],
    styles: ["Floral", "Botanical", "Animal", "Geometric"],
    collections: ["ARTEMIS", "HOLLYHOCKS", "PLANTASIA"],
    image:
      "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=600&q=80",
  },

  "Carpets & Flooring": {
    heading: "CARPETS & FLOORING",
    links: ["All Carpets & Flooring", "Rugs", "Bestsellers"],
    colours: ["Greens", "Pinks", "Golds", "Blues", "Neutrals"],
    styles: ["Floral", "Botanical", "Traditional", "Geometric"],
    collections: ["ARTEMIS", "HOLLYHOCKS", "PLANTASIA"],
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
  },

  "Home Decor": {
    heading: "HOME DECOR",
    links: ["All Home Decor", "Cushions", "Throws", "Accessories"],
    colours: ["Greens", "Pinks", "Yellows", "Blues", "Neutrals"],
    styles: ["Botanical", "Animal", "Traditional", "Contemporary"],
    collections: ["ARTEMIS", "HOLLYHOCKS", "PLANTASIA"],
    image:
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=600&q=80",
  },

  Furnishings: {
    heading: "FURNISHINGS",
    links: ["All Furnishings", "Furniture", "Lighting", "Mirrors"],
    colours: ["Greens", "Pinks", "Golds", "Blues", "Neutrals"],
    styles: ["Classic", "Botanical", "Contemporary", "Statement"],
    collections: ["ARTEMIS", "HOLLYHOCKS", "PLANTASIA"],
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=600&q=80",
  },

  Apothecary: {
    heading: "APOTHECARY",
    links: ["All Apothecary", "Candles", "Home Fragrance"],
    colours: ["Greens", "Pinks", "Golds", "Neutrals"],
    styles: ["Floral", "Botanical", "Woody", "Fresh"],
    collections: ["ARTEMIS", "HOLLYHOCKS", "PLANTASIA"],
    image:
      "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80",
  },
};

const colourDots = {
  Greens: ["#d0dcd0", "#a8bdb0", "#365d49"],
  Pinks: ["#f0d1d6", "#e5a8b0", "#c86e83"],
  Yellows: ["#f2e8c8", "#e9d99b", "#d8b64f"],
  Blues: ["#d6dfeb", "#9fb8d1", "#426b98"],
  Neutrals: ["#e7e7e4", "#ccccca", "#b5b5b1"],
  Blacks: ["#bdbdbb", "#777875", "#20211f"],
  Golds: ["#f4e8c1", "#dfc578", "#a68532"],
};

function ColourDots({ colour }) {
  return (
    <span className="mr-3 flex shrink-0 -space-x-2">
      {(colourDots[colour] || colourDots.Greens).map((color) => (
        <span
          key={color}
          style={{ backgroundColor: color }}
          className="h-4 w-4 rounded-full border border-white"
        />
      ))}
    </span>
  );
}

const categorySlugMap = {
  Wallpaper: "wallpaper",
  Fabric: "fabric",
  "Curtains & Blinds": "curtains-blinds",
  "Carpets & Flooring": "carpets-flooring",
  "Home Decor": "home-decor",
  Furnishings: "furnishings",
  Apothecary: "apothecary",
};

function getCategoryLink(categoryName, item) {
  const catSlug = categorySlugMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, "-");
  const normalized = item.trim().toLowerCase();

  if (normalized.startsWith("all ")) {
    return `/shop/${catSlug}`;
  }
  if (normalized === "bestsellers") {
    return `/products?category=${catSlug}&filter=bestseller`;
  }
  if (normalized === "new in") {
    return `/products?category=${catSlug}&sort=newest`;
  }
  if (normalized === "bespoke") {
    return `/products?category=${catSlug}&search=bespoke`;
  }
  if (normalized === "free interior design services") {
    return `/design-services`;
  }
  if (normalized === "made to measure") {
    return `/products?category=${catSlug}&search=measure`;
  }
  if (normalized === "roman blinds") {
    return `/products?category=${catSlug}&search=blind`;
  }
  if (normalized === "rugs") {
    return `/products?category=${catSlug}&search=rug`;
  }
  if (normalized === "cushions") {
    return `/products?category=${catSlug}&search=cushion`;
  }
  if (normalized === "throws") {
    return `/products?category=${catSlug}&search=throw`;
  }
  if (normalized === "accessories") {
    return `/products?category=${catSlug}&search=accessories`;
  }
  if (normalized === "furniture") {
    return `/products?category=${catSlug}&productType=FURNITURE`;
  }
  if (normalized === "lighting") {
    return `/products?category=lighting`;
  }
  if (normalized === "mirrors") {
    return `/products?category=${catSlug}&search=mirror`;
  }
  if (normalized === "candles") {
    return `/products?category=${catSlug}&search=candle`;
  }
  if (normalized === "home fragrance") {
    return `/products?category=${catSlug}&search=fragrance`;
  }
  if (normalized === "velvet") {
    return `/products?category=${catSlug}&search=velvet`;
  }
  if (normalized === "linen") {
    return `/products?category=${catSlug}&search=linen`;
  }

  return `/products?category=${catSlug}&search=${encodeURIComponent(normalized)}`;
}

function getColourLink(categoryName, colour) {
  const catSlug = categorySlugMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, "_");
  const colourParam = colour.toLowerCase().replace(/s$/, "");
  return `/products?category=${catSlug}&colour=${colourParam}`;
}

function getStyleLink(categoryName, style) {
  const catSlug = categorySlugMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, "_");
  const styleSlug = style.toLowerCase().replace(/\s+/g, "-");
  let search = style.toLowerCase();
  if (search.includes("william") || search.includes("morris")) {
    search = "victorian";
  } else if (search.includes("foliage") || search.includes("botanical")) {
    search = "botanical";
  }
  return `/products?category=${catSlug}&style=${styleSlug}&search=${encodeURIComponent(search)}`;
}

function getCollectionLink(categoryName, collection) {
  const catSlug = categorySlugMap[categoryName] || categoryName.toLowerCase().replace(/\s+/g, "_");
  const colSlug = collection.toLowerCase().replace(/['’]/g, "").replace(/\s+/g, "-");
  let search = collection.toLowerCase().replace(/['’]/g, "");
  if (search.includes("artist") || search.includes("stripe")) {
    search = "stripe";
  }
  return `/products?category=${catSlug}&collection=${colSlug}&search=${encodeURIComponent(search)}`;
}

// INSPIRATION DATA
const galleryRooms = [
  {
    title: "Bedroom",
    image: "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=600&q=80",
    to: "/products?search=bedroom",
  },
  {
    title: "Living Room",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
    to: "/products?search=living+room",
  },
  {
    title: "Kitchen & Dining",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=80",
    to: "/products?search=dining",
  },
  {
    title: "Bathroom",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80",
    to: "/products?search=bathroom",
  },
  {
    title: "Hallway",
    image: "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=600&q=80",
    to: "/products?search=hallway",
  },
];

const featuredStories = [
  {
    title: "House Of Hackney X Axminster Carpets",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=400&q=80",
    to: "/products?search=carpet",
  },
  {
    title: "Wool Is Cool",
    image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80",
    to: "/products?search=wool",
  },
  {
    title: "WONDER GARDEN",
    image: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80",
    to: "/products?search=garden",
  },
  {
    title: "The Greenprint",
    image: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
    to: "/our-house?tab=greenprint",
  },
  {
    title: "The Auras",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    to: "/inspiration?tab=auras",
  },
  {
    title: "A Wild Idea",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&q=80",
    to: "/products?category=wallpaper",
  },
];

const aurasList = [
  {
    title: "Aura 01: To Dream",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
    to: "/products?colour=neutrals&mood=dream",
  },
  {
    title: "Aura 02: To Renew",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=400&q=80",
    to: "/products?colour=greens&mood=renew",
  },
  {
    title: "Auras 03: To Flourish",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80",
    to: "/products?colour=pinks&mood=flourish",
  },
  {
    title: "Aura 04: To Nurture",
    image: "https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&w=400&q=80",
    to: "/products?colour=yellows&mood=nurture",
  },
  {
    title: "Aura 05: To Root",
    image: "https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=400&q=80",
    to: "/products?colour=neutrals&mood=root",
  },
  {
    title: "Aura 06: To Nourish",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
    to: "/products?colour=yellows&mood=nourish",
  },
];

function MegaMenu({ tab = "SHOP", category, onClose }) {
  if (!category) return null;

  // 1. INSPIRATION MODE
  if (tab === "INSPIRATION") {
    const isStories = category.toLowerCase() === "stories";
    const isAuras = category.toLowerCase() === "auras";
    const isGallery = !isStories && !isAuras;

    return (
      <div
        className="absolute inset-x-0 top-full z-50 hidden px-6 pb-7 pt-2 lg:block animate-fadeIn delay-300"
        onMouseLeave={onClose}
      >
        <div className="grid grid-cols-[minmax(240px,0.7fr)_minmax(0,2.5fr)] gap-3 xl:grid-cols-[minmax(260px,0.7fr)_minmax(0,2.5fr)]">
          {/* Left panel */}
          <div className="rounded-[22px] bg-white p-7 xl:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#ede9e1]">
            <Link
              to="/inspiration"
              onClick={onClose}
              className="mb-7 block font-serif text-3xl xl:text-4xl tracking-tight text-[#171713] hover:underline"
            >
              {category.toUpperCase()}
            </Link>

            <div className="flex flex-col space-y-3">
              {isGallery && (
                <>
                  <Link
                    to="/inspiration?tab=gallery"
                    onClick={onClose}
                    className="font-serif text-lg text-[#171713] hover:underline"
                  >
                    View All Gallery
                  </Link>
                  {galleryRooms.map((room) => (
                    <Link
                      key={room.title}
                      to={room.to}
                      onClick={onClose}
                      className="text-base text-[#2e312b] hover:underline"
                    >
                      {room.title}
                    </Link>
                  ))}
                </>
              )}

              {isStories && (
                <>
                  <Link
                    to="/inspiration?tab=stories"
                    onClick={onClose}
                    className="font-serif text-lg text-[#171713] hover:underline"
                  >
                    View All Stories
                  </Link>
                  <Link
                    to="/inspiration?tab=guides"
                    onClick={onClose}
                    className="text-base text-[#2e312b] hover:underline"
                  >
                    How-to Guides
                  </Link>
                  <Link
                    to="/inspiration?tab=tips"
                    onClick={onClose}
                    className="text-base text-[#2e312b] hover:underline"
                  >
                    Expert Tips
                  </Link>
                  <Link
                    to="/inspiration?tab=makeover"
                    onClick={onClose}
                    className="text-base text-[#2e312b] hover:underline"
                  >
                    Interior Makeover
                  </Link>
                  <Link
                    to="/our-house?tab=regenerative"
                    onClick={onClose}
                    className="text-base text-[#2e312b] hover:underline"
                  >
                    Regeneration
                  </Link>
                </>
              )}

              {isAuras && (
                <>
                  <Link
                    to="/inspiration?tab=auras"
                    onClick={onClose}
                    className="font-serif text-lg text-[#171713] hover:underline"
                  >
                    Discover the Auras
                  </Link>
                  <Link
                    to="/design-services"
                    onClick={onClose}
                    className="text-base text-[#2e312b] hover:underline"
                  >
                    Book a Design Consultation
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="rounded-[22px] bg-white p-7 xl:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#ede9e1]">
            {isGallery && (
              <div className="grid grid-cols-5 gap-4">
                {galleryRooms.map((room) => (
                  <Link
                    key={room.title}
                    to={room.to}
                    onClick={onClose}
                    className="group block text-center"
                  >
                    <div className="overflow-hidden rounded-xl aspect-[3/4] bg-[#f1ede4] mb-3">
                      <img
                        src={room.image}
                        alt={room.title}
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <span className="font-serif text-sm xl:text-base text-[#171713] group-hover:underline">
                      {room.title}
                    </span>
                  </Link>
                ))}
              </div>
            )}

            {isStories && (
              <div>
                <h3 className="mb-6 font-serif text-xl text-[#171713]">Featured</h3>
                <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                  {featuredStories.map((story) => (
                    <Link
                      key={story.title}
                      to={story.to}
                      onClick={onClose}
                      className="group flex items-center gap-3.5 hover:opacity-85 transition-opacity"
                    >
                      <img
                        src={story.image}
                        alt={story.title}
                        loading="lazy"
                        className="h-16 w-24 rounded-lg object-cover shrink-0"
                      />
                      <span className="font-serif text-sm xl:text-[15px] leading-snug text-[#171713] group-hover:underline line-clamp-2">
                        {story.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {isAuras && (
              <div>
                <h3 className="mb-6 font-serif text-xl text-[#171713]">The Auras</h3>
                <div className="grid grid-cols-3 gap-x-6 gap-y-5">
                  {aurasList.map((aura) => (
                    <Link
                      key={aura.title}
                      to={aura.to}
                      onClick={onClose}
                      className="group flex items-center gap-3.5 hover:opacity-85 transition-opacity"
                    >
                      <img
                        src={aura.image}
                        alt={aura.title}
                        loading="lazy"
                        className="h-16 w-24 rounded-lg object-cover shrink-0"
                      />
                      <span className="font-serif text-sm xl:text-[15px] leading-snug text-[#171713] group-hover:underline">
                        {aura.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. OUR HOUSE MODE
  if (tab === "OUR HOUSE") {
    const isImpact = category.toLowerCase().includes("impact");

    return (
      <div
        className="absolute inset-x-0 top-full z-50 hidden px-6 pb-7 pt-2 lg:block animate-fadeIn delay-300"
        onMouseLeave={onClose}
      >
        <div className="grid grid-cols-[minmax(240px,0.7fr)_minmax(0,2.5fr)] gap-3 xl:grid-cols-[minmax(260px,0.7fr)_minmax(0,2.5fr)]">
          {/* Left panel */}
          <div className="rounded-[22px] bg-white p-7 xl:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#ede9e1]">
            <Link
              to="/our-house"
              onClick={onClose}
              className="mb-7 block font-serif text-3xl xl:text-4xl tracking-tight text-[#171713] hover:underline"
            >
              {category.toUpperCase()}
            </Link>

            <div className="flex flex-col space-y-3">
              {!isImpact ? (
                <>
                  <Link
                    to="/our-house?tab=story"
                    onClick={onClose}
                    className="font-serif text-lg text-[#171713] hover:underline"
                  >
                    Our Story
                  </Link>
                  <Link
                    to="/our-house?tab=materials"
                    onClick={onClose}
                    className="font-serif text-lg text-[#171713] hover:underline"
                  >
                    Our Materials
                  </Link>
                  <Link
                    to="/design-services"
                    onClick={onClose}
                    className="font-serif text-lg text-[#171713] hover:underline"
                  >
                    Our Design Services
                  </Link>
                  <Link
                    to="/our-house?tab=events"
                    onClick={onClose}
                    className="font-serif text-lg text-[#171713] hover:underline"
                  >
                    Events
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/our-house?tab=regenerative"
                    onClick={onClose}
                    className="font-serif text-lg text-[#171713] hover:underline"
                  >
                    Our Regenerative Journey
                  </Link>
                  <Link
                    to="/our-house?tab=report"
                    onClick={onClose}
                    className="font-serif text-lg text-[#171713] hover:underline"
                  >
                    Impact Report 2025
                  </Link>
                  <Link
                    to="/our-house?tab=certifications"
                    onClick={onClose}
                    className="font-serif text-lg text-[#171713] hover:underline"
                  >
                    Certifications & Awards
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right panel */}
          <div className="rounded-[22px] bg-white p-7 xl:p-9 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#ede9e1]">
            {!isImpact ? (
              <div className="grid grid-cols-[1.1fr_1fr_1fr] gap-6 xl:gap-8 items-start">
                <div>
                  <h3 className="mb-4 font-serif text-lg xl:text-xl text-[#171713]">
                    Visit our Houses
                  </h3>
                  <div className="space-y-3">
                    <Link
                      to="/our-house?tab=showrooms#london"
                      onClick={onClose}
                      className="block text-sm xl:text-base text-[#2e312b] hover:underline"
                    >
                      London Showroom at St Michael&apos;s
                    </Link>
                    <Link
                      to="/our-house?tab=showrooms#ny"
                      onClick={onClose}
                      className="block text-sm xl:text-base text-[#2e312b] hover:underline"
                    >
                      New York Showroom at the Design Center
                    </Link>
                    <Link
                      to="/our-house?tab=showrooms#trematon"
                      onClick={onClose}
                      className="block text-sm xl:text-base text-[#2e312b] hover:underline"
                    >
                      Castle of Trematon
                    </Link>
                  </div>
                </div>

                <Link
                  to="/our-house?tab=stmichaels"
                  onClick={onClose}
                  className="group block"
                >
                  <div className="overflow-hidden rounded-xl aspect-[4/3] bg-[#f1ede4] mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1548625361-16eb16260195?auto=format&fit=crop&w=500&q=80"
                      alt="St Michael's Showroom"
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-serif text-base text-[#171713] leading-snug">
                    The transformation of St Michael&apos;s
                  </h4>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm underline underline-offset-4 group-hover:opacity-75">
                    Read More <ArrowUpRight size={14} />
                  </span>
                </Link>

                <Link
                  to="/products?search=book"
                  onClick={onClose}
                  className="group block"
                >
                  <div className="overflow-hidden rounded-xl aspect-[4/3] bg-[#f1ede4] mb-3">
                    <img
                      src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=500&q=80"
                      alt="In the Company of Nature Book"
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <h4 className="font-serif text-base text-[#171713] leading-snug">
                    In the Company of Nature
                  </h4>
                  <span className="mt-2 inline-flex items-center gap-1 text-sm underline underline-offset-4 group-hover:opacity-75">
                    Discover The Book <ArrowUpRight size={14} />
                  </span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-6 xl:gap-8">
                <div>
                  <h3 className="mb-4 font-serif text-base xl:text-lg text-[#171713]">
                    Investing in Nature
                  </h3>
                  <div className="space-y-3 text-sm text-[#2e312b]">
                    <Link
                      to="/our-house?tab=true-cost"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      Our True Cost
                    </Link>
                    <Link
                      to="/our-house?tab=nature-licensing"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      Nature Licensing Fee
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 font-serif text-base xl:text-lg text-[#171713]">
                    Materials & Makers
                  </h3>
                  <div className="space-y-3 text-sm text-[#2e312b]">
                    <Link
                      to="/our-house?tab=materials"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      Our Materials
                    </Link>
                    <Link
                      to="/our-house?tab=suppliers"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      Our Suppliers
                    </Link>
                    <Link
                      to="/our-house?tab=wool"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      Wool is Cool
                    </Link>
                    <Link
                      to="/products?category=paint"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      The Problem With Paint
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 font-serif text-base xl:text-lg text-[#171713]">
                    Activism & Influence
                  </h3>
                  <div className="space-y-3 text-sm text-[#2e312b]">
                    <Link
                      to="/our-house?tab=activism"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      Our Activism
                    </Link>
                    <Link
                      to="/our-house?tab=we-are-nature"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      #WeAreNature
                    </Link>
                    <Link
                      to="/our-house?tab=garden"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      Garden Of Tomorrow
                    </Link>
                    <Link
                      to="/our-house?tab=bursary"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      William Morris Art Futures Bursary
                    </Link>
                  </div>
                </div>

                <div>
                  <h3 className="mb-4 font-serif text-base xl:text-lg text-[#171713]">
                    Governance & Culture
                  </h3>
                  <div className="space-y-3 text-sm text-[#2e312b]">
                    <Link
                      to="/our-house?tab=nature-director"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      Nature, Our Director
                    </Link>
                    <Link
                      to="/our-house?tab=greenprint"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      The Greenprint
                    </Link>
                    <Link
                      to="/our-house?tab=nature-fridays"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      Nature Fridays
                    </Link>
                    <Link
                      to="/our-house?tab=accessibility"
                      onClick={onClose}
                      className="block hover:underline"
                    >
                      Accessibility Statement
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. SHOP MODE (Default)
  const data = shopMenuData[category];
  if (!data) return null;

  const currentCategorySlug = categorySlugMap[category] || category.toLowerCase().replace(/\s+/g, "_");

  return (
    <div
      className="absolute inset-x-0 top-full z-50 hidden px-6 pb-7 pt-2 lg:block animate-fadeIn delay-300"
      onMouseLeave={onClose}
    >
      <div className="grid grid-cols-[minmax(240px,0.8fr)_minmax(0,2.4fr)] gap-3 xl:grid-cols-[minmax(260px,0.8fr)_minmax(0,2.4fr)]">
        {/* Left category panel */}
        <div className="rounded-[22px] bg-white p-7 xl:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#ede9e1]">
          <Link
            to={`/shop/${currentCategorySlug}`}
            onClick={onClose}
            className="mb-7 block font-serif text-4xl tracking-tight text-[#171713] hover:underline"
          >
            {data.heading}
          </Link>

          <div className="flex flex-col">
            {data.links.map((item, index) => (
              <Link
                key={item}
                to={getCategoryLink(category, item)}
                onClick={onClose}
                className={`py-3 font-serif text-lg text-[#171713] hover:underline ${
                  index === 2 ? "mt-3 border-t border-[#e7e2d7] pt-6" : ""
                }`}
              >
                {item}
              </Link>
            ))}
          </div>
        </div>

        {/* Right mega menu content */}
        <div className="grid grid-cols-[0.8fr_0.8fr_1fr_1.3fr] gap-5 rounded-[22px] bg-white p-7 xl:gap-8 xl:p-9 shadow-[0_8px_30px_rgba(0,0,0,0.06)] border border-[#ede9e1]">
          <div>
            <h3 className="mb-7 font-serif text-xl">By Colour</h3>

            <div className="space-y-4">
              {data.colours.map((colour) => (
                <Link
                  key={colour}
                  to={getColourLink(category, colour)}
                  onClick={onClose}
                  className="flex items-center text-base hover:underline"
                >
                  <ColourDots colour={colour} />
                  {colour}
                </Link>
              ))}
            </div>

            <Link
              to={`/products?category=${currentCategorySlug}&filter=all-colours`}
              onClick={onClose}
              className="mt-6 inline-block underline underline-offset-4"
            >
              All Colours
            </Link>
          </div>

          <div>
            <h3 className="mb-7 font-serif text-xl">By Style</h3>

            <div className="space-y-4">
              {data.styles.map((style) => (
                <Link
                  key={style}
                  to={getStyleLink(category, style)}
                  onClick={onClose}
                  className="block text-base hover:underline"
                >
                  {style}
                </Link>
              ))}
            </div>

            <Link
              to={`/products?category=${currentCategorySlug}&filter=all-styles`}
              onClick={onClose}
              className="mt-6 inline-block underline underline-offset-4"
            >
              All Styles
            </Link>
          </div>

          <div>
            <h3 className="mb-7 font-serif text-xl">By Collection</h3>

            <div className="space-y-4">
              {data.collections.map((collection) => (
                <Link
                  key={collection}
                  to={getCollectionLink(category, collection)}
                  onClick={onClose}
                  className="block text-base hover:underline"
                >
                  {collection}
                </Link>
              ))}
            </div>

            <Link
              to={`/products?category=${currentCategorySlug}&filter=all-collections`}
              onClick={onClose}
              className="mt-6 inline-block underline underline-offset-4"
            >
              All Collections
            </Link>
          </div>

          {/* Promotional image */}
          <Link
            to={`/shop/${currentCategorySlug}`}
            onClick={onClose}
            className="group grid grid-cols-1 gap-4 self-center xl:grid-cols-[1fr_0.9fr]"
          >
            <img
              src={data.image}
              alt={`Discover ${data.heading}`}
              loading="lazy"
              className="h-52 w-full rounded-md object-cover xl:h-60"
            />

            <div>
              <p className="font-serif text-xl leading-tight">
                Transform Your Space With Pattern
              </p>
              <span className="mt-4 inline-block text-base underline underline-offset-4 group-hover:opacity-60">
                How-To Guide
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default memo(MegaMenu);