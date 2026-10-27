import { memo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Sparkles,
  ShieldCheck,
  TreePine,
  Truck,
  Palette,
  Calendar,
  Quote,
  Heart,
} from "lucide-react";
import { useWishlist } from "../utils/wishlist";

// Brand value pillars
const VALUE_PILLARS = [
  {
    icon: ShieldCheck,
    title: "Certified B Corp™",
    description: "Meeting the highest standards of social & environmental impact",
  },
  {
    icon: TreePine,
    title: "World Land Trust Partner",
    description: "35m² of endangered rainforest protected with every single order",
  },
  {
    icon: Truck,
    title: "Complimentary Swatch Shipping",
    description: "Sample swatches delivered straight to your door with free postage",
  },
  {
    icon: Palette,
    title: "Made in England",
    description: "Handcrafted wallpapers and fabrics preserving British heritage craft",
  },
];

// Iconic House of Hackney patterns
const HOUSE_FAVOURITES = [
  {
    name: "Hollyhocks Wallpaper",
    colourway: "Spring",
    category: "Floral & Meadows",
    price: 200,
    unit: "roll",
    slug: "hollyhocks-wallpaper-spring",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_900,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-0",
    swatches: [
      { name: "Spring", hex: "#c8d6ba" },
      { name: "Summer", hex: "#f0d5a8" },
      { name: "Autumn", hex: "#b46e4b" },
      { name: "Winter", hex: "#3a4a3f" },
    ],
    tag: "Bestseller",
  },
  {
    name: "Plantasia Wallpaper",
    colourway: "Sage",
    category: "Botanical & Foliage",
    price: 200,
    unit: "roll",
    slug: "plantasia-wallpaper-sage",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_900,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-0",
    swatches: [
      { name: "Sage", hex: "#a4b29a" },
      { name: "Indigo", hex: "#2b3b4f" },
      { name: "Sienna", hex: "#8c563e" },
      { name: "Prism", hex: "#e7ded2" },
    ],
    tag: "Iconic Design",
  },
  {
    name: "Artemis Wallpaper",
    colourway: "Blush",
    category: "Floral & Meadows",
    price: 200,
    unit: "roll",
    slug: "artemis-wallpaper-blush",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_900,f_auto,q_auto/house_of_hackney/wallpaper/artemis_wallpaper___blush/artemis-wallpaper-blush-0",
    swatches: [
      { name: "Blush", hex: "#dfb4af" },
      { name: "Off White", hex: "#efece6" },
      { name: "Black", hex: "#1f1f1e" },
      { name: "Moss Green", hex: "#4a5d3f" },
    ],
    tag: "Bestseller",
  },
  {
    name: "Babylon Wallpaper",
    colourway: "Dove & Willow",
    category: "Botanical & Foliage",
    price: 200,
    unit: "roll",
    slug: "babylon-wallpaper-dove-willow",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_900,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0",
    swatches: [
      { name: "Dove & Willow", hex: "#959b8a" },
      { name: "Papyrus", hex: "#e5ddce" },
      { name: "Celestial Blue", hex: "#7a90a2" },
      { name: "Blush", hex: "#d8aca8" },
    ],
    tag: "Classic",
  },
  {
    name: "Floribunda Magna Wallpaper",
    colourway: "Zenith",
    category: "Floral & Meadows",
    price: 230,
    unit: "roll",
    slug: "floribunda-magna-wallpaper-zenith",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_900,f_auto,q_auto/house_of_hackney/wallpaper/floribunda_magna_wallpaper___zenith/floribunda-magna-wallpaper-zenith-0",
    swatches: [
      { name: "Zenith", hex: "#5d6d7e" },
      { name: "Verde", hex: "#4a684b" },
    ],
    tag: "Grand Mural",
  },
  {
    name: "Zeus Wallpaper",
    colourway: "Eau De Nil",
    category: "Maximalist & Whimsical",
    price: 200,
    unit: "roll",
    slug: "zeus-wallpaper-eau-de-nil",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_900,f_auto,q_auto/house_of_hackney/wallpaper/zeus_wallpaper___eau_de_nil/zeus-wallpaper-eau-de-nil-0",
    swatches: [
      { name: "Eau De Nil", hex: "#8ca89c" },
      { name: "Tobacco", hex: "#634731" },
      { name: "Carob", hex: "#352e2a" },
    ],
    tag: "Iconic Motif",
  },
];

