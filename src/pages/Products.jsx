import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams, useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ArrowRight,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  LayoutGrid,
  Grid2X2,
  Grid3X3,
  ShieldCheck,
  TreePine,
  Truck,
  Heart,
} from "lucide-react";

import { getProducts } from "../services/productservice";
import { getProductImage, optimizeImageUrl } from "../utils/getProductImage";
import { addToCart } from "../features/carts/cartSlice";
import { setProducts as setReduxProducts } from "../features/products/productSlice";
import { showToast, showError } from "../utils/sweetAlert";
import { useWishlist } from "../utils/wishlist";

function formatPrice(value, currency = "GBP") {
  if (value === null || value === undefined || !Number.isFinite(Number(value))) {
    return null;
  }
  const curr = currency || "GBP";
  const locale = curr === "GBP" ? "en-GB" : curr === "USD" ? "en-US" : curr === "EUR" ? "de-DE" : "en-GB";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 2,
    }).format(Number(value));
  } catch {
    return `${curr} ${Number(value).toFixed(2)}`;
  }
}

const HERO_CONTENT = {
  All: {
    title: "THE COMPLETE COLLECTION",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/furnishings/artemis_cotton_linen_vesper_sofa___jadeite/artemis-cotton-linen-vesper-sofa-jadeite-0",
    description: "From cotton linens and 100% organic velvets to British wallpapers and handcrafted artisanal furnishings, create something truly unique by transforming our prints into custom curtains and bespoke upholstered furniture. Discover our world of iconic British design.",
    links: [
      { label: "BOOK A FREE CONSULTATION", to: "/products" },
      { label: "EXPLORE SAMPLES", to: "/products?category=wallpaper" },
    ],
  },
  Fabric: {
    title: "FABRIC",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/furnishings/artemis_cotton_linen_vesper_sofa___jadeite/artemis-cotton-linen-vesper-sofa-jadeite-0",
    description: "From cotton linens and 100% organic velvets to hemp, sheers and recycled performance fabric, create something truly unique by transforming our fabrics into custom curtains and blinds or bespoke upholstered furniture. Discover more about our made-to-measure and bespoke services by booking a complimentary consultation with one of our experts.",
    links: [
      { label: "BOOK A FREE CONSULTATION", to: "/products" },
      { label: "CREATE YOUR CURTAINS", to: "/products?category=fabric" },
    ],
  },
  Wallpaper: {
    title: "WALLPAPER",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0",
    description: "Step into our immersive world of British heritage wallpapers. Handcrafted on sustainably sourced paper from FSC-certified forests, each iconic print is printed with non-toxic water-based inks and captures the eccentric beauty of nature.",
    links: [
      { label: "ORDER WALLPAPER SAMPLES", to: "/products?category=wallpaper" },
      { label: "WALLPAPER CALCULATOR", to: "/products?category=wallpaper" },
    ],
  },
  Paint: {
    title: "PAINT",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/paint/woad_paint___21/woad-paint-21-1",
    description: "Handcrafted mineral paint with superior coverage and depth of colour. Breathable, durable and formulated with low VOCs, our colours bring a soulful mood to every wall and architectural woodwork.",
    links: [
      { label: "ORDER SAMPLE POTS", to: "/products?category=paint" },
      { label: "COLOUR CONSULTATION", to: "/products?category=paint" },
    ],
  },
  "Home Decor": {
    title: "HOME DECOR",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/home_decor/alice_in_wonderland_medium_fringed_jacquard_cushion___achillea/alice-in-wonderland-medium-fringed-jacquard-cushion-achillea-1",
    description: "Characterful home accessories and luxury decor crafted with eccentric British soul. Discover tactile jacquard cushions, lampshades, and statement accents designed to bring wonder to every corner.",
    links: [
      { label: "EXPLORE ACCESSORIES", to: "/products?category=home_decor" },
      { label: "GIFT INSPIRATION", to: "/products?category=home_decor" },
    ],
  },
  Furnishings: {
    title: "FURNISHINGS",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/furnishings/wonder_garden_ceramic_mug/wondergarden-ceramic-mug-cream-1",
    description: "Bespoke British furniture and handcrafted artisanal furnishings made to order in England. Unrivalled craftsmanship meets rebellious British maximalism.",
    links: [
      { label: "BESPOKE SERVICE", to: "/products?category=furnishings" },
      { label: "VIEW CATALOGUE", to: "/products?category=furnishings" },
    ],
  },
  "Curtains & Blinds": {
    title: "CURTAINS & BLINDS",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/furnishings/artemis_cotton_linen_vesper_sofa___jadeite/artemis-cotton-linen-vesper-sofa-jadeite-0",
    description: "Custom-made curtains and blinds tailored by master British craftspeople. Choose from our sumptuous organic velvets, crisp cotton linens and statement jacquards.",
    links: [
      { label: "BOOK A CONSULTATION", to: "/products?category=fabric" },
      { label: "EXPLORE FABRICS", to: "/products?category=fabric" },
    ],
  },
  "Carpets & Flooring": {
    title: "CARPETS & FLOORING",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/home_decor/alice_in_wonderland_medium_fringed_jacquard_cushion___achillea/alice-in-wonderland-medium-fringed-jacquard-cushion-achillea-1",
    description: "Statement British carpets and luxury area rugs woven with decadent botanical motifs and ancestral craftsmanship.",
    links: [
      { label: "ORDER RUG SAMPLES", to: "/products?category=home_decor" },
      { label: "DESIGN SERVICES", to: "/products?category=home_decor" },
    ],
  },
  Lighting: {
    title: "LIGHTING",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/furnishings/wonder_garden_ceramic_mug/wondergarden-ceramic-mug-cream-1",
    description: "Statement lamps, ceramic lamp bases and hand-fringed velvet lampshades designed to cast an enchanting glow across your interiors.",
    links: [
      { label: "VIEW ALL LIGHTING", to: "/products?category=lighting" },
      { label: "LAMPSHADES", to: "/products?category=lighting" },
    ],
  },
  Apothecary: {
    title: "APOTHECARY",
    image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80",
    description: "Sensory home fragrances, natural botanical candles and artisanal bath elixirs infused with British wildflowers and mystical scents.",
    links: [
      { label: "EXPLORE CANDLES", to: "/products?category=apothecary" },
      { label: "FRAGRANCE FINDER", to: "/products?category=apothecary" },
    ],
  },
};

