/**
 * Optimizes Cloudinary URLs to ensure full-resolution, crisp image delivery
 * preventing low-res blurriness.
 */
export function optimizeImageUrl(rawUrl, width = 900) {
  if (typeof rawUrl !== "string" || !rawUrl.trim()) return rawUrl || "";
  let s = rawUrl.trim();
  if (s.includes("res.cloudinary.com")) {
    // If it has low-res width parameters (e.g. w_40, w_100, w_200, c_thumb), upgrade them to high-res
    if (s.includes("/w_") || s.includes(",w_") || s.includes("/upload/w_") || s.includes("c_thumb")) {
      s = s.replace(/w_\d+/g, `w_${width}`).replace(/c_thumb/g, "c_scale");
    } else if (!s.includes("/upload/c_") && !s.includes("/upload/w_") && !s.includes("/upload/f_auto")) {
      s = s.replace("/upload/", `/upload/c_scale,w_${width},f_auto,q_auto/`);
    }
    // Append version cache-buster so browsers don't serve stale 40px cached previews
    if (!s.includes("v=")) {
      const sep = s.includes("?") ? "&" : "?";
      s = `${s}${sep}v=hoh2026_hires`;
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
    if (s.startsWith("http://") || s.startsWith("https://") || s.startsWith("/")) {
      return { url: optimizeImageUrl(s), alt: "Product image" };
    }
  }

  const records = Array.isArray(source) ? source : [source];

  for (const record of records) {
    if (!record) continue;

    if (typeof record === "string" && record.trim()) {
      return { url: optimizeImageUrl(record.trim()), alt: "Product image" };
    }

    const altText =
      record?.name ||
      record?.title ||
      record?.altText ||
      record?.alt ||
      record?.product?.name ||
      "Product image";

    // 2. Direct string properties on product/variant
    if (typeof record.thumbnail === "string" && record.thumbnail.trim()) {
      return { url: optimizeImageUrl(record.thumbnail.trim()), alt: altText };
    }

    if (typeof record.image === "string" && record.image.trim()) {
      return { url: optimizeImageUrl(record.image.trim()), alt: altText };
    }

    // 3. Array of image strings
    if (Array.isArray(record.images) && record.images.length > 0) {
      for (const img of record.images) {
        if (typeof img === "string" && img.trim()) {
          return { url: optimizeImageUrl(img.trim()), alt: altText };
        }
        if (img && typeof img === "object") {
          const u = img.secureUrl || img.url;
          if (u && typeof u === "string") {
            return { url: optimizeImageUrl(u.trim()), alt: img.altText || altText };
          }
        }
      }
    }

    // 4. Object thumbnail
    const thumbUrl = record.thumbnail?.secureUrl || record.thumbnail?.url;
    if (typeof thumbUrl === "string" && thumbUrl.trim()) {
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
      if (typeof u === "string" && u.trim()) {
        return {
          url: optimizeImageUrl(u.trim()),
          alt: mediaObj.altText || item?.altText || altText,
        };
      }
    }

    // 6. Direct secureUrl or url on the object itself
    const directUrl = record.secureUrl || record.url || record.src;
    if (typeof directUrl === "string" && directUrl.trim()) {
      return { url: optimizeImageUrl(directUrl.trim()), alt: altText };
    }

    // 7. Check variants array on product
    if (Array.isArray(record.variants) && record.variants.length > 0) {
      for (const variant of record.variants) {
        if (!variant) continue;
        const vImg = getProductImage(variant);
        if (vImg?.url) {
          return { url: vImg.url, alt: variant.title || altText };
        }
      }
    }

    // 8. Check colours array on product
    if (Array.isArray(record.colours) && record.colours.length > 0) {
      for (const col of record.colours) {
        if (!col) continue;
        const cUrl = col.image || col.media?.thumbnail?.secureUrl || col.media?.thumbnail?.url || col.media?.image;
        if (typeof cUrl === "string" && cUrl.trim()) {
          return { url: optimizeImageUrl(cUrl.trim()), alt: col.name || altText };
        }
      }
    }

    // 9. Check product media relation directly
    if (record.media && typeof record.media === "object") {
      const pmImg = getProductImage(record.media);
      if (pmImg?.url) {
        return pmImg;
      }
    }
  }

  return null;
}

export default getProductImage;
