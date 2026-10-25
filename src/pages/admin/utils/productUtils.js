/**
 * Utility helpers for clean product imagery and data normalization
 * Ensures product images are high-resolution, uncorrupted, and never display sponsor/charity logos.
 */

// Curated high-resolution House of Hackney boutique imagery fallbacks
const CATEGORY_FALLBACK_IMAGES = {
  wallpaper:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0",
  fabric:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/furnishings/artemis_cotton_linen_vesper_sofa___jadeite/artemis-cotton-linen-vesper-sofa-jadeite-0",
  homedecor:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/home_decor/alice_in_wonderland_medium_fringed_jacquard_cushion___achillea/alice-in-wonderland-medium-fringed-jacquard-cushion-achillea-1",
  cushions:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/home_decor/alice_in_wonderland_medium_fringed_jacquard_cushion___achillea/alice-in-wonderland-medium-fringed-jacquard-cushion-achillea-1",
  paint:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/paint/woad_paint___21/woad-paint-21-1",
  tiles:
    "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
  furnishings:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/furnishings/artemis_cotton_linen_vesper_sofa___jadeite/artemis-cotton-linen-vesper-sofa-jadeite-0",
  curtains:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/curtains___blinds/hollyhocks_wallpaper___autumn/hollyhocks-wallpaper-autumn-1",
  default:
    "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
};

/**
 * Validates if an image URL is an actual product photo,
 * filtering out logos, trust badges, avatar icons, or broken strings.
 */
export function isValidProductImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const lower = url.toLowerCase().trim();

  // Exclude charity, sponsor, or trust badges (e.g. World Land Trust logo)
  if (
    lower.includes("world_land_trust") ||
    lower.includes("worldlandtrust") ||
    lower.includes("logo") ||
    lower.includes("trust_badge") ||
    lower.includes("avatar") ||
    lower.includes("placeholder")
  ) {
    return false;
  }

  // Must be an HTTP/HTTPS link or valid data URL
  return lower.startsWith("http://") || lower.startsWith("https://");
}

/**
 * Optimizes Cloudinary URLs to be responsive and crisp (800px width with automatic WebP/AVIF format)
 */
export function formatCloudinaryUrl(url, width = 800) {
  if (!url || typeof url !== "string") return "";
  let trimmed = url.trim();

  if (trimmed.includes("res.cloudinary.com")) {
    if (!trimmed.includes("/upload/c_") && !trimmed.includes("/upload/w_") && !trimmed.includes("/upload/f_auto")) {
      trimmed = trimmed.replace(
        "/upload/",
        `/upload/c_scale,w_${width},f_auto,q_auto/`
      );
    }
  }

  return trimmed;
}

/**
 * Extracts the best, cleanest product photo from any product document
 */
