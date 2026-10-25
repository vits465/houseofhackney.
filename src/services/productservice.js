import axiosInstance from "./axiosInstance";
import {
  syncProductData,
  getCustomProducts,
  getDeletedProductIds,
  registerCacheInvalidator,
} from "../utils/productSync";

const productsCache = new Map();
const productCache = new Map();
const mediaCache = new Map();
const variantsCache = new Map();
const pricingCache = new Map();
const specsCache = new Map();
const relatedCache = new Map();

// Automatically wipe memory caches whenever an admin makes a product change
registerCacheInvalidator(() => {
  productsCache.clear();
  productCache.clear();
  pricingCache.clear();
  variantsCache.clear();
  mediaCache.clear();
  specsCache.clear();
  relatedCache.clear();
});

export const clearProductCaches = () => {
  productsCache.clear();
  productCache.clear();
  pricingCache.clear();
  variantsCache.clear();
  mediaCache.clear();
  specsCache.clear();
  relatedCache.clear();
};

const getResponseData = (response) => {
  const body = response?.data;

  if (body?.success === false) {
    throw new Error(body.message || "API request failed");
  }

  return body;
};

const normalizeProductsResponse = (body) => {
  if (!body) return { products: [], pagination: null };

  let products = [];
  let pagination = body.pagination || null;

  if (Array.isArray(body.data)) {
    products = body.data;
  } else if (Array.isArray(body.data?.data)) {
    products = body.data.data;
    pagination = pagination || {
      page: body.data.page,
      limit: body.data.limit,
      total: body.data.total,
      totalPages: body.data.totalPages,
    };
  } else if (Array.isArray(body.products)) {
    products = body.products;
  } else if (Array.isArray(body)) {
    products = body;
  }

  // Prepend any custom products added via Admin
  const customProds = getCustomProducts();
  const deletedIds = getDeletedProductIds();

  // Combine custom products with backend products (preventing duplicates)
  const existingIds = new Set(customProds.map((c) => String(c._id || c.id)));
  const nonDuplicateBackend = products.filter(
    (p) => !existingIds.has(String(p._id || p.id))
  );
  const combined = [...customProds, ...nonDuplicateBackend];

  // Apply synchronization, admin overrides, and smart stock
  const synchronized = combined
    .filter((p) => p && !deletedIds.has(String(p._id || p.id || "")))
    .map((p) => syncProductData(p))
    .filter(Boolean);

  return { products: synchronized, pagination };
};

const cacheRequest = async (cache, key, requestFactory) => {
  if (cache.has(key)) return cache.get(key);

  const request = requestFactory();
  cache.set(key, request);

  try {
    return await request;
  } catch (error) {
    cache.delete(key);
    throw error;
  }
};

export const getProducts = (options = {}, maybeLimit) => {
  // Support both getProducts(page, limit) and getProducts({ page, limit, ... })
  let params = {};
  if (typeof options === "number") {
    params = { page: options, limit: maybeLimit || 20 };
  } else if (typeof options === "object") {
    params = { ...options };
  }

  const cacheKey = JSON.stringify(params);

  return cacheRequest(productsCache, cacheKey, async () => {
    const response = await axiosInstance.get("/products", { params });
    const body = getResponseData(response);
    return normalizeProductsResponse(body);
  });
};

export const getProductById = (productId) => {
  if (!productId) {
    return Promise.reject(new Error("Product ID or slug is missing."));
  }

  const id = String(productId).trim();

  // Check if this is a custom product created in Admin
  const customProds = getCustomProducts();
  const customMatch = customProds.find(
    (p) => String(p._id) === id || String(p.id) === id || String(p.slug) === id
  );
  if (customMatch) {
    return Promise.resolve(syncProductData(customMatch));
  }

  return cacheRequest(productCache, id, async () => {
    const response = await axiosInstance.get(`/products/${encodeURIComponent(id)}`);
    const body = getResponseData(response);
    const product = body?.data?.product ?? body?.data ?? body;

    if (!product || typeof product !== "object" || Array.isArray(product)) {
      throw new Error("Invalid product response.");
    }

    return syncProductData(product);
  });
};