// Rich core categories
const CATEGORIES = [
  {
    title: "Wallpaper",
    subtitle: "British heritage prints on FSC-certified paper",
    image:
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1000,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-0",
    link: "/products?category=wallpaper",
    tag: "Explore Rolls & Murals",
  },
  {
    title: "Fabric",
    subtitle: "Organic velvets, cotton linens & jacquards",
    image:
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1000,f_auto,q_auto/house_of_hackney/furnishings/artemis_cotton_linen_vesper_sofa___jadeite/artemis-cotton-linen-vesper-sofa-jadeite-0",
    link: "/products?category=fabric",
    tag: "Order by the Metre",
  },
  {
    title: "Paint",
    subtitle: "Soulful breathable mineral paint with rich depth",
    image:
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1000,f_auto,q_auto/house_of_hackney/paint/woad_paint___21/woad-paint-21-1",
    link: "/products?category=paint",
    tag: "Sample Pots Available",
  },
  {
    title: "Curtains & Blinds",
    subtitle: "Made-to-measure by master British drapery tailors",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=85",
    link: "/products?category=fabric",
    tag: "Bespoke Tailoring",
  },
  {
    title: "Home Decor & Cushions",
    subtitle: "Tactile fringed cushions, lampshades & ceramics",
    image:
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1000,f_auto,q_auto/house_of_hackney/home_decor/alice_in_wonderland_medium_fringed_jacquard_cushion___achillea/alice-in-wonderland-medium-fringed-jacquard-cushion-achillea-1",
    link: "/products?category=home_decor",
    tag: "Accessories & Gifts",
  },
  {
    title: "Furnishings",
    subtitle: "Handcrafted statement sofas & upholstered chairs",
    image:
      "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1000,f_auto,q_auto/house_of_hackney/furnishings/artemis_cotton_linen_vesper_sofa___jadeite/artemis-cotton-linen-vesper-sofa-jadeite-0",
    link: "/products?category=furnishings",
    tag: "Made to Order",
  },
];

// Press quotes
const PRESS_QUOTES = [
  {
    quote: "The rebellious British interiors brand reshaping modern luxury through nature-inspired maximalism.",
    source: "VOGUE",
  },
  {
    quote: "House of Hackney brings the romanticism of the natural world indoors in the most sumptuous way imaginable.",
    source: "ARCHITECTURAL DIGEST",
  },
  {
    quote: "Unabashedly eccentric, considered in every stitch, and proudly leading the way in sustainable British craft.",
    source: "ELLE DECORATION",
  },
  {
    quote: "Every print tells a story of English eccentricity, folklore, and an unwavering love for the earth.",
    source: "THE WORLD OF INTERIORS",
  },
];

// Real homes customer community gallery
const COMMUNITY_STORIES = [
  {
    room: "A Sunlit Drawing Room",
    pattern: "Hollyhocks in Spring",
    location: "Cotswolds, England",
    image: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=85",
    productLink: "/products/hollyhocks-wallpaper-spring",
  },
  {
    room: "Atmospheric Dining Sanctuary",
    pattern: "Plantasia in Sage",
    location: "Edinburgh, Scotland",
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=85",
    productLink: "/products/plantasia-wallpaper-sage",
  },
  {
    room: "Whimsical Master Bedroom",
    pattern: "Artemis in Blush",
    location: "London, UK",
    image: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=800&q=85",
    productLink: "/products/artemis-wallpaper-blush",
  },
  {
    room: "Woodland Powder Room",
    pattern: "Babylon in Willow",
    location: "Cornwall, England",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=85",
    productLink: "/products/babylon-wallpaper-dove-willow",
  },
];

