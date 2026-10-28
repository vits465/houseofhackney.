import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Edit2,
  ExternalLink,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  Tag,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Palette,
  Maximize2,
  ShoppingBag,
  Info,
} from "lucide-react";
import { useAdmin } from "../AdminContext";
import { getCleanProductImage, isValidProductImageUrl, formatCloudinaryUrl } from "../utils/productUtils";
import { showToast } from "../../../utils/sweetAlert";

export default function ProductDetailModal() {
  const {
    theme,
    viewingProduct,
    viewProductModalOpen,
    closeViewProductModal,
    openEditProductModal,
  } = useAdmin();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("specifications"); // 'specifications' | 'variants' | 'pricing' | 'story'
  const [copiedField, setCopiedField] = useState(null);
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  if (!viewProductModalOpen || !viewingProduct) return null;

  const prod = viewingProduct;

  // Gather all unique validated images
  const allImages = [];
  const primaryThumb = getCleanProductImage(prod);
  if (primaryThumb) allImages.push(primaryThumb);

  const pushIfValid = (rawUrl) => {
    if (!rawUrl || typeof rawUrl !== "string") return;
    if (!isValidProductImageUrl(rawUrl)) return;
    const formatted = formatCloudinaryUrl(rawUrl, 1400);
    if (!allImages.includes(formatted)) {
      allImages.push(formatted);
    }
  };

  if (Array.isArray(prod.images)) {
    prod.images.forEach((img) => {
      const url = typeof img === "string" ? img : img?.secureUrl || img?.url;
      pushIfValid(url);
    });
  }

  if (Array.isArray(prod.media?.gallery)) {
    prod.media.gallery.forEach((it) => {
      const url = it?.secureUrl || it?.url || it?.media?.secureUrl;
      pushIfValid(url);
    });
  }

  if (Array.isArray(prod.variants)) {
    prod.variants.forEach((v) => {
      const vUrl = v?.image || v?.thumbnail?.secureUrl || v?.thumbnail?.url;
      pushIfValid(vUrl);
    });
  }

  const activeImage = allImages[selectedImgIndex] || primaryThumb;

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    showToast(`Copied ${fieldName} to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleEditClick = () => {
    closeViewProductModal();
    openEditProductModal(prod);
  };

  const catName =
    prod.category?.name ||
    prod.categoryName ||
    (typeof prod.category === "string" && !/^[0-9a-fA-F]{24}$/.test(prod.category)
      ? prod.category
      : "Wallpaper");

  const brandName = prod.brand?.name || "House of Hackney";
  const collectionName = prod.collection?.name || "Atelier Heritage";
  const price = prod.price || prod.pricing?.sellingPrice || prod.pricing?.basePrice || 195;
  const basePrice = prod.pricing?.basePrice || price;
  const samplePrice = prod.pricing?.sample?.price ?? 4;
  const isSampleAvailable = prod.pricing?.sample?.available ?? true;
  const stock = prod.stock ?? prod.inventory?.availableQuantity ?? 0;
  const isOutOfStock = stock <= 0 || prod.inventory?.status === "OUT_OF_STOCK";

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeViewProductModal}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={`relative w-full max-w-5xl rounded-3xl border shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col ${
            isDark
              ? "bg-[#141b16] border-[#253628] text-[#f2f7f3]"
              : "bg-white border-[#dbe6de] text-[#142617]"
          }`}
        >
          
          <div
            className={`px-6 py-4 border-b flex items-center justify-between gap-4 backdrop-blur-md ${
              isDark
                ? "bg-[#18221b]/95 border-[#253528]"
                : "bg-[#f8fbf9]/95 border-[#e8efe9]"
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-9 h-9 rounded-2xl bg-[#3e7b52]/15 text-[#3e7b52] flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold tracking-tight truncate">
                    {prod.name}
                  </h2>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      prod.status === "PUBLISHED" || prod.status === "ACTIVE"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {prod.status || "PUBLISHED"}
                  </span>
                  {prod.isTradeAvailable && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3e7b52]/15 text-[#3e7b52] flex items-center gap-1">
                      <ShieldCheck size={11} /> Trade Eligible
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-[#627766] mt-0.5 font-mono">
                  <span>SKU: {prod.sku}</span>
                  <span>•</span>
                  <span>Category: {catName}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleEditClick}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#3e7b52] hover:bg-[#326743] text-white text-xs font-bold transition-all shadow-sm shadow-[#3e7b52]/25 cursor-pointer"
              >
                <Edit2 size={13} />
                <span>Edit Product</span>
              </button>

              <button
                onClick={closeViewProductModal}
                className={`p-2 rounded-full transition-colors cursor-pointer ${
                  isDark
                    ? "hover:bg-[#202d23] text-[#8ea392]"
                    : "hover:bg-[#edf4ef] text-[#556959]"
                }`}
                title="Close"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Body Canvas (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
              {/* Left Column: Visuals & Quick specs (5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                {/* Main Hero Viewer */}
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-black/5 border border-inherit group">
                  <img
                    src={activeImage}
                    alt={prod.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-md">
                      {catName}
                    </span>
                    {prod.collection?.name && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#3e7b52]/90 text-white backdrop-blur-md">
                        {prod.collection.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Thumbnail Strip */}
                {allImages.length > 1 && (
                  <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
                    {allImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImgIndex(idx)}
                        className={`w-14 h-14 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                          selectedImgIndex === idx
                            ? "border-[#3e7b52] scale-105 shadow-md shadow-[#3e7b52]/20"
                            : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={img}
                          alt={`Thumbnail ${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Quick Meta Card */}
                <div
                  className={`p-4 rounded-2xl border space-y-2.5 text-xs font-sans ${
                    isDark ? "bg-[#18231a] border-[#263728]" : "bg-[#f8fbf9] border-[#e4ede6]"
                  }`}
                >
                  <div className="flex items-center justify-between py-1 border-b border-inherit">
                    <span className="text-[#627766]">Product ID</span>
                    <button
                      onClick={() => handleCopy(prod._id || prod.id, "Product ID")}
                      className="font-mono font-bold text-[#3e7b52] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {prod._id || prod.id}
                      {copiedField === "Product ID" ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-inherit">
                    <span className="text-[#627766]">Master SKU</span>
                    <button
                      onClick={() => handleCopy(prod.sku, "SKU")}
                      className="font-mono font-bold text-[#3e7b52] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {prod.sku}
                      {copiedField === "SKU" ? <Check size={11} /> : <Copy size={11} />}
                    </button>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-inherit">
                    <span className="text-[#627766]">Brand Atelier</span>
                    <span className="font-semibold">{brandName}</span>
                  </div>

                  <div className="flex items-center justify-between py-1">
                    <span className="text-[#627766]">Product Type</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3e7b52]/10 text-[#3e7b52]">
                      {prod.productType || "SIMPLE"}
                    </span>
                  </div>
                </div>

                {/* Mobile Edit Button */}
                <button
                  onClick={handleEditClick}
                  className="sm:hidden w-full flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-[#3e7b52] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  <Edit2 size={13} />
                  <span>Edit Product Specifications</span>
                </button>
              </div>

              {/* Right Column: Full Specifications & Commerce (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* commercial pricing & stock dashboard */}
                <div
                  className={`p-5 rounded-3xl border grid grid-cols-2 sm:grid-cols-4 gap-4 shadow-sm ${
                    isDark ? "bg-[#18231a] border-[#263728]" : "bg-white border-[#e0ebe2]"
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#627766] block">
                      Selling Price
                    </span>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-[#3e7b52] mt-0.5">
                      £{price}
                    </p>
                    {basePrice > price && (
                      <span className="text-[11px] line-through text-[#859b89]">
                        £{basePrice}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#627766] block">
                      Inventory Units
                    </span>
                    <p
                      className={`text-xl sm:text-2xl font-bold font-mono mt-0.5 ${
                        isOutOfStock
                          ? "text-rose-500"
                          : stock < 15
                          ? "text-amber-500"
                          : "text-[#285735] dark:text-[#7ec792]"
                      }`}
                    >
                      {stock} units
                    </p>
                    <span className="text-[10px] text-[#859b89]">
                      {isOutOfStock ? "Out of Stock" : "Available in stock"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#627766] block">
                      Sample Swatch
                    </span>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-[#142617] dark:text-[#f2f7f3] mt-0.5">
                      £{samplePrice}
                    </p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      {isSampleAvailable ? "Available to order" : "Sample N/A"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#627766] block">
                      Trade Tier 3 (25%)
                    </span>
                    <p className="text-xl sm:text-2xl font-bold font-mono text-[#3e7b52] mt-0.5">
                      £{(price * 0.75).toFixed(2)}
                    </p>
                    <span className="text-[10px] text-[#859b89]">B2B Gold Patron</span>
                  </div>
                </div>

                {/* interactive detail */}
                <div className="flex items-center gap-1.5 border-b border-inherit pb-2 text-xs font-semibold overflow-x-auto">
                  {[
                    { id: "specifications", label: "Technical Specs" },
                    { id: "variants", label: `Variants (${prod.variants?.length || 0})` },
                    { id: "colours", label: `Colourways (${prod.colours?.length || 0})` },
                    { id: "editorial", label: "Editorial Story" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                        activeTab === tab.id
                          ? "bg-[#3e7b52] text-white shadow-sm"
                          : isDark
                          ? "text-[#8ea392] hover:text-white"
                          : "text-[#526956] hover:text-[#142617]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content Panels */}
                {activeTab === "specifications" && (
                  <div
                    className={`p-5 rounded-2xl border divide-y text-xs ${
                      isDark
                        ? "bg-[#18231a] border-[#263728] divide-[#243527]"
                        : "bg-[#f8fbf9] border-[#e2ece5] divide-[#e8efe9]"
                    }`}
                  >
                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#627766]">Material & Composition</span>
                      <span className="font-semibold text-right">
                        {prod.specifications?.composition || prod.material || "100% Non-woven Sustainable FSC Paper / Organic Velvet"}
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#627766]">Dimensions & Roll Spec</span>
                      <span className="font-semibold text-right">
                        {prod.specifications?.rollDimensions ||
                          (prod.specifications?.width ? `${prod.specifications.width}cm W x ${prod.specifications.length || 10}m L` : "W 180cm x Roll Length 10.05m")}
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#627766]">Pattern Repeat & Match</span>
                      <span className="font-semibold text-right">
                        {prod.specifications?.repeat || "Straight Match / 68cm Vertical Repeat"}
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#627766]">Care & Maintenance</span>
                      <span className="font-semibold text-right">
                        {prod.specifications?.careInstructions || "Spongeable with mild British soap & damp cloth"}
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#627766]">Interior Suitability</span>
                      <span className="font-semibold text-right">
                        {Array.isArray(prod.rooms) && prod.rooms.length > 0
                          ? prod.rooms.join(", ")
                          : "Living Rooms, Dining Chambers, Bedrooms, Luxury Powder Rooms"}
                      </span>
                    </div>

                    <div className="py-2.5 flex items-center justify-between">
                      <span className="text-[#627766]">Heritage Craft Origin</span>
                      <span className="font-semibold text-right">
                        Handcrafted in the United Kingdom
                      </span>
                    </div>
                  </div>
                )}

                {activeTab === "variants" && (
                  <div className="space-y-3">
                    {Array.isArray(prod.variants) && prod.variants.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {prod.variants.map((v, i) => (
                          <div
                            key={v._id || v.id || i}
                            className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs ${
                              isDark
                                ? "bg-[#18231a] border-[#263728]"
                                : "bg-[#f8fbf9] border-[#e2ece5]"
                            }`}
                          >
                            <img
                              src={v.image || v.thumbnail?.secureUrl || activeImage}
                              alt={v.title || v.sku}
                              className="w-12 h-12 rounded-xl object-cover bg-black/5 flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="font-bold truncate">{v.title || `Variant ${i + 1}`}</p>
                              <p className="text-[10px] font-mono text-[#3e7b52] truncate">
                                SKU: {v.sku}
                              </p>
                              <p className="text-[10px] text-[#627766]">
                                Status: {v.status || "ACTIVE"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-[#627766]">
                        No additional sub-variants registered for this master creation.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "colours" && (
                  <div className="space-y-3">
                    {Array.isArray(prod.colours) && prod.colours.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {prod.colours.map((col, i) => (
                          <div
                            key={col._id || i}
                            className={`p-3.5 rounded-2xl border flex items-center gap-3 text-xs ${
                              isDark
                                ? "bg-[#18231a] border-[#263728]"
                                : "bg-[#f8fbf9] border-[#e2ece5]"
                            }`}
                          >
                            {col.hex ? (
                              <div
                                className="w-10 h-10 rounded-xl shadow-inner border border-black/10 flex-shrink-0"
                                style={{ backgroundColor: col.hex }}
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-xl bg-[#3e7b52]/20 text-[#3e7b52] flex items-center justify-center font-bold">
                                <Palette size={16} />
                              </div>
                            )}
                            <div>
                              <p className="font-bold">{col.name || `Colourway ${i + 1}`}</p>
                              {col.hex && (
                                <p className="text-[10px] font-mono text-[#627766]">{col.hex}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-xs text-[#627766]">
                        Single colour palette specification.
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "editorial" && (
                  <div
                    className={`p-5 rounded-2xl border space-y-3.5 text-xs ${
                      isDark
                        ? "bg-[#18231a] border-[#263728]"
                        : "bg-[#f8fbf9] border-[#e2ece5]"
                    }`}
                  >
                    <div>
                      <h4 className="font-bold text-sm mb-1">Editorial Inspiration</h4>
                      <p className="text-[#627766] leading-relaxed">
                        {prod.description ||
                          prod.shortDescription ||
                          "A rebellious reimagining of classical British botany, designed to bring transformative magic and soul into contemporary interiors. Handcrafted in England using natural pigments and ancestral printing presses."}
                      </p>
                    </div>

                    {prod.shortDescription && prod.description && (
                      <div className="pt-3 border-t border-inherit">
                        <h4 className="font-bold mb-1">Catalog Summary</h4>
                        <p className="text-[#627766] leading-relaxed">
                          {prod.shortDescription}
                        </p>
                      </div>
                    )}

                    {Array.isArray(prod.searchKeywords) && prod.searchKeywords.length > 0 && (
                      <div className="pt-3 border-t border-inherit">
                        <span className="text-[10px] uppercase font-bold text-[#627766] block mb-1.5">
                          Search Keywords
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {prod.searchKeywords.map((kw, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-[#3e7b52]/10 text-[#3e7b52]"
                            >
                              #{kw}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
