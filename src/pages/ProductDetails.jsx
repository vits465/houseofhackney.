import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
} from "lucide-react";

import {
  getProducts,
  getProductById,
  getProductMedia,
  getProductVariants,
  getProductPricing,
  getProductSpecifications,
  getRelatedProducts,
} from "../services/productservice";

import { getProductImage, optimizeImageUrl } from "../utils/getProductImage";
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
  const dispatch = useDispatch();

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
      const url = optimizeImageUrl(rawUrl.trim(), 1200);

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

  // Sample information - strictly validated against API
  const rawSample = pricing?.sample || product?.pricing?.sample;
  const rawSamplePrice = rawSample?.price;
  const hasValidSamplePrice =
    typeof rawSamplePrice === "number" &&
    !Number.isNaN(rawSamplePrice) &&
    rawSamplePrice > 0;
  const sampleSupported = Boolean(rawSample?.available === true && hasValidSamplePrice);
  const samplePrice = sampleSupported ? rawSamplePrice : null;
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
        {/* Back navigation */}
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 text-[10px] font-medium tracking-[1.5px] uppercase text-[#666257] hover:text-[#171713] transition"
        >
          <ArrowLeft size={14} />
          Back to Collection
        </Link>

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

            {/* Primary Main Display Image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-[#e8e2d7] rounded-sm shadow-sm flex items-center justify-center p-3 sm:p-5">
              {currentImage?.url ? (
                <img
                  src={optimizeImageUrl(currentImage.url, 1200)}
                  alt={currentImage.alt || product.name}
                  className="max-h-full max-w-full object-contain transition-opacity duration-300 drop-shadow-xs"
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
                <span className="absolute top-3 right-3 bg-stone-700/90 text-white text-[10px] font-medium uppercase px-2.5 py-1 tracking-wider shadow-sm">
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

            {/* Quantity Selector */}
            <div className={`mt-6 ${!inStock ? "opacity-50 pointer-events-none" : ""}`}>
              <label htmlFor="quantity" className="mb-2 block text-[10px] font-medium uppercase tracking-[1.5px] text-[#171713]">
                Quantity
              </label>

              <div className="flex h-11 w-36 items-center justify-between border border-[#d8d1c5] bg-white/50">
                <button
                  type="button"
                  disabled={!inStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  aria-label="Decrease quantity"
                  className="h-full w-10 flex items-center justify-center hover:bg-black/5 disabled:cursor-not-allowed"
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
                  className="h-full w-10 flex items-center justify-center hover:bg-black/5 disabled:cursor-not-allowed"
                >
                  <Plus size={13} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleAddToCart(false)}
                disabled={!inStock}
                className={`flex w-full items-center justify-center gap-3 px-6 py-4 text-[10px] font-semibold tracking-[2px] uppercase transition shadow-sm ${
                  inStock
                    ? "bg-[#394132] text-white hover:bg-[#26251f]"
                    : "bg-[#d5cec3] text-[#7d776c] cursor-not-allowed border border-[#c4bcaf]"
                }`}
              >
                <ShoppingBag size={16} />
                {inStock ? "Add to Bag" : "Out of Stock"}
              </button>

              {sampleSupported && samplePrice !== null && (
                <button
                  type="button"
                  onClick={() => handleAddToCart(true)}
                  className="flex w-full items-center justify-center gap-2 border border-[#394132] bg-transparent py-3 text-[10px] font-semibold tracking-[1.5px] uppercase text-[#394132] hover:bg-[#394132] hover:text-white transition"
                >
                  <Sparkles size={14} />
                  Order a Sample ({formatPrice(samplePrice, sampleCurrency)})
                </button>
              )}
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
                  className="flex w-full items-center justify-between py-4 text-left text-xs font-medium tracking-wide uppercase"
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
            </div>
          </div>
        </div>

        {/* Related Designs Section */}
        {relatedProducts.length > 0 && (
          <section className="mt-24 border-t border-[#d8d1c5] pt-16">
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
      </div>
    </main>
  );
}

export default ProductDetails;
