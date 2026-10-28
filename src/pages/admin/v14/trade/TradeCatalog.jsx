import { useState, useMemo } from "react";
import { Search, Plus, ShoppingBag, Layers, Package } from "lucide-react";
import { useAdmin } from "../../AdminContext";
import { showToast } from "../../../../utils/sweetAlert";
import { getCleanProductImage } from "../../utils/productUtils";
import RequestQuoteModal from "./RequestQuoteModal";

export default function TradeCatalog() {
  const { theme, tradeProfile, products } = useAdmin();
  const isDark = theme === "dark";

  const discountPercent = tradeProfile?.tier?.discountPercentage || 25;
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [selectedProductForQuote, setSelectedProductForQuote] = useState(null);

  // Dynamic categories from loaded products
  const categories = useMemo(() => {
    const cats = new Set(["ALL"]);
    (products || []).forEach((p) => {
      const c = typeof p.category === "string" ? p.category : p.category?.name;
      if (c && typeof c === "string" && !/^[0-9a-fA-F]{24}$/.test(c)) {
        cats.add(c);
      }
    });
    return Array.from(cats);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return (products || []).filter((prod) => {
      const cat = typeof prod.category === "string" ? prod.category : prod.category?.name || "";
      const matchesCat = selectedCategory === "ALL" || cat.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch =
        prod.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        prod.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cat.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleOrderMemo = (prodName) => {
    showToast(`Complimentary memo sample requested for ${prodName}`);
  };

  return (
    <div className="space-y-6">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Wholesale Trade Catalog
          </h1>
          <p className="text-xs text-[#627766] mt-0.5">
            Exclusive professional trade wholesale pricing with your {discountPercent}% tier concession ({filteredProducts.length} creations)
          </p>
        </div>

        <button
          onClick={() => setRequestModalOpen(true)}
          className="px-5 py-2.5 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all flex items-center gap-2 shadow-sm shadow-[#3e7b52]/25 self-start sm:self-auto"
        >
          <Plus size={15} />
          Create Custom Project Quote
        </button>
      </div>

      {/* Filter and Category Pills */}
      <div
        className={`p-4 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors ${
          isDark
            ? "bg-[#141a15] border-[#253327]"
            : "bg-white border-[#e4ede5]"
        }`}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat
                  ? "bg-[#3e7b52] text-white shadow-sm"
                  : isDark
                  ? "text-[#859b89] hover:bg-[#1f2b21] hover:text-white"
                  : "text-[#526956] hover:bg-[#edf6f0] hover:text-[#142617]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[220px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#859b89]"
          />
          <input
            type="text"
            placeholder="Search creations or substrate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full pl-9 pr-3 py-1.5 rounded-full border text-xs outline-none ${
              isDark
                ? "bg-[#1d271f] border-[#2e3f31] text-white placeholder-[#556957]"
                : "bg-[#f5f9f6] border-[#dce8df] text-[#142617] placeholder-[#95a898]"
            }`}
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center border rounded-2xl">
          <Package size={32} className="mx-auto text-[#627766] mb-2 opacity-50" />
          <p className="text-sm font-semibold">No wholesale creations found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.slice(0, 36).map((prod) => {
            const retailPrice = Number(prod.pricing?.retailPrice || prod.price || 195);
            const tradePrice = Math.round(retailPrice * (1 - discountPercent / 100));
            const img = getCleanProductImage(prod);
            const catName = typeof prod.category === "string" ? prod.category : prod.category?.name || "Luxury Decor";

            return (
              <div
                key={prod._id || prod.id}
                className={`rounded-2xl border overflow-hidden flex flex-col transition-all group ${
                  isDark
                    ? "bg-[#141a15] border-[#253327] hover:border-[#334636]"
                    : "bg-white border-[#e4ede5] hover:border-[#c9dece] shadow-sm hover:shadow-md"
                }`}
              >
                {/* Image Frame */}
                <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
                  <img
                    src={img}
                    alt={prod.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-[#3e7b52] text-white text-[10px] font-bold shadow-sm">
                    {discountPercent}% Wholesale
                  </span>
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold backdrop-blur-md ${
                      isDark ? "bg-black/60 text-white" : "bg-white/80 text-[#142617]"
                    }`}
                  >
                    {catName}
                  </span>
                </div>

                {/* Product Info */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold tracking-tight">{prod.name}</h3>
                    <p className="text-[11px] text-[#627766] mt-0.5 flex items-center gap-1">
                      <Layers size={12} /> {prod.sku || "Atelier Master SKU"}
                    </p>
                    <p className="text-[11px] font-mono text-[#859b89] mt-0.5">
                      {prod.stock !== undefined ? `${prod.stock} units available` : "Crafted to Order"}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-inherit flex items-end justify-between">
                    <div>
                      <span className="text-[11px] text-[#859b89] line-through block">
                        Retail: £{retailPrice}
                      </span>
                      <span className="text-lg font-bold text-[#3e7b52] block leading-tight">
                        £{tradePrice}{" "}
                        <span className="text-[10px] font-normal text-[#627766]">Trade Ex. VAT</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOrderMemo(prod.name)}
                        title="Request Free Memo Swatch"
                        className={`p-2 rounded-full border transition-colors ${
                          isDark
                            ? "border-[#2e3f31] text-[#9db3a1] hover:text-white hover:bg-[#1f2b21]"
                            : "border-[#d8e6dc] text-[#526956] hover:text-[#142617] hover:bg-[#edf6f0]"
                        }`}
                      >
                        <ShoppingBag size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProductForQuote(prod);
                          setRequestModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-full bg-[#3e7b52] text-white text-xs font-bold hover:bg-[#346a45] transition-all flex items-center gap-1 shadow-sm"
                      >
                        <Plus size={13} /> Add to Quote
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <RequestQuoteModal
        isOpen={requestModalOpen}
        initialProduct={selectedProductForQuote}
        onClose={() => {
          setRequestModalOpen(false);
          setSelectedProductForQuote(null);
        }}
      />
    </div>
  );
}
