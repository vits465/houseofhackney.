import { useState, useEffect } from "react";
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
  RefreshCw,
  ChevronLeft,
  ChevronRight,
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
    openViewProductModal,
    deleteProduct,
    refreshProducts,
  } = useAdmin();
  const isDark = theme === "dark";

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(18); // 12, 18, 36, 72, 999 (All)

  // load full catalog
  useEffect(() => {
    if (products.length < 100 && !loadingProducts && refreshProducts) {
      refreshProducts();
    }
  }, []);

  // categories
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

  // Reset pagination on filter / search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, statusFilter, search, itemsPerPage]);

  // Pagination calculation
  const totalItems = filteredProducts.length;
  const isShowAll = itemsPerPage >= 999;
  const totalPages = isShowAll ? 1 : Math.ceil(totalItems / itemsPerPage) || 1;
  const safeCurrentPage = Math.min(Math.max(1, currentPage), totalPages);

  const paginatedProducts = isShowAll
    ? filteredProducts
    : filteredProducts.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage);

  // KPI Calculations
  const totalCount = products.length;
  const publishedCount = products.filter((p) => p.status === "PUBLISHED" || p.status === "ACTIVE").length;
  const draftCount = products.filter((p) => p.status === "DRAFT").length;
  const lowStockCount = products.filter((p) => (p.stock || 0) < 15).length;
  const tradeEnabledCount = products.filter((p) => p.isTradeAvailable).length;

  const handleDelete = async (prod) => {
    const confirmed = await showConfirm(
      `Delete ${prod.name}?`,
      `Are you sure you want to remove SKU ${prod.sku} from the catalog? This will send a DELETE request to /products/${prod._id || prod.id}.`
    );

    if (confirmed && confirmed.isConfirmed) {
      await deleteProduct(prod._id || prod.id);
      showToast(`${prod.name} deleted from catalog.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* header bar with actions */}
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
              {totalCount} Total Catalog
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

        {/* Action Buttons: Refresh Catalog + Add Product */}
        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={refreshProducts}
            disabled={loadingProducts}
            title="Re-sync entire catalog from backend"
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-sans font-bold transition-all cursor-pointer ${
              isDark
                ? "border-[#2b3d2f] text-[#9db3a1] hover:text-white hover:bg-[#1a251d]"
                : "border-[#d8e6dc] text-[#3e5642] hover:text-[#142617] hover:bg-[#f2f8f4]"
            } ${loadingProducts ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            <RefreshCw size={13} className={loadingProducts ? "animate-spin text-[#3e7b52]" : ""} />
            <span>{loadingProducts ? "Syncing..." : "Refresh Catalog"}</span>
          </button>

          <button
            onClick={openCreateProductModal}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white text-xs font-sans font-bold transition-all shadow-sm shadow-[#3e7b52]/25 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add New Product</span>
          </button>
        </div>
      </div>

      {/* kpi live metrics */}
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

      {/* filter, search and view switcher bar */}
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

          {/* Top Quick Page Navigation & View Switcher */}
          <div className="flex items-center gap-2">
            {!isShowAll && totalPages > 1 && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono ${
                  isDark ? "bg-[#141a15] border-[#253327]" : "bg-[#f5f9f6] border-[#d8e6dc]"
                }`}
              >
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className="p-0.5 rounded hover:text-[#3e7b52] disabled:opacity-30 disabled:hover:text-inherit cursor-pointer"
                  title="Previous Page"
                >
                  <ChevronLeft size={13} />
                </button>
                <span className="font-semibold text-[11px]">
                  {safeCurrentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className="p-0.5 rounded hover:text-[#3e7b52] disabled:opacity-30 disabled:hover:text-inherit cursor-pointer"
                  title="Next Page"
                >
                  <ChevronRight size={13} />
                </button>
              </div>
            )}

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
      </div>

      {/* products presentation */}
      {paginatedProducts.length === 0 ? (
        <div
          className={`p-12 rounded-3xl border text-center space-y-3 ${
            isDark ? "bg-[#18231a] border-[#293a2c]" : "bg-white border-[#e2ece5]"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-[#3e7b52]/15 text-[#3e7b52] mx-auto flex items-center justify-center">
            <Package size={24} />
          </div>
          <h3 className="font-bold text-base">No matching products found</h3>
          <p className="text-xs text-[#627766] max-w-sm mx-auto">
            Try adjusting your search criteria, clearing the category filter, or refreshing the atelier catalog.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setStatusFilter("all");
              setSearch("");
            }}
            className="px-4 py-2 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          <AnimatePresence>
            {paginatedProducts.map((prod) => {
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
                    {/* Image Area - clickable to view full details */}
                    <div
                      onClick={() => openViewProductModal(prod)}
                      className="aspect-[4/3] w-full overflow-hidden relative bg-black/5 group cursor-pointer"
                    >
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
                          prod.status === "PUBLISHED" || prod.status === "ACTIVE"
                            ? "bg-emerald-500/90 text-white"
                            : "bg-amber-500/90 text-white"
                        }`}
                      >
                        {prod.status}
                      </span>

                      
                      <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="px-3 py-1.5 rounded-full bg-white/90 text-[#142617] text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-sm">
                          <Eye size={13} /> View Full Details
                        </span>
                      </div>
                    </div>

                    
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
                        onClick={() => openViewProductModal(prod)}
                        className={`font-sans font-bold text-sm tracking-tight line-clamp-1 hover:text-[#3e7b52] cursor-pointer transition-colors ${
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

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openViewProductModal(prod)}
                        className="px-2.5 py-1.5 rounded-full border border-transparent hover:border-[#3e7b52]/30 text-[#3e7b52] hover:bg-[#3e7b52]/10 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        title="View Full Product Details"
                      >
                        <Eye size={13} /> Details
                      </button>

                      <button
                        onClick={() => openEditProductModal(prod)}
                        className="px-3 py-1.5 rounded-full border border-[#3e7b52] text-[#3e7b52] hover:bg-[#3e7b52] hover:text-white text-xs font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                      >
                        <Edit2 size={12} /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(prod)}
                        className="p-1.5 rounded-full text-rose-500 hover:bg-rose-500/15 transition-colors cursor-pointer"
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
                  <th className="pb-3 pr-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? "divide-[#202c22]" : "divide-[#edf2ee]"
                }`}
              >
                {paginatedProducts.map((prod) => {
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
                        <div
                          onClick={() => openViewProductModal(prod)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <img
                            src={imgUrl}
                            alt={prod.name}
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src =
                                "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0";
                            }}
                            className="w-10 h-10 rounded-xl object-cover bg-black/5 group-hover:scale-105 transition-transform"
                          />
                          <div>
                            <p className="font-bold group-hover:text-[#3e7b52] transition-colors">{prod.name}</p>
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
                            prod.status === "PUBLISHED" || prod.status === "ACTIVE"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {prod.status}
                        </span>
                      </td>
                      <td className="py-3.5 pr-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openViewProductModal(prod)}
                            className="px-2.5 py-1.5 rounded-full border border-transparent hover:border-[#3e7b52]/30 text-[#3e7b52] hover:bg-[#3e7b52]/10 text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                            title="View Full Details"
                          >
                            <Eye size={12} /> Details
                          </button>

                          <button
                            onClick={() => openEditProductModal(prod)}
                            className="px-3 py-1.5 rounded-full border border-[#3e7b52] text-[#3e7b52] hover:bg-[#3e7b52] hover:text-white text-[11px] font-bold transition-all flex items-center gap-1 shadow-sm cursor-pointer"
                          >
                            <Edit2 size={12} /> Edit
                          </button>

                          <button
                            onClick={() => handleDelete(prod)}
                            className="p-1.5 rounded-full text-rose-500 hover:bg-rose-500/15 transition-colors cursor-pointer"
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

      {/* pagination bar */}
      {totalItems > 0 && (
        <div
          className={`p-4 rounded-3xl border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans transition-colors ${
            isDark
              ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
              : "bg-white border-[#e2ece5] text-[#142617]"
          }`}
        >
          {/* Info: Showing X to Y of Z */}
          <div className="text-[#627766] flex items-center gap-2">
            <span>
              Showing{" "}
              <strong className={isDark ? "text-white" : "text-[#142617]"}>
                {isShowAll ? 1 : (safeCurrentPage - 1) * itemsPerPage + 1}
              </strong>{" "}
              to{" "}
              <strong className={isDark ? "text-white" : "text-[#142617]"}>
                {isShowAll ? totalItems : Math.min(safeCurrentPage * itemsPerPage, totalItems)}
              </strong>{" "}
              of{" "}
              <strong className="text-[#3e7b52] font-bold">{totalItems}</strong>{" "}
              creations
            </span>
          </div>

          {/* Controls: Items per page selector + Page navigation buttons */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {/* Page size selector */}
            <div className="flex items-center gap-2">
              <span className="text-[#627766] text-[11px]">Per page:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className={`px-2.5 py-1 rounded-full border text-xs font-medium outline-none cursor-pointer ${
                  isDark
                    ? "bg-[#141a15] border-[#253327] text-white"
                    : "bg-[#f5f9f6] border-[#d8e6dc] text-[#142617]"
                }`}
              >
                <option value={12}>12</option>
                <option value={18}>18</option>
                <option value={36}>36</option>
                <option value={72}>72</option>
                <option value={999}>All ({totalItems})</option>
              </select>
            </div>

            {/* Page buttons */}
            {!isShowAll && totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                  className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                    safeCurrentPage === 1
                      ? "opacity-40 cursor-not-allowed border-transparent"
                      : isDark
                      ? "border-[#2e3e30] hover:bg-[#223024] text-white"
                      : "border-[#d8e6dc] hover:bg-[#edf6f0] text-[#142617]"
                  }`}
                  title="Previous Page"
                >
                  <ChevronLeft size={15} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    // Show first, last, and within 2 of current page
                    return (
                      p === 1 ||
                      p === totalPages ||
                      Math.abs(p - safeCurrentPage) <= 1
                    );
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev && p - prev > 1;

                    return (
                      <div key={p} className="flex items-center">
                        {showEllipsis && (
                          <span className="px-1 text-[#627766]">...</span>
                        )}
                        <button
                          onClick={() => setCurrentPage(p)}
                          className={`w-7 h-7 rounded-full text-xs font-bold transition-all cursor-pointer ${
                            safeCurrentPage === p
                              ? "bg-[#3e7b52] text-white shadow-sm"
                              : isDark
                              ? "text-[#8ea392] hover:bg-[#202d23]"
                              : "text-[#526956] hover:bg-[#edf6f0]"
                          }`}
                        >
                          {p}
                        </button>
                      </div>
                    );
                  })}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                  className={`p-1.5 rounded-full border transition-colors cursor-pointer ${
                    safeCurrentPage === totalPages
                      ? "opacity-40 cursor-not-allowed border-transparent"
                      : isDark
                      ? "border-[#2e3e30] hover:bg-[#223024] text-white"
                      : "border-[#d8e6dc] hover:bg-[#edf6f0] text-[#142617]"
                  }`}
                  title="Next Page"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
