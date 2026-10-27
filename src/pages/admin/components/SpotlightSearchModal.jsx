import { useState, useEffect, useRef } from "react";
import {
  Search,
  Package,
  ShoppingBag,
  Users,
  Settings,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useAdmin } from "../AdminContext";
import { getCleanProductImage } from "../utils/productUtils";

export default function SpotlightSearchModal() {
  const {
    spotlightOpen,
    setSpotlightOpen,
    theme,
    setActiveTab,
    setSelectedOrder,
    setNewProductOpen,
    products,
    orders,
  } = useAdmin();

  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const isDark = theme === "dark";

  useEffect(() => {
    if (spotlightOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
    }
  }, [spotlightOpen]);

  if (!spotlightOpen) return null;

  const quickNav = [
    { label: "Overview", tab: "overview", icon: Sparkles },
    { label: "Creations & Catalog", tab: "manage", icon: Package },
    { label: "Activity Log", tab: "activity", icon: ShoppingBag },
    { label: "Rewards & VIP Patrons", tab: "program", icon: Users },
    { label: "Curator Account", tab: "account", icon: Settings },
  ];

  // Dynamic matching creations from live products
  const matchingProducts = (products || [])
    .filter((p) => {
      const q = query.toLowerCase();
      const cat = typeof p.category === "string" ? p.category : p.category?.name || "";
      return (
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        cat.toLowerCase().includes(q)
      );
    })
    .slice(0, 6);

  // Dynamic matching orders from live orders
  const matchingOrders = (orders || [])
    .filter((o) => {
      const q = query.toLowerCase();
      const ordId = (o.orderNumber || o.code || o._id || "").toLowerCase();
      const clientName = (
        o.shippingAddress?.fullName ||
        o.user?.name ||
        o.customer?.name ||
        ""
      ).toLowerCase();
      return ordId.includes(q) || clientName.includes(q);
    })
    .slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div
        className="fixed inset-0"
        onClick={() => setSpotlightOpen(false)}
      />

      <div
        className={`relative w-full max-w-2xl rounded-3xl border shadow-2xl overflow-hidden transition-all duration-200 ${
          isDark
            ? "bg-[#18201a] border-[#293a2c] text-[#f2f7f3]"
            : "bg-white border-[#e2ece4] text-[#1e2a21]"
        }`}
      >
        {/* Search Input Bar */}
        <div
          className={`flex items-center gap-3 px-5 py-4 border-b ${
            isDark ? "border-[#293a2c]" : "border-[#e5ede6]"
          }`}
        >
          <Search size={18} className="text-[#3e7b52] dark:text-[#74b886]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, creation, patron name, or order #..."
            className="w-full bg-transparent text-sm font-sans focus:outline-none placeholder-current/40"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="p-1 text-xs opacity-60 hover:opacity-100"
            >
              Clear
            </button>
          )}
          <button
            onClick={() => setSpotlightOpen(false)}
            className={`p-1.5 rounded-lg border text-xs font-mono ${
              isDark
                ? "bg-[#141a15] border-[#253327]"
                : "bg-[#f5f9f6] border-[#d8e6dc] text-[#2d5538]"
            }`}
          >
            ESC
          </button>
        </div>

        {/* Search Results / Quick Actions */}
        <div className="p-4 max-h-[460px] overflow-y-auto scrollbar-thin space-y-4">
          {!query && (
            <div>
              <p
                className={`text-[10px] font-mono tracking-widest uppercase mb-2 ${
                  isDark ? "text-[#8a9d8e]" : "text-[#788c7e]"
                }`}
              >
                QUICK NAVIGATION
              </p>
              <div className="grid grid-cols-2 gap-2">
                {quickNav.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveTab(item.tab);
                        setSpotlightOpen(false);
                      }}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left text-xs font-medium transition-colors ${
                        isDark
                          ? "bg-[#141a15] border-[#253327] hover:border-[#4a8b5e]"
                          : "bg-[#fcfdfc] border-[#e7f0e9] hover:bg-[#f2f8f4] hover:border-[#3e7b52]"
                      }`}
                    >
                      <Icon size={16} className="text-[#3e7b52] dark:text-[#74b886]" />
                      <span className="font-semibold">{item.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-3 border-t border-current/10">
                <button
                  onClick={() => {
                    setSpotlightOpen(false);
                    setNewProductOpen(true);
                  }}
                  className="flex items-center justify-between w-full p-3 rounded-2xl bg-[#3e7b52] hover:bg-[#346945] text-white text-xs font-semibold uppercase tracking-wider transition-colors shadow-sm shadow-[#3e7b52]/20"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={15} />
                    + Add New Luxury Creation
                  </span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Filtered Creations from Live Database */}
          {query && matchingProducts.length > 0 && (
            <div>
              <p
                className={`text-[10px] font-mono tracking-widest uppercase mb-2 ${
                  isDark ? "text-[#8a9d8e]" : "text-[#788c7e]"
                }`}
              >
                MATCHING CREATIONS ({matchingProducts.length})
              </p>
              <div className="space-y-1.5">
                {matchingProducts.map((p) => {
                  const cat = typeof p.category === "string" ? p.category : p.category?.name || "Boutique Creation";
                  const price = Number(p.pricing?.retailPrice || p.price || 0);
                  const img = getCleanProductImage(p);

                  return (
                    <div
                      key={p._id || p.id}
                      onClick={() => {
                        setActiveTab("manage");
                        setSpotlightOpen(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-colors ${
                        isDark
                          ? "bg-[#141a15] border-[#253327] hover:border-[#4a8b5e]"
                          : "bg-[#fcfdfc] border-[#e7f0e9] hover:border-[#3e7b52]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={img}
                          alt={p.name}
                          className="w-9 h-9 rounded-xl object-cover bg-neutral-100"
                        />
                        <div>
                          <p className="text-xs font-sans font-bold">{p.name}</p>
                          <span className="text-[10px] font-mono text-[#3e7b52] dark:text-[#74b886]">
                            {cat} • £{price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-[#3e7b52] dark:text-[#74b886]">
                        {p.stock !== undefined ? `${p.stock} units` : "In Stock"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filtered Orders from Live Database */}
          {query && matchingOrders.length > 0 && (
            <div>
              <p
                className={`text-[10px] font-mono tracking-widest uppercase mb-2 ${
                  isDark ? "text-[#8a9d8e]" : "text-[#788c7e]"
                }`}
              >
                PATRON COMMISSIONS ({matchingOrders.length})
              </p>
              <div className="space-y-1.5">
                {matchingOrders.map((ord) => {
                  const ordId = ord.orderNumber || ord.code || (ord._id ? `ORD-${ord._id.slice(-6).toUpperCase()}` : "ORD-0001");
                  const clientName = ord.shippingAddress?.fullName || ord.user?.name || ord.customer?.name || "Atelier Patron";
                  const amt = Number(ord.totalAmount || ord.grandTotal || ord.totalPrice || ord.total) || 0;
                  const status = ord.status || "CONFIRMED";

                  return (
                    <div
                      key={ord._id || ord.id}
                      onClick={() => {
                        setSelectedOrder(ord);
                        setSpotlightOpen(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-2xl border cursor-pointer transition-colors ${
                        isDark
                          ? "bg-[#141a15] border-[#253327] hover:border-[#4a8b5e]"
                          : "bg-[#fcfdfc] border-[#e7f0e9] hover:border-[#3e7b52]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#eaf5ed] text-[#2e6d3f] flex items-center justify-center font-bold text-xs">
                          {clientName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-[#3e7b52] dark:text-[#74b886]">
                              {ordId}
                            </span>
                            <span className="text-xs font-sans font-bold">
                              {clientName}
                            </span>
                          </div>
                          <span className="text-[10px] font-sans opacity-70">
                            {status} • {ord.shippingAddress?.city || "United Kingdom"}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold">
                        £{amt.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {query && matchingProducts.length === 0 && matchingOrders.length === 0 && (
            <div className="py-8 text-center text-xs text-[#627766]">
              No creations or commissions match "{query}".
            </div>
          )}
        </div>

        {/* Modal Footer Key Guide */}
        <div
          className={`flex items-center justify-between px-5 py-3 border-t text-[11px] font-mono ${
            isDark
              ? "bg-[#141a15] border-[#293a2c] text-[#7f9183]"
              : "bg-[#f5f9f6] border-[#e5ede6] text-[#788c7e]"
          }`}
        >
          <span>Live catalog & orders search</span>
          <span>Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
}
