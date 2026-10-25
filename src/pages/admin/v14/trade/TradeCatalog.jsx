import { useState } from "react";
import { Search, Plus, Filter, Check, ShoppingBag, Eye, Layers } from "lucide-react";
import { useAdmin } from "../../AdminContext";
import { showToast } from "../../../../utils/sweetAlert";
import RequestQuoteModal from "./RequestQuoteModal";

const TRADE_CATALOG_PRODUCTS = [
  {
    id: "prod_01",
    name: "ARTEMIS Wallpaper - Wild Flora Noir",
    category: "Wallpaper",
    substrate: "FSC Non-Woven Paper",
    retailPrice: 220,
    unit: "Roll (10m x 0.52m)",
    image: "https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80",
    inStock: true,
  },
  {
    id: "prod_02",
    name: "BABYLON Velvet Upholstery - Moss Green",
    category: "Fabric",
    substrate: "100% British Cotton Velvet",
    retailPrice: 185,
    unit: "Per Linear Metre",
    image: "https://images.unsplash.com/photo-1584589167171-541ce45f1eea?auto=format&fit=crop&w=600&q=80",
    inStock: true,
  },
  {
    id: "prod_03",
    name: "TRELLIS Silk Fringe Cushion - Heritage Gold",
    category: "Cushions",
    substrate: "Silk Blend with Bullion Fringe",
    retailPrice: 160,
    unit: "Filled Piece (50x50cm)",
    image: "https://images.unsplash.com/photo-1579656381226-5fc0f0100c3b?auto=format&fit=crop&w=600&q=80",
    inStock: true,
  },
  {
    id: "prod_04",
    name: "PHANTASIA Jacquard Fabric - Sage Lapis",
    category: "Fabric",
    substrate: "Woven Silk & Viscose Blend",
    retailPrice: 240,
    unit: "Per Linear Metre",
    image: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80",
    inStock: true,
  },
  {
    id: "prod_05",
    name: "HOLLYHOCKS British Heritage Velvet - Spring",
    category: "Fabric",
    substrate: "Loom-Finished Cotton Velvet",
    retailPrice: 210,
    unit: "Per Linear Metre",
    image: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80",
    inStock: true,
  },
  {
    id: "prod_06",
    name: "ZELLIGE Handcrafted Tile - Emerald Gloss",
    category: "Tiles",
    substrate: "Glazed Terracotta",
    retailPrice: 195,
    unit: "Square Metre (10x10cm tiles)",
    image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
    inStock: true,
  },
];

export default function TradeCatalog() {
  const { theme, tradeProfile } = useAdmin();
  const isDark = theme === "dark";

  const discountPercent = tradeProfile?.tier?.discountPercentage || 25;
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [requestModalOpen, setRequestModalOpen] = useState(false);

  const categories = ["ALL", "Wallpaper", "Fabric", "Cushions", "Tiles"];

  const filteredProducts = TRADE_CATALOG_PRODUCTS.filter((prod) => {
    const matchesCat =
      selectedCategory === "ALL" || prod.category === selectedCategory;
    const matchesSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.substrate.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleOrderMemo = (prodName) => {
    showToast(`Complimentary memo sample requested for ${prodName}`);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Wholesale Trade Catalog
          </h1>
          <p className="text-xs text-[#627766] mt-0.5">
            Exclusive professional trade wholesale pricing with your {discountPercent}% tier concession
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
          {categories.map((cat) => (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => {
          const tradePrice = Math.round(prod.retailPrice * (1 - discountPercent / 100));

          return (
            <div
              key={prod.id}
              className={`rounded-2xl border overflow-hidden flex flex-col transition-all group ${
                isDark
                  ? "bg-[#141a15] border-[#253327] hover:border-[#334636]"
                  : "bg-white border-[#e4ede5] hover:border-[#c9dece] shadow-sm hover:shadow-md"
              }`}
            >
              {/* Image Frame */}
              <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-900">
                <img
                  src={prod.image}
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
                  {prod.category}
                </span>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold tracking-tight">{prod.name}</h3>
                  <p className="text-[11px] text-[#627766] mt-0.5 flex items-center gap-1">
                    <Layers size={12} /> {prod.substrate}
                  </p>
                  <p className="text-[11px] font-mono text-[#859b89] mt-0.5">{prod.unit}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-inherit flex items-end justify-between">
                  <div>
                    <span className="text-[11px] text-[#859b89] line-through block">
                      Retail: £{prod.retailPrice}
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
                      onClick={() => setRequestModalOpen(true)}
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

      <RequestQuoteModal
        isOpen={requestModalOpen}
        onClose={() => setRequestModalOpen(false)}
      />
    </div>
  );
}