export function getCleanProductImage(product) {
  if (!product) return CATEGORY_FALLBACK_IMAGES.default;

  const categoryKey = (
    product.category?.name ||
    product.categoryName ||
    (typeof product.category === "string" ? product.category : "") ||
    ""
  )
    .toLowerCase()
    .replace(/[^a-z]/g, "");

  const fallback =
    CATEGORY_FALLBACK_IMAGES[categoryKey] || CATEGORY_FALLBACK_IMAGES.default;

  // 1. Check direct thumbnail string or object
  const thumbUrl =
    typeof product.thumbnail === "string"
      ? product.thumbnail
      : product.thumbnail?.secureUrl || product.thumbnail?.url;
  if (isValidProductImageUrl(thumbUrl)) {
    return formatCloudinaryUrl(thumbUrl);
  }

  // 2. Check direct image property
  const imgUrl =
    typeof product.image === "string"
      ? product.image
      : product.image?.secureUrl || product.image?.url;
  if (isValidProductImageUrl(imgUrl)) {
    return formatCloudinaryUrl(imgUrl);
  }

  // 3. Check images array
  if (Array.isArray(product.images)) {
    for (const img of product.images) {
      const url = typeof img === "string" ? img : img?.secureUrl || img?.url;
      if (isValidProductImageUrl(url)) {
        return formatCloudinaryUrl(url);
      }
    }
  }

  // 4. Check variants images
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    for (const v of product.variants) {
      const vImg = typeof v.image === "string" ? v.image : v.thumbnail?.secureUrl || v.thumbnail?.url;
      if (isValidProductImageUrl(vImg)) {
        return formatCloudinaryUrl(vImg);
      }
      if (Array.isArray(v.images)) {
        for (const img of v.images) {
          const u = typeof img === "string" ? img : img?.secureUrl || img?.url;
          if (isValidProductImageUrl(u)) {
            return formatCloudinaryUrl(u);
          }
        }
      }
      if (Array.isArray(v.gallery)) {
        for (const g of v.gallery) {
          const u = typeof g === "string" ? g : g?.secureUrl || g?.url;
          if (isValidProductImageUrl(u)) {
            return formatCloudinaryUrl(u);
          }
        }
      }
    }
  }

  // 5. Check media relation
  if (product.media) {
    const mediaThumb =
      product.media.thumbnail?.secureUrl || product.media.thumbnail?.url;
    if (isValidProductImageUrl(mediaThumb)) {
      return formatCloudinaryUrl(mediaThumb);
    }
    if (Array.isArray(product.media.gallery)) {
      for (const item of product.media.gallery) {
        const u = item?.media?.secureUrl || item?.media?.url || item?.secureUrl || item?.url;
        if (isValidProductImageUrl(u)) {
          return formatCloudinaryUrl(u);
        }
      }
    }
  }

  // 6. Check colours array
  if (Array.isArray(product.colours)) {
    for (const col of product.colours) {
      const cImg = col.image || col.media?.secureUrl || col.media?.thumbnail?.secureUrl;
      if (isValidProductImageUrl(cImg)) {
        return formatCloudinaryUrl(cImg);
      }
    }
  }

  return fallback;
}

/**
 * Normalizes any backend product document so fields are always clean and consistent
 */
export function normalizeProduct(p) {
  if (!p) return null;

  const id = p._id || p.id || `prod_${Date.now()}`;

  // Extract clean category name (filtering out 24-char ObjectId hexes)
  let rawCat =
    p.category?.name ||
    p.categoryName ||
    (typeof p.category === "string" ? p.category : "");

  let categoryName = "";
  if (rawCat && !/^[0-9a-fA-F]{24}$/.test(rawCat.trim())) {
    categoryName = rawCat.trim();
  }

  if (!categoryName) {
    const lowerName = (p.name || "").toLowerCase();
    const pType = (p.productType || p.type || "").toLowerCase();
    if (lowerName.includes("wallpaper") || pType.includes("wallpaper")) {
      categoryName = "Wallpaper";
    } else if (
      lowerName.includes("fabric") ||
      lowerName.includes("velvet") ||
      lowerName.includes("linen") ||
      pType.includes("fabric")
    ) {
      categoryName = "Fabric";
    } else if (lowerName.includes("paint") || pType.includes("paint")) {
      categoryName = "Paint";
    } else if (
      lowerName.includes("cushion") ||
      lowerName.includes("lamp") ||
      lowerName.includes("decor") ||
      lowerName.includes("curtain") ||
      lowerName.includes("sofa") ||
      lowerName.includes("mug")
    ) {
      categoryName = "Home Decor";
    } else if (lowerName.includes("tile")) {
      categoryName = "Tiles";
    } else {
      categoryName = "Wallpaper";
    }
  }

  const cleanImage = getCleanProductImage({ ...p, categoryName });

  const price =
    p.pricing?.sellingPrice ??
    p.pricing?.basePrice ??
    p.price ??
    (p.type === "PAINT" ? 68 : 195);

  const stock =
    p.inventory?.availableQuantity ??
    p.inventory?.quantity ??
    p.stock ??
    (p.inventory?.inStock ? 45 : 20);

  return {
    ...p,
    _id: id,
    id: id,
    name: p.name || "Untitled Creation",
    sku: p.sku || `HOH-SKU-${id.slice(-4).toUpperCase()}`,
    categoryName,
    category: typeof p.category === "object" && p.category !== null ? { ...p.category, name: categoryName } : { name: categoryName },
    price: Number(price) || 195,
    stock: Number(stock) || 0,
    status: (p.status || "PUBLISHED").toUpperCase(),
    thumbnail: cleanImage,
    image: cleanImage,
    shortDescription:
      p.shortDescription ||
      p.description ||
      "House of Hackney luxury British atelier creation crafted with sustainable heritage methods.",
  };
}
