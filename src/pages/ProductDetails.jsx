import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ArrowLeft,
  ChevronDown,
  Minus,
  Plus,
  ShoppingBag,
  Sparkles,
  Check,
  Truck,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  Calculator,
  TreePine,
  Palette,
  Heart,
} from "lucide-react";
import { useWishlist } from "../utils/wishlist";

const CURATED_PAINT_PAIRINGS = [
  {
    name: "Mallow",
    shade: "Dusky Plaster Pink",
    hex: "#dfc0be",
    finish: "Mineral Emulsion",
    price: 6,
    unit: "sample pot",
    description: "A restorative, chalky rose reminiscent of ancient Venetian plaster.",
    link: "/products?category=paint&colour=pink",
  },
  {
    name: "Cirrus",
    shade: "Pale Chalky Sky Grey",
    hex: "#d5dede",
    finish: "Mineral Emulsion",
    price: 6,
    unit: "sample pot",
    description: "An ethereal mineral grey-blue that allows botanical prints to sing.",
    link: "/products?category=paint&colour=neutral",
  },
  {
    name: "Jadeite",
    shade: "Serene Celadon Green",
    hex: "#9bb0a3",
    finish: "Mineral Emulsion",
    price: 6,
    unit: "sample pot",
    description: "A calming eucalyptus sage inspired by English kitchen garden foliage.",
    link: "/products?category=paint&colour=green",
  },
  {
    name: "Woad",
    shade: "Heritage Botanical Indigo",
    hex: "#2e4156",
    finish: "Mineral Emulsion",
    price: 6,
    unit: "sample pot",
    description: "A soulful, deep English ink blue named after the ancient dye plant.",
    link: "/products?category=paint&colour=blue",
  },
];

import {
  getProducts,
  getProductById,
  getProductMedia,
  getProductVariants,
  getProductPricing,
  getProductSpecifications,
  getRelatedProducts,
} from "../services/productservice";

import { getProductImage, optimizeImageUrl, isValidImageUrl } from "../utils/getProductImage";
import { addToCart } from "../features/carts/cartSlice";
import { setSelectedProduct } from "../features/products/productSlice";
import { showToast, showError } from "../utils/sweetAlert";

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

function getVariantId(variant) {
  return String(variant?._id || variant?.id || variant?.sku || "");
}