const slugToCategoryMap = {
  all: "All",
  wallpaper: "Wallpaper",
  fabric: "Fabric",
  paint: "Paint",
  furnishings: "Furnishings",
  home_decor: "Home Decor",
  "home-decor": "Home Decor",
  lighting: "Lighting",
  apothecary: "Apothecary",
  curtains___blinds: "Curtains & Blinds",
  "curtains-blinds": "Curtains & Blinds",
  "curtains-and-blinds": "Curtains & Blinds",
  carpets___flooring: "Carpets & Flooring",
  "carpets-flooring": "Carpets & Flooring",
  "carpets-and-flooring": "Carpets & Flooring",
};

const categorySlugMap = {
  All: "",
  Wallpaper: "wallpaper",
  Fabric: "fabric",
  Paint: "paint",
  Furnishings: "furnishings",
  "Home Decor": "home_decor",
  Lighting: "lighting",
  Apothecary: "apothecary",
  "Curtains & Blinds": "curtains___blinds",
  "Carpets & Flooring": "carpets___flooring",
};

const SUB_CATEGORIES_BY_CATEGORY = {
  Wallpaper: [
    { label: "All Wallpaper", filterKey: "clear" },
    { label: "Floral & Meadows", filterKey: "style", value: "floral" },
    { label: "Botanical & Foliage", filterKey: "style", value: "botanical" },
    { label: "William Morris & Victorian", filterKey: "style", value: "victorian" },
    { label: "Animal & Whimsical", filterKey: "style", value: "whimsical" },
    { label: "Murals & Grand Panels", filterKey: "productType", value: "WALLPAPER_MURAL" },
    { label: "Stripes & Architectural", filterKey: "style", value: "stripe" },
  ],
  Fabric: [
    { label: "All Fabric", filterKey: "clear" },
    { label: "Velvet", filterKey: "search", value: "velvet" },
    { label: "Cotton & Linen", filterKey: "search", value: "linen" },
    { label: "Jacquard", filterKey: "search", value: "jacquard" },
    { label: "Curtains & Drapery", filterKey: "search", value: "curtain" },
  ],
  Paint: [
    { label: "All Paint", filterKey: "clear" },
    { label: "Greens & Sage", filterKey: "colour", value: "green" },
    { label: "Pinks & Blush", filterKey: "colour", value: "pink" },
    { label: "Blues & Woad", filterKey: "colour", value: "blue" },
    { label: "Neutrals & Creams", filterKey: "colour", value: "neutral" },
    { label: "Dark & Moody", filterKey: "colour", value: "black" },
  ],
  "Home Decor": [
    { label: "All Decor", filterKey: "clear" },
    { label: "Cushions & Tassels", filterKey: "search", value: "cushion" },
    { label: "Lampshades", filterKey: "search", value: "lampshade" },
    { label: "Ceramics & Mugs", filterKey: "search", value: "ceramic" },
  ],
};

