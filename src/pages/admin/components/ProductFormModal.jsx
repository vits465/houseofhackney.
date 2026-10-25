import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Check, Image, Layers, RefreshCw } from "lucide-react";
import { useAdmin } from "../AdminContext";
import { showToast } from "../../../utils/sweetAlert";

const PRESET_PRODUCT_IMAGES = [
  {
    label: "Babylon Willow Wallpaper",
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_600,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0",
  },
  {
    label: "Artemis Velvet Jadeite",
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_600,f_auto,q_auto/house_of_hackney/furnishings/artemis_cotton_linen_vesper_sofa___jadeite/artemis-cotton-linen-vesper-sofa-jadeite-0",
  },
  {
    label: "Alice Jacquard Cushion",
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_600,f_auto,q_auto/house_of_hackney/home_decor/alice_in_wonderland_medium_fringed_jacquard_cushion___achillea/alice-in-wonderland-medium-fringed-jacquard-cushion-achillea-1",
  },
  {
    label: "Woad Mineral Paint",
    url: "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_600,f_auto,q_auto/house_of_hackney/paint/woad_paint___21/woad-paint-21-1",
  },
  {
    label: "Phantasia Botanical Fabric",
    url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Gothic Garden Tile",
    url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
  },
];

export default function ProductFormModal({ isOpen, onClose, editingProduct = null }) {
  const { theme, addProduct, editProduct } = useAdmin();
  const isDark = theme === "dark";

  const isEditing = Boolean(editingProduct);

  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "Home Decor",
    productType: "SIMPLE",
    price: 195,
    stock: 25,
    status: "PUBLISHED",
    visibility: "PUBLIC",
    isTradeAvailable: true,
    isFeatured: false,
    shortDescription: "",
    thumbnail: PRESET_PRODUCT_IMAGES[0].url,
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setForm({
        name: editingProduct.name || "",
        sku: editingProduct.sku || "",
        category: editingProduct.category?.name || editingProduct.categoryName || "Home Decor",
        productType: editingProduct.productType || "SIMPLE",
        price: editingProduct.price !== undefined ? editingProduct.price : 195,
        stock: editingProduct.stock !== undefined ? editingProduct.stock : 25,
        status: editingProduct.status || "PUBLISHED",
        visibility: editingProduct.visibility || "PUBLIC",
        isTradeAvailable: editingProduct.isTradeAvailable !== undefined ? editingProduct.isTradeAvailable : true,
        isFeatured: Boolean(editingProduct.isFeatured),
        shortDescription: editingProduct.shortDescription || "",
        thumbnail: editingProduct.thumbnail || editingProduct.image || PRESET_PRODUCT_IMAGES[0].url,
      });
    } else {
      // Default new product
      const randomSku = `HOH-ART-${Math.floor(100 + Math.random() * 900)}`;
      setForm({
        name: "",
        sku: randomSku,
        category: "Wallpaper",
        productType: "SIMPLE",
        price: 220,
        stock: 50,
        status: "PUBLISHED",
        visibility: "PUBLIC",
        isTradeAvailable: true,
        isFeatured: false,
        shortDescription: "Luxury British artisanal creation manufactured with sustainable heritage methods.",
        thumbnail: PRESET_PRODUCT_IMAGES[0].url,
      });
    }
  }, [editingProduct, isOpen]);

  if (!isOpen) return null;

  const handleGenerateSku = () => {
    const catCode = form.category.slice(0, 3).toUpperCase();
    const code = `HOH-${catCode}-${Math.floor(100 + Math.random() * 900)}`;
    setForm({ ...form, sku: code });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await editProduct(editingProduct._id || editingProduct.id, {
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        });
        showToast("Product updated successfully in atelier catalog!");
      } else {
        await addProduct({
          ...form,
          price: Number(form.price),
          stock: Number(form.stock),
        });
        showToast("New product created and published to catalog!");
      }
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className={`relative w-full max-w-3xl rounded-3xl border shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col ${
            isDark
              ? "bg-[#141a15] border-[#253327] text-[#f2f7f3]"
              : "bg-white border-[#dce8df] text-[#142617]"
          }`}
        >
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-inherit flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#3e7b52]/15 text-[#3e7b52] flex items-center justify-center">
                <Sparkles size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold tracking-tight">
                  {isEditing ? "Edit Product Creation" : "Create New Luxury Product"}
                </h3>
                <p className="text-xs text-[#627766] mt-0.5">
                  {isEditing
                    ? `Updating specification for SKU: ${form.sku}`
                    : "Register new creation directly into backend catalog"}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className={`p-1.5 rounded-full transition-colors ${
                isDark ? "hover:bg-[#1d271f] text-[#859b89]" : "hover:bg-[#edf6f0] text-[#627766]"
              }`}
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4.5 overflow-y-auto flex-1">
            {/* Top row: Name & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Artemis Velvet Wallpaper - Wild Flora"
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none font-medium ${
                    isDark
                      ? "bg-[#1c271e] border-[#2e3f31] text-white"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold uppercase text-[#627766]">
                    SKU Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateSku}
                    className="text-[10px] text-[#3e7b52] font-bold hover:underline flex items-center gap-0.5"
                  >
                    <RefreshCw size={10} /> Auto
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none font-mono font-bold uppercase ${
                    isDark
                      ? "bg-[#1c271e] border-[#2e3f31] text-[#7ec792]"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#285735]"
                  }`}
                />
              </div>
            </div>

            {/* Category, Price, Stock */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={`w-full px-3 py-2 text-xs rounded-xl border outline-none font-medium ${
                    isDark
                      ? "bg-[#1c271e] border-[#2e3f31] text-white"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                  }`}
                >
                  <option value="Wallpaper">Wallpaper</option>
                  <option value="Fabric">Fabric</option>
                  <option value="Home Decor">Home Decor / Cushions</option>
                  <option value="Paint">Paint</option>
                  <option value="Tiles">Tiles</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1">
                  Retail Price (£ GBP) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none font-bold ${
                    isDark
                      ? "bg-[#1c271e] border-[#2e3f31] text-white"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1">
                  Stock Units Available *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none font-bold ${
                    isDark
                      ? "bg-[#1c271e] border-[#2e3f31] text-white"
                      : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                  }`}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1">
                Editorial Description & Substrate Notes
              </label>
              <textarea
                rows="2"
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                placeholder="Product characteristics, material composition, artisan details..."
                className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none resize-none ${
                  isDark
                    ? "bg-[#1c271e] border-[#2e3f31] text-white"
                    : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                }`}
              />
            </div>

            {/* Image Selection with Presets */}
            <div>
              <label className="block text-[11px] font-semibold uppercase text-[#627766] mb-1.5 flex items-center gap-1.5">
                <Image size={13} /> Product Imagery
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {/* Live Preview */}
                <div className="w-24 h-24 rounded-2xl overflow-hidden border border-inherit shrink-0 bg-stone-100 dark:bg-stone-900 shadow-sm">
                  <img
                    src={form.thumbnail}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 w-full space-y-2">
                  <input
                    type="url"
                    value={form.thumbnail}
                    onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
                    placeholder="Enter image URL..."
                    className={`w-full px-3.5 py-2 text-xs rounded-xl border outline-none font-mono ${
                      isDark
                        ? "bg-[#1c271e] border-[#2e3f31] text-white"
                        : "bg-[#f9fbf9] border-[#d8e6dc] text-[#142617]"
                    }`}
                  />

                  {/* Preset chips */}
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_PRODUCT_IMAGES.map((img, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setForm({ ...form, thumbnail: img.url })}
                        className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                          form.thumbnail === img.url
                            ? "bg-[#3e7b52] text-white font-bold"
                            : isDark
                            ? "border-[#2c3e2f] text-[#8fa894] hover:bg-[#202f23]"
                            : "border-[#d8e6dc] text-[#526956] hover:bg-[#edf6f0]"
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Publication Status & B2B Trade Toggles */}
            <div
              className={`p-4 rounded-2xl border grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs ${
                isDark
                  ? "bg-[#18231a] border-[#28392b]"
                  : "bg-[#edf6f0] border-[#d4e6d7]"
              }`}
            >
              <div>
                <label className="block text-[11px] font-semibold text-[#627766] mb-1">
                  Catalog Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={`w-full px-2.5 py-1.5 text-xs rounded-lg border outline-none font-bold ${
                    isDark
                      ? "bg-[#1f2c21] border-[#314633] text-white"
                      : "bg-white border-[#d8e6dc] text-[#142617]"
                  }`}
                >
                  <option value="PUBLISHED">PUBLISHED (Live)</option>
                  <option value="DRAFT">DRAFT (Hidden)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="tradeAvailable"
                  checked={form.isTradeAvailable}
                  onChange={(e) => setForm({ ...form, isTradeAvailable: e.target.checked })}
                  className="w-4 h-4 text-[#3e7b52] rounded accent-[#3e7b52]"
                />
                <label htmlFor="tradeAvailable" className="font-semibold cursor-pointer">
                  Eligible for Trade B2B Wholesale
                </label>
              </div>

              <div className="flex items-center gap-2 pt-4">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-[#3e7b52] rounded accent-[#3e7b52]"
                />
                <label htmlFor="isFeatured" className="font-semibold cursor-pointer">
                  Feature in Atelier Spotlight
                </label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-inherit">
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${
                  isDark
                    ? "border-[#2e3f31] text-[#9db3a1] hover:text-white"
                    : "border-[#d8e6dc] text-[#526956] hover:text-[#142617]"
                }`}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all flex items-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Check size={14} />
                {submitting
                  ? "Saving..."
                  : isEditing
                  ? "Save Changes (PUT /products/:id)"
                  : "Publish Creation (POST /products)"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
