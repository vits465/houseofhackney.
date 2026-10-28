import { memo, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, X, ArrowRight, Loader2 } from "lucide-react";
import { getProducts } from "../../services/productservice";
import { getProductImage } from "../../utils/getProductImage";

const HOUSE_FAVOURITES = [
  {
    name: "Hollyhocks Wallpaper",
    colourway: "Spring",
    price: "£200.00 / per roll",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_400,f_auto,q_auto/house_of_hackney/wallpaper/hollyhocks_wallpaper___spring/hollyhocks-wallpaper-spring-0",
    slug: "hollyhocks-wallpaper-spring",
  },
  {
    name: "Plantasia Wallpaper",
    colourway: "Sage",
    price: "£200.00 / per roll",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_400,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-0",
    slug: "plantasia-wallpaper-sage",
  },
  {
    name: "Wild Card Wallpaper",
    colourway: "Butterscotch",
    price: "£200.00 / per roll",
    image: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_400,f_auto,q_auto/house_of_hackney/wallpaper/wild_card_wallpaper___butterscotch/wild-card-wallpaper-butterscotch-0",
    slug: "wild-card-wallpaper-butterscotch",
  },
];

const SEARCH_CATEGORIES = [
  { label: "New Season", to: "/products?sort=newest" },
  { label: "Wallpaper", to: "/products?category=wallpaper" },
  { label: "Fabric", to: "/products?category=fabric" },
  { label: "Curtains & Blinds", to: "/products?category=curtains-blinds" },
  { label: "Carpets & Flooring", to: "/products?category=carpets-flooring" },
  { label: "Home Decor", to: "/products?category=home-decor" },
];

const HELP_LINKS = [
  { label: "FAQs", to: "/faqs" },
  { label: "Contact Us", to: "/contact" },
  { label: "Delivery & Returns", to: "/help" },
  { label: "Book a Design Consultation", to: "/design-services" },
];

