/**
 * House of Hackney Storefront Image Optimization & High-Resolution Resolver
 *
 * Ensures all product images across the storefront (Catalog, Details, Cart, QuickView)
 * are crystal clear, uncorrupted, and never display sponsor/charity logos.
 */

const ICONIC_PRODUCT_FALLBACKS = {
  artemis:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/wallpaper/artemis_wallpaper___blush/artemis-wallpaper-blush-0",
  bambusa:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0",
  "gothic-garden":
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/wallpaper/gaia_wallpaper___prussian_blue/gaia-wallpaper-prussian-blue-0",
  "gothic garden":
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/wallpaper/gaia_wallpaper___prussian_blue/gaia-wallpaper-prussian-blue-0",
};

const CATEGORY_DEFAULT_IMAGES = {
  wallpaper:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0",
  fabric:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/wallpaper/artemis_wallpaper___blush/artemis-wallpaper-blush-0",
  homedecor:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/home_decor/alice_in_wonderland_medium_fringed_jacquard_cushion___achillea/alice-in-wonderland-medium-fringed-jacquard-cushion-achillea-1",
  cushions:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/home_decor/alice_in_wonderland_medium_fringed_jacquard_cushion___achillea/alice-in-wonderland-medium-fringed-jacquard-cushion-achillea-1",
  paint:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/paint/woad_paint___21/woad-paint-21-1",
  furnishings:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/furnishings/wild_card_kenton_small_ottoman___butterscotch/wild-card-kenton-small-ottoman-butterscotch-0",
  curtains:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/wallpaper/plantasia_wallpaper___sage/plantasia-wallpaper-sage-0",
  default:
    "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_1200,f_auto,q_auto/house_of_hackney/wallpaper/artemis_wallpaper___petrol/artemis-wallpaper-petrol-0",
};

/**
 * Validates whether an image URL is a real product photo and not a charity logo or corrupted asset
 */
export function isValidImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  const s = url.toLowerCase().trim();

  if (
    s.includes("world_land_trust") ||
    s.includes("worldlandtrust") ||
    s.includes("artemis-cotton-linen-vesper-sofa-jadeite-0") ||
    s.includes("hollyhocks-wallpaper-autumn-1") ||
    s.includes("logo") ||
    s.includes("trust_badge") ||
    s.includes("avatar") ||
    s.includes("placeholder")
  ) {
    return false;
  }

  return s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/");
}

/**
 * Optimizes Cloudinary URLs to ensure full-resolution, crisp image delivery
 * preventing low-res blurriness.
 */
export function optimizeImageUrl(rawUrl, width = 1200) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return rawUrl || "";
  let s = rawUrl.trim();
  if (s.includes("res.cloudinary.com")) {
    if (s.includes("/w_") || s.includes(",w_") || s.includes("/upload/w_") || s.includes("c_thumb")) {
      s = s.replace(/w_\d+/g, `w_${width}`).replace(/c_thumb/g, "c_scale");
    } else if (!s.includes("/upload/c_") && !s.includes("/upload/w_") && !s.includes("/upload/f_auto")) {
      s = s.replace("/upload/", `/upload/c_scale,w_${width},f_auto,q_auto/`);
    }
    return s;
  }
  return s;
}

/**
 * Robustly extracts the primary valid image URL and alt text from any source:
 * - Direct string URL
 * - Product document (thumbnail, images)
 * - Variant document (image, thumbnail, images)
 * - ProductMedia document (thumbnail, gallery)
 * - Media record
 */
