import { useState, useEffect } from "react";
import userService from "../services/userService";
import { showToast } from "./sweetAlert";

const STORAGE_KEY = "hoh_wishlist_items";

// Helper to read stored wishlist items
export function getStoredWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Helper to save wishlist items
export function saveStoredWishlist(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event("hoh-wishlist-change"));
  } catch (err) {
    console.error("Failed to save wishlist to localStorage", err);
  }
}

// Check if a product is in the wishlist
export function isProductWishlisted(productId) {
  if (!productId) return false;
  const items = getStoredWishlist();
  const idStr = String(productId);
  return items.some((item) => String(item._id || item.id || item.productId) === idStr);
}

// Toggle wishlist item and sync with backend if possible
export function toggleWishlistItem(product) {
  if (!product) return false;

  const productId = String(product._id || product.id || product.productId);
  const currentItems = getStoredWishlist();
  const exists = currentItems.some(
    (item) => String(item._id || item.id || item.productId) === productId
  );

  let updated;

  if (exists) {
    updated = currentItems.filter(
      (item) => String(item._id || item.id || item.productId) !== productId
    );
    saveStoredWishlist(updated);
    showToast("Removed from wishlist");

    // Async backend sync if user has token
    if (sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken")) {
      userService.removeFromWishlist(productId).catch(() => {});
    }
    return false;
  } else {
    const newItem = {
      _id: productId,
      id: productId,
      productId: productId,
      name: product.name || product.title || "House of Hackney Creation",
      title: product.name || product.title || "House of Hackney Creation",
      price: product.pricing?.sellingPrice ?? product.price ?? 125,
      currency: product.pricing?.currency || product.currency || "GBP",
      category: product.category,
      colours: product.colours || [],
      images: product.images || [],
      image: product.image || product.media?.thumbnail?.url || "",
      slug: product.slug || productId,
    };
    updated = [newItem, ...currentItems];
    saveStoredWishlist(updated);
    showToast("Added to wishlist");

    // Async backend sync if user has token
    if (sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken")) {
      userService.addToWishlist(productId).catch(() => {});
    }
    return true;
  }
}

// Remove single item from wishlist
export function removeWishlistItem(productId) {
  const currentItems = getStoredWishlist();
  const updated = currentItems.filter(
    (item) => String(item._id || item.id || item.productId) !== String(productId)
  );
  saveStoredWishlist(updated);
  showToast("Removed from wishlist");

  if (sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken")) {
    userService.removeFromWishlist(productId).catch(() => {});
  }
}

// Clear all items from wishlist
export function clearAllWishlist() {
  saveStoredWishlist([]);
  showToast("Wishlist cleared");

  if (sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken")) {
    userService.clearWishlist().catch(() => {});
  }
}

// React hook to subscribe to wishlist changes
export function useWishlist() {
  const [items, setItems] = useState(getStoredWishlist);

  useEffect(() => {
    const handleUpdate = () => {
      setItems(getStoredWishlist());
    };

    window.addEventListener("hoh-wishlist-change", handleUpdate);
    window.addEventListener("storage", handleUpdate);

    return () => {
      window.removeEventListener("hoh-wishlist-change", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  const isWishlisted = (id) => {
    if (!id) return false;
    const str = String(id);
    return items.some((item) => String(item._id || item.id || item.productId) === str);
  };

  return {
    items,
    count: items.length,
    isWishlisted,
    toggleWishlist: toggleWishlistItem,
    removeItem: removeWishlistItem,
    clearAll: clearAllWishlist,
  };
}
