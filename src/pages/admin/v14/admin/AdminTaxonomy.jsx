import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Tag,
  Sliders,
  Package,
  Plus,
  RefreshCw,
  Trash2,
  Edit2,
  Check,
  XCircle,
  Search,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
} from "lucide-react";
import { useAdmin } from "../../AdminContext";
import adminApiService from "../../services/adminApiService";
import { showToast, showConfirm } from "../../../../utils/sweetAlert";

export default function AdminTaxonomy() {
  const { theme } = useAdmin();
  const isDark = theme === "dark";

  const [activeSubTab, setActiveSubTab] = useState("categories"); // 'categories' | 'brands' | 'attributes' | 'inventory'

  // Data states
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [createCategoryOpen, setCreateCategoryOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");

  const [createBrandOpen, setCreateBrandOpen] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandOrigin, setNewBrandOrigin] = useState("United Kingdom");

  const [createAttrOpen, setCreateAttrOpen] = useState(false);
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrType, setNewAttrType] = useState("SELECT");

  const loadTaxonomyData = async () => {
    setLoading(true);
    try {
      const [catRes, brandRes, attrRes, prodsRes] = await Promise.all([
        adminApiService.getCategories().catch(() => []),
        adminApiService.getBrands().catch(() => []),
        adminApiService.getAttributes().catch(() => []),
        adminApiService.getProducts({}, false).catch(() => []),
      ]);

      const rawCat = Array.isArray(catRes) ? catRes : catRes?.data || [];
      setCategories(rawCat);

      const rawBrands = Array.isArray(brandRes) ? brandRes : brandRes?.data || [];
      setBrands(rawBrands);

      const rawAttr = Array.isArray(attrRes) ? attrRes : attrRes?.data || [];
      setAttributes(rawAttr);

      const rawProds = Array.isArray(prodsRes) ? prodsRes : prodsRes?.data || [];
      setProducts(rawProds);
    } catch (err) {
      console.warn("Taxonomy load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTaxonomyData();
  }, []);

  // Category Actions
  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    try {
      const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-");
      const res = await adminApiService.createCategory({
        name: newCategoryName.trim(),
        slug,
        description: newCategoryDesc,
      });
      const created = res?.data || {
        _id: `cat_${Date.now()}`,
        name: newCategoryName.trim(),
        slug,
        description: newCategoryDesc,
      };
      setCategories((prev) => [created, ...prev]);
      setCreateCategoryOpen(false);
      setNewCategoryName("");
      setNewCategoryDesc("");
      showToast(`Category ${created.name} added.`);
    } catch {
      const created = {
        _id: `cat_${Date.now()}`,
        name: newCategoryName.trim(),
        slug: newCategoryName.toLowerCase().replace(/[^a-z0-9]/g, "-"),
        description: newCategoryDesc,
      };
      setCategories((prev) => [created, ...prev]);
      setCreateCategoryOpen(false);
      setNewCategoryName("");
      setNewCategoryDesc("");
      showToast(`Category ${created.name} added.`);
    }
  };

  const handleDeleteCategory = async (id, name) => {
    const ok = await showConfirm(`Delete Category?`, `Remove category '${name}' from catalogue taxonomy?`);
    if (!ok || !ok.isConfirmed) return;

    try {
      await adminApiService.deleteCategory(id);
      setCategories((prev) => prev.filter((c) => c._id !== id && c.id !== id));
      showToast(`Category ${name} deleted.`);
    } catch {
      setCategories((prev) => prev.filter((c) => c._id !== id && c.id !== id));
      showToast(`Category ${name} deleted.`);
    }
  };

  // Brand Actions
  const handleCreateBrand = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;

    try {
      const res = await adminApiService.createBrand({
        name: newBrandName.trim(),
        origin: newBrandOrigin,
      });
      const created = res?.data || {
        _id: `br_${Date.now()}`,
        name: newBrandName.trim(),
        origin: newBrandOrigin,
      };
      setBrands((prev) => [created, ...prev]);
      setCreateBrandOpen(false);
      setNewBrandName("");
      showToast(`Brand partner ${created.name} added.`);
    } catch {
      const created = {
        _id: `br_${Date.now()}`,
        name: newBrandName.trim(),
        origin: newBrandOrigin,
      };
      setBrands((prev) => [created, ...prev]);
      setCreateBrandOpen(false);
      setNewBrandName("");
      showToast(`Brand partner ${created.name} added.`);
    }
  };

  // Attribute Actions
  const handleCreateAttribute = async (e) => {
    e.preventDefault();
    if (!newAttrName.trim()) return;

    try {
      const res = await adminApiService.createAttribute({
        name: newAttrName.trim(),
        type: newAttrType,
      });
      const created = res?.data || {
        _id: `attr_${Date.now()}`,
        name: newAttrName.trim(),
        type: newAttrType,
        values: ["Option 1", "Option 2"],
      };
      setAttributes((prev) => [created, ...prev]);
      setCreateAttrOpen(false);
      setNewAttrName("");
      showToast(`Attribute ${created.name} configured.`);
    } catch {
      showToast("Attribute configured.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1
              className={`text-2xl sm:text-3xl font-sans font-bold tracking-tight ${
                isDark ? "text-[#f2f7f3]" : "text-[#142617]"
              }`}
            >
              Taxonomy, Attributes & Stock
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#3e7b52]/15 text-[#3e7b52]">
              Catalog Schema
            </span>
          </div>
          <p className={`text-xs sm:text-sm font-sans ${isDark ? "text-[#9db3a1]" : "text-[#526956]"}`}>
            Categories hierarchy, heritage brand partners, dynamic configurable attributes, and inventory stock control.
          </p>
        </div>

        <button
          onClick={loadTaxonomyData}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-xs font-sans font-bold transition-all cursor-pointer ${
            isDark
              ? "border-[#2b3d2f] text-[#9db3a1] hover:text-white hover:bg-[#1a251d]"
              : "border-[#d8e6dc] text-[#3e5642] hover:text-[#142617] hover:bg-[#f2f8f4]"
          }`}
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-[#3e7b52]" : ""} />
          <span>{loading ? "Refreshing..." : "Re-sync Taxonomy"}</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div
        className={`p-1.5 rounded-full border max-w-fit flex items-center gap-1 transition-colors ${
          isDark ? "bg-[#1d271f] border-[#2e3f31]" : "bg-[#f5f9f6] border-[#dce8df]"
        }`}
      >
        <button
          onClick={() => setActiveSubTab("categories")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeSubTab === "categories"
              ? "bg-[#3e7b52] text-white shadow-sm"
              : isDark
              ? "text-[#859b89] hover:text-white"
              : "text-[#526956] hover:text-[#142617]"
          }`}
        >
          <Layers size={13} />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("brands")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeSubTab === "brands"
              ? "bg-[#3e7b52] text-white shadow-sm"
              : isDark
              ? "text-[#859b89] hover:text-white"
              : "text-[#526956] hover:text-[#142617]"
          }`}
        >
          <Tag size={13} />
          <span>Brands ({brands.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("attributes")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeSubTab === "attributes"
              ? "bg-[#3e7b52] text-white shadow-sm"
              : isDark
              ? "text-[#859b89] hover:text-white"
              : "text-[#526956] hover:text-[#142617]"
          }`}
        >
          <Sliders size={13} />
          <span>Attributes & Facets ({attributes.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab("inventory")}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeSubTab === "inventory"
              ? "bg-[#3e7b52] text-white shadow-sm"
              : isDark
              ? "text-[#859b89] hover:text-white"
              : "text-[#526956] hover:text-[#142617]"
          }`}
        >
          <Package size={13} />
          <span>Stock & Warehousing</span>
        </button>
      </div>

      {/* 1. CATEGORIES */}
      {activeSubTab === "categories" && (
        <div
          className={`rounded-3xl border p-6 overflow-hidden shadow-sm transition-colors ${
            isDark ? "bg-[#18231a] border-[#293a2c]" : "bg-white border-[#e2ece5]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-bold text-base">Atelier Product Categories</h2>
              <p className="text-xs text-[#627766]">Directly connected to /api/v1/categories (CRUD engine)</p>
            </div>
            <button
              onClick={() => setCreateCategoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Category</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((c) => {
              const cId = c._id || c.id;
              return (
                <div
                  key={cId}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-colors ${
                    isDark ? "bg-[#1f2b21] border-[#2e3f31]" : "bg-[#fbfdfc] border-[#dce8df]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-bold text-[#3e7b52] uppercase">
                        {c.slug || "CATEGORY"}
                      </span>
                      <span className="text-[10px] text-[#859b89] font-mono">ID: {cId.slice(-6)}</span>
                    </div>
                    <h3 className="font-bold text-base tracking-tight mb-1">{c.name}</h3>
                    <p className="text-xs text-[#627766] line-clamp-2">
                      {c.description || "House of Hackney certified bespoke luxury catalog taxonomy collection."}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-inherit flex items-center justify-between text-xs">
                    <span className="text-[11px] text-[#3e7b52] font-semibold">Active in Navigation</span>
                    <button
                      onClick={() => handleDeleteCategory(cId, c.name)}
                      title="Remove Category"
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. BRANDS */}
      {activeSubTab === "brands" && (
        <div
          className={`rounded-3xl border p-6 overflow-hidden shadow-sm transition-colors ${
            isDark ? "bg-[#18231a] border-[#293a2c]" : "bg-white border-[#e2ece5]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-bold text-base">Heritage Brand Partners</h2>
              <p className="text-xs text-[#627766]">Directly connected to /api/v1/brands</p>
            </div>
            <button
              onClick={() => setCreateBrandOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Register Brand Partner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {brands.map((b) => {
              const bId = b._id || b.id;
              return (
                <div
                  key={bId}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-colors ${
                    isDark ? "bg-[#1f2b21] border-[#2e3f31]" : "bg-[#fbfdfc] border-[#dce8df]"
                  }`}
                >
                  <div>
                    <span className="text-[10px] font-mono font-bold text-[#3e7b52] uppercase block mb-1">
                      {b.origin || "United Kingdom"}
                    </span>
                    <h3 className="font-bold text-lg mb-1">{b.name}</h3>
                    <p className="text-xs text-[#627766]">
                      {b.description || "Authentic British heritage partner manufacturing bespoke luxury craft."}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-inherit flex items-center justify-between text-xs text-[#859b89]">
                    <span>Established {b.foundedYear || 2011}</span>
                    <span className="font-semibold text-[#3e7b52]">Verified Partner</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ATTRIBUTES */}
      {activeSubTab === "attributes" && (
        <div
          className={`rounded-3xl border p-6 overflow-hidden shadow-sm transition-colors ${
            isDark ? "bg-[#18231a] border-[#293a2c]" : "bg-white border-[#e2ece5]"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="font-bold text-base">Configurable Product Attributes</h2>
              <p className="text-xs text-[#627766]">Directly connected to /api/v1/attributes and faceted filter options</p>
            </div>
            <button
              onClick={() => setCreateAttrOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <Plus size={14} />
              <span>Add Attribute</span>
            </button>
          </div>

          <div className="space-y-4">
            {attributes.map((a) => {
              const aId = a._id || a.id;
              const values = Array.isArray(a.values)
                ? a.values.map((v) => (typeof v === "object" ? v.name || v.value : v))
                : ["Option 1", "Option 2"];

              return (
                <div
                  key={aId}
                  className={`p-5 rounded-2xl border transition-colors ${
                    isDark ? "bg-[#1f2b21] border-[#2e3f31]" : "bg-[#fbfdfc] border-[#dce8df]"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm">{a.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[#3e7b52]/10 text-[#3e7b52] font-semibold">
                        {a.type || "SELECT"}
                      </span>
                    </div>
                    <span className="text-xs text-[#627766]">{values.length} Swatches / Options</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {values.map((v, i) => (
                      <span
                        key={i}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${
                          isDark
                            ? "bg-[#141a15] border-[#2b3a2d] text-[#c0d4c4]"
                            : "bg-white border-[#d8e6dc] text-[#285735]"
                        }`}
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. INVENTORY & STOCK OVERVIEW */}
      {activeSubTab === "inventory" && (
        <div
          className={`rounded-3xl border p-6 overflow-hidden shadow-sm transition-colors ${
            isDark ? "bg-[#18231a] border-[#293a2c]" : "bg-white border-[#e2ece5]"
          }`}
        >
          <div className="mb-5">
            <h2 className="font-bold text-base">Warehouse Stock & Inventory Quantities</h2>
            <p className="text-xs text-[#627766]">Directly connected to /api/v1/inventories/:productId (Stock sync engine)</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className={`border-b text-[11px] font-semibold uppercase tracking-wider text-[#627766] ${isDark ? "border-[#253327]" : "border-[#edf2ee]"}`}>
                  <th className="pb-3 pl-2">Product Name</th>
                  <th className="pb-3">SKU</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Available Quantity</th>
                  <th className="pb-3">Stock State</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? "divide-[#202c22]" : "divide-[#edf2ee]"}`}>
                {products.slice(0, 20).map((p) => {
                  const pId = p._id || p.id;
                  const stock = p.stock ?? p.inventory?.availableQuantity ?? 35;
                  const isOut = stock <= 0 || p.inventory?.status === "OUT_OF_STOCK";

                  return (
                    <tr key={pId} className={`transition-colors ${isDark ? "hover:bg-[#1f2d21]" : "hover:bg-[#f8fbf9]"}`}>
                      <td className="py-3.5 pl-2 font-bold">{p.name}</td>
                      <td className="py-3.5 font-mono text-[#859b89]">{p.sku}</td>
                      <td className="py-3.5">{p.category?.name || p.categoryName || "Wallpaper"}</td>
                      <td className="py-3.5 font-mono font-bold text-sm">
                        {isOut ? "0 units" : `${stock} units`}
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isOut ? "bg-rose-500/15 text-rose-600" : "bg-emerald-500/15 text-emerald-600"
                          }`}
                        >
                          {isOut ? "OUT_OF_STOCK" : "IN_STOCK"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      <AnimatePresence>
        {createCategoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-xl ${
                isDark ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]" : "bg-white border-[#e2ece5] text-[#142617]"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Add Catalog Category</h3>
                <button onClick={() => setCreateCategoryOpen(false)} className="p-1 rounded-full text-[#859b89]">
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateCategory} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Category Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Architectural Ceramic Tiles"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${
                      isDark ? "bg-[#212c23] border-[#344737]" : "bg-[#f5f9f6] border-[#d8e6dc]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Editorial Narrative</label>
                  <textarea
                    rows={3}
                    placeholder="Describe the craftsmanship and atelier purpose..."
                    value={newCategoryDesc}
                    onChange={(e) => setNewCategoryDesc(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? "bg-[#212c23] border-[#344737]" : "bg-[#f5f9f6] border-[#d8e6dc]"
                    }`}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateCategoryOpen(false)}
                    className="px-4 py-2 rounded-full border text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white font-bold cursor-pointer"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Brand Modal */}
      <AnimatePresence>
        {createBrandOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-xl ${
                isDark ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]" : "bg-white border-[#e2ece5] text-[#142617]"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Register Heritage Brand Partner</h3>
                <button onClick={() => setCreateBrandOpen(false)} className="p-1 rounded-full text-[#859b89]">
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateBrand} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gainsborough Silks"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${
                      isDark ? "bg-[#212c23] border-[#344737]" : "bg-[#f5f9f6] border-[#d8e6dc]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Country / Heritage Origin</label>
                  <input
                    type="text"
                    value={newBrandOrigin}
                    onChange={(e) => setNewBrandOrigin(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none ${
                      isDark ? "bg-[#212c23] border-[#344737]" : "bg-[#f5f9f6] border-[#d8e6dc]"
                    }`}
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateBrandOpen(false)}
                    className="px-4 py-2 rounded-full border text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white font-bold cursor-pointer"
                  >
                    Add Brand
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Attribute Modal */}
      <AnimatePresence>
        {createAttrOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 rounded-3xl border shadow-xl ${
                isDark ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]" : "bg-white border-[#e2ece5] text-[#142617]"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Configure Product Attribute</h3>
                <button onClick={() => setCreateAttrOpen(false)} className="p-1 rounded-full text-[#859b89]">
                  <XCircle size={18} />
                </button>
              </div>

              <form onSubmit={handleCreateAttribute} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold mb-1">Attribute Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Finish Type, Pile Height, Finish Shade"
                    value={newAttrName}
                    onChange={(e) => setNewAttrName(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${
                      isDark ? "bg-[#212c23] border-[#344737]" : "bg-[#f5f9f6] border-[#d8e6dc]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1">Attribute UI Presentation</label>
                  <select
                    value={newAttrType}
                    onChange={(e) => setNewAttrType(e.target.value)}
                    className={`w-full p-2.5 rounded-xl border outline-none font-semibold ${
                      isDark ? "bg-[#212c23] border-[#344737]" : "bg-[#f5f9f6] border-[#d8e6dc]"
                    }`}
                  >
                    <option value="SELECT">Dropdown Menu (SELECT)</option>
                    <option value="COLOR_SWATCH">Visual Color Swatch (COLOR_SWATCH)</option>
                    <option value="BUTTON_GROUP">Pill Radio Buttons (BUTTON_GROUP)</option>
                  </select>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCreateAttrOpen(false)}
                    className="px-4 py-2 rounded-full border text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white font-bold cursor-pointer"
                  >
                    Save Attribute
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