function Home() {
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [activeTab, setActiveTab] = useState("All Icons");

  const filteredFavourites =
    activeTab === "All Icons"
      ? HOUSE_FAVOURITES
      : HOUSE_FAVOURITES.filter((item) => item.category === activeTab);

  return (
    <main className="overflow-hidden bg-[#f6f3ec] text-[#26251f]">
      {/* Value pillars */}
      <section className="border-b border-[#e5dfd4] bg-[#eae4d9] px-3 sm:px-6 md:px-8 py-3 text-xs">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-3 gap-y-2.5 sm:grid-cols-4 sm:gap-6">
          {VALUE_PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <Icon size={16} className="shrink-0 text-[#394132]" />
                <div className="min-w-0">
                  <p className="font-medium tracking-wide text-[#171713] text-[11px] sm:text-xs truncate sm:whitespace-normal">
                    {pillar.title}
                  </p>
                  <p className="hidden text-[10px] text-[#666257] md:block">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Hero campaign */}
      <section
        id="home-hero"
        className="grid grid-cols-1 md:min-h-[580px] md:grid-cols-2 lg:min-h-[640px]"
      >
        {/* Campaign photograph */}
        <div className="relative h-[60svh] min-h-[380px] overflow-hidden sm:h-[65svh] md:h-auto md:min-h-[580px] lg:min-h-[640px]">
          <img
            src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1800&q=90"
            alt="Pattern-rich House of Hackney interior inspiration"
            fetchPriority="high"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute bottom-4 left-4 rounded-full bg-[#171713]/70 px-3 py-1 text-[9px] uppercase tracking-widest text-white backdrop-blur-xs">
            Featuring Artemis Blush & Wildflower Velvet
          </div>
        </div>

        {/* Campaign text panel */}
        <div className="flex items-center justify-center bg-[#5c2421] px-6 py-16 text-center text-[#fffaf3] sm:px-12 sm:py-20 md:px-8 md:py-14 lg:px-14 xl:px-20">
          <div className="mx-auto w-full max-w-[540px]">
            <p className="mb-4 text-[10px] tracking-[3.5px] uppercase sm:text-[11px] text-[#e8cbb6]">
              AUTUMN / WINTER COLLECTION
            </p>

            <h1 className="font-serif text-[clamp(36px,5vw,72px)] uppercase leading-[1.04] tracking-[-1.5px]">
              Favourites
              <br />
              to Fall For
            </h1>

            <div className="mx-auto my-6 h-px w-14 bg-[#d8c4a5]/80" />

            <p className="mx-auto max-w-[420px] text-[13px] leading-7 text-[#fffaf3]/90 sm:text-sm sm:leading-7">
              From wildflower meadows and William Morris classics to
              fantasy foliage prints, bring nature home this season
              with our iconic House Favourites. Handcrafted in England.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/products?category=wallpaper"
                className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-[#fffaf3]/90 bg-[#fffaf3] px-7 py-3.5 text-[10px] font-semibold tracking-[2px] text-[#5c2421] transition duration-300 hover:bg-transparent hover:text-[#fffaf3] sm:text-[11px]"
              >
                SHOP WALLPAPER
                <ArrowRight size={14} />
              </Link>

              <Link
                to="/products?filter=bestseller"
                className="inline-flex min-h-12 items-center justify-center gap-2.5 border border-[#fffaf3]/60 px-6 py-3.5 text-[10px] font-semibold tracking-[2px] text-[#fffaf3] transition duration-300 hover:bg-[#fffaf3] hover:text-[#5c2421] sm:text-[11px]"
              >
                EXPLORE BESTSELLERS
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Brand introduction */}
      <section className="px-6 py-16 text-center sm:px-10 sm:py-20 md:py-24">
        <p className="mb-3 text-[10px] font-semibold tracking-[3px] uppercase text-[#394132]">
          A WORLD OF BOTANICAL PATTERN
        </p>

        <h2 className="mx-auto max-w-3xl font-serif text-3xl leading-tight sm:text-4xl md:text-5xl text-[#171713]">
          Interiors for the love of Nature.
        </h2>

        <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#666257]">
          We believe homes should be sanctuaries of self-expression.
          By marrying heritage British manufacturing with a punk-inspired maximalist spirit,
          each design honors the beauty of the earth while protecting it for the future.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[#171713]">
          <Link
            to="/our-house"
            className="inline-flex items-center gap-2 border-b border-[#26251f] pb-1 font-medium tracking-[1.5px] uppercase transition hover:opacity-60"
          >
            DISCOVER OUR STORY
            <ArrowRight size={13} />
          </Link>
          <Link
            to="/design-services"
            className="inline-flex items-center gap-2 border-b border-[#26251f] pb-1 font-medium tracking-[1.5px] uppercase transition hover:opacity-60"
          >
            FREE DESIGN CONSULTATIONS
            <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* House favourites */}
      <section className="border-t border-[#e5dfd4] bg-[#fbf9f5] px-5 py-16 sm:px-8 md:px-12 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-[2.5px] uppercase text-[#394132]">
                TIMELESS CLASSICS
              </p>
              <h2 className="font-serif text-3xl text-[#171713] sm:text-4xl">
                House Favourites
              </h2>
            </div>

            {/* Pattern category filter tabs */}
            <div className="flex flex-wrap gap-2">
              {[
                "All Icons",
                "Floral & Meadows",
                "Botanical & Foliage",
                "Maximalist & Whimsical",
              ].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-4 py-1.5 text-[10px] font-medium tracking-wider uppercase transition ${
                    activeTab === tab
                      ? "bg-[#394132] text-white"
                      : "border border-[#d8d1c5] bg-white/70 text-[#171713] hover:border-[#394132]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Pattern Cards Grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-3">
            {filteredFavourites.map((item) => (
              <article key={item.name} className="group flex flex-col justify-between">
                <div>
                  <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#e8e2d7] p-3 shadow-2xs transition-shadow duration-300 group-hover:shadow-md">
                    <Link
                      to={`/products/${item.slug}`}
                      className="block h-full w-full flex items-center justify-center"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                      />
                    </Link>

                    {/* Wishlist Heart Button */}
                    <button
                      type="button"
                      aria-label={isWishlisted(item.slug) ? "Remove from wishlist" : "Add to wishlist"}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlist({
                          _id: item.slug,
                          name: item.name,
                          title: item.name,
                          price: item.price,
                          currency: "GBP",
                          image: item.image,
                          slug: item.slug,
                        });
                      }}
                      className={`absolute top-3 right-3 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition cursor-pointer ${
                        isWishlisted(item.slug)
                          ? "bg-white text-[#b83232] shadow-sm scale-105"
                          : "bg-white/80 text-[#171713] hover:bg-white hover:text-[#b83232]"
                      }`}
                    >
                      <Heart
                        size={14}
                        className={isWishlisted(item.slug) ? "fill-[#b83232]" : ""}
                      />
                    </button>

                    {/* Badge */}
                    <span className="absolute top-3 left-3 rounded-full bg-[#f6f3ec]/95 px-2.5 py-0.5 text-[9px] font-medium tracking-wider uppercase text-[#171713] shadow-xs backdrop-blur-xs">
                      {item.tag}
                    </span>

                    <span className="absolute right-3 bottom-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#171713] text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 shadow-xs pointer-events-none">
                      <ArrowRight size={13} />
                    </span>
                  </div>

                  <div className="mt-4">
                    <p className="text-[10px] tracking-wider uppercase text-[#777267]">
                      {item.category}
                    </p>
                    <Link
                      to={`/products/${item.slug}`}
                      className="mt-0.5 block font-serif text-lg uppercase tracking-wide text-[#171713] hover:underline"
                    >
                      {item.name}
                    </Link>
                    <p className="mt-0.5 text-xs text-[#666257]">
                      Colourway: {item.colourway}
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-xs font-semibold text-[#171713]">
                        £{item.price}.00{" "}
                        <span className="font-normal text-[#777267]">
                          / per {item.unit}
                        </span>
                      </p>

                      {/* Swatch dots */}
                      <div className="flex items-center gap-1.5">
                        {item.swatches.map((swatch) => (
                          <span
                            key={swatch.name}
                            title={swatch.name}
                            className="h-3 w-3 rounded-full border border-black/20 shadow-xs"
                            style={{ backgroundColor: swatch.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link
                    to={`/products/${item.slug}`}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-[#171713] py-2 text-[10px] font-medium tracking-wider uppercase text-[#171713] transition hover:bg-[#171713] hover:text-white"
                  >
                    View Pattern
                  </Link>
                  <Link
                    to={`/products/${item.slug}?sample=true`}
                    className="flex items-center justify-center gap-1 rounded-full border border-[#394132] bg-[#394132]/10 px-3 py-2 text-[10px] font-medium tracking-wider uppercase text-[#394132] transition hover:bg-[#394132] hover:text-white"
                  >
                    <Sparkles size={11} />
                    Sample
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/products?category=wallpaper"
              className="inline-flex items-center gap-3 rounded-full bg-[#171713] px-9 py-3.5 text-xs font-medium tracking-[2.5px] uppercase text-white transition hover:bg-[#394132]"
            >
              EXPLORE ALL WALLPAPER DESIGNS
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="px-5 py-16 sm:px-8 md:px-12 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="mb-2 text-[10px] font-semibold tracking-[2.5px] uppercase text-[#394132]">
                CURATE YOUR SPACE
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[#171713]">
                Shop by Collection
              </h2>
            </div>

            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[1.5px] underline underline-offset-4 text-[#171713] hover:text-[#394132]"
            >
              VIEW ALL COLLECTIONS
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.title}
                to={cat.link}
                className="group relative block overflow-hidden rounded-sm bg-[#e8e2d7] shadow-sm transition hover:shadow-md"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <span className="text-[9px] uppercase tracking-widest text-[#d8c4a5]">
                    {cat.tag}
                  </span>
                  <h3 className="mt-1 font-serif text-2xl font-normal leading-tight">
                    {cat.title}
                  </h3>
                  <p className="mt-1 text-xs text-white/80 line-clamp-1">
                    {cat.subtitle}
                  </p>

                  <div className="mt-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-wider text-[#d8c4a5] group-hover:text-white transition">
                    <span>Explore Collection</span>
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Brand story and impact */}
      <section className="grid grid-cols-1 bg-[#32392b] text-[#f6f3ec] md:grid-cols-2">
        <div className="relative min-h-[380px] overflow-hidden sm:min-h-[460px] md:min-h-[580px]">
          <img
            src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85"
            alt="Considered British luxury craft in a historic setting"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute top-6 left-6 rounded-sm bg-[#171713]/80 px-3 py-1.5 text-[9px] uppercase tracking-widest text-[#e8cbb6] backdrop-blur-xs">
            The Castle of Trematon & Hackney Archives
          </div>
        </div>

        <div className="flex items-center justify-center px-7 py-16 sm:px-12 md:px-10 lg:px-16 xl:px-20">
          <div className="max-w-lg">
            <div className="flex items-center gap-2 text-[#d8c4a5] mb-4">
              <TreePine size={18} />
              <p className="text-[10px] font-semibold tracking-[3px] uppercase">
                B CORP & WORLD LAND TRUST
              </p>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-[1.1] text-white">
              Reworking tradition for a new generation.
            </h2>

            <p className="mt-6 text-sm leading-7 text-[#d8d3c5]">
              Founded in London in 2011 by Frieda Gormley and Javvy M Royle,
              House of Hackney is a certified B Corporation using business
              as a catalyst for positive change. With every purchase you make,
              we buy and protect 35 square metres of endangered forest in
              partnership with the <strong className="text-white">World Land Trust</strong>.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4 border-y border-white/20 py-4 text-xs text-[#d8d3c5]">
              <div>
                <p className="font-serif text-2xl font-bold text-white">3,250,000+ m²</p>
                <p className="text-[10px] uppercase tracking-wider text-[#d8c4a5]">Forest Protected</p>
              </div>
              <div>
                <p className="font-serif text-2xl font-bold text-white">100%</p>
                <p className="text-[10px] uppercase tracking-wider text-[#d8c4a5]">Made in England</p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/our-house"
                className="inline-flex items-center gap-2.5 rounded-full border border-white px-6 py-3 text-[10px] font-medium tracking-[2px] uppercase text-white hover:bg-white hover:text-[#32392b] transition"
              >
                OUR B CORP STORY
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Design services */}
      <section className="bg-[#f0ebe1] px-6 py-16 sm:px-10 sm:py-20 md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-3 text-[10px] font-semibold tracking-[3px] uppercase text-[#394132]">
            PERSONALISED DECORATING ADVICE
          </p>

          <h2 className="mx-auto max-w-2xl font-serif text-3xl leading-tight sm:text-4xl md:text-5xl text-[#171713]">
            Have a vision for your space?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-[#666257]">
            Whether you want help calculating roll quantities, pairing mineral paints with statement wallpaper,
            or commissioning bespoke made-to-measure curtains, our expert interior consultants are at your service.
          </p>

          <div className="mt-12 grid grid-cols-1 gap-6 text-left sm:grid-cols-3">
            <div className="rounded-sm border border-[#d8d1c5] bg-white p-6 shadow-2xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#394132]/10 text-[#394132]">
                <Calendar size={18} />
              </div>
              <h3 className="mt-4 font-serif text-lg text-[#171713]">Virtual Consultations</h3>
              <p className="mt-2 text-xs leading-5 text-[#666257]">
                Book a complimentary 1-on-1 video appointment from anywhere in the world.
              </p>
            </div>

            <div className="rounded-sm border border-[#d8d1c5] bg-white p-6 shadow-2xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#394132]/10 text-[#394132]">
                <Palette size={18} />
              </div>
              <h3 className="mt-4 font-serif text-lg text-[#171713]">Curated Moodboards</h3>
              <p className="mt-2 text-xs leading-5 text-[#666257]">
                Receive bespoke scheme palettes, coordinating paint swatches and fabric combinations.
              </p>
            </div>

            <div className="rounded-sm border border-[#d8d1c5] bg-white p-6 shadow-2xs">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#394132]/10 text-[#394132]">
                <Truck size={18} />
              </div>
              <h3 className="mt-4 font-serif text-lg text-[#171713]">Complimentary Samples</h3>
              <p className="mt-2 text-xs leading-5 text-[#666257]">
                We send curated wallpaper and fabric samples directly to your doorstep.
              </p>
            </div>
          </div>

          <div className="mt-10">
            <Link
              to="/design-services"
              className="inline-flex items-center gap-3 rounded-full bg-[#394132] px-8 py-3.5 text-xs font-semibold tracking-[2px] uppercase text-white shadow-sm hover:bg-[#282e23] transition"
            >
              BOOK A FREE CONSULTATION
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* Press acclaim */}
      <section className="border-t border-[#e5dfd4] px-5 py-14 sm:px-8 md:px-12 md:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-8 text-center text-[10px] font-semibold tracking-[3px] uppercase text-[#777267]">
            ACCLAIM & TESTIMONIALS
          </p>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {PRESS_QUOTES.map((press, i) => (
              <div
                key={i}
                className="flex flex-col justify-between border-l border-[#d8d1c5] pl-5"
              >
                <div>
                  <Quote size={20} className="text-[#394132]/40 mb-2" />
                  <p className="text-xs leading-6 text-[#555248] italic">
                    &quot;{press.quote}&quot;
                  </p>
                </div>
                <p className="mt-4 font-serif text-xs font-bold tracking-[2.5px] uppercase text-[#171713]">
                  {press.source}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community lookbook */}
      <section className="border-t border-[#e5dfd4] bg-[#fbf9f5] px-5 py-16 sm:px-8 md:px-12 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 text-center">
            <p className="mb-2 text-[10px] font-semibold tracking-[3px] uppercase text-[#394132]">
              #HOUSEOFHACKNEY
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#171713]">
              In Real Homes
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-xs text-[#666257]">
              Step inside beautiful sanctuaries created by our global community of designers and homeowners.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {COMMUNITY_STORIES.map((story, idx) => (
              <Link
                key={idx}
                to={story.productLink}
                className="group relative block aspect-[3/4] overflow-hidden rounded-sm bg-[#e8e2d7]"
              >
                <img
                  src={story.image}
                  alt={story.room}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                <div className="absolute inset-x-0 bottom-0 p-3.5 text-white">
                  <p className="text-[9px] uppercase tracking-wider text-[#d8c4a5]">
                    {story.location}
                  </p>
                  <p className="font-serif text-sm leading-tight text-white line-clamp-1">
                    {story.pattern}
                  </p>
                  <span className="mt-1 inline-flex items-center gap-1 text-[9px] uppercase tracking-wider text-[#d8c4a5] group-hover:underline">
                    Shop Look <ArrowRight size={10} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default memo(Home);

