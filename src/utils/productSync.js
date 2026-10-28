/**
 * House of Hackney Product Synchronization & Smart Stock Engine
 *
 * Ensures:
 * 1. Admin edits (name, price, stock, category, description, image) persist locally in localStorage
 *    and immediately reflect in the storefront (Products list, ProductDetails, Cart, etc.).
 * 2. Only 1-2 products per category are OUT_OF_STOCK by default, with all other creations in stock.
 * 3. Manual stock edits in the Admin Panel always take full precedence.
 */

const OVERRIDES_STORAGE_KEY = "hoh_product_overrides";
const CUSTOM_PRODUCTS_KEY = "hoh_custom_products";
const DELETED_PRODUCTS_KEY = "hoh_deleted_products";

// out-of-stock product ids

const DEFAULT_OUT_OF_STOCK_IDS = new Set([
  "6a76d06bb4a90fc1d5c9b943", // Wallpaper (1)
  "6a76d06ab4a90fc1d5c9b8fe", // Wallpaper (2)
  "6a76d067b4a90fc1d5c9b673", // Home Decor (1)
  "6a76d067b4a90fc1d5c9b5fd", // Home Decor (2)
  "6a76d065b4a90fc1d5c9b3de", // Fabric (1)
  "6a76d064b4a90fc1d5c9b3a4", // Fabric (2)
  "6a76d068b4a90fc1d5c9b7e6", // Paint (1)
  "6a76d068b4a90fc1d5c9b7ce", // Paint (2)
  "6a76d067b4a90fc1d5c9b64c", // Lighting (1)
  "6a76d066b4a90fc1d5c9b51d", // Furnishings (1)
  "6a76d066b4a90fc1d5c9b505", // Furnishings (2)
  "6a76d063b4a90fc1d5c9b273", // Apothecary (1)
]);

// Registered cache clearing callbacks
const cacheInvalidators = new Set();

export function registerCacheInvalidator(fn) {
  if (typeof fn === "function") {
    cacheInvalidators.add(fn);
  }
}

export function notifyProductChange() {
  cacheInvalidators.forEach((fn) => {
    try {
      fn();
    } catch {
      // ignore
    }
  });

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("hoh_catalog_updated"));
  }
}

/**
 * Get all product overrides from localStorage
 */
export function getProductOverrides() {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(OVERRIDES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/**
 * Save an override for a product (called by Admin updateProduct)
 */
export function saveProductOverride(id, updateData) {
  if (!id || typeof window === "undefined") return;
  try {
    const all = getProductOverrides();
    const existing = all[id] || {};
    all[id] = {
      ...existing,
      ...updateData,
      _id: id,
      id: id,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(all));
    notifyProductChange();
  } catch (err) {
    console.warn("Error saving product override:", err);
  }
}

/**
 * Get custom created products from localStorage
 */
export function getCustomProducts() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PRODUCTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Save a newly created product (called by Admin addProduct)
 */
export function saveCustomProduct(newProduct) {
  if (!newProduct || typeof window === "undefined") return;
  try {
    const all = getCustomProducts();
    const id = newProduct._id || newProduct.id || `prod_${Date.now()}`;
    const item = { ...newProduct, _id: id, id: id };
    const filtered = all.filter((p) => p._id !== id && p.id !== id);
    filtered.unshift(item);
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(filtered));
    notifyProductChange();
    return item;
  } catch (err) {
    console.warn("Error saving custom product:", err);
  }
}

/**
 * Get deleted product IDs
 */
export function getDeletedProductIds() {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_PRODUCTS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return new Set(arr);
  } catch {
    return new Set();
  }
}

/**
 * Mark a product as deleted (called by Admin deleteProduct)
 */
export function saveDeletedProductId(id) {
  if (!id || typeof window === "undefined") return;
  try {
    const delSet = getDeletedProductIds();
    delSet.add(id);
    localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(Array.from(delSet)));

    // Also remove from custom products or overrides if present
    const customs = getCustomProducts().filter((p) => p._id !== id && p.id !== id);
    localStorage.setItem(CUSTOM_PRODUCTS_KEY, JSON.stringify(customs));

    const overrides = getProductOverrides();
    delete overrides[id];
    localStorage.setItem(OVERRIDES_STORAGE_KEY, JSON.stringify(overrides));

    notifyProductChange();
  } catch (err) {
    console.warn("Error saving deleted product:", err);
  }
}

/**
 * Computes smart stock & inventory for a product:
 * - Honors admin overrides explicitly
 * - Guarantees only 1-2 products per category are out of stock
 * - Sets all other products in stock with healthy quantities (25-45 units)
 */
export function applySmartStock(product) {
  if (!product) return product;

  const id = String(product._id || product.id || "");

  
  const overrides = getProductOverrides();
  const override = overrides[id];
  if (override && override.stock !== undefined) {
    const numStock = Number(override.stock);
    const isOut = numStock <= 0 || override.status === "OUT_OF_STOCK";
    return {
      ...product,
      stock: numStock,
      inventory: {
        ...(product.inventory || {}),
        status: isOut ? "OUT_OF_STOCK" : "IN_STOCK",
        inStock: !isOut,
        availableQuantity: numStock,
      },
    };
  }

  
  if (DEFAULT_OUT_OF_STOCK_IDS.has(id)) {
    return {
      ...product,
      stock: 0,
      inventory: {
        ...(product.inventory || {}),
        status: "OUT_OF_STOCK",
        inStock: false,
        availableQuantity: 0,
      },
    };
  }

  
  
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  }
  const defaultQuantity = 24 + (Math.abs(hash) % 24); // 24 to 47 units

  return {
    ...product,
    stock: defaultQuantity,
    inventory: {
      ...(product.inventory || {}),
      status: "IN_STOCK",
      inStock: true,
      availableQuantity: defaultQuantity,
    },
  };
}

/**
 * Normalizes a product with admin overrides and smart stock
 */
export function syncProductData(product) {
  if (!product) return null;

  const id = String(product._id || product.id || "");
  const deletedIds = getDeletedProductIds();
  if (deletedIds.has(id)) {
    return null; // Product was removed
  }

  const overrides = getProductOverrides();
  const override = overrides[id] || {};

  // Merge override data
  const merged = {
    ...product,
    ...override,
    _id: id,
    id: id,
  };

  // Align pricing if override edited price
  if (override.price !== undefined) {
    const numPrice = Number(override.price);
    merged.price = numPrice;
    merged.pricing = {
      ...(merged.pricing || {}),
      sellingPrice: numPrice,
      basePrice: merged.pricing?.basePrice || numPrice,
    };
  }

  // Align category if override edited category
  if (override.category) {
    const catName = typeof override.category === "object" ? override.category.name : override.category;
    merged.categoryName = catName;
    merged.category = typeof merged.category === "object" && merged.category !== null
      ? { ...merged.category, name: catName }
      : { name: catName };
  }

  // Apply smart stock rule
  return applySmartStock(merged);
}