function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const handleClose = () => {
    setQuery("");
    setResults([]);
    setLoading(false);
    onClose();
  };

  // Focus input and lock scroll when opened
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Small delay to allow modal render before focusing
    const focusTimer = setTimeout(() => {
      inputRef.current?.focus();
    }, 80);

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isOpen, onClose]);

  // Live product search debounced
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    let active = true;
    const timer = setTimeout(async () => {
      try {
        const data = await getProducts({ search: trimmed, limit: 6 });
        if (!active) return;
        const list = Array.isArray(data) ? data : data?.products || [];
        setResults(list);
      } catch {
        if (active) setResults([]);
      } finally {
        if (active) setLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  if (!isOpen) return null;

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    if (val.trim().length >= 2) {
      setLoading(true);
    } else {
      setLoading(false);
      setResults([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/products?search=${encodeURIComponent(trimmed)}`);
      handleClose();
    }
  };

  const handleProductClick = (slugOrId) => {
    navigate(`/products/${slugOrId}`);
    handleClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] overflow-y-auto bg-black/40 backdrop-blur-xs transition-opacity duration-300"
      onClick={handleClose}
    >
      <div
        className="min-h-screen sm:min-h-0 w-full bg-[#f6f3ec] text-[#171713] shadow-2xl transition-transform duration-300 animate-in fade-in slide-in-from-top-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-5 md:py-8">
          {/* Top Search Input Row */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-3 border-b border-[#dedbd4] pb-4"
          >
            <Search size={22} className="shrink-0 text-[#77746c]" />

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleQueryChange}
              placeholder="SEARCH OUR PRODUCTS AND STORES"
              aria-label="Search products and stores"
              className="flex-1 bg-transparent text-sm sm:text-base md:text-lg tracking-[0.14em] uppercase placeholder:text-[#9c978b] placeholder:tracking-[0.14em] outline-hidden text-[#171713]"
            />

            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setLoading(false);
                }}
                aria-label="Clear search"
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-[#eae6dc] text-[#77746c] cursor-pointer"
              >
                <X size={16} />
              </button>
            )}

            <button
              type="button"
              onClick={handleClose}
              aria-label="Close search"
              className="grid h-10 w-10 place-items-center rounded-xl border border-[#d8d5ce] bg-white hover:bg-[#ede9df] text-[#171713] transition-colors cursor-pointer"
            >
              <X size={20} strokeWidth={1.5} />
            </button>
          </form>

          {/* Body Content */}
          <div className="py-8">
            {/* Live Search Results when query entered */}
            {query.trim().length >= 2 ? (
              <div>
                <div className="flex items-center justify-between pb-4">
                  <h3 className="font-serif text-lg tracking-wide text-[#171713]">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 size={16} className="animate-spin text-[#394132]" />
                        Searching House Collection...
                      </span>
                    ) : (
                      `Search Results for "${query}" (${results.length})`
                    )}
                  </h3>

                  {results.length > 0 && (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="text-xs font-semibold tracking-wider uppercase underline underline-offset-4 hover:text-[#394132] cursor-pointer"
                    >
                      View all results
                    </button>
                  )}
                </div>

                {results.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 pt-2">
                    {results.map((product) => {
                      const img =
                        getProductImage(product)?.url ||
                        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_400,f_auto,q_auto/house_of_hackney/wallpaper/artemis_wallpaper___blush/artemis-wallpaper-blush-0";
                      const price = product.pricing?.basePrice ?? product.price ?? 200;
                      const unit = product.pricing?.priceUnit || "roll";
                      return (
                        <div
                          key={product._id || product.id}
                          onClick={() => handleProductClick(product.slug || product._id)}
                          className="group cursor-pointer text-left"
                        >
                          <div className="aspect-square overflow-hidden rounded-md bg-[#eae5db]">
                            <img
                              src={img}
                              alt={product.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <p className="mt-2 text-xs font-medium text-[#171713] group-hover:underline line-clamp-1">
                            {product.name}
                          </p>
                          <p className="text-[11px] text-[#6d6a62]">
                            From £{price} / {unit}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ) : !loading ? (
                  <div className="py-12 text-center text-[#6d6a62]">
                    <p className="font-serif text-xl text-[#171713]">No results found for &ldquo;{query}&rdquo;</p>
                    <p className="mt-2 text-xs">Try searching for &ldquo;wallpaper&rdquo;, &ldquo;floral&rdquo;, &ldquo;velvet&rdquo;, or &ldquo;green&rdquo;</p>
                  </div>
                ) : null}
              </div>
            ) : (
              /* Default Overview (House Favourites, Categories, Help, Sample Packs) */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
                {/* house favourites */}
                <div className="lg:col-span-4 space-y-4">
                  <h3 className="font-serif text-xl tracking-tight text-[#171713]">
                    House Favourites
                  </h3>
                  <div className="space-y-3.5 pt-1">
                    {HOUSE_FAVOURITES.map((item) => (
                      <div
                        key={item.name}
                        onClick={() => handleProductClick(item.slug)}
                        className="group flex items-center gap-3.5 cursor-pointer"
                      >
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-[#eae5db] border border-[#d8d5ce]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[#171713] group-hover:underline">
                            {item.name} - {item.colourway}
                          </p>
                          <p className="text-xs text-[#6d6a62]">From {item.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* categories */}
                <div className="lg:col-span-3 space-y-4">
                  <h3 className="font-serif text-xl tracking-tight text-[#171713]">
                    Categories
                  </h3>
                  <ul className="space-y-2.5 pt-1 text-sm">
                    {SEARCH_CATEGORIES.map((cat) => (
                      <li key={cat.label}>
                        <Link
                          to={cat.to}
                          onClick={onClose}
                          className="text-[#2e312b] hover:underline"
                        >
                          {cat.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* help */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="font-serif text-xl tracking-tight text-[#171713]">
                    Help
                  </h3>
                  <ul className="space-y-2.5 pt-1 text-sm">
                    {HELP_LINKS.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          onClick={onClose}
                          className="text-[#2e312b] hover:underline"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* sample packs promotion card */}
                <div className="lg:col-span-3">
                  <div
                    onClick={() => {
                      navigate("/samples");
                      onClose();
                    }}
                    className="group cursor-pointer overflow-hidden rounded-xl border border-[#d8d5ce] bg-white shadow-xs transition-shadow hover:shadow-md"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[#e8e2d7]">
                      <img
                        src="https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_600,f_auto,q_auto/house_of_hackney/wallpaper/artemis_wallpaper___blush/artemis-wallpaper-blush-0"
                        alt="Sample Packs"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-serif text-lg tracking-tight text-[#171713]">
                        Sample Packs
                      </h4>
                      <p className="mt-1 text-xs text-[#6d6a62]">
                        Curated fabric and wallpaper swatch kits delivered straight to your door.
                      </p>
                      <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#394132] group-hover:underline">
                        Order Samples <ArrowRight size={13} />
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default memo(SearchModal);