function Products() {
  const dispatch = useDispatch();
  const { isWishlisted, toggleWishlist } = useWishlist();
  const [searchParams, setSearchParams] = useSearchParams();
  const { categorySlug, collectionSlug, styleSlug, colourSlug } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 16, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [gridCols, setGridCols] = useState(4); // 2, 3, or 4 columns view

  // parse url filters
  const urlCategoryRaw = searchParams.get("category") || categorySlug || "";
  const urlColour = searchParams.get("colour") || searchParams.get("color") || colourSlug || "";
  const urlStyle = searchParams.get("style") || styleSlug || "";
  const urlCollection = searchParams.get("collection") || collectionSlug || "";
  const urlSearch = searchParams.get("search") || searchParams.get("q") || "";
  const urlFilter = searchParams.get("filter") || "";
  const urlSort = searchParams.get("sort") || "default";
  const urlProductType = searchParams.get("productType") || searchParams.get("type") || "All";

  // Derive resolved category
  const activeCategory = useMemo(() => {
    if (!urlCategoryRaw) return "All";
    const lower = urlCategoryRaw.toLowerCase();
    return slugToCategoryMap[lower] || urlCategoryRaw.charAt(0).toUpperCase() + urlCategoryRaw.slice(1);
  }, [urlCategoryRaw]);

  useEffect(() => {
    let cancelled = false;

    async function fetchCatalogue() {
      try {
        setLoading(true);
        setError("");

        const params = {
          page: currentPage,
          limit: 16,
        };

        if (activeCategory !== "All") {
          if (activeCategory === "Curtains & Blinds") {
            params.category = "fabric";
          } else if (activeCategory === "Carpets & Flooring") {
            params.category = "home_decor";
          } else {
            params.category = categorySlugMap[activeCategory] || activeCategory.toLowerCase().replace(/\s+/g, "_");
          }
        }

        if (urlProductType && urlProductType !== "All") {
          params.productType = urlProductType.toUpperCase();
        }

        if (urlFilter === "bestseller") {
          params.isBestSeller = true;
        } else if (urlFilter === "featured") {
          params.isFeatured = true;
        } else if (urlFilter === "new") {
          params.isNewArrival = true;
        }

        // Search parameter from urlSearch, collection or style
        const effectiveSearch = (urlSearch || urlCollection || (urlStyle && !urlStyle.startsWith("all-") ? urlStyle : "")).trim();
        if (effectiveSearch) {
          let cleanSearch = effectiveSearch.toLowerCase().replace(/['’]/g, "");
          if (cleanSearch.includes("artist") || cleanSearch.includes("stripe")) {
            cleanSearch = "stripe";
          } else if (cleanSearch.includes("william") || cleanSearch.includes("morris")) {
            cleanSearch = "victorian";
          }
          params.search = cleanSearch;
        }

        if (urlSort === "name-asc") params.sort = "name_asc";
        else if (urlSort === "name-desc") params.sort = "name_desc";
        else if (urlSort === "price-asc") params.sort = "price-low-to-high";
        else if (urlSort === "price-desc") params.sort = "price-high-to-low";
        else if (urlSort === "newest" || urlFilter === "new") params.sort = "newest";

        const result = await getProducts(params);
        if (cancelled) return;

        let list = Array.isArray(result) ? result : result?.products || [];

        // Accurate price-based sorting fallback
        if (urlSort === "price-asc") {
          list = [...list].sort((a, b) => {
            const pa = a.pricing?.sellingPrice ?? a.price ?? 0;
            const pb = b.pricing?.sellingPrice ?? b.price ?? 0;
            return pa - pb;
          });
        } else if (urlSort === "price-desc") {
          list = [...list].sort((a, b) => {
            const pa = a.pricing?.sellingPrice ?? a.price ?? 0;
            const pb = b.pricing?.sellingPrice ?? b.price ?? 0;
            return pb - pa;
          });
        }

        // filter by colour
        if (urlColour) {
          const targetColour = urlColour.toLowerCase().replace(/s$/, ""); // "greens" -> "green"
          list = list.filter((p) => {
            
            const matchesColourObj = (p.colours || []).some((c) => {
              const cName = (c.name || "").toLowerCase();
              const cSlug = (c.slug || "").toLowerCase();
              return cName.includes(targetColour) || cSlug.includes(targetColour);
            });
            if (matchesColourObj) return true;

            
            const pName = (p.name || "").toLowerCase();
            const pDesc = (p.description || "").toLowerCase();
            const pKw = (p.searchKeywords || []).map((k) => String(k).toLowerCase());
            if (pName.includes(targetColour) || pDesc.includes(targetColour) || pKw.some((k) => k.includes(targetColour))) {
              return true;
            }

            
            if (targetColour === "green" && (pName.includes("willow") || pName.includes("jadeite") || pName.includes("olive") || pName.includes("sage") || pName.includes("botanical"))) {
              return true;
            }
            if (targetColour === "pink" && (pName.includes("blush") || pName.includes("rose") || pName.includes("dusky"))) {
              return true;
            }
            if (targetColour === "blue" && (pName.includes("celestial") || pName.includes("woad") || pName.includes("sky") || pName.includes("navy"))) {
              return true;
            }
            if (targetColour === "yellow" || targetColour === "gold") {
              if (pName.includes("yarrow") || pName.includes("ochre") || pName.includes("achillea") || pName.includes("mustard") || pName.includes("gold")) return true;
            }
            if (targetColour === "neutral") {
              if (pName.includes("cream") || pName.includes("dove") || pName.includes("papyrus") || pName.includes("white") || pName.includes("linen")) return true;
            }
            if (targetColour === "black") {
              if (pName.includes("midnight") || pName.includes("noir") || pName.includes("dark")) return true;
            }

            return false;
          });
        }

        const pag = result?.pagination || { page: currentPage, limit: 16, total: list.length, totalPages: 1 };

        setProducts(list);
        dispatch(setReduxProducts(list));
        setPagination(pag);
      } catch (err) {
        if (!cancelled) {
          console.error("Unable to load products:", err);
          setError("Unable to load products from catalogue. Please try again.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCatalogue();

    return () => {
      cancelled = true;
    };
  }, [
    activeCategory,
    currentPage,
    dispatch,
    reloadKey,
    urlCollection,
    urlColour,
    urlFilter,
    urlProductType,
    urlSearch,
    urlSort,
    urlStyle,
  ]);

  // sync product updates
  useEffect(() => {
    const handleUpdate = () => {
      setReloadKey((k) => k + 1);
    };
    window.addEventListener("hoh_catalog_updated", handleUpdate);
    return () => window.removeEventListener("hoh_catalog_updated", handleUpdate);
  }, []);

  const categoriesList = [
    "All",
    "Wallpaper",
    "Fabric",
    "Curtains & Blinds",
    "Carpets & Flooring",
    "Home Decor",
    "Furnishings",
    "Paint",
    "Lighting",
    "Apothecary",
  ];
  const productTypesList = ["All", "WALLPAPER", "FABRIC", "PAINT", "FURNITURE", "LIGHTING", "HOMEWARE", "ACCESSORY"];

  const currentHero = HERO_CONTENT[activeCategory] || HERO_CONTENT.All;

  const handleCategoryClick = (item) => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete("category");
    const qs = nextParams.toString();
    const query = qs ? `?${qs}` : "";

    if (item === "All") {
      navigate(`/products${query}`);
    } else {
      const slug = item.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");
      navigate(`/shop/${slug}${query}`);
    }
  };

  const handleSortChange = (newSort) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newSort === "default") {
      nextParams.delete("sort");
    } else {
      nextParams.set("sort", newSort);
    }
    setCurrentPage(1);
    setSearchParams(nextParams);
  };

  const handleProductTypeChange = (newType) => {
    const nextParams = new URLSearchParams(searchParams);
    if (newType === "All") {
      nextParams.delete("productType");
      nextParams.delete("type");
    } else {
      nextParams.set("productType", newType);
    }
    setCurrentPage(1);
    setSearchParams(nextParams);
  };

  const handleClearAllFilters = () => {
    setSearchParams({});
    setCurrentPage(1);
    navigate("/products");
  };

  const handleRemoveFilter = (filterKey) => {
    if (filterKey === "category") {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("category");
      const qs = nextParams.toString();
      navigate(`/products${qs ? `?${qs}` : ""}`);
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    if (filterKey === "colour") {
      nextParams.delete("colour");
      nextParams.delete("color");
    }
    if (filterKey === "style") nextParams.delete("style");
    if (filterKey === "collection") nextParams.delete("collection");
    if (filterKey === "search") {
      nextParams.delete("search");
      nextParams.delete("q");
    }
    if (filterKey === "filter") nextParams.delete("filter");
    if (filterKey === "productType") {
      nextParams.delete("productType");
      nextParams.delete("type");
    }
    setCurrentPage(1);
    setSearchParams(nextParams);
  };

  const hasActiveFilters = Boolean(
    activeCategory !== "All" ||
    urlColour ||
    urlStyle ||
    urlCollection ||
    urlSearch ||
    urlFilter ||
    (urlProductType && urlProductType !== "All")
  );

  const handleAddToCart = (product, isSample = false) => {
    if (!product?._id) {
      showError("Unable to add item", "Product information is unavailable.");
      return;
    }

    const rawSamplePrice = product.pricing?.sample?.price;
    const hasValidSamplePrice =
      typeof rawSamplePrice === "number" &&
      !Number.isNaN(rawSamplePrice) &&
      rawSamplePrice > 0;
    const sampleAvailable = Boolean(product.pricing?.sample?.available === true && hasValidSamplePrice);

    if (isSample) {
      if (!sampleAvailable) {
        showError("Sample Unavailable", "Sample swatches are not available for this item.");
        return;
      }
    } else {
      const inventory = product?.inventory;
      const inStock = Boolean(
        inventory &&
        inventory.inStock !== false &&
        inventory.status !== "OUT_OF_STOCK" &&
        (inventory.availableQuantity === undefined || inventory.availableQuantity > 0)
      );

      if (!inStock) {
        showError("Out of Stock", "This product is currently out of stock.");
        return;
      }
    }

    const imageData = getProductImage(product);
    const itemPrice = isSample
      ? rawSamplePrice
      : product.pricing?.sellingPrice ?? product.price ?? 0;

    const currency = product.pricing?.currency || product.currency || "GBP";
    const priceUnit = isSample ? "sample" : product.pricing?.priceUnit || "";

    dispatch(
      addToCart({
        ...product,
        _id: product._id,
        productId: product._id,
        isSample,
        price: itemPrice,
        currency,
        priceUnit,
        image: imageData?.url || "",
        title: isSample ? `${product.name} (Sample Swatch)` : product.name,
        quantity: 1,
      })
    );

    showToast(isSample ? "Sample swatch added to bag" : "Added to your bag");
  };

  return (
    <main className="min-h-screen bg-[#f6f3ec] text-[#171713]">
      
      <section className="mx-auto max-w-7xl px-5 pt-8 pb-12 sm:px-8 md:px-12 md:pt-14 md:pb-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 items-center">
          <div className="md:col-span-5 lg:col-span-5">
            <div className="relative aspect-[4/3] sm:aspect-[5/4] overflow-hidden rounded-md bg-[#e8e2d7] shadow-sm">
              <img
                src={currentHero.image}
                alt={currentHero.title}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
              />
            </div>
          </div>

          <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-center">
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-wide uppercase text-[#171713]">
              {currentHero.title}
            </h1>

            <p className="mt-5 text-xs sm:text-sm leading-7 text-[#4a473f] max-w-2xl font-light">
              {currentHero.description}
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-6 text-[10px] sm:text-xs font-semibold tracking-[2px] uppercase text-[#171713]">
              {currentHero.links.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.to}
                  className="underline underline-offset-8 hover:text-[#394132] transition"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      
      <section className="border-t border-[#d8d1c5] bg-[#f6f3ec]">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8 md:px-12">
          <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-[#777267] text-center mb-3">
            SHOP — {activeCategory.toUpperCase()}
          </p>
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categoriesList.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleCategoryClick(item)}
                className={`shrink-0 rounded-full px-4 py-1.5 text-[10px] font-medium uppercase tracking-wider transition ${
                  activeCategory === item
                    ? "bg-[#171713] text-white"
                    : "border border-transparent text-[#666257] hover:border-[#171713]/30 hover:text-[#171713]"
                }`}
              >
                {item === "All" ? "ALL PRODUCTS" : `${item.toUpperCase()}`}
              </button>
            ))}
          </div>
        </div>
      </section>

      
      {urlFilter === "all-colours" && (
        <section className="border-b border-[#d8d1c5] bg-[#ece7dd] py-3 px-5 sm:px-8 md:px-12">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-3">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#171713]">
              Filter by Palette:
            </span>
            {["Greens", "Pinks", "Yellows", "Blues", "Neutrals", "Blacks"].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set("colour", c.toLowerCase().replace(/s$/, ""));
                  setSearchParams(nextParams);
                }}
                className={`rounded-full px-3.5 py-1 text-[10px] uppercase tracking-wider transition ${
                  urlColour === c.toLowerCase().replace(/s$/, "")
                    ? "bg-[#171713] text-white font-semibold"
                    : "bg-white/80 border border-[#d8d1c5] text-[#171713] hover:border-[#171713]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>
      )}

      {urlFilter === "all-styles" && (
        <section className="border-b border-[#d8d1c5] bg-[#ece7dd] py-3 px-5 sm:px-8 md:px-12">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#171713] mr-1">
              Filter by Style:
            </span>
            {["Floral", "Botanical", "Foliage", "Animal", "Striped", "William Morris", "Mural", "Geometric", "Traditional"].map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams);
                  nextParams.set("style", st.toLowerCase().replace(/\s+/g, "-"));
                  setSearchParams(nextParams);
                }}
                className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider transition ${
                  urlStyle === st.toLowerCase().replace(/\s+/g, "-")
                    ? "bg-[#171713] text-white font-semibold"
                    : "bg-white/80 border border-[#d8d1c5] text-[#171713] hover:border-[#171713]"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </section>
      )}

      {urlFilter === "all-collections" && (
        <section className="border-b border-[#d8d1c5] bg-[#ece7dd] py-3 px-5 sm:px-8 md:px-12">
          <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-center gap-2">
            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#171713] mr-1">
              Collections:
            </span>
            {["ARTEMIS", "ARTIST'S STRIPE", "HOLLYHOCKS", "PLANTASIA", "ZEUS"].map((col) => (
              <button
                key={col}
                type="button"
                onClick={() => {
                  const nextParams = new URLSearchParams(searchParams);
                  const clean = col.toLowerCase().replace(/['’]/g, "").replace(/\s+/g, "-");
                  nextParams.set("collection", clean);
                  setSearchParams(nextParams);
                }}
                className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-wider transition ${
                  urlCollection === col.toLowerCase().replace(/['’]/g, "").replace(/\s+/g, "-")
                    ? "bg-[#171713] text-white font-semibold"
                    : "bg-white/80 border border-[#d8d1c5] text-[#171713] hover:border-[#171713]"
                }`}
              >
                {col}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* sub-category motif chips */}
      {SUB_CATEGORIES_BY_CATEGORY[activeCategory] && (
        <section className="border-b border-[#d8d1c5] bg-[#eae5db] px-5 py-2.5 sm:px-8 md:px-12">
          <div className="mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto scrollbar-none py-1">
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#171713] mr-1">
              Motif & Style:
            </span>
            {SUB_CATEGORIES_BY_CATEGORY[activeCategory].map((sub) => {
              let isSelected = false;
              if (sub.filterKey === "clear") {
                isSelected = !urlStyle && !urlColour && (!urlProductType || urlProductType === "All") && !urlSearch;
              } else if (sub.filterKey === "style") {
                isSelected = urlStyle === sub.value;
              } else if (sub.filterKey === "colour") {
                isSelected = urlColour === sub.value;
              } else if (sub.filterKey === "productType") {
                isSelected = urlProductType === sub.value;
              } else if (sub.filterKey === "search") {
                isSelected = urlSearch === sub.value;
              }

              return (
                <button
                  key={sub.label}
                  type="button"
                  onClick={() => {
                    const nextParams = new URLSearchParams(searchParams);
                    if (sub.filterKey === "clear") {
                      nextParams.delete("style");
                      nextParams.delete("colour");
                      nextParams.delete("color");
                      nextParams.delete("productType");
                      nextParams.delete("type");
                      nextParams.delete("search");
                      nextParams.delete("q");
                    } else if (sub.filterKey === "style") {
                      nextParams.set("style", sub.value);
                    } else if (sub.filterKey === "colour") {
                      nextParams.set("colour", sub.value);
                    } else if (sub.filterKey === "productType") {
                      nextParams.set("productType", sub.value);
                    } else if (sub.filterKey === "search") {
                      nextParams.set("search", sub.value);
                    }
                    setSearchParams(nextParams);
                  }}
                  className={`shrink-0 rounded-full px-3.5 py-1 text-[10px] uppercase tracking-wider transition ${
                    isSelected
                      ? "bg-[#394132] font-semibold text-white shadow-xs"
                      : "border border-[#d8d1c5] bg-white/80 text-[#171713] hover:border-[#171713]"
                  }`}
                >
                  {sub.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* filter and sort */}
      <section className="sticky top-0 z-20 border-y border-[#d8d1c5] bg-[#f6f3ec]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 sm:px-8 md:flex-row md:items-center md:justify-between md:px-12">
          {/* Left: Product Count */}
          <div className="text-[11px] font-medium uppercase tracking-[2px] text-[#171713]">
            {pagination?.total || products.length} PRODUCTS
          </div>

          {/* Middle: Filter Select & Active Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] uppercase tracking-[1.5px] text-[#777267] mr-1 hidden sm:inline">
              FILTER BY:
            </span>

            <select
              value={urlProductType}
              onChange={(e) => handleProductTypeChange(e.target.value)}
              aria-label="Filter by type"
              className="rounded-full border border-[#d8d1c5] bg-white/70 px-3 py-1 text-[10px] uppercase tracking-wider text-[#171713] outline-none hover:border-[#171713] transition"
            >
              {productTypesList.map((t) => (
                <option key={t} value={t}>
                  {t === "All" ? "PRODUCT TYPE" : t}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="rounded-full border border-stone-300 bg-white/80 px-3 py-1 text-[10px] uppercase tracking-wider text-stone-600 hover:border-black transition"
              >
                CLEAR ALL
              </button>
            )}
          </div>

          {/* Right: Sort Selector & Grid View Toggles */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[1.5px] text-[#777267]">
              SORT BY:
            </span>
            <select
              value={urlSort}
              onChange={(e) => handleSortChange(e.target.value)}
              aria-label="Sort products"
              className="rounded-full border border-[#d8d1c5] bg-white/70 px-3 py-1 text-[10px] uppercase tracking-wider text-[#171713] outline-none hover:border-[#171713] transition"
            >
              <option value="default">Featured</option>
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A–Z</option>
              <option value="name-desc">Name: Z–A</option>
            </select>

            
            <div className="hidden sm:flex items-center gap-1 border-l border-[#d8d1c5] pl-3 ml-1">
              <span className="text-[9px] uppercase tracking-wider text-[#777267] mr-1">
                VIEW:
              </span>
              <button
                type="button"
                onClick={() => setGridCols(2)}
                title="2 Columns (Editorial view)"
                className={`p-1.5 rounded-sm transition ${
                  gridCols === 2 ? "bg-[#394132] text-white" : "text-[#777267] hover:text-[#171713]"
                }`}
              >
                <Grid2X2 size={13} />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(3)}
                title="3 Columns (Balanced view)"
                className={`p-1.5 rounded-sm transition ${
                  gridCols === 3 ? "bg-[#394132] text-white" : "text-[#777267] hover:text-[#171713]"
                }`}
              >
                <Grid3X3 size={13} />
              </button>
              <button
                type="button"
                onClick={() => setGridCols(4)}
                title="4 Columns (Compact grid)"
                className={`p-1.5 rounded-sm transition ${
                  gridCols === 4 ? "bg-[#394132] text-white" : "text-[#777267] hover:text-[#171713]"
                }`}
              >
                <LayoutGrid size={13} />
              </button>
            </div>
          </div>
        </div>

        
        <div className="border-t border-[#d8d1c5] bg-[#394132] py-2 px-4 text-center text-white text-[10px] tracking-[1.5px] uppercase font-medium flex items-center justify-center gap-2">
          <Truck size={13} />
          <span>Complimentary A4 Wallpaper & Fabric Swatch Delivery on All Sample Orders</span>
        </div>

        
        {hasActiveFilters && (
          <div className="mx-auto max-w-7xl px-5 pb-3 sm:px-8 md:px-12 flex flex-wrap items-center gap-2 border-t border-[#d8d1c5]/40 pt-2.5">
            <span className="text-[10px] font-medium uppercase tracking-[1.5px] text-[#777267]">
              Active:
            </span>

            {activeCategory !== "All" && (
              <button
                type="button"
                onClick={() => handleRemoveFilter("category")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#171713] bg-white px-2.5 py-0.5 text-[9px] font-medium tracking-wider uppercase text-[#171713] hover:bg-[#171713] hover:text-white transition"
              >
                <span>Category: {activeCategory}</span>
                <X size={10} strokeWidth={2.5} />
              </button>
            )}

            {urlColour && (
              <button
                type="button"
                onClick={() => handleRemoveFilter("colour")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#171713] bg-white px-2.5 py-0.5 text-[9px] font-medium tracking-wider uppercase text-[#171713] hover:bg-[#171713] hover:text-white transition"
              >
                <span>Colour: {urlColour}</span>
                <X size={10} strokeWidth={2.5} />
              </button>
            )}

            {urlStyle && (
              <button
                type="button"
                onClick={() => handleRemoveFilter("style")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#171713] bg-white px-2.5 py-0.5 text-[9px] font-medium tracking-wider uppercase text-[#171713] hover:bg-[#171713] hover:text-white transition"
              >
                <span>Style: {urlStyle.replace(/-/g, " ")}</span>
                <X size={10} strokeWidth={2.5} />
              </button>
            )}

            {urlCollection && (
              <button
                type="button"
                onClick={() => handleRemoveFilter("collection")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#171713] bg-white px-2.5 py-0.5 text-[9px] font-medium tracking-wider uppercase text-[#171713] hover:bg-[#171713] hover:text-white transition"
              >
                <span>Collection: {urlCollection.replace(/-/g, " ")}</span>
                <X size={10} strokeWidth={2.5} />
              </button>
            )}

            {urlSearch && (
              <button
                type="button"
                onClick={() => handleRemoveFilter("search")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#171713] bg-white px-2.5 py-0.5 text-[9px] font-medium tracking-wider uppercase text-[#171713] hover:bg-[#171713] hover:text-white transition"
              >
                <span>Keyword: &quot;{urlSearch}&quot;</span>
                <X size={10} strokeWidth={2.5} />
              </button>
            )}

            {urlFilter && (
              <button
                type="button"
                onClick={() => handleRemoveFilter("filter")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#171713] bg-white px-2.5 py-0.5 text-[9px] font-medium tracking-wider uppercase text-[#171713] hover:bg-[#171713] hover:text-white transition"
              >
                <span>{urlFilter.replace(/-/g, " ")}</span>
                <X size={10} strokeWidth={2.5} />
              </button>
            )}

            {urlProductType && urlProductType !== "All" && (
              <button
                type="button"
                onClick={() => handleRemoveFilter("productType")}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#171713] bg-white px-2.5 py-0.5 text-[9px] font-medium tracking-wider uppercase text-[#171713] hover:bg-[#171713] hover:text-white transition"
              >
                <span>Type: {urlProductType}</span>
                <X size={10} strokeWidth={2.5} />
              </button>
            )}
          </div>
        )}
      </section>

      
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 md:px-12">
        {loading && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-[#e4ded3] rounded-sm" />
                <div className="mt-3 h-4 w-2/3 bg-[#e4ded3]" />
                <div className="mt-2 h-3 w-1/2 bg-[#e4ded3]" />
                <div className="mt-2 h-4 w-1/3 bg-[#e4ded3]" />
              </div>
            ))}
          </div>
        )}

        {error && (
          <div className="py-20 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => setReloadKey((k) => k + 1)}
              className="mt-5 rounded-full border border-[#171713] px-7 py-2 text-xs font-medium tracking-wider text-[#171713] hover:bg-[#171713] hover:text-white transition uppercase"
            >
              TRY AGAIN
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {products.length === 0 ? (
              <div className="py-24 text-center">
                <p className="font-serif text-2xl text-[#171713]">No products found</p>
                <p className="mt-2 text-sm text-[#666257]">Try choosing another category or clearing your filters.</p>
                <button
                  type="button"
                  onClick={handleClearAllFilters}
                  className="mt-6 rounded-full border border-[#171713] px-6 py-2 text-xs tracking-wider uppercase text-[#171713] hover:bg-[#171713] hover:text-white transition"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div
                className={
                  gridCols === 2
                    ? "grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-14"
                    : gridCols === 3
                    ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12"
                    : "grid grid-cols-2 gap-x-4 gap-y-12 sm:gap-x-6 sm:gap-y-14 lg:grid-cols-4"
                }
              >
                {products.map((product, index) => {
                  const imageData = getProductImage(product);
                  const image = imageData?.url || "";

                  const currency = product.pricing?.currency || "GBP";
                  const sellingPrice = product.pricing?.sellingPrice ?? product.price ?? null;
                  const compareAtPrice = product.pricing?.compareAtPrice ?? null;
                  const priceUnit = product.pricing?.priceUnit || "";
                  const rawSamplePrice = product.pricing?.sample?.price;
                  const hasValidSamplePrice =
                    typeof rawSamplePrice === "number" &&
                    !Number.isNaN(rawSamplePrice) &&
                    rawSamplePrice > 0;
                  const sampleSupported = Boolean(
                    product.pricing?.sample?.available === true && hasValidSamplePrice
                  );
                  const samplePrice = sampleSupported ? rawSamplePrice : null;

                  // Stock availability calculation
                  const inventory = product.inventory;
                  const inStock = Boolean(
                    inventory &&
                    inventory.inStock !== false &&
                    inventory.status !== "OUT_OF_STOCK" &&
                    (inventory.availableQuantity === undefined || inventory.availableQuantity > 0)
                  );

                  const hasDiscount = compareAtPrice && sellingPrice && compareAtPrice > sellingPrice;
                  const targetSlug = product.slug || product._id;

                  // Extract color swatches
                  const colours = product.colours || [];
                  const categoryName = typeof product?.category === "object" ? product.category?.name : product?.category || "";
                  const subtitleText = colours.length > 0 && colours[0].name
                    ? `${categoryName ? `${categoryName} - ` : ""}${colours[0].name}`
                    : categoryName || product.productType || "";

                  return (
                    <div key={product._id} className="contents">
                      
                      {index === 4 && (
                        <div className="col-span-full my-4 rounded-sm bg-[#32392b] text-[#f6f3ec] p-6 sm:p-9 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                          <div className="max-w-xl">
                            <span className="text-[9px] font-semibold tracking-[2.5px] uppercase text-[#d8c4a5]">
                              COMPLIMENTARY INTERIOR SERVICES
                            </span>
                            <h3 className="font-serif text-2xl sm:text-3xl text-white mt-1">
                              Need help bringing your sanctuary to life?
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-[#d8d3c5]">
                              Our dedicated design consultants offer 1-on-1 virtual consultations, bespoke paint pairings, and roll calculations tailored to your room dimensions.
                            </p>
                          </div>
                          <Link
                            to="/design-services"
                            className="shrink-0 inline-flex items-center gap-2 rounded-full border border-white bg-white text-[#32392b] px-6 py-2.5 text-[10px] font-semibold tracking-[2px] uppercase hover:bg-transparent hover:text-white transition"
                          >
                            BOOK FREE APPOINTMENT <ArrowRight size={13} />
                          </Link>
                        </div>
                      )}

                      
                      {index === 10 && (
                        <div className="col-span-full my-4 rounded-sm bg-[#eae4d9] border border-[#d8d1c5] p-6 sm:p-9 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xs">
                          <div className="max-w-xl">
                            <span className="text-[9px] font-semibold tracking-[2.5px] uppercase text-[#394132]">
                              TRY BEFORE YOU BUY
                            </span>
                            <h3 className="font-serif text-2xl text-[#171713] mt-1">
                              Curate your personal sample pack
                            </h3>
                            <p className="mt-2 text-xs leading-5 text-[#666257]">
                              Experience the true texture, paper finish, and colour vibrancy of our designs in your own lighting. All A4 wallpaper & fabric samples include complimentary Royal Mail shipping.
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center gap-3">
                            <span className="text-xs font-semibold text-[#171713]">£5.00 / sample</span>
                            <span className="text-[10px] uppercase tracking-wider text-[#394132] font-medium bg-[#394132]/10 px-3 py-1.5 rounded-full">
                              Free UK Postage
                            </span>
                          </div>
                        </div>
                      )}

                      <article className="group flex flex-col justify-between min-w-0">
                        <div>
                          {/* Image card with wishlist button */}
                          <div className="relative aspect-[4/5] overflow-hidden bg-[#e8e2d7] rounded-sm p-3.5 flex items-center justify-center transition-shadow duration-300 group-hover:shadow-md">
                            <Link
                              to={`/products/${targetSlug}`}
                              className="block h-full w-full flex items-center justify-center"
                            >
                              {image ? (
                                <>
                                  <img
                                    src={optimizeImageUrl(image, 800)}
                                    alt={imageData?.alt || product.name}
                                    className="max-h-full max-w-full object-contain transition-transform duration-700 ease-out group-hover:scale-105"
                                    onError={(event) => {
                                      event.currentTarget.onerror = null;
                                      event.currentTarget.src =
                                        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/artemis_wallpaper___blush/artemis-wallpaper-blush-0";
                                    }}
                                  />
                                  <div className="hidden flex-col items-center justify-center p-4 text-center text-[#777267]">
                                    <span className="font-serif text-xs italic line-clamp-2">{product.name}</span>
                                    <span className="mt-1 text-[9px] uppercase tracking-widest text-[#999285]">House of Hackney</span>
                                  </div>
                                </>
                              ) : (
                                <div className="flex flex-col items-center justify-center px-3 text-center text-xs text-[#777267]">
                                  <span className="font-serif text-xs italic">{product.name}</span>
                                  <span className="mt-1 text-[9px] uppercase tracking-widest text-[#999285]">House of Hackney</span>
                                </div>
                              )}
                            </Link>

                            
                            <button
                              type="button"
                              aria-label={isWishlisted(product._id) ? "Remove from wishlist" : "Add to wishlist"}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                toggleWishlist(product);
                              }}
                              className={`absolute top-2.5 right-2.5 z-10 flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full transition-all duration-200 shadow-xs cursor-pointer ${
                                isWishlisted(product._id)
                                  ? "bg-white text-[#b83232] shadow-sm scale-105"
                                  : "bg-white/80 text-[#171713] hover:bg-white hover:text-[#b83232] hover:scale-105"
                              }`}
                            >
                              <Heart
                                size={14}
                                className={isWishlisted(product._id) ? "fill-[#b83232]" : ""}
                              />
                            </button>

                            
                            {product.isFeatured && (
                              <span className="absolute top-2.5 left-2.5 bg-[#eae4d9] text-[#171713] text-[8px] sm:text-[9px] font-medium uppercase px-2.5 py-0.5 rounded-full shadow-xs tracking-wider">
                                Bestseller
                              </span>
                            )}

                            {hasDiscount && !product.isFeatured && (
                              <span className="absolute top-2.5 left-2.5 bg-[#394132] text-white text-[8px] sm:text-[9px] font-medium uppercase px-2 py-0.5 tracking-wider shadow-xs">
                                Sale
                              </span>
                            )}

                            {!inStock && (
                              <span className="absolute bottom-2.5 left-2.5 bg-stone-700/90 text-white text-[8px] sm:text-[9px] font-medium uppercase px-2 py-0.5 tracking-wider shadow-xs">
                                Out of Stock
                              </span>
                            )}

                            <span className="absolute bottom-2.5 right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#f6f3ec]/90 text-[#171713] opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-xs pointer-events-none">
                              <ArrowRight size={13} />
                            </span>
                          </div>

                          
                          <div className="mt-3.5">
                            <Link
                              to={`/products/${targetSlug}`}
                              className="block font-serif text-base sm:text-lg tracking-wide uppercase text-[#171713] hover:underline line-clamp-1"
                              title={product.name}
                            >
                              {product.name}
                            </Link>

                            
                            <p className="mt-0.5 text-xs text-[#666257] line-clamp-1">
                              {subtitleText}
                            </p>
                          </div>

                          
                          <div className="mt-1 flex items-baseline gap-2 text-xs">
                            {sellingPrice !== null && (
                              <span className="font-semibold text-[#171713]">
                                {formatPrice(sellingPrice, currency)}
                                {priceUnit && (
                                  <span className="font-normal text-[#666257]"> / {priceUnit === "meter" ? "per meter" : priceUnit}</span>
                                )}
                              </span>
                            )}

                            {hasDiscount && (
                              <span className="text-[11px] text-[#8e8a7f] line-through">
                                {formatPrice(compareAtPrice, currency)}
                              </span>
                            )}
                          </div>

                          
                          {colours.length > 0 && (
                            <div className="mt-2.5 flex items-center gap-1.5">
                              {colours.slice(0, 4).map((c, idx) => (
                                <span
                                  key={idx}
                                  title={c.name}
                                  className="h-3.5 w-3.5 rounded-sm border border-[#d8d1c5] shadow-xs"
                                  style={{ backgroundColor: c.colorHex || "#d8d1c5" }}
                                />
                              ))}
                              {colours.length > 4 && (
                                <span className="text-[9px] text-[#777267] font-medium">+{colours.length - 4}</span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Button: Exact "Add Sample +" Pill Button */}
                        <div className="mt-4 flex flex-col gap-2">
                          {sampleSupported && samplePrice !== null ? (
                            <button
                              type="button"
                              onClick={() => handleAddToCart(product, true)}
                              className="flex w-full items-center justify-center gap-1.5 rounded-full border border-[#171713] py-2 text-[10px] font-medium tracking-[1.5px] uppercase text-[#171713] hover:bg-[#171713] hover:text-white transition shadow-2xs"
                            >
                              <Sparkles size={12} />
                              Add Sample ({formatPrice(samplePrice, currency)})
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={!inStock}
                              onClick={() => handleAddToCart(product, false)}
                              className={`flex w-full items-center justify-center gap-2 rounded-full border py-2 text-[10px] font-medium tracking-[1.5px] uppercase transition ${
                                inStock
                                  ? "border-[#171713] text-[#171713] hover:bg-[#171713] hover:text-white"
                                  : "border-[#c4bcaf] bg-[#d5cec3] text-[#7d776c] cursor-not-allowed"
                              }`}
                            >
                              <ShoppingBag size={12} />
                              {inStock ? "Add to Bag" : "Out of Stock"}
                            </button>
                          )}
                        </div>
                      </article>
                    </div>
                  );
                })}
              </div>
            )}

            
            <div className="mt-16 flex flex-col items-center justify-center border-t border-[#d8d1c5] pt-12">
              {pagination?.totalPages > 1 && currentPage < pagination.totalPages && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentPage((p) => p + 1);
                    window.scrollTo({ top: 400, behavior: "smooth" });
                  }}
                  className="rounded-full bg-[#171713] px-10 py-3 text-xs font-medium tracking-[2.5px] uppercase text-white hover:bg-[#394132] transition shadow-xs"
                >
                  LOAD MORE
                </button>
              )}

              
              {pagination?.totalPages > 1 && (
                <div className="mt-6 flex items-center justify-center gap-2 text-xs">
                  <button
                    type="button"
                    disabled={currentPage <= 1}
                    onClick={() => {
                      setCurrentPage((p) => Math.max(1, p - 1));
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className="flex items-center gap-1 border border-[#d8d1c5] px-3 py-1.5 disabled:opacity-30 hover:border-[#171713] transition rounded-sm"
                  >
                    <ChevronLeft size={14} />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                      const pageNum = i + 1;
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => {
                            setCurrentPage(pageNum);
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                          className={`h-7 w-7 text-xs font-medium transition rounded-sm ${
                            currentPage === pageNum
                              ? "bg-[#171713] text-white"
                              : "border border-[#d8d1c5] hover:border-[#171713]"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    disabled={currentPage >= pagination.totalPages}
                    onClick={() => {
                      setCurrentPage((p) => Math.min(pagination.totalPages, p + 1));
                      window.scrollTo({ top: 400, behavior: "smooth" });
                    }}
                    className="flex items-center gap-1 border border-[#d8d1c5] px-3 py-1.5 disabled:opacity-30 hover:border-[#171713] transition rounded-sm"
                  >
                    Next
                    <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>

            
            <div className="mt-20 max-w-4xl mx-auto text-center px-4">
              <p className="text-xs sm:text-sm leading-7 text-[#666257]">
                Step into a world of colour, print and timeless craftsmanship with House of Hackney&apos;s collection of luxury fabrics, wallpapers and handcrafted mineral paints. From rich velvets to elegant weaves, our creations are designed to transform interiors into works of art. Whether you&apos;re reupholstering a vintage armchair, sewing bespoke curtains, or hanging statement wallpaper, this is where wonder starts.
              </p>
              <p className="mt-4 text-xs sm:text-sm leading-7 text-[#666257]">
                All of our fabrics and wallpapers are crafted in Britain or at heritage European mills, using responsibly sourced fibres and produced in small sustainable runs. It&apos;s luxury design with heart — made to last for generations to come.
              </p>
            </div>
          </>
        )}
      </section>

      
      <section className="border-t border-[#d8d1c5] bg-[#f6f3ec] py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-14 items-center">
            
            <div className="md:col-span-6 flex flex-col justify-center">
              <p className="text-[10px] font-medium tracking-[3px] uppercase text-[#777267]">
                CURTAINS, BLINDS & UPHOLSTERY
              </p>

              <h2 className="mt-3 font-serif text-3xl sm:text-4xl lg:text-5xl tracking-wide text-[#171713]">
                Free Design Consultation
              </h2>

              <p className="mt-5 text-xs sm:text-sm leading-7 text-[#555248] max-w-lg">
                Whether it&apos;s a maximalist haven or nuanced neutral nest you&apos;re dreaming of, we&apos;re here to turn those dreams into reality. Book a one-on-one consultation with our London design specialists.
              </p>

              <div className="mt-7">
                <Link
                  to="/products"
                  className="inline-block text-xs font-semibold tracking-[2px] uppercase text-[#171713] underline underline-offset-8 hover:text-[#394132] transition"
                >
                  BOOK A CONSULTATION
                </Link>
              </div>
            </div>

            
            <div className="md:col-span-6">
              <div className="relative aspect-[4/3] sm:aspect-[16/11] overflow-hidden rounded-md bg-[#e8e2d7] shadow-sm">
                <img
                  src="https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/curtains___blinds/hollyhocks_wallpaper___autumn/hollyhocks-wallpaper-autumn-1"
                  alt="House of Hackney Interior Design Services"
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* brand trust & sustainability footer bar */}
      <section className="border-t border-[#d8d1c5] bg-[#eae5db] py-12 px-5 sm:px-8">
        <div className="mx-auto max-w-7xl grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <TreePine size={24} className="text-[#394132] mb-2" />
            <h4 className="font-serif text-sm text-[#171713] uppercase tracking-wider font-semibold">World Land Trust</h4>
            <p className="text-[11px] text-[#666257] mt-1">35m² of endangered forest protected per order</p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck size={24} className="text-[#394132] mb-2" />
            <h4 className="font-serif text-sm text-[#171713] uppercase tracking-wider font-semibold">Certified B Corp</h4>
            <p className="text-[11px] text-[#666257] mt-1">Highest social & environmental rigor</p>
          </div>
          <div className="flex flex-col items-center">
            <Truck size={24} className="text-[#394132] mb-2" />
            <h4 className="font-serif text-sm text-[#171713] uppercase tracking-wider font-semibold">Sample Swatch Delivery</h4>
            <p className="text-[11px] text-[#666257] mt-1">Complimentary UK Royal Mail postage</p>
          </div>
          <div className="flex flex-col items-center">
            <Sparkles size={24} className="text-[#394132] mb-2" />
            <h4 className="font-serif text-sm text-[#171713] uppercase tracking-wider font-semibold">Made in England</h4>
            <p className="text-[11px] text-[#666257] mt-1">Sustainably printed on FSC-certified paper</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Products;