export function getProductImage(source) {
  if (!source) return null;

  // 1. Direct string URL
  if (typeof source === "string" && source.trim()) {
    const s = source.trim();
    if (isValidImageUrl(s)) {
      return { url: optimizeImageUrl(s), alt: "Product image" };
    }
  }

  const records = Array.isArray(source) ? source : [source];

  for (const record of records) {
    if (!record) continue;

    if (typeof record === "string" && record.trim()) {
      if (isValidImageUrl(record.trim())) {
        return { url: optimizeImageUrl(record.trim()), alt: "Product image" };
      }
    }

    const altText =
      record?.name ||
      record?.title ||
      record?.altText ||
      record?.alt ||
      record?.product?.name ||
      "Product image";

    // 2. Direct string properties on product/variant
    if (typeof record.thumbnail === "string" && isValidImageUrl(record.thumbnail)) {
      return { url: optimizeImageUrl(record.thumbnail.trim()), alt: altText };
    }

    if (typeof record.image === "string" && isValidImageUrl(record.image)) {
      return { url: optimizeImageUrl(record.image.trim()), alt: altText };
    }

    // 3. Array of image strings
    if (Array.isArray(record.images) && record.images.length > 0) {
      for (const img of record.images) {
        if (typeof img === "string" && isValidImageUrl(img)) {
          return { url: optimizeImageUrl(img.trim()), alt: altText };
        }
        if (img && typeof img === "object") {
          const u = img.secureUrl || img.url;
          if (typeof u === "string" && isValidImageUrl(u)) {
            return { url: optimizeImageUrl(u.trim()), alt: img.altText || altText };
          }
        }
      }
    }

    // 4. Object thumbnail
    const thumbUrl = record.thumbnail?.secureUrl || record.thumbnail?.url;
    if (typeof thumbUrl === "string" && isValidImageUrl(thumbUrl)) {
      return {
        url: optimizeImageUrl(thumbUrl.trim()),
        alt: record.thumbnail?.altText || altText,
      };
    }

    // 5. Gallery items
    const galleryItems = Array.isArray(record.gallery) ? record.gallery : [];
    for (const item of galleryItems) {
      const mediaObj = item?.media || item;
      const u = mediaObj?.secureUrl || mediaObj?.url;
      if (typeof u === "string" && isValidImageUrl(u)) {
        return {
          url: optimizeImageUrl(u.trim()),
          alt: mediaObj.altText || item?.altText || altText,
        };
      }
    }

    // 6. Direct secureUrl or url on the object itself
    const directUrl = record.secureUrl || record.url || record.src;
    if (typeof directUrl === "string" && isValidImageUrl(directUrl)) {
      return { url: optimizeImageUrl(directUrl.trim()), alt: altText };
    }

    // 7. Check variants array on product
    if (Array.isArray(record.variants) && record.variants.length > 0) {
      for (const variant of record.variants) {
        if (!variant) continue;
        const vImg = getProductImage(variant);
        if (vImg?.url && isValidImageUrl(vImg.url)) {
          return { url: vImg.url, alt: variant.title || altText };
        }
      }
    }

    // 8. Check colours array on product
    if (Array.isArray(record.colours) && record.colours.length > 0) {
      for (const col of record.colours) {
        if (!col) continue;
        const cUrl = col.image || col.media?.thumbnail?.secureUrl || col.media?.thumbnail?.url || col.media?.image;
        if (typeof cUrl === "string" && isValidImageUrl(cUrl)) {
          return { url: optimizeImageUrl(cUrl.trim()), alt: col.name || altText };
        }
      }
    }

    // 9. Check product media relation directly
    if (record.media && typeof record.media === "object") {
      const pmImg = getProductImage(record.media);
      if (pmImg?.url && isValidImageUrl(pmImg.url)) {
        return pmImg;
      }
    }

    // 10. Check if product name matches iconic creations
    const nameKey = (record.name || record.title || record.slug || "").toLowerCase();
    for (const [key, fallbackUrl] of Object.entries(ICONIC_PRODUCT_FALLBACKS)) {
      if (nameKey.includes(key)) {
        return { url: fallbackUrl, alt: altText };
      }
    }

    // 11. Category Fallback
    const catKey = (record.category?.name || record.categoryName || (typeof record.category === "string" ? record.category : "") || "")
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    const catFallback = CATEGORY_DEFAULT_IMAGES[catKey] || CATEGORY_DEFAULT_IMAGES.default;
    return { url: catFallback, alt: altText };
  }

  return { url: CATEGORY_DEFAULT_IMAGES.default, alt: "House of Hackney Luxury Creation" };
}

export default getProductImage;