function ProductDetails() {
  const { productId } = useParams();
  const [searchParams] = useSearchParams();
  const isSampleMode = searchParams.get("sample") === "true";
  const dispatch = useDispatch();
  const { isWishlisted, toggleWishlist } = useWishlist();

  const [product, setProduct] = useState(null);
  const [media, setMedia] = useState(null);
  const [variants, setVariants] = useState([]);
  const [pricing, setPricing] = useState(null);
  const [specifications, setSpecifications] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);

  const [selectedVariantId, setSelectedVariantId] = useState("");
  const [selectedColourId, setSelectedColourId] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [openSection, setOpenSection] = useState("description");

  // Interactive Wallpaper Roll Calculator & View Scale States
  const [showCalculator, setShowCalculator] = useState(false);
  const [calcUnit, setCalcUnit] = useState("meters"); // "meters" or "feet"
  const [wallWidth, setWallWidth] = useState(3.5);
  const [wallHeight, setWallHeight] = useState(2.6);
  const [numWalls, setNumWalls] = useState(1);
  const [calculatedRolls, setCalculatedRolls] = useState(null);
  const [calcFeedback, setCalcFeedback] = useState("");
  const [viewScale, setViewScale] = useState("pattern"); // "pattern" or "room"

  const handleCalculateRolls = () => {
    const widthInM = calcUnit === "feet" ? Number(wallWidth) * 0.3048 : Number(wallWidth);
    const heightInM = calcUnit === "feet" ? Number(wallHeight) * 0.3048 : Number(wallHeight);
    const totalArea = Math.max(0.1, widthInM * heightInM * numWalls);
    // Standard roll covers ~5.4m² (180cm x 300cm), plus 15% allowance for repeat matching & trimming
    const needed = Math.max(1, Math.ceil((totalArea * 1.15) / 5.4));
    setCalculatedRolls(needed);
  };

  const handleApplyCalculatedRolls = () => {
    if (calculatedRolls) {
      setQuantity(calculatedRolls);
      setCalcFeedback(`Applied ${calculatedRolls} rolls to quantity!`);
      setTimeout(() => {
        setCalcFeedback("");
        setShowCalculator(false);
      }, 1400);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");
      setSelectedImageIndex(0);
      setQuantity(1);
      setSelectedVariantId("");

      try {
        // 1. Fetch main product details (accepts ID or slug)
        const productData = await getProductById(productId);
        if (cancelled) return;

        setProduct(productData);
        dispatch(setSelectedProduct(productData));

        const realId = productData._id;

        // 2. Fetch supplementary endpoints in parallel for complete data
        const [mediaData, variantData, pricingData, specsData, relatedData] = await Promise.all([
          getProductMedia(realId).catch(() => null),
          getProductVariants(realId).catch(() => []),
          getProductPricing(realId).catch(() => null),
          getProductSpecifications(realId).catch(() => null),
          getRelatedProducts(realId).catch(() => []),
        ]);

        if (cancelled) return;

        setMedia(mediaData || productData.media || null);

        const combinedVariants =
          (variantData && variantData.length > 0)
            ? variantData
            : (productData.variants && productData.variants.length > 0)
            ? productData.variants
            : [];

        setVariants(combinedVariants);
        setPricing(productData.pricing || pricingData || null);

        // Technical specifications
        const combinedSpecs =
          productData.specifications ||
          specsData ||
          null;

        setSpecifications(combinedSpecs);

        // Ensure related products have valid, crisp image assets
        let validRelated = (relatedData || []).filter(
          (rel) => rel && (rel.thumbnail || rel.image || (Array.isArray(rel.images) && rel.images.length > 0))
        );

        if (validRelated.length < 4) {
          try {
            const cat = productData.category?.slug || productData.category?.name || productData.category;
            const pType = productData.productType;
            const catalogueParams = { limit: 8 };
            if (cat && typeof cat === "string") {
              catalogueParams.category = cat.toLowerCase().replace(/\s+/g, "_");
            }
            if (pType) catalogueParams.productType = pType;

            const moreProducts = await getProducts(catalogueParams);
            const list = Array.isArray(moreProducts) ? moreProducts : moreProducts?.products || [];
            const addFromCat = list.filter(
              (p) => String(p._id) !== String(realId) && !validRelated.some((v) => String(v._id) === String(p._id))
            );
            validRelated = [...validRelated, ...addFromCat];
          } catch {
            // Keep existing validRelated
          }
        }

        setRelatedProducts(validRelated);

        // Default variant selection
        if (combinedVariants.length > 0) {
          const defaultVar = combinedVariants.find((v) => v.isDefault) || combinedVariants[0];
          setSelectedVariantId(getVariantId(defaultVar));

          // Explicitly match default colour from default variant
          const rawCols = productData.colours || [];
          const matchingCol = rawCols.find(
            (c) =>
              (c.variantId && (String(c.variantId) === String(defaultVar._id) || String(c.variantId) === String(defaultVar.id))) ||
              (defaultVar.colourId && String(c._id) === String(defaultVar.colourId)) ||
              (defaultVar.attributes || []).some((a) => {
                const attrName = String(a.attribute?.name || a.attribute || a.name || "").toLowerCase();
                return (
                  (attrName === "colour" || attrName === "color" || attrName === "shade" || attrName === "color / finish") &&
                  String(a.value || "").trim().toLowerCase() === (c.name || "").trim().toLowerCase()
                );
              }) ||
              (defaultVar.title || "").toLowerCase().endsWith(` - ${(c.name || "").toLowerCase()}`)
          );

          if (matchingCol) {
            setSelectedColourId(String(matchingCol._id || matchingCol.slug || matchingCol.name));
          } else if (rawCols.length > 0) {
            setSelectedColourId(String(rawCols[0]._id || rawCols[0].slug || rawCols[0].name || ""));
          }
        } else {
          // Default colour selection
          const rawCols = productData.colours || [];
          if (rawCols.length > 0) {
            setSelectedColourId(String(rawCols[0]._id || rawCols[0].slug || rawCols[0].name || ""));
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Product load error:", err);
          setError(err.response?.data?.message || err.message || "Product not found.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
      dispatch(setSelectedProduct(null));
    };
  }, [productId, dispatch]);

  // Live auto-refresh when an admin modifies this product
  useEffect(() => {
    const handleUpdate = () => {
      getProductById(productId)
        .then((updated) => {
          if (updated) {
            setProduct(updated);
            dispatch(setSelectedProduct(updated));
            if (updated.pricing) setPricing(updated.pricing);
          }
        })
        .catch(() => {});
    };
    window.addEventListener("hoh_catalog_updated", handleUpdate);
    return () => window.removeEventListener("hoh_catalog_updated", handleUpdate);
  }, [productId, dispatch]);

  // Auto-scroll to sample section if arriving from a Sample action
  useEffect(() => {
    if (isSampleMode && product && !loading) {
      const timer = setTimeout(() => {
        const el = document.getElementById("sample-box-card");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [isSampleMode, product, loading]);

  // Selected Variant
  const selectedVariant = useMemo(() => {
    return variants.find((v) => getVariantId(v) === selectedVariantId) || null;
  }, [variants, selectedVariantId]);

  // Selected Colour
  const selectedColour = useMemo(() => {
    const cols = product?.colours || [];
    return cols.find((c) => String(c._id || c.slug || c.name) === selectedColourId) || null;
  }, [product, selectedColourId]);

  // Gallery calculation with intelligent filename-based deduplication
  const gallery = useMemo(() => {
    const urls = [];
    const seenUrls = new Set();
    const seenFilenames = new Set();

    const addUrl = (rawUrl, alt) => {
      if (typeof rawUrl !== "string" || !rawUrl.trim()) return;
      if (!isValidImageUrl(rawUrl)) return;
      const url = optimizeImageUrl(rawUrl.trim(), 1400);

      // Extract filename to avoid cross-folder duplicates
      const parts = url.split("/");
      const filename = parts[parts.length - 1]?.split(".")[0]?.toLowerCase();

      if (!seenUrls.has(url) && (!filename || !seenFilenames.has(filename))) {
        seenUrls.add(url);
        if (filename) seenFilenames.add(filename);
        urls.push({ url, alt: alt || product?.name || "Product image" });
      }
    };

    // 1. Variant specific images first if available
    if (selectedVariant) {
      if (selectedVariant.image) addUrl(selectedVariant.image, selectedVariant.title);
      if (selectedVariant.thumbnail) {
        const u = selectedVariant.thumbnail?.secureUrl || selectedVariant.thumbnail?.url || selectedVariant.thumbnail;
        if (u) addUrl(u, selectedVariant.title);
      }
      if (selectedVariant.media) {
        const u = selectedVariant.media.image || selectedVariant.media.thumbnail?.secureUrl || selectedVariant.media.thumbnail?.url;
        if (u) addUrl(u, selectedVariant.title);
        if (Array.isArray(selectedVariant.media.images)) {
          selectedVariant.media.images.forEach((img) => {
            const mUrl = typeof img === "string" ? img : img?.secureUrl || img?.url;
            if (mUrl) addUrl(mUrl, selectedVariant.title);
          });
        }
        if (Array.isArray(selectedVariant.media.gallery)) {
          selectedVariant.media.gallery.forEach((item) => {
            const m = item?.media || item;
            const mUrl = m?.secureUrl || m?.url;
            if (mUrl) addUrl(mUrl, m?.altText || selectedVariant.title);
          });
        }
      }
      if (Array.isArray(selectedVariant.images)) {
        selectedVariant.images.forEach((img) => {
          const u = typeof img === "string" ? img : img?.secureUrl || img?.url;
          if (u) addUrl(u, selectedVariant.title);
        });
      }
      if (Array.isArray(selectedVariant.gallery)) {
        selectedVariant.gallery.forEach((item) => {
          const m = item?.media || item;
          const u = typeof m === "string" ? m : m?.secureUrl || m?.url;
          if (u) addUrl(u, selectedVariant.title);
        });
      }
    }

    // 2. Selected colour media & image
    if (selectedColour) {
      if (selectedColour.image) addUrl(selectedColour.image, selectedColour.name);
      if (selectedColour.media) {
        const u =
          selectedColour.media.thumbnail?.secureUrl ||
          selectedColour.media.thumbnail?.url ||
          selectedColour.media.secureUrl ||
          selectedColour.media.url;
        if (u) addUrl(u, selectedColour.name);
      }
    }

    // 3. Product Media gallery
    if (media?.gallery && Array.isArray(media.gallery)) {
      media.gallery.forEach((item) => {
        const m = item.media || item;
        const u = m?.secureUrl || m?.url;
        addUrl(u, m?.altText || product?.name);
      });
    }

    // 4. Direct product images
    if (product) {
      if (product.thumbnail) addUrl(product.thumbnail, product.name);
      if (Array.isArray(product.images)) {
        product.images.forEach((u) => addUrl(u, product.name));
      }
    }

    if (urls.length === 0 && product) {
      const fallback = getProductImage(product);
      if (fallback?.url) {
        urls.push(fallback);
      }
    }

    return urls;
  }, [selectedVariant, selectedColour, media, product]);

  const currentImage = gallery[selectedImageIndex] || gallery[0];

  const handleSelectColour = (colour) => {
    const cid = String(colour._id || colour.slug || colour.name);
    setSelectedColourId(cid);
    setSelectedImageIndex(0);

    // 1. Explicit variantId on colour
    if (colour.variantId) {
      const v = variants.find(
        (item) => String(item._id) === String(colour.variantId) || String(item.id) === String(colour.variantId)
      );
      if (v) {
        setSelectedVariantId(getVariantId(v));
        return;
      }
    }

    // 2. Variant referencing this colour's ID
    const varByColId = variants.find(
      (v) => String(v.colourId || v.colorId) === String(colour._id)
    );
    if (varByColId) {
      setSelectedVariantId(getVariantId(varByColId));
      return;
    }

    // 3. Exact attribute match for Color / Colour / Shade
    const cName = (colour.name || "").trim().toLowerCase();
    if (!cName) return;

    const varByAttr = variants.find((v) => {
      const colorAttr = (v.attributes || []).find((a) => {
        const attrName = String(a.attribute?.name || a.attribute || a.name || "").toLowerCase();
        return (
          attrName === "colour" ||
          attrName === "color" ||
          attrName === "shade" ||
          attrName === "color / finish"
        );
      });
      if (colorAttr) {
        return String(colorAttr.value || "").trim().toLowerCase() === cName;
      }
      return false;
    });

    if (varByAttr) {
      setSelectedVariantId(getVariantId(varByAttr));
      return;
    }

    // 4. Exact variant title match or exact prefix/suffix boundary (e.g. " - ColourName")
    const foundVar = variants.find((v) => {
      const vTitle = (v.title || "").trim().toLowerCase();
      return (
        vTitle === cName ||
        vTitle.endsWith(` - ${cName}`) ||
        vTitle.endsWith(` / ${cName}`) ||
        vTitle.startsWith(`${cName} - `)
      );
    });

    if (foundVar) {
      setSelectedVariantId(getVariantId(foundVar));
    }
  };

  const handleSelectVariant = (variant) => {
    const vid = getVariantId(variant);
    setSelectedVariantId(vid);

    const rawCols = product?.colours || [];

    // 1. Explicit variantId relationship from colour
    const colByVariantId = rawCols.find(
      (c) =>
        c.variantId &&
        (String(c.variantId) === String(variant._id) || String(c.variantId) === String(variant.id))
    );
    if (colByVariantId) {
      setSelectedColourId(String(colByVariantId._id || colByVariantId.slug || colByVariantId.name));
      return;
    }

    // 2. Variant explicit colorId/colourId
    if (variant.colourId || variant.colorId) {
      const targetColId = String(variant.colourId || variant.colorId);
      const colById = rawCols.find((c) => String(c._id) === targetColId);
      if (colById) {
        setSelectedColourId(String(colById._id || colById.slug || colById.name));
        return;
      }
    }

    // 3. Exact attribute match for Color / Colour / Shade
    const colorAttr = (variant.attributes || []).find((a) => {
      const attrName = String(a.attribute?.name || a.attribute || a.name || "").toLowerCase();
      return (
        attrName === "colour" ||
        attrName === "color" ||
        attrName === "shade" ||
        attrName === "color / finish"
      );
    });
    if (colorAttr) {
      const attrVal = String(colorAttr.value || "").trim().toLowerCase();
      const colByAttr = rawCols.find((c) => (c.name || "").trim().toLowerCase() === attrVal);
      if (colByAttr) {
        setSelectedColourId(String(colByAttr._id || colByAttr.slug || colByAttr.name));
        return;
      }
    }

    // 4. Exact variant title match or exact boundary
    const vTitle = (variant.title || "").trim().toLowerCase();
    const foundCol = rawCols.find((c) => {
      const cName = (c.name || "").trim().toLowerCase();
      if (!cName) return false;
      return (
        vTitle === cName ||
        vTitle.endsWith(` - ${cName}`) ||
        vTitle.endsWith(` / ${cName}`) ||
        vTitle.startsWith(`${cName} - `)
      );
    });

    if (foundCol) {
      setSelectedColourId(String(foundCol._id || foundCol.slug || foundCol.name));
    }
  };

  // Pricing calculations
  const currency =
    selectedVariant?.currency ||
    pricing?.currency ||
    product?.pricing?.currency ||
    product?.currency ||
    "GBP";

  const sellingPrice =
    selectedVariant?.price ??
    pricing?.sellingPrice ??
    product?.pricing?.sellingPrice ??
    product?.price ??
    null;

  const compareAtPrice =
    pricing?.compareAtPrice ??
    product?.pricing?.compareAtPrice ??
    null;

  const priceUnit =
    pricing?.priceUnit ||
    product?.pricing?.priceUnit ||
    "";

  const hasDiscount = compareAtPrice && sellingPrice && compareAtPrice > sellingPrice;

  // Sample information - validated against API with authentic fallback for wallpapers & fabrics
  const isWallpaperOrFabric = Boolean(
    (product?.category?.name || product?.category || product?.productType || "")
      .toString()
      .toLowerCase()
      .includes("wallpaper") ||
    (product?.category?.name || product?.category || product?.productType || "")
      .toString()
      .toLowerCase()
      .includes("fabric")
  );

  const rawSample = pricing?.sample || product?.pricing?.sample;
  const rawSamplePrice = rawSample?.price;
  const hasValidSamplePrice =
    typeof rawSamplePrice === "number" &&
    !Number.isNaN(rawSamplePrice) &&
    rawSamplePrice > 0;
  const sampleSupported = Boolean(
    (rawSample?.available === true && hasValidSamplePrice) || isWallpaperOrFabric
  );
  const samplePrice = sampleSupported
    ? (hasValidSamplePrice ? rawSamplePrice : 6)
    : null;
  const sampleCurrency = rawSample?.currency || currency;

  // Stock / Availability calculation
  const inventory = product?.inventory;
  const inStock = Boolean(
    inventory &&
    inventory.inStock !== false &&
    inventory.status !== "OUT_OF_STOCK" &&
    (inventory.availableQuantity === undefined || inventory.availableQuantity > 0)
  );

  // Handlers
  const handleAddToCart = (isSample = false) => {
    if (!product?._id) {
      showError("Unable to add item", "Product information is unavailable.");
      return;
    }

    if (isSample) {
      if (!sampleSupported || samplePrice === null) {
        showError("Sample Unavailable", "Sample swatches are not available for this item.");
        return;
      }
    } else {
      if (!inStock) {
        showError("Out of Stock", "This item is currently out of stock.");
        return;
      }

      if (variants.length > 0 && !selectedVariant) {
        showError("Choose an option", "Please select a product variant.");
        return;
      }
    }

    const itemPrice = isSample ? samplePrice : sellingPrice;
    const itemCurrency = isSample ? sampleCurrency : currency;

    dispatch(
      addToCart({
        ...product,
        _id: product._id,
        productId: product._id,
        variantId: selectedVariant ? getVariantId(selectedVariant) : null,
        variantSku: selectedVariant?.sku || "",
        variantTitle: selectedVariant?.title || "",
        isSample,
        price: itemPrice,
        currency: itemCurrency,
        priceUnit: isSample ? "sample" : priceUnit,
        image: currentImage?.url || "",
        title: isSample ? `${product.name} (Sample Swatch)` : product.name,
        quantity: isSample ? 1 : quantity,
      })
    );

    showToast(isSample ? "Sample swatch added to bag" : "Added to your bag");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#f6f3ec] px-5 py-24 text-center">
        <p className="font-serif text-xl text-[#394132] animate-pulse">Loading House of Hackney craftsmanship...</p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-[#f6f3ec] px-5 py-24 text-center text-[#171713]">
        <h1 className="font-serif text-3xl">{error || "Product not found"}</h1>
        <p className="mt-3 text-sm text-[#666257]">The product you requested could not be retrieved from the catalogue.</p>
        <Link to="/products" className="mt-6 inline-block text-sm font-medium underline underline-offset-4 text-[#394132]">
          Back to collection
        </Link>
      </main>
    );
  }

  // Specifications checking: only true if actual data exists
  const hasSpecs =
    specifications &&
    (specifications.composition ||
      specifications.width?.value ||
      specifications.verticalRepeat?.value ||
      specifications.horizontalRepeat?.value ||
      (Array.isArray(specifications.careInstructions) && specifications.careInstructions.length > 0) ||
      specifications.countryOfOrigin ||
      (Array.isArray(specifications.suitability) && specifications.suitability.length > 0) ||
      (Array.isArray(specifications.certifications) && specifications.certifications.length > 0));

  const categoryName = product.category?.name || product.category || "";
  const productType = product.productType || "";
  const labelHeader = categoryName && productType && categoryName.toUpperCase() !== productType.toUpperCase()
    ? `${categoryName} • ${productType}`
    : categoryName || productType;

  return (
    <main className="min-h-screen bg-[#f6f3ec] text-[#171713]">
      <div className="mx-auto max-w-7xl px-5 pb-20 pt-8 sm:px-8 md:px-12">
        {/* Breadcrumb Navigation & Back Link */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-[#d8d1c5]/50 pb-4 text-xs">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-[10px] uppercase tracking-[1.5px] text-[#777267]">
            <Link to="/" className="hover:text-[#171713] transition">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-[#171713] transition">
              {typeof product.category === "object" ? product.category?.name : product.category || "Collection"}
            </Link>
            <span>/</span>
            <span className="font-semibold text-[#171713] line-clamp-1">{product.name}</span>
          </nav>

          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-[10px] font-medium tracking-[1.5px] uppercase text-[#666257] hover:text-[#171713] transition"
          >
            <ArrowLeft size={13} />
            Back to Collection
          </Link>
        </div>

        {/* Product Hero Grid */}
        <div className="grid items-start gap-9 md:grid-cols-2 md:gap-14">
          {/* Gallery Component */}
          <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-3 sm:grid-cols-[84px_minmax(0,1fr)] sm:gap-4">
            {/* Thumbnails Sidebar */}
            {gallery.length > 1 && (
              <div className="flex flex-col gap-3 max-h-[640px] overflow-y-auto scrollbar-none">
                {gallery.map((image, index) => (
                  <button
                    key={`${image.url}-${index}`}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    aria-label={`View product image ${index + 1}`}
                    className={`aspect-[3/4] overflow-hidden border p-1 bg-[#e8e2d7]/50 flex items-center justify-center transition ${
                      selectedImageIndex === index ? "border-[#394132] opacity-100 ring-1 ring-[#394132]" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={optimizeImageUrl(image.url, 200)}
                      alt={image.alt}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Primary Main Display Image with Scale View Toggle */}
            <div className="relative aspect-[4/5] overflow-hidden bg-[#e8e2d7] rounded-sm shadow-sm flex items-center justify-center p-3 sm:p-5">
              {/* Scale View Toggle */}
              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-full shadow-xs text-[9px] uppercase tracking-wider">
                <button
                  type="button"
                  onClick={() => setViewScale("pattern")}
                  className={`px-2.5 py-0.5 rounded-full transition ${
                    viewScale === "pattern" ? "bg-[#394132] text-white font-medium shadow-2xs" : "text-[#666257] hover:text-[#171713]"
                  }`}
                >
                  Pattern Detail
                </button>
                <button
                  type="button"
                  onClick={() => setViewScale("room")}
                  className={`px-2.5 py-0.5 rounded-full transition ${
                    viewScale === "room" ? "bg-[#394132] text-white font-medium shadow-2xs" : "text-[#666257] hover:text-[#171713]"
                  }`}
                >
                  Room Scale
                </button>
              </div>

              {currentImage?.url ? (
                <img
                  src={optimizeImageUrl(currentImage.url, 1200)}
                  alt={currentImage.alt || product.name}
                  className={`max-h-full max-w-full transition-all duration-700 drop-shadow-xs ${
                    viewScale === "room" ? "object-cover h-full w-full scale-100" : "object-contain scale-95"
                  }`}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#777267]">
                  Product image unavailable
                </div>
              )}

              {/* Badges */}
              {hasDiscount && (
                <span className="absolute top-3 left-3 bg-[#394132] text-white text-[10px] font-medium uppercase px-2.5 py-1 tracking-wider shadow-sm">
                  Sale
                </span>
              )}

              {!inStock && (
                <span className="absolute top-3 left-3 bg-stone-700/90 text-white text-[10px] font-medium uppercase px-2.5 py-1 tracking-wider shadow-sm">
                  Out of Stock
                </span>
              )}
            </div>
          </div>

          {/* Product Details & Actions */}
          <div className="md:sticky md:top-24">
            {/* Category / Brand / ProductType */}
            <p className="mb-2 text-[10px] font-medium uppercase tracking-[2.5px] text-[#777267]">
              {labelHeader}
            </p>

            {/* Product Title */}
            <h1 className="font-serif text-3xl leading-tight sm:text-4xl lg:text-5xl text-[#171713]">
              {product.name}
            </h1>

            {/* Price section with unit and compare-at */}
            <div className="mt-4 flex items-baseline gap-3">
              {sellingPrice !== null && (
                <span className="text-2xl font-semibold text-[#171713]">
                  {formatPrice(sellingPrice, currency)}
                  {priceUnit && (
                    <span className="text-sm font-normal text-[#666257]"> / {priceUnit}</span>
                  )}
                </span>
              )}

              {hasDiscount && (
                <span className="text-base text-[#8e8a7f] line-through">
                  {formatPrice(compareAtPrice, currency)}
                </span>
              )}
            </div>

            {/* Out of Stock Notice */}
            {!inStock && (
              <div className="mt-3 flex items-center gap-2 rounded border border-stone-300 bg-stone-100/90 px-3 py-2 text-xs text-stone-700">
                <AlertCircle size={15} className="text-stone-600 shrink-0" />
                <span>
                  <strong className="font-medium text-stone-900">Currently out of stock.</strong>{" "}
                  {sampleSupported ? "Full quantity orders are unavailable, but you can order a sample swatch below." : "This item is currently unavailable for purchase."}
                </span>
              </div>
            )}

            {/* Short Description */}
            {product.shortDescription && (
              <p className="mt-4 text-sm leading-7 text-[#5c584e]">
                {product.shortDescription}
              </p>
            )}

            {/* Colour Swatches Selector */}
            {Array.isArray(product.colours) && product.colours.length > 0 && (
              <div className="mt-6 border-t border-[#d8d1c5] pt-5">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[1.5px] text-[#171713]">
                  Colour:{" "}
                  <span className="font-normal text-[#666257]">
                    {selectedColour?.name || "Choose a colour"}
                  </span>
                </p>

                <div className="flex flex-wrap items-center gap-2.5">
                  {product.colours.map((c) => {
                    const cid = String(c._id || c.slug || c.name);
                    const isSelected = selectedColourId === cid;
                    return (
                      <button
                        key={cid}
                        type="button"
                        onClick={() => handleSelectColour(c)}
                        title={c.name}
                        className={`group flex items-center gap-2 border px-3 py-1.5 text-xs font-medium transition rounded-sm ${
                          isSelected
                            ? "border-[#394132] bg-[#394132] text-white"
                            : "border-[#d8d1c5] bg-white/60 text-[#171713] hover:border-[#394132]"
                        }`}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-black/20 shrink-0 shadow-xs"
                          style={{ backgroundColor: c.colorHex || "#d8d1c5" }}
                        />
                        <span>{c.name}</span>
                        {isSelected && <Check size={12} className="ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Variant Selector (Options / Finishes) */}
            {variants.length > 0 && (
              <div className="mt-6 border-t border-[#d8d1c5] pt-5">
                <p className="mb-3 text-[11px] font-medium uppercase tracking-[1.5px] text-[#171713]">
                  Option:{" "}
                  <span className="font-normal text-[#666257]">
                    {selectedVariant?.title || "Choose an option"}
                  </span>
                </p>

                <div className="flex flex-wrap gap-2.5">
                  {variants.map((v) => {
                    const vid = getVariantId(v);
                    const isSelected = vid === selectedVariantId;
                    return (
                      <button
                        key={vid}
                        type="button"
                        onClick={() => handleSelectVariant(v)}
                        className={`flex items-center gap-2 border px-3.5 py-2 text-xs font-medium transition ${
                          isSelected
                            ? "border-[#394132] bg-[#394132] text-white"
                            : "border-[#d8d1c5] bg-white/60 text-[#171713] hover:border-[#394132]"
                        }`}
                      >
                        {isSelected && <Check size={13} />}
                        {v.title || v.name || "Default Option"}
                      </button>
                    );
                  })}
                </div>

                {selectedVariant?.sku && (
                  <p className="mt-2 text-[11px] text-[#777267]">
                    SKU: {selectedVariant.sku}
                  </p>
                )}
              </div>
            )}

            {/* Quantity Selector & Wallpaper Roll Estimator Tool */}
            <div className={`mt-6 ${!inStock ? "opacity-50 pointer-events-none" : ""}`}>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="quantity" className="text-[10px] font-medium uppercase tracking-[1.5px] text-[#171713]">
                  Quantity ({priceUnit || "Rolls"})
                </label>

                {/* Wallpaper Calculator Trigger */}
                {(labelHeader.toLowerCase().includes("wallpaper") || labelHeader.toLowerCase().includes("mural")) && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowCalculator(!showCalculator);
                      if (!calculatedRolls) handleCalculateRolls();
                    }}
                    className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#394132] hover:underline cursor-pointer"
                  >
                    <Calculator size={13} />
                    <span>How Many Rolls Do I Need?</span>
                  </button>
                )}
              </div>

              {/* Wallpaper Roll Calculator Tool Widget */}
              {showCalculator && (
                <div className="mb-6 rounded-sm border border-[#394132] bg-[#fbf9f5] p-4 text-xs shadow-sm">
                  <div className="flex items-center justify-between border-b border-[#e5dfd4] pb-2">
                    <span className="font-serif text-sm font-semibold text-[#171713] flex items-center gap-2">
                      <Calculator size={14} className="text-[#394132]" />
                      Roll Estimator Tool
                    </span>
                    <div className="flex rounded border border-[#d8d1c5] bg-white p-0.5 text-[9px] uppercase">
                      <button
                        type="button"
                        onClick={() => setCalcUnit("meters")}
                        className={`px-2 py-0.5 rounded-xs transition ${
                          calcUnit === "meters" ? "bg-[#394132] text-white font-medium" : "text-[#777267]"
                        }`}
                      >
                        Metres (m)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCalcUnit("feet")}
                        className={`px-2 py-0.5 rounded-xs transition ${
                          calcUnit === "feet" ? "bg-[#394132] text-white font-medium" : "text-[#777267]"
                        }`}
                      >
                        Feet (ft)
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-[#777267] block mb-1">
                        Wall Width ({calcUnit === "meters" ? "m" : "ft"})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        value={wallWidth}
                        onChange={(e) => {
                          setWallWidth(Number(e.target.value));
                          setTimeout(handleCalculateRolls, 50);
                        }}
                        className="w-full border border-[#d8d1c5] bg-white px-2.5 py-1.5 text-xs text-[#171713] outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] uppercase tracking-wider text-[#777267] block mb-1">
                        Wall Height ({calcUnit === "meters" ? "m" : "ft"})
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="1"
                        value={wallHeight}
                        onChange={(e) => {
                          setWallHeight(Number(e.target.value));
                          setTimeout(handleCalculateRolls, 50);
                        }}
                        className="w-full border border-[#d8d1c5] bg-white px-2.5 py-1.5 text-xs text-[#171713] outline-none"
                      />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] text-[#666257]">Number of Walls:</span>
                    <div className="flex gap-1.5">
                      {[1, 2, 4].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => {
                            setNumWalls(n);
                            setTimeout(handleCalculateRolls, 50);
                          }}
                          className={`px-2.5 py-1 text-[10px] border rounded-xs transition ${
                            numWalls === n ? "border-[#394132] bg-[#394132] text-white" : "border-[#d8d1c5] bg-white text-[#171713]"
                          }`}
                        >
                          {n} {n === 1 ? "Wall" : "Walls"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {calculatedRolls !== null && (
                    <div className="mt-3 rounded border border-[#c5d3bc] bg-[#eff5ec] p-2.5 text-center">
                      <p className="font-semibold text-xs text-[#2b4c20]">
                        Recommended: {calculatedRolls} {calculatedRolls === 1 ? "Roll" : "Rolls"}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#4d6a43]">
                        Includes 15% allowance for vertical pattern repeat and trimming waste.
                      </p>
                      <button
                        type="button"
                        onClick={handleApplyCalculatedRolls}
                        className="mt-2 w-full rounded bg-[#394132] py-1.5 text-[10px] font-semibold uppercase tracking-wider text-white hover:bg-[#282e23] transition cursor-pointer"
                      >
                        Apply {calculatedRolls} Rolls to Order
                      </button>
                      {calcFeedback && (
                        <p className="mt-1.5 text-[10px] font-medium text-emerald-700 animate-fadeIn">
                          ✓ {calcFeedback}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Quantity Counter */}
              <div className="flex h-11 w-36 items-center justify-between border border-[#d8d1c5] bg-white/50">
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="h-full w-10 flex items-center justify-center hover:bg-black/5 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Minus size={13} />
                </button>

                <input
                  id="quantity"
                  type="number"
                  min="1"
                  max="99"
                  disabled={!inStock}
                  value={quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setQuantity(Number.isFinite(val) ? Math.max(1, Math.min(99, Math.floor(val))) : 1);
                  }}
                  className="w-12 bg-transparent text-center text-sm font-medium outline-none disabled:cursor-not-allowed"
                />

                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                  aria-label="Increase quantity"
                  className="h-full w-10 flex items-center justify-center hover:bg-black/5 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={!inStock}
                className={`flex flex-1 items-center justify-center gap-3 px-6 py-4 text-[10px] font-semibold tracking-[2px] uppercase transition shadow-sm cursor-pointer ${
                  inStock
                    ? "bg-[#394132] text-white hover:bg-[#26251f]"
                    : "bg-[#d5cec3] text-[#7d776c] cursor-not-allowed border border-[#c4bcaf]"
                }`}
              >
                <ShoppingBag size={16} />
                {inStock ? "Add to Bag" : "Out of Stock"}
              </button>

              {/* Wishlist Button */}
              <button
                type="button"
                aria-label={isWishlisted(product?._id) ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => toggleWishlist(product)}
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border transition shadow-xs cursor-pointer ${
                  isWishlisted(product?._id)
                    ? "border-[#b83232] bg-[#fbf5f5] text-[#b83232]"
                    : "border-[#d8d1c5] bg-white text-[#171713] hover:border-[#b83232] hover:text-[#b83232]"
                }`}
                title={isWishlisted(product?._id) ? "In Wishlist" : "Add to Wishlist"}
              >
                <Heart
                  size={18}
                  className={isWishlisted(product?._id) ? "fill-[#b83232]" : ""}
                />
              </button>
            </div>

            {/* Dedicated Sample Box Card */}
            {sampleSupported && samplePrice !== null && (
              <div
                id="sample-box-card"
                className={`mt-6 rounded-sm border p-4 text-xs transition-all duration-500 ${
                  isSampleMode
                    ? "border-[#394132] bg-[#eff5ec] ring-2 ring-[#394132]/40 shadow-md"
                    : "border-[#394132] bg-[#fbf9f5]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#394132]">
                      Try Before You Buy
                    </span>
                    <h4 className="font-serif text-sm font-semibold text-[#171713] mt-0.5">
                      Order A4 Swatch Sample
                    </h4>
                    <p className="text-[11px] text-[#666257] mt-1">
                      Generous 21cm × 29.7cm swatch. Test the paper texture and lighting in your room.
                    </p>
                  </div>
                  <span className="shrink-0 font-semibold text-sm text-[#171713]">
                    {formatPrice(samplePrice, sampleCurrency)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[#394132] bg-[#394132] py-2.5 text-[10px] font-semibold tracking-[1.5px] uppercase text-white hover:bg-[#26251f] transition cursor-pointer"
                >
                  <Sparkles size={13} />
                  Add Sample to Bag ({formatPrice(samplePrice, sampleCurrency)})
                </button>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-[10px] text-[#394132] font-medium">
                  <Truck size={12} />
                  <span>Complimentary UK Royal Mail Sample Postage</span>
                </div>
              </div>
            )}

            {/* World Land Trust & B-Corp Impact Banner */}
            <div className="mt-6 rounded-sm bg-[#32392b] text-[#f6f3ec] p-4 text-xs flex items-center gap-3.5 shadow-2xs">
              <TreePine size={22} className="text-[#d8c4a5] shrink-0" />
              <div>
                <p className="font-semibold text-white tracking-wide">
                  35m² Rainforest Protected Forever
                </p>
                <p className="text-[10px] text-[#d8d3c5] mt-0.5">
                  With every order, we buy and preserve endangered wild habitat via World Land Trust. Certified B Corp™.
                </p>
              </div>
            </div>

            {/* Trust Features */}
            <div className="mt-7 grid grid-cols-3 gap-2 border-y border-[#d8d1c5] py-4 text-center text-[10px] text-[#666257]">
              <div className="flex flex-col items-center gap-1">
                <Truck size={16} className="text-[#394132]" />
                <span>Complimentary Delivery</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck size={16} className="text-[#394132]" />
                <span>Made in England</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RotateCcw size={16} className="text-[#394132]" />
                <span>28-Day Returns</span>
              </div>
            </div>

            {/* Collapsible Information Accordions */}
            <div className="mt-8 border-t border-[#d8d1c5]">
              {/* 1. Description */}
              {product.description && (
                <div className="border-b border-[#d8d1c5]">
                  <button
                    type="button"
                    onClick={() => setOpenSection((s) => (s === "description" ? "" : "description"))}
                    className="flex w-full items-center justify-between py-4 text-left text-xs font-medium tracking-wide uppercase"
                  >
                    <span>Description</span>
                    <ChevronDown size={15} className={`transition-transform duration-300 ${openSection === "description" ? "rotate-180" : ""}`} />
                  </button>
                  {openSection === "description" && (
                    <div className="pb-5 text-sm leading-7 text-[#666257] whitespace-pre-line">
                      {product.description}
                    </div>
                  )}
                </div>
              )}

              {/* 2. Specifications & Dimensions (Hides if no data provided) */}
              {hasSpecs && (
                <div className="border-b border-[#d8d1c5]">
                  <button
                    type="button"
                    onClick={() => setOpenSection((s) => (s === "specs" ? "" : "specs"))}
                    className="flex w-full items-center justify-between py-4 text-left text-xs font-medium tracking-wide uppercase"
                  >
                    <span>Product Specifications & Details</span>
                    <ChevronDown size={15} className={`transition-transform duration-300 ${openSection === "specs" ? "rotate-180" : ""}`} />
                  </button>
                  {openSection === "specs" && (
                    <div className="pb-5 text-xs text-[#555248] space-y-2.5">
                      {specifications.composition && (
                        <div className="flex justify-between py-1 border-b border-[#e4ded3]">
                          <span className="text-[#777267]">Composition</span>
                          <span className="font-medium text-[#171713]">{specifications.composition}</span>
                        </div>
                      )}
                      {specifications.width?.value && (
                        <div className="flex justify-between py-1 border-b border-[#e4ded3]">
                          <span className="text-[#777267]">Width</span>
                          <span className="font-medium text-[#171713]">{specifications.width.value}{specifications.width.unit}</span>
                        </div>
                      )}
                      {specifications.verticalRepeat?.value && (
                        <div className="flex justify-between py-1 border-b border-[#e4ded3]">
                          <span className="text-[#777267]">Pattern Repeat</span>
                          <span className="font-medium text-[#171713]">{specifications.verticalRepeat.value}{specifications.verticalRepeat.unit}</span>
                        </div>
                      )}
                      {specifications.countryOfOrigin && (
                        <div className="flex justify-between py-1 border-b border-[#e4ded3]">
                          <span className="text-[#777267]">Country of Origin</span>
                          <span className="font-medium text-[#171713]">{specifications.countryOfOrigin}</span>
                        </div>
                      )}
                      {Array.isArray(specifications.careInstructions) && specifications.careInstructions.length > 0 && (
                        <div className="py-1 border-b border-[#e4ded3]">
                          <span className="text-[#777267] block mb-1">Care Instructions</span>
                          <ul className="list-disc list-inside space-y-0.5 font-medium text-[#171713]">
                            {specifications.careInstructions.map((c, i) => (
                              <li key={i}>{c}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Array.isArray(specifications.suitability) && specifications.suitability.length > 0 && (
                        <div className="flex justify-between py-1 border-b border-[#e4ded3]">
                          <span className="text-[#777267]">Suitability</span>
                          <span className="font-medium text-[#171713]">{specifications.suitability.join(", ")}</span>
                        </div>
                      )}
                      {Array.isArray(specifications.certifications) && specifications.certifications.length > 0 && (
                        <div className="flex justify-between py-1 border-b border-[#e4ded3]">
                          <span className="text-[#777267]">Certifications</span>
                          <span className="font-medium text-[#171713]">{specifications.certifications.join(", ")}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 3. Delivery & Returns */}
              <div className="border-b border-[#d8d1c5]">
                <button
                  type="button"
                  onClick={() => setOpenSection((s) => (s === "shipping" ? "" : "shipping"))}
                  className="flex w-full items-center justify-between py-4 text-left text-xs font-medium tracking-wide uppercase cursor-pointer"
                >
                  <span>Delivery & Returns</span>
                  <ChevronDown size={15} className={`transition-transform duration-300 ${openSection === "shipping" ? "rotate-180" : ""}`} />
                </button>
                {openSection === "shipping" && (
                  <div className="pb-5 text-sm leading-7 text-[#666257]">
                    <p>Standard UK Delivery: 3–5 working days (Complimentary on orders over £150).</p>
                    <p className="mt-1">International Express Shipping calculated at checkout.</p>
                    <p className="mt-1">Samples are delivered via Royal Mail First Class.</p>
                  </div>
                )}
              </div>

              {/* 4. Hanging & Application Guide */}
              <div className="border-b border-[#d8d1c5]">
                <button
                  type="button"
                  onClick={() => setOpenSection((s) => (s === "installation" ? "" : "installation"))}
                  className="flex w-full items-center justify-between py-4 text-left text-xs font-medium tracking-wide uppercase cursor-pointer"
                >
                  <span>Hanging & Installation Guide</span>
                  <ChevronDown size={15} className={`transition-transform duration-300 ${openSection === "installation" ? "rotate-180" : ""}`} />
                </button>
                {openSection === "installation" && (
                  <div className="pb-5 text-xs leading-6 text-[#666257] space-y-2">
                    <p><strong>Paste-the-Wall Technique:</strong> Our wallpapers are printed on heavy non-woven substrate, meaning you apply paste directly to the wall — no soaking or pasting table required.</p>
                    <p><strong>Adhesive:</strong> We recommend a premium ready-mixed non-woven tub paste (e.g. Solvite or Beeline).</p>
                    <p><strong>Pattern Match:</strong> Straight match or half-drop as specified on the roll label. Smooth down with a clean felt roller or decorator sponge.</p>
                    <p><strong>Maintenance:</strong> Spongeable. Wipe gently with a soft damp cloth.</p>
                  </div>
                )}
              </div>

              {/* 5. Sustainability & Craftsmanship */}
              <div className="border-b border-[#d8d1c5]">
                <button
                  type="button"
                  onClick={() => setOpenSection((s) => (s === "sustainability" ? "" : "sustainability"))}
                  className="flex w-full items-center justify-between py-4 text-left text-xs font-medium tracking-wide uppercase cursor-pointer"
                >
                  <span>B Corp & Environmental Impact</span>
                  <ChevronDown size={15} className={`transition-transform duration-300 ${openSection === "sustainability" ? "rotate-180" : ""}`} />
                </button>
                {openSection === "sustainability" && (
                  <div className="pb-5 text-xs leading-6 text-[#666257] space-y-2">
                    <p><strong>Certified B Corporation™:</strong> We meet the highest verified standards of social and environmental performance, transparency and accountability.</p>
                    <p><strong>World Land Trust:</strong> Every roll or metre purchased buys and permanently protects 35m² of endangered rainforest habitat.</p>
                    <p><strong>Materials:</strong> 100% FSC-certified paper sourced from sustainably managed British forests. Printed with non-toxic, water-based mineral inks.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Curated Paint Pairings Section */}
        <section className="mt-20 border-t border-[#d8d1c5] pt-14">
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold tracking-[2.5px] uppercase text-[#394132] flex items-center gap-1.5">
                <Palette size={14} />
                Complete The Look
              </p>
              <h2 className="font-serif text-2xl sm:text-3xl text-[#171713] mt-1">
                Curated Paint Pairings
              </h2>
              <p className="text-xs text-[#666257] mt-1 max-w-xl">
                Our in-house colourists have specifically handpicked these mineral paint shades to harmonize with {product.name}.
              </p>
            </div>
            <Link
              to="/products?category=paint"
              className="text-xs uppercase tracking-wider underline underline-offset-4 text-[#394132]"
            >
              Explore All Paint
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {CURATED_PAINT_PAIRINGS.map((paint) => (
              <div
                key={paint.name}
                className="rounded-sm border border-[#d8d1c5] bg-white p-4 shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div
                    className="aspect-square w-full rounded-sm shadow-inner mb-3 border border-black/10"
                    style={{ backgroundColor: paint.hex }}
                  />
                  <h4 className="font-serif text-base text-[#171713]">{paint.name} Mineral Paint</h4>
                  <p className="text-[10px] uppercase tracking-wider text-[#777267] mt-0.5">{paint.shade}</p>
                  <p className="text-[11px] text-[#666257] mt-1.5 leading-4 line-clamp-2">{paint.description}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-[#e8e2d7] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#171713]">£{paint.price}.00</span>
                  <Link
                    to={paint.link}
                    className="inline-flex items-center gap-1 rounded-full border border-[#394132] px-3 py-1 text-[9px] uppercase tracking-wider text-[#394132] hover:bg-[#394132] hover:text-white transition font-medium"
                  >
                    View Shade
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Related Designs Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-20 border-t border-[#d8d1c5] pt-16">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-medium tracking-[2.5px] uppercase text-[#394132]">You May Also Like</p>
                <h2 className="font-serif text-2xl sm:text-3xl text-[#171713] mt-1">Related Designs</h2>
              </div>
              <Link to="/products" className="text-xs uppercase tracking-wider underline underline-offset-4 text-[#394132]">
                View All
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 sm:grid-cols-4">
              {relatedProducts.slice(0, 4).map((rel) => {
                const rawImg =
                  typeof rel.thumbnail === "string"
                    ? rel.thumbnail
                    : rel.thumbnail?.secureUrl ||
                      rel.thumbnail?.url ||
                      rel.image ||
                      (Array.isArray(rel.images) && rel.images[0]) ||
                      getProductImage(rel)?.url ||
                      "";

                const relImage = optimizeImageUrl(rawImg, 800);
                const relPrice = rel.sellingPrice ?? rel.price ?? rel.pricing?.sellingPrice ?? null;
                const relCurr = rel.currency || rel.pricing?.currency || "GBP";
                const relSlug = rel.slug || rel.id || rel._id;

                return (
                  <article key={rel._id || rel.id} className="group">
                    <Link
                      to={`/products/${relSlug}`}
                      className="block relative aspect-[4/5] overflow-hidden bg-[#e8e2d7] rounded-sm p-3 flex items-center justify-center"
                    >
                      {relImage ? (
                        <>
                          <img
                            src={relImage}
                            alt={rel.name}
                            loading="lazy"
                            className="max-h-full max-w-full object-contain transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const fb = e.currentTarget.nextElementSibling;
                              if (fb) fb.style.display = "flex";
                            }}
                          />
                          <div className="hidden flex-col items-center justify-center p-3 text-center text-[#777267]">
                            <span className="font-serif text-xs italic line-clamp-2">{rel.name}</span>
                            <span className="mt-1 text-[9px] uppercase tracking-widest text-[#999285]">
                              House of Hackney
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-xs text-[#777267] text-center p-3">
                          <span className="font-serif text-xs italic line-clamp-2">{rel.name}</span>
                          <span className="mt-1 text-[9px] uppercase tracking-widest text-[#999285]">
                            House of Hackney
                          </span>
                        </div>
                      )}
                    </Link>

                    <p className="mt-3 text-[9px] uppercase tracking-wider text-[#777267]">
                      {rel.productType || (typeof rel.category === "object" ? rel.category?.name : rel.category) || ""}
                    </p>
                    <Link
                      to={`/products/${relSlug}`}
                      className="mt-1 block font-serif text-base text-[#171713] hover:underline line-clamp-1"
                    >
                      {rel.name}
                    </Link>
                    {relPrice !== null && (
                      <p className="mt-1 text-xs font-medium text-[#171713]">
                        {formatPrice(relPrice, relCurr)}
                        {(rel.priceUnit || rel.pricing?.priceUnit) && (
                          <span className="text-[10px] font-normal text-[#666257]">
                            {" "}
                            / {rel.priceUnit || rel.pricing?.priceUnit}
                          </span>
                        )}
                      </p>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* Real Homes Community Lookbook */}
        <section className="mt-20 border-t border-[#d8d1c5] pt-14">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-semibold tracking-[2.5px] uppercase text-[#394132]">
              #HOUSEOFHACKNEY
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-[#171713] mt-1">
              In Real Homes
            </h2>
            <p className="text-xs text-[#666257] mt-1">
              See how interior designers and customers style House of Hackney prints in their own sanctuaries.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                title: "Living Room Alcove",
                location: "London, UK",
                img: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=700&q=80",
              },
              {
                title: "Master Suite",
                location: "Cotswolds, England",
                img: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=700&q=80",
              },
              {
                title: "Dining Sanctuary",
                location: "Edinburgh, Scotland",
                img: "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=700&q=80",
              },
              {
                title: "Powder Room",
                location: "New York, USA",
                img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=700&q=80",
              },
            ].map((home, idx) => (
              <div key={idx} className="group relative aspect-[3/4] overflow-hidden rounded-sm bg-[#e8e2d7]">
                <img
                  src={home.img}
                  alt={home.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                  <p className="text-[9px] uppercase tracking-wider text-[#d8c4a5]">{home.location}</p>
                  <p className="font-serif text-sm text-white">{home.title}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

export default ProductDetails;
