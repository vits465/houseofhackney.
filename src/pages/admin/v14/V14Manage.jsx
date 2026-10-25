import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  LayoutGrid,
  List,
  Eye,
  ShieldCheck,
} from "lucide-react";
import { useAdmin } from "../AdminContext";
import { showToast, showConfirm } from "../../../utils/sweetAlert";
import { getCleanProductImage } from "../utils/productUtils";

export default function V14Manage() {
  const {
    theme,
    products,
    loadingProducts,
    openCreateProductModal,
    openEditProductModal,
    deleteProduct,
  } = useAdmin();
  const isDark = theme === "dark";

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  // Dynamic categories from all loaded products with standard presets (clean strings only)
  const dynamicCategories = [
    "all",
    ...new Set([
      "Wallpaper",
      "Fabric",
      "Home Decor",
      "Paint",
      "Tiles",
      ...products
        .map((p) => p.category?.name || p.categoryName || (typeof p.category === "string" ? p.category : ""))
        .filter((cat) => typeof cat === "string" && cat.trim() && !/^[0-9a-fA-F]{24}$/.test(cat.trim())),
    ]),
  ];

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const prodCategory = prod.category?.name || prod.categoryName || prod.category || "";
    const matchCat =
      selectedCategory === "all" ||
      prodCategory.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchStatus =
      statusFilter === "all" || prod.status?.toUpperCase() === statusFilter.toUpperCase();

    const matchSearch =
      prod.name?.toLowerCase().includes(search.toLowerCase()) ||
      prod.sku?.toLowerCase().includes(search.toLowerCase()) ||
      prodCategory.toLowerCase().includes(search.toLowerCase());

    return matchCat && matchStatus && matchSearch;
  });

  // KPI Calculations
  const totalCount = products.length;
  const publishedCount = products.filter((p) => p.status === "PUBLISHED").length;
  const draftCount = products.filter((p) => p.status === "DRAFT").length;
  const lowStockCount = products.filter((p) => (p.stock || 0) < 15).length;
  const tradeEnabledCount = products.filter((p) => p.isTradeAvailable).length;

  const handleDelete = async (prod) => {
    const confirmed = await showConfirm(
      `Delete ${prod.name}?`,
      `Are you sure you want to remove SKU ${prod.sku} from the catalog? This will send a DELETE request to /products/${prod._id || prod.id}.`
    );

    if (confirmed) {
      await deleteProduct(prod._id || prod.id);
      showToast(`${prod.name} deleted from catalog.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1
              className={`text-2xl sm:text-3xl font-sans font-bold tracking-tight ${
                isDark ? "text-[#f2f7f3]" : "text-[#142617]"
              }`}
            >
              Products & Catalog (CRUD)
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3e7b52]/15 text-[#3e7b52]">
              /products API
            </span>
          </div>
          <p
            className={`text-xs sm:text-sm font-sans ${
              isDark ? "text-[#9db3a1]" : "text-[#526956]"
            }`}
          >
            Directly connected to backend endpoints — Create, Read, Update, and Delete luxury atelier creations.
          </p>
        </div>

        {/* Add Product Button (Light Green and White - NO BLACK!) */}
        <button
          onClick={openCreateProductModal}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white text-xs font-sans font-bold transition-all shadow-sm shadow-[#3e7b52]/25 self-start sm:self-auto cursor-pointer"
        >
          <Plus size={15} />
          <span>Add New Product</span>
        </button>
      </div>

      {/* 2. KPI Live Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark ? "bg-[#141a15] border-[#253327]" : "bg-white border-[#e4ede5]"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#627766] block">
            Catalog Total
          </span>
          <p className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-[#3e7b52]">
            {totalCount} Items
          </p>
          <span className="text-[10px] text-[#859b89]">Master inventory</span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark ? "bg-[#141a15] border-[#253327]" : "bg-white border-[#e4ede5]"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#627766] block">
            Published Live
          </span>
          <p className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            {publishedCount} Live
          </p>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
            Active in boutique
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark ? "bg-[#141a15] border-[#253327]" : "bg-white border-[#e4ede5]"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#627766] block">
            Drafts & Review
          </span>
          <p className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
            {draftCount} Drafts
          </p>
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
            Pre-launch queue
          </span>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-colors ${
            isDark ? "bg-[#141a15] border-[#253327]" : "bg-white border-[#e4ede5]"
          }`}
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#627766] block">
            Trade Wholesale
          </span>
          <p className="text-xl sm:text-2xl font-bold tracking-tight mt-1 text-[#3e7b52]">
            {tradeEnabledCount} Eligible
          </p>
          <span className="text-[10px] text-[#859b89]">B2B portal enabled</span>
        </div>
      </div>

      {/* 3. Filter, Search and View Switcher Bar */}
      <div
        className={`p-4 rounded-3xl border flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors ${
          isDark
            ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
            : "bg-white border-[#e2ece5] text-[#142617]"
        }`}
      >
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-0.5">
          {dynamicCategories.map((cat) => {
            const isCatActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative px-3.5 py-1.5 rounded-full font-sans font-semibold capitalize transition-colors select-none ${
                  isCatActive
                    ? "text-white"
                    : isDark
                    ? "text-[#9db3a1] hover:text-white"
                    : "text-[#526956] hover:text-[#142617]"
                }`}
              >
                {isCatActive && (
                  <motion.span
                    layoutId="activeManageCategoryPill"
                    className="absolute inset-0 rounded-full bg-[#3e7b52] shadow-sm shadow-[#3e7b52]/30"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">
                  {cat === "all" ? "All Categories" : cat}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right side: Search + Status Filter + View Switcher */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status filter dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`px-3 py-1.5 text-xs rounded-full border outline-none font-medium ${
              isDark
                ? "bg-[#141a15] border-[#253327] text-white"
                : "bg-[#f5f9f6] border-[#d8e6dc] text-[#142617]"
            }`}
          >
            <option value="all">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search
              size={14}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? "text-[#7f9183]" : "text-[#7b9180]"
              }`}
            />
            <input
              type="text"
              placeholder="Search product, SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`w-full pl-8 pr-3 py-1.5 text-xs rounded-full border font-sans focus:outline-none transition-colors ${
                isDark
                  ? "bg-[#141a15] border-[#253327] text-[#f2f7f3] focus:border-[#4a8b5e]"
                  : "bg-[#f5f9f6] border-[#d8e6dc] text-[#142617] focus:border-[#3e7b52]"
              }`}
            />
          </div>

          {/* View toggle (Grid / Table) */}
          <div
            className={`flex items-center p-0.5 rounded-full border ${
              isDark ? "bg-[#141a15] border-[#253327]" : "bg-[#f5f9f6] border-[#d8e6dc]"
            }`}
          >
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === "grid"
                  ? "bg-[#3e7b52] text-white shadow-sm"
                  : isDark
                  ? "text-[#859b89]"
                  : "text-[#627766]"
              }`}
            >
              <LayoutGrid size={14} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1.5 rounded-full transition-colors ${
                viewMode === "table"
                  ? "bg-[#3e7b52] text-white shadow-sm"
                  : isDark
                  ? "text-[#859b89]"
                  : "text-[#627766]"
              }`}
            >
              <List size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Products Presentation (Grid View or Table View) */}
      {viewMode === "grid" ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence>
            {filteredProducts.map((prod) => {
              const catName =
                prod.category?.name || prod.categoryName || prod.category || "Creation";
              const imgUrl = getCleanProductImage(prod);

              return (
                <motion.div
                  layout
                  key={prod._id || prod.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-3xl border overflow-hidden flex flex-col justify-between shadow-sm transition-all hover:-translate-y-0.5 ${
                    isDark
                      ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
                      : "bg-white border-[#e2ece5] text-[#142617]"
                  }`}
                >
                  <div>
                    {/* Image Area */}
                    <div className="aspect-[4/3] w-full overflow-hidden relative bg-black/5 group">
                      <img
                        src={imgUrl}
                        alt={prod.name}
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src =
                            "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0";
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full text-[10px] font-sans font-bold bg-[#285735]/85 text-white backdrop-blur-sm">
                        {catName}
                      </span>
                      <span
                        className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          prod.status === "PUBLISHED"
                            ? "bg-emerald-500/90 text-white"
                            : "bg-amber-500/90 text-white"
                        }`}
                      >
                        {prod.status}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-5">
                      <div className="flex items-center justify-between text-[11px] font-mono text-[#859b89] mb-1">
                        <span>SKU: {prod.sku || "HOH-AUTO"}</span>
                        {prod.isTradeAvailable && (
                          <span className="text-[#3e7b52] font-semibold flex items-center gap-1">
                            <ShieldCheck size={11} /> Trade Wholesale
                          </span>
                        )}
                      </div>

                      <h4
                        className={`font-sans font-bold text-sm tracking-tight line-clamp-1 ${
                          isDark ? "text-[#f2f7f3]" : "text-[#142617]"
                        }`}
                      >
                        {prod.name}
                      </h4>

                      <p className="text-xs text-[#627766] mt-1 line-clamp-2 leading-relaxed">
                        {prod.shortDescription || "Luxury British atelier creation manufactured with sustainable heritage methods."}
                      </p>

                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-inherit text-xs font-mono">
                        <span className="font-bold text-[#2f6f43] dark:text-[#7ec792] text-base">
                          £{prod.price || 195}
                        </span>
                        <span
                          className={`font-semibold ${
                            (prod.stock || 0) < 15
                              ? "text-amber-600 dark:text-amber-400"
                              : isDark
                              ? "text-[#9db3a1]"
                              : "text-[#526956]"
                          }`}
                        >
                          {prod.stock || 0} in stock
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div
                    className={`px-5 py-3 border-t flex items-center justify-between text-xs ${
                      isDark
                        ? "border-[#253528] bg-[#141d15]"
                        : "border-[#edf2ee] bg-[#f9fbf9]"
                    }`}
                  >
                    <span className="text-[10px] font-mono text-[#859b89]">
                      ID: {(prod._id || prod.id)?.slice(-6)}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditProductModal(prod)}
                        className="px-3 py-1.5 rounded-full border border-[#3e7b52] text-[#3e7b52] hover:bg-[#3e7b52] hover:text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Edit2 size={12} /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(prod)}
                        className="p-1.5 rounded-full text-rose-500 hover:bg-rose-500/15 transition-colors"
                        title="Delete product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* Detailed Table View */
        <div
          className={`rounded-3xl border overflow-hidden p-6 ${
            isDark ? "bg-[#18231a] border-[#293a2c]" : "bg-white border-[#e2ece5]"
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr
                  className={`border-b text-[11px] font-semibold uppercase tracking-wider text-[#627766] ${
                    isDark ? "border-[#253327]" : "border-[#edf2ee]"
                  }`}
                >
                  <th className="pb-3 pl-2">Creation Spec</th>
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Price (£)</th>
                  <th className="pb-3">Inventory</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-2 text-right">CRUD Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? "divide-[#202c22]" : "divide-[#edf2ee]"
                }`}
              >
                {filteredProducts.map((prod) => {
                  const catName =
                    prod.category?.name ||
                    prod.categoryName ||
                    (typeof prod.category === "string" && !/^[0-9a-fA-F]{24}$/.test(prod.category)
                      ? prod.category
                      : "Wallpaper");
                  const imgUrl = getCleanProductImage(prod);

                  return (
                    <tr
                      key={prod._id || prod.id}
                      className={`hover:bg-[#f8fbf9] dark:hover:bg-[#141e16] transition-colors`}
                    >
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={imgUrl}
                            alt={prod.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0";
                            }}
                            className="w-10 h-10 rounded-xl object-cover bg-black/5"
                          />
                          <div>
                            <p className="font-bold">{prod.name}</p>
                            <p className="text-[10px] text-[#627766]">
                              {prod.productType || "SIMPLE"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 font-mono text-[#3e7b52] font-bold">
                        {prod.sku}
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#3e7b52]/10 text-[#3e7b52]">
                          {catName}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-sm">
                        £{prod.price || 195}
                      </td>
                      <td className="py-3.5 font-bold">
                        {prod.stock || 0} units
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            prod.status === "PUBLISHED"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditProductModal(prod)}
                            className="px-3 py-1.5 rounded-full border border-[#3e7b52] text-[#3e7b52] hover:bg-[#3e7b52] hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 rounded-full text-rose-500 hover:bg-rose-500/15 transition-colors"
                            title="Delete product"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