/**
 * Fetch media associated with a product.
 */
export const getProductMedia = (productId) => {
  if (!productId) return Promise.resolve(null);
  const id = String(productId).trim();

  return cacheRequest(mediaCache, id, async () => {
    try {
      const response = await axiosInstance.get(`/products/${encodeURIComponent(id)}/media`);
      const body = getResponseData(response);
      return body?.data ?? null;
    } catch (error) {
      console.warn("Product media request failed:", error.message);
      return null;
    }
  });
};

/**
 * Fetch product variants.
 */
export const getProductVariants = (productId) => {
  if (!productId) return Promise.resolve([]);
  const id = String(productId).trim();

  return cacheRequest(variantsCache, id, async () => {
    try {
      const response = await axiosInstance.get(`/variants/product/${encodeURIComponent(id)}`);
      const body = getResponseData(response);
      const data = body?.data ?? body;

      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.variants)) return data.variants;
      if (Array.isArray(data?.items)) return data.items;

      return [];
    } catch (error) {
      console.warn("Product variants request failed:", error.message);
      return [];
    }
  });
};

/**
 * Fetch pricing details for a product.
 */
export const getProductPricing = (productId) => {
  if (!productId) return Promise.resolve(null);
  const id = String(productId).trim();

  return cacheRequest(pricingCache, id, async () => {
    try {
      const response = await axiosInstance.get(`/products/${encodeURIComponent(id)}/pricing`);
      const body = getResponseData(response);
      return body?.data?.pricing ?? body?.data ?? null;
    } catch (error) {
      console.warn("Product pricing request failed:", error.message);
      return null;
    }
  });
};

/**
 * Fetch technical specifications for a product.
 */
export const getProductSpecifications = (productId) => {
  if (!productId) return Promise.resolve(null);
  const id = String(productId).trim();

  return cacheRequest(specsCache, id, async () => {
    try {
      const response = await axiosInstance.get(`/products/${encodeURIComponent(id)}/specifications`);
      const body = getResponseData(response);
      return body?.data ?? null;
    } catch (error) {
      console.warn("Product specifications request failed:", error.message);
      return null;
    }
  });
};

/**
 * Fetch related products.
 */
export const getRelatedProducts = (productId) => {
  if (!productId) return Promise.resolve([]);
  const id = String(productId).trim();

  return cacheRequest(relatedCache, id, async () => {
    try {
      const response = await axiosInstance.get(`/products/${encodeURIComponent(id)}/related`);
      const body = getResponseData(response);
      const data = body?.data ?? [];
      return Array.isArray(data) ? data : [];
    } catch (error) {
      console.warn("Related products request failed:", error.message);
      return [];
    }
  });
};

export const getFacets = (params = {}) => {
  return axiosInstance.get("/filters/facets", { params }).then((res) => getResponseData(res)?.data || null);
};

export const filterProductsApi = (params = {}) => {
  return axiosInstance.get("/filters/products", { params }).then((res) => {
    const body = getResponseData(res);
    return normalizeProductsResponse(body);
  });
};

export const clearProductCache = (productId) => {
  productsCache.clear();

  if (productId) {
    const id = String(productId);
    productCache.delete(id);
    mediaCache.delete(id);
    variantsCache.delete(id);
    pricingCache.delete(id);
    specsCache.delete(id);
    relatedCache.delete(id);
  } else {
    productCache.clear();
    mediaCache.clear();
    variantsCache.clear();
    pricingCache.clear();
    specsCache.clear();
    relatedCache.clear();
  }
};

export default {
  getProducts,
  getProductById,
  getProductMedia,
  getProductVariants,
  getProductPricing,
  getProductSpecifications,
  getRelatedProducts,
  getFacets,
  filterProductsApi,
  clearProductCache,
};
