import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  ShoppingBag,
  MapPin,
  Heart,
  ShieldCheck,
  Briefcase,
  LogOut,
  LogIn,
  UserPlus,
  Lock,
  ChevronRight,
  ExternalLink,
  Package,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Edit2,
  Sparkles,
  ArrowRight,
  Search,
  Check,
  X,
  FileText,
  Printer,
  Smartphone,
  Laptop,
} from "lucide-react";

import userService from "../services/userService";
import { setAuthUser, logout } from "../features/auth/authSlice";
import { addToCart } from "../features/carts/cartSlice";
import { getProductImage } from "../utils/getProductImage";
import {
  showSuccess,
  showError,
  showConfirm,
  showToast,
  showLoading,
  closeAlert,
} from "../utils/sweetAlert";
import {
  getStoredWishlist,
  removeWishlistItem,
  clearAllWishlist,
} from "../utils/wishlist";
import { syncProductData } from "../utils/productSync";

function formatCurrency(amount, currency = "GBP") {
  if (amount === null || amount === undefined || !Number.isFinite(Number(amount))) {
    return "£0.00";
  }
  const curr = currency || "GBP";
  const locale = curr === "GBP" ? "en-GB" : curr === "USD" ? "en-US" : "de-DE";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 2,
    }).format(Number(amount));
  } catch {
    return `£${Number(amount).toFixed(2)}`;
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const TABS = [
  { id: "overview", label: "Overview", icon: User, desc: "Account dashboard & summary" },
  { id: "orders", label: "My Orders", icon: Package, desc: "Order history & deliveries" },
  { id: "addresses", label: "Residences", icon: MapPin, desc: "Shipping & billing addresses" },
  { id: "wishlist", label: "Wishlist", icon: Heart, desc: "Saved wallpapers, fabrics & decor" },
  { id: "details", label: "Personal Details", icon: FileText, desc: "Contact & preferences" },
  { id: "security", label: "Security", icon: ShieldCheck, desc: "Password & active sessions" },
  { id: "trade", label: "Trade Concierge", icon: Briefcase, desc: "B2B privileges & designer tier" },
];

export default function Profile({ defaultTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const params = useParams();

  const { user, token } = useSelector((state) => state.auth || {});
  const isAuthenticated = Boolean(user && token);

  // Active Tab determination
  const activeTab = useMemo(() => {
    if (params.tab && TABS.some((t) => t.id === params.tab.toLowerCase())) {
      return params.tab.toLowerCase();
    }
    if (defaultTab && TABS.some((t) => t.id === defaultTab.toLowerCase())) {
      return defaultTab.toLowerCase();
    }
    if (location.pathname.includes("/orders")) return "orders";
    if (location.pathname.includes("/wishlist")) return "wishlist";
    if (location.pathname.includes("/addresses")) return "addresses";
    return isAuthenticated ? "overview" : "wishlist";
  }, [params.tab, defaultTab, location.pathname, isAuthenticated]);

  const handleTabChange = (tabId) => {
    if (!isAuthenticated && tabId !== "wishlist") {
      navigate(`/login?redirect=${encodeURIComponent(`/profile/${tabId}`)}`);
      return;
    }
    navigate(tabId === "wishlist" ? "/wishlist" : `/profile/${tabId}`);
  };

  // Live Data States
  const [profileData, setProfileData] = useState(user || null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [tradeProfile, setTradeProfile] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  // Modals state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState("");

  // Check roles
  const roles = user?.roles || [];
  const isSuperAdmin = roles.some(
    (r) =>
      r === "super-admin" ||
      r === "super_admin" ||
      r?.slug === "super_admin" ||
      r?.name === "SUPER_ADMIN"
  );
  const isAdmin =
    isSuperAdmin ||
    roles.some(
      (r) =>
        r === "admin" ||
        r?.slug === "admin" ||
        r?.name === "ADMIN" ||
        user?.accountType === "ADMIN"
    );

  // Load User Data
  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setLoading(true);

        // If guest/unauthenticated, load local storage items without triggering 401s
        if (!token) {
          const localWishlist = getStoredWishlist();
          setWishlistItems(localWishlist);
          const localOrders = JSON.parse(localStorage.getItem("hoh_local_orders") || "[]");
          // For guests without an account, only show orders with no registered user ID
          const guestOrders = localOrders.filter(
            (o) => !o.userId && (!o.user?.email || o.user?.email === "patron@houseofhackney.com")
          );
          setOrders(guestOrders);
          return;
        }

        const [
          meRes,
          ordersRes,
          addressesRes,
          wishlistRes,
          sessionsRes,
          tradeRes,
        ] = await Promise.allSettled([
          userService.getProfile(),
          userService.getOrders(),
          userService.getAddresses(),
          userService.getWishlist(),
          userService.getSessions(),
          userService.getTradeProfile(),
        ]);

        if (!isMounted) return;

        let activeUser = user;
        if (meRes.status === "fulfilled" && meRes.value) {
          activeUser = meRes.value;
          setProfileData(meRes.value);
          dispatch(setAuthUser(meRes.value));
        }

        // Merge server orders with local orders belonging strictly to THIS user
        const localOrders = JSON.parse(localStorage.getItem("hoh_local_orders") || "[]");
        const userEmail = (activeUser?.email || user?.email || "").toLowerCase().trim();
        const userId = String(activeUser?._id || activeUser?.id || user?._id || user?.id || "");

        // Only include local orders if they belong to this authenticated user
        const userLocalOrders = localOrders.filter((lo) => {
          const loEmail = (lo.user?.email || lo.client?.email || lo.email || "").toLowerCase().trim();
          const loUserId = String(lo.userId || lo.user?._id || lo.user?.id || "");
          if (userId && loUserId && loUserId === userId) return true;
          if (userEmail && loEmail && loEmail === userEmail) return true;
          return false;
        });

        const apiOrders = ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value)
          ? ordersRes.value
          : [];

        // Server orders from /orders are authoritative and already scoped by user ID
        const combinedOrders = [
          ...userLocalOrders.filter(
            (lo) => !apiOrders.some((ao) => ao._id === lo._id || ao.orderNumber === lo.orderNumber)
          ),
          ...apiOrders,
        ];
        setOrders(combinedOrders);

        if (addressesRes.status === "fulfilled") {
          setAddresses(addressesRes.value || []);
        }

        // Server wishlist is authoritative for authenticated user
        if (wishlistRes.status === "fulfilled") {
          const rawItems = Array.isArray(wishlistRes.value) ? wishlistRes.value : [];
          const serverItems = rawItems.map((item) => {
            const prod = item.product || item;
            return {
              _id: prod._id || prod.id || item._id,
              id: prod._id || prod.id || item._id,
              productId: prod._id || prod.id || item._id,
              name: prod.name || prod.title || "House of Hackney Creation",
              title: prod.name || prod.title || "House of Hackney Creation",
              price: prod.pricing?.sellingPrice ?? prod.pricing?.basePrice ?? prod.price ?? 125,
              currency: prod.pricing?.currency || prod.currency || "GBP",
              category: prod.category?.name || prod.categoryName || prod.category,
              colours: prod.colours || [],
              images: prod.images || [],
              image: prod.image || prod.media?.thumbnail?.url || (prod.images && prod.images[0]?.url) || "",
              slug: prod.slug || prod._id,
              inventory: prod.inventory,
              inStock: Boolean(
                prod.inventory
                  ? prod.inventory.inStock !== false && prod.inventory.status !== "OUT_OF_STOCK"
                  : true
              ),
            };
          });

          setWishlistItems(serverItems);
          saveStoredWishlist(serverItems);
        } else {
          const localWishlist = getStoredWishlist();
          setWishlistItems(localWishlist);
        }

        if (sessionsRes.status === "fulfilled") {
          setSessions(sessionsRes.value || []);
        }

        if (tradeRes.status === "fulfilled") {
          setTradeProfile(tradeRes.value || null);
        }
      } catch (err) {
        console.error("Error loading account data:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [dispatch, refreshKey, token]);

  // Handle Logout
  const handleLogout = async () => {
    const res = await showConfirm(
      "Sign Out",
      "Are you sure you wish to sign out of your House of Hackney sanctuary?"
    );
    if (!res.isConfirmed) return;

    try {
      showLoading("Signing out...");
      sessionStorage.removeItem("refreshToken");
      setProfileData(null);
      setOrders([]);
      setAddresses([]);
      setWishlistItems([]);
      setSessions([]);
      setTradeProfile(null);
      saveStoredWishlist([]);
      dispatch(logout());
      closeAlert();
      showToast("You have been signed out successfully.");
      navigate("/login");
    } catch {
      closeAlert();
      navigate("/login");
    }
  };

  // Refresh helper
  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  // User Display Info
  const isGuest = !isAuthenticated;

  const displayName = isGuest
    ? (activeTab === "wishlist" ? "Curated Wishlist" : "Guest Sanctuary")
    : profileData?.firstName
    ? `${profileData.firstName} ${profileData?.lastName || ""}`.trim()
    : profileData?.email?.split("@")[0] || "Esteemed Patron";

  const userInitials = isGuest
    ? "HOH"
    : profileData?.firstName
    ? `${profileData.firstName.charAt(0)}${profileData?.lastName?.charAt(0) || ""}`.toUpperCase()
    : "HOH";

  return (
    <div className="min-h-screen bg-[#f6f3ec] text-[#171713] pb-24 overflow-x-clip w-full max-w-full">
      {/* Top Breadcrumb & Luxury Sanctuary Banner */}
      <div className="border-b border-[#dedbd4] bg-[#faf8f4] w-full overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-5 sm:py-8 sm:px-6 lg:px-8 w-full overflow-hidden">
          <div className="flex flex-col gap-5 sm:gap-6 md:flex-row md:items-center md:justify-between">
            {/* Patron Profile Info */}
            <div className="flex items-center gap-3.5 sm:gap-5 min-w-0">
              <div className="relative flex h-14 w-14 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-2xl bg-[#394132] text-white shadow-md ring-2 sm:ring-4 ring-[#dedbd4]/50">
                {isGuest ? (
                  <Heart size={26} className="text-[#d4af37]" fill="#d4af37" />
                ) : (
                  <span className="font-serif text-xl sm:text-3xl tracking-wider font-semibold">
                    {userInitials}
                  </span>
                )}
                <span className="absolute -bottom-1 -right-1 flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-[#c29b38] text-white shadow">
                  <Sparkles size={11} className="sm:w-3.5 sm:h-3.5" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="font-serif text-xl sm:text-3xl font-medium tracking-tight text-[#171713] truncate">
                    {displayName}
                  </h1>
                  {isGuest ? (
                    <span className="rounded-full bg-[#e8e4db] px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-widest text-[#555] uppercase">
                      Guest Session
                    </span>
                  ) : isSuperAdmin ? (
                    <span className="rounded-full bg-[#171713] px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-widest text-[#d4af37] border border-[#d4af37]/40 uppercase shadow-sm">
                      Super Admin
                    </span>
                  ) : isAdmin ? (
                    <span className="rounded-full bg-[#394132] px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-widest text-white uppercase shadow-sm">
                      Administrator
                    </span>
                  ) : tradeProfile?.status === "APPROVED" ? (
                    <span className="rounded-full bg-[#c29b38]/15 px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-widest text-[#8a681c] border border-[#c29b38]/40 uppercase">
                      Trade Partner
                    </span>
                  ) : (
                    <span className="rounded-full bg-[#e8e4db] px-2.5 py-0.5 text-[9px] sm:text-[10px] font-semibold tracking-widest text-[#555] uppercase">
                      House Patron
                    </span>
                  )}
                </div>

                {isGuest ? (
                  <p className="mt-1 text-xs sm:text-sm text-[#66645e]">
                    Saved in this browser session. Sign in to sync your wishlist across devices &amp; manage orders.
                  </p>
                ) : (
                  <>
                    <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-[#66645e] truncate">
                      {profileData?.email}
                      {profileData?.phone && ` • ${profileData.phone}`}
                    </p>

                    <p className="mt-0.5 text-[10px] sm:text-[11px] uppercase tracking-wider text-[#99968e]">
                      Patron Sanctuary &bull; Member since {formatDate(profileData?.createdAt || new Date())}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Quick Actions (Admin switcher & Logout if logged in, Log In & Register if guest) */}
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-[#394132] px-3.5 py-2.5 text-xs font-medium tracking-[0.8px] text-white hover:bg-[#282e23] transition-all shadow-sm"
                >
                  <span>ADMIN DASHBOARD</span>
                  <ExternalLink size={13} />
                </Link>
              )}

              {isAuthenticated ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-[#dedbd4] bg-white px-3.5 py-2.5 text-xs font-medium tracking-[0.8px] text-[#555] hover:border-red-400 hover:text-red-700 hover:bg-red-50/50 transition-all shadow-xs cursor-pointer"
                >
                  <LogOut size={13} />
                  <span>SIGN OUT</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <Link
                    to={`/login?redirect=${encodeURIComponent(location.pathname)}`}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-[#394132] px-4 py-2.5 text-xs font-semibold tracking-[0.8px] text-white hover:bg-[#282e23] transition-all shadow-sm"
                  >
                    <LogIn size={13} />
                    <span>LOG IN</span>
                  </Link>
                  <Link
                    to={`/register?redirect=${encodeURIComponent(location.pathname)}`}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-[#dedbd4] bg-white px-4 py-2.5 text-xs font-medium tracking-[0.8px] text-[#171713] hover:border-[#171713] transition-all shadow-xs"
                  >
                    <UserPlus size={13} />
                    <span>REGISTER</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Sanctuary Layout */}
      <div className="mx-auto max-w-7xl px-4 pt-5 sm:pt-8 sm:px-6 lg:px-8 w-full overflow-hidden">
        {/* Mobile Horizontal Pill Navigation Rail (visible on mobile/tablet) */}
        <div className="block lg:hidden mb-5 w-full overflow-hidden">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-0.5 no-scrollbar w-full">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              let badgeCount = null;
              if (tab.id === "orders") badgeCount = orders.length;
              if (tab.id === "wishlist") badgeCount = wishlistItems.length;
              if (tab.id === "addresses") badgeCount = addresses.length;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#394132] text-white shadow-xs"
                      : "bg-white border border-[#dedbd4] text-[#44423c] hover:bg-[#faf8f4] hover:text-[#171713]"
                  }`}
                >
                  <Icon
                    size={15}
                    className={isActive ? "text-[#d4af37]" : "text-[#77746c]"}
                  />
                  <span>{tab.label}</span>
                  {!isAuthenticated && tab.id !== "wishlist" && (
                    <Lock size={10} className="text-[#99968e] ml-0.5" />
                  )}
                  {badgeCount !== null && (
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-[#e8e5dc] text-[#555]"
                      }`}
                    >
                      {badgeCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-4 w-full">
          {/* Navigation Tab Sidebar (Desktop Only) */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-28 space-y-1.5 rounded-2xl border border-[#dedbd4] bg-white p-3 shadow-xs">
              <div className="px-3 py-2 text-[11px] font-semibold tracking-[1.5px] uppercase text-[#88857d]">
                SANCTUARY MENU
              </div>

              <nav className="flex flex-col gap-1.5">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  let badgeCount = null;
                  if (tab.id === "orders") badgeCount = orders.length;
                  if (tab.id === "wishlist") badgeCount = wishlistItems.length;
                  if (tab.id === "addresses") badgeCount = addresses.length;

                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left transition-all text-xs sm:text-sm font-medium cursor-pointer ${
                        isActive
                          ? "bg-[#394132] text-white shadow-sm"
                          : "text-[#44423c] hover:bg-[#f6f3ec] hover:text-[#171713]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={isActive ? "text-[#d4af37]" : "text-[#77746c]"}
                        />
                        <span className="tracking-[0.3px]">{tab.label}</span>
                        {!isAuthenticated && tab.id !== "wishlist" && (
                          <Lock size={11} className="text-[#99968e] opacity-75" />
                        )}
                      </div>

                      {badgeCount !== null && (
                        <span
                          className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[#e8e5dc] text-[#555]"
                          }`}
                        >
                          {badgeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              {/* Assistance Box */}
              <div className="mt-4 rounded-xl bg-[#f6f3ec] p-4 text-xs text-[#55534c] border border-[#dedbd4]">
                <p className="font-semibold text-[#171713] uppercase tracking-[0.5px]">
                  Concierge Support
                </p>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Need assistance with custom prints, upholstery, or sample swatches?
                </p>
                <Link
                  to="/design-services"
                  className="mt-2 inline-flex items-center gap-1 font-semibold text-[#394132] hover:underline text-[11px] uppercase tracking-wider"
                >
                  <span>Book Consultation</span>
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </aside>

          {/* Active Tab Main Content */}
          <main className="lg:col-span-3 min-w-0 w-full overflow-hidden">
            {activeTab === "overview" && (
              <OverviewSection
                user={profileData}
                orders={orders}
                addresses={addresses}
                wishlistItems={wishlistItems}
                tradeProfile={tradeProfile}
                onNavigateTab={handleTabChange}
                onSelectOrder={setSelectedOrder}
              />
            )}

            {activeTab === "orders" && (
              <OrdersSection
                orders={orders}
                loading={loading}
                onSelectOrder={setSelectedOrder}
                onOpenCancel={(order) => {
                  setCancelModalOrder(order);
                  setCancelReason("");
                }}
              />
            )}

            {activeTab === "addresses" && (
              <AddressesSection
                addresses={addresses}
                loading={loading}
                onUpdateAddresses={setAddresses}
                onOpenAdd={() => {
                  setEditingAddress(null);
                  setAddressModalOpen(true);
                }}
                onOpenEdit={(addr) => {
                  setEditingAddress(addr);
                  setAddressModalOpen(true);
                }}
                onRefresh={triggerRefresh}
              />
            )}

            {activeTab === "wishlist" && (
              <WishlistSection
                items={wishlistItems}
                loading={loading}
                onUpdateItems={setWishlistItems}
                onRefresh={triggerRefresh}
                isAuthenticated={isAuthenticated}
              />
            )}

            {activeTab === "details" && (
              <PersonalDetailsSection
                key={profileData?._id || profileData?.id || "patron-details"}
                user={profileData}
                onUpdateUser={(updated) => {
                  setProfileData(updated);
                  dispatch(setAuthUser(updated));
                }}
              />
            )}

            {activeTab === "security" && (
              <SecuritySection
                sessions={sessions}
                user={profileData || user}
                onRefresh={triggerRefresh}
              />
            )}

            {activeTab === "trade" && (
              <TradeSection
                tradeProfile={tradeProfile}
                user={profileData || user}
                onRefresh={triggerRefresh}
              />
            )}
          </main>
        </div>
      </div>

      {/* --- Modals --- */}
      {/* Order Details & Invoice Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
        />
      )}

      {/* Cancel Order Modal */}
      {cancelModalOrder && (
        <CancelOrderModal
          order={cancelModalOrder}
          reason={cancelReason}
          setReason={setCancelReason}
          onClose={() => setCancelModalOrder(null)}
          onSuccess={() => {
            setCancelModalOrder(null);
            triggerRefresh();
          }}
        />
      )}

      {/* Add / Edit Address Modal */}
      {addressModalOpen && (
        <AddressFormModal
          address={editingAddress}
          onClose={() => setAddressModalOpen(false)}
          onOptimisticSave={(savedAddr) => {
            if (editingAddress) {
              setAddresses((prev) =>
                prev.map((a) => (a._id === (editingAddress._id || editingAddress.id) ? { ...a, ...savedAddr } : a))
              );
            } else {
              setAddresses((prev) => [
                { ...savedAddr, _id: savedAddr._id || `addr_${Date.now()}` },
                ...prev,
              ]);
            }
          }}
          onSuccess={() => {
            setAddressModalOpen(false);
            triggerRefresh();
          }}
        />
      )}
    </div>
  );
}

// ==========================================
// 1. OVERVIEW / DASHBOARD SECTION
// ==========================================
function OverviewSection({
  orders,
  addresses,
  wishlistItems,
  tradeProfile,
  onNavigateTab,
  onSelectOrder,
}) {
  const recentOrders = useMemo(() => orders.slice(0, 3), [orders]);
  const defaultAddress = useMemo(
    () => addresses.find((a) => a.isDefault) || addresses[0] || null,
    [addresses]
  );

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-[#dedbd4] bg-white p-4 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-radial from-[#394132]/5 to-transparent pointer-events-none" />

        <div className="max-w-2xl">
          <span className="text-[10px] sm:text-[11px] font-semibold tracking-[2px] uppercase text-[#c29b38]">
            SANCTUARY WELCOME
          </span>
          <h2 className="mt-1 font-serif text-xl sm:text-3xl text-[#171713]">
            Welcome to your Patron Portal
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[#66645e] leading-relaxed">
            Manage your bespoke interior commissions, track parcel despatches from our English
            print mills, curate luxury wishlists, and manage your private residential addresses.
          </p>
        </div>

        {/* Quick Stat Cards */}
        <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-4">
          <button
            type="button"
            onClick={() => onNavigateTab("orders")}
            className="flex flex-col rounded-xl border border-[#dedbd4] bg-[#faf8f4] p-3 sm:p-4 min-h-[96px] sm:min-h-[110px] justify-between text-left hover:border-[#394132] transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#77746c]">
              <Package size={17} />
              <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-serif font-medium text-[#171713]">
                {orders.length}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.5px] text-[#77746c]">
                Commissions Placed
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("wishlist")}
            className="flex flex-col rounded-xl border border-[#dedbd4] bg-[#faf8f4] p-3 sm:p-4 min-h-[96px] sm:min-h-[110px] justify-between text-left hover:border-[#394132] transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#77746c]">
              <Heart size={17} />
              <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-serif font-medium text-[#171713]">
                {wishlistItems.length}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.5px] text-[#77746c]">
                Saved Treasures
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("addresses")}
            className="flex flex-col rounded-xl border border-[#dedbd4] bg-[#faf8f4] p-3 sm:p-4 min-h-[96px] sm:min-h-[110px] justify-between text-left hover:border-[#394132] transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#77746c]">
              <MapPin size={17} />
              <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-serif font-medium text-[#171713]">
                {addresses.length}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.5px] text-[#77746c]">
                Saved Residences
              </span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab("trade")}
            className="flex flex-col rounded-xl border border-[#dedbd4] bg-[#faf8f4] p-3 sm:p-4 min-h-[96px] sm:min-h-[110px] justify-between text-left hover:border-[#394132] transition-colors group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#77746c]">
              <Briefcase size={17} />
              <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="block text-sm sm:text-base font-serif font-medium text-[#171713] truncate">
                {tradeProfile?.status === "APPROVED" ? "Tier Active" : "Apply for B2B"}
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium uppercase tracking-[0.5px] text-[#77746c]">
                Trade Tier
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Default Address */}
      <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-3">
        {/* Recent Orders (2 cols) */}
        <div className="md:col-span-2 space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg sm:text-xl text-[#171713]">Recent Commissions</h3>
            {orders.length > 0 && (
              <button
                type="button"
                onClick={() => onNavigateTab("orders")}
                className="text-xs font-medium text-[#394132] hover:underline uppercase tracking-wider cursor-pointer"
              >
                View all ({orders.length})
              </button>
            )}
          </div>

          {recentOrders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#dedbd4] bg-white p-6 sm:p-8 text-center">
              <Package size={34} className="mx-auto text-[#bbb8b0]" />
              <p className="mt-3 font-serif text-base sm:text-lg text-[#171713]">No orders yet</p>
              <p className="mt-1 text-xs text-[#77746c] max-w-sm mx-auto">
                Your bespoke wallpapers, fabrics, and artisanal home furnishings will appear here.
              </p>
              <Link
                to="/products"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#394132] px-5 py-2.5 text-xs font-semibold uppercase tracking-[1px] text-white hover:bg-[#282e23] transition-all"
              >
                <span>EXPLORE COLLECTIONS</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((ord) => {
                const orderId = ord._id || ord.id || "N/A";
                const itemCount = ord.items?.length || 1;
                const total = ord.totalAmount ?? ord.total ?? ord.pricing?.totalPrice ?? 0;
                const status = (ord.status || "CONFIRMED").toUpperCase();

                return (
                  <div
                    key={orderId}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-xl border border-[#dedbd4] bg-white p-3.5 sm:p-4 shadow-2xs hover:border-[#394132]/60 transition-all"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold text-[#171713]">
                          #{orderId.slice(-8).toUpperCase()}
                        </span>
                        <OrderStatusPill status={status} />
                      </div>
                      <p className="mt-1 text-xs text-[#77746c]">
                        Ordered on {formatDate(ord.createdAt)} &bull; {itemCount}{" "}
                        {itemCount === 1 ? "creation" : "creations"}
                      </p>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t sm:border-t-0 pt-2.5 sm:pt-0 border-[#dedbd4]/50">
                      <span className="font-serif text-sm sm:text-base font-semibold text-[#171713]">
                        {formatCurrency(total, ord.currency || "GBP")}
                      </span>
                      <button
                        type="button"
                        onClick={() => onSelectOrder(ord)}
                        className="rounded-lg border border-[#dedbd4] bg-[#faf8f4] px-3 py-1.5 text-xs font-medium text-[#171713] hover:bg-[#394132] hover:text-white transition-colors cursor-pointer"
                      >
                        Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Primary Residence (1 col) */}
        <div className="space-y-4 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-lg sm:text-xl text-[#171713]">Default Residence</h3>
            <button
              type="button"
              onClick={() => onNavigateTab("addresses")}
              className="text-xs font-medium text-[#394132] hover:underline uppercase tracking-wider cursor-pointer"
            >
              Manage
            </button>
          </div>

          {defaultAddress ? (
            <div className="rounded-2xl border border-[#dedbd4] bg-white p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#394132]/10 px-2.5 py-0.5 text-[10px] font-semibold text-[#394132] uppercase tracking-wider">
                  {defaultAddress.type || "DEFAULT"}
                </span>
                <span className="text-[11px] font-medium text-[#77746c] flex items-center gap-1">
                  <Check size={12} className="text-emerald-600" /> Default
                </span>
              </div>

              <div>
                <p className="font-medium text-sm text-[#171713]">
                  {defaultAddress.fullName}
                </p>
                <p className="mt-1 text-xs text-[#55534c] leading-relaxed">
                  {defaultAddress.addressLine1}
                  {defaultAddress.addressLine2 && `, ${defaultAddress.addressLine2}`}
                  <br />
                  {defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}
                  <br />
                  {defaultAddress.country}
                </p>
                <p className="mt-2 text-xs text-[#77746c]">
                  Phone: {defaultAddress.phone}
                </p>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-[#dedbd4] bg-white p-6 text-center">
              <MapPin size={28} className="mx-auto text-[#bbb8b0]" />
              <p className="mt-2 font-serif text-sm text-[#171713]">No address saved</p>
              <p className="mt-1 text-[11px] text-[#77746c]">
                Add your residential delivery address for expedited checkout.
              </p>
              <button
                type="button"
                onClick={() => onNavigateTab("addresses")}
                className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[#394132] underline underline-offset-4 cursor-pointer"
              >
                + Add Address
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. MY ORDERS SECTION
// ==========================================
function OrdersSection({ orders, loading, onSelectOrder, onOpenCancel }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      const orderId = (ord._id || ord.id || "").toLowerCase();
      const status = (ord.status || "CONFIRMED").toUpperCase();

      const matchesSearch =
        !searchTerm.trim() ||
        orderId.includes(searchTerm.toLowerCase().trim()) ||
        (ord.items || []).some((item) =>
          (item.title || item.name || item.product?.title || "")
            .toLowerCase()
            .includes(searchTerm.toLowerCase().trim())
        );

      const matchesStatus =
        statusFilter === "ALL" || status === statusFilter.toUpperCase();

      return matchesSearch && matchesStatus;
    });
  }, [orders, searchTerm, statusFilter]);

  if (loading && orders.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-[#dedbd4] bg-white p-8">
        <p className="font-serif text-lg text-[#77746c] animate-pulse">
          Fetching your commissions & orders...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#171713]">Order Commissions</h2>
          <p className="text-xs text-[#77746c] mt-0.5">
            View status timelines, invoices, and tracking for all luxury orders.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#99968e]"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by order ID or item..."
              className="w-full rounded-xl border border-[#dedbd4] bg-white pl-8 pr-3 py-2 text-xs text-[#171713] placeholder-[#99968e] focus:border-[#394132] focus:outline-hidden"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-[#dedbd4] bg-white px-3 py-2 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dedbd4] bg-white p-8 sm:p-12 text-center">
          <Package size={38} className="mx-auto text-[#bbb8b0]" />
          <h3 className="mt-3 font-serif text-lg sm:text-xl text-[#171713]">
            {orders.length === 0
              ? "No commissions placed yet"
              : "No orders match your filter"}
          </h3>
          <p className="mt-1 text-xs text-[#77746c] max-w-md mx-auto">
            {orders.length === 0
              ? "When you acquire House of Hackney British wallpapers, fabrics, and home decor, they will appear here."
              : "Try clearing your search query or selecting a different status filter."}
          </p>
          {orders.length === 0 && (
            <Link
              to="/products"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#394132] px-6 py-2.5 sm:py-3 text-xs font-semibold uppercase tracking-[1px] text-white hover:bg-[#282e23] transition-all"
            >
              <span>EXPLORE ALL COLLECTIONS</span>
              <ArrowRight size={13} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const orderId = ord._id || ord.id || "";
            const total = ord.totalAmount ?? ord.total ?? ord.pricing?.totalPrice ?? 0;
            const status = (ord.status || "CONFIRMED").toUpperCase();
            const items = ord.items || [];
            const canCancel =
              status === "PENDING" || status === "CONFIRMED" || status === "PROCESSING";

            return (
              <div
                key={orderId}
                className="overflow-hidden rounded-2xl border border-[#dedbd4] bg-white shadow-xs transition-all hover:shadow-md"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dedbd4] bg-[#faf8f4] px-3.5 sm:px-5 py-3 sm:py-4">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#88857d]">
                        Commission ID
                      </span>
                      <p className="font-mono text-xs font-bold text-[#171713]">
                        #{orderId.slice(-8).toUpperCase()}
                      </p>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-[#dedbd4]" />

                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#88857d]">
                        Date Placed
                      </span>
                      <p className="text-xs font-medium text-[#171713]">
                        {formatDate(ord.createdAt)}
                      </p>
                    </div>

                    <div className="hidden sm:block h-6 w-px bg-[#dedbd4]" />

                    <div>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-[#88857d]">
                        Total
                      </span>
                      <p className="font-serif text-xs font-bold text-[#171713]">
                        {formatCurrency(total, ord.currency || "GBP")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <OrderStatusPill status={status} />
                  </div>
                </div>

                {/* Items in Order */}
                <div className="divide-y divide-[#f2efe9] px-3.5 sm:px-5 py-2 sm:py-3">
                  {items.map((item, idx) => {
                    const productObj = item.product || item;
                    const imgInfo = getProductImage(productObj);
                    const title =
                      item.title ||
                      item.name ||
                      productObj.title ||
                      productObj.name ||
                      "House of Hackney Creation";
                    const price = item.price || item.unitPrice || 0;
                    const qty = item.quantity || 1;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-3 py-3"
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img
                            src={imgInfo.url}
                            alt={title}
                            className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-xl object-cover border border-[#dedbd4]/60 bg-[#f6f3ec]"
                          />
                          <div className="min-w-0 flex-1">
                            <h4 className="font-serif text-xs sm:text-sm font-medium text-[#171713] truncate">
                              {title}
                            </h4>
                            <p className="text-[10px] sm:text-[11px] text-[#77746c] truncate">
                              Qty: {qty} &bull; {formatCurrency(price, ord.currency || "GBP")} each
                            </p>
                            {item.variant?.title && (
                              <p className="text-[10px] text-[#99968e] truncate">
                                Option: {item.variant.title}
                              </p>
                            )}
                          </div>
                        </div>

                        <span className="font-serif text-xs sm:text-sm font-semibold text-[#171713] shrink-0 text-right">
                          {formatCurrency(price * qty, ord.currency || "GBP")}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Order Footer Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[#dedbd4] bg-[#faf8f4]/60 px-3.5 sm:px-5 py-3 sm:py-3.5">
                  <div className="text-[11px] text-[#77746c]">
                    {ord.shippingAddress
                      ? `Shipping to: ${ord.shippingAddress.fullName || ord.shippingAddress.city || "Client residence"}`
                      : "Standard English Courier Despatch"}
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {canCancel && (
                      <button
                        type="button"
                        onClick={() => onOpenCancel(ord)}
                        className="flex-1 sm:flex-initial text-center rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => onSelectOrder(ord)}
                      className="flex-1 sm:flex-initial text-center rounded-lg bg-[#394132] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#282e23] transition-colors cursor-pointer"
                    >
                      View Invoice & Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// 3. ADDRESS BOOK SECTION
function AddressesSection({ addresses, loading, onUpdateAddresses, onOpenAdd, onOpenEdit }) {
  const handleDelete = async (addrId) => {
    const res = await showConfirm(
      "Remove Address",
      "Are you sure you wish to delete this delivery residence?"
    );
    if (!res.isConfirmed) return;

    // Optimistically remove address immediately
    onUpdateAddresses?.((prev) => prev.filter((a) => (a._id || a.id) !== addrId));
    showToast("Address deleted successfully.");

    try {
      await userService.deleteAddress(addrId);
    } catch (err) {
      console.warn("Failed to delete address", err);
    }
  };

  const handleSetDefault = async (addrId) => {
    // Optimistically update default address immediately
    onUpdateAddresses?.((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: (a._id || a.id) === addrId,
      }))
    );
    showToast("Default residence updated.");

    try {
      await userService.setDefaultAddress(addrId);
    } catch (err) {
      console.warn("Could not set default", err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#171713]">Saved Residences</h2>
          <p className="text-xs text-[#77746c] mt-0.5">
            Manage your personal delivery sanctuaries and commercial billing residences.
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAdd}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#394132] px-4 py-2.5 text-xs font-semibold uppercase tracking-[1px] text-white hover:bg-[#282e23] transition-all shadow-sm cursor-pointer"
        >
          <Plus size={15} />
          <span>ADD NEW RESIDENCE</span>
        </button>
      </div>

      {loading && addresses.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-[#dedbd4] bg-white p-6 sm:p-8">
          <p className="font-serif text-sm text-[#77746c] animate-pulse">
            Loading your saved residences...
          </p>
        </div>
      ) : addresses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dedbd4] bg-white p-8 sm:p-12 text-center">
          <MapPin size={38} className="mx-auto text-[#bbb8b0]" />
          <h3 className="mt-3 font-serif text-lg sm:text-xl text-[#171713]">
            No residences registered yet
          </h3>
          <p className="mt-1 text-xs text-[#77746c] max-w-sm mx-auto">
            Save your shipping and billing residences for rapid, one-click checkout.
          </p>
          <button
            type="button"
            onClick={onOpenAdd}
            className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#394132] px-5 py-2.5 text-xs font-semibold uppercase tracking-[1px] text-white hover:bg-[#282e23] transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>ADD RESIDENCE NOW</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {addresses.map((addr) => {
            const addrId = addr._id || addr.id;
            const isDefault = Boolean(addr.isDefault);

            return (
              <div
                key={addrId}
                className={`flex flex-col justify-between rounded-2xl border bg-white p-4 sm:p-5 shadow-xs transition-all ${
                  isDefault ? "border-[#394132] ring-1 ring-[#394132]/20" : "border-[#dedbd4]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-[#f2efe9] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#555]">
                      {addr.type || "RESIDENCE"}
                    </span>

                    {isDefault && (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-200">
                        <Check size={11} />
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <h4 className="mt-3 font-serif text-base font-medium text-[#171713]">
                    {addr.fullName}
                  </h4>

                  <p className="mt-1.5 text-xs text-[#55534c] leading-relaxed">
                    {addr.addressLine1}
                    {addr.addressLine2 && `, ${addr.addressLine2}`}
                    <br />
                    {addr.city}, {addr.state} {addr.postalCode}
                    <br />
                    {addr.country}
                  </p>

                  <p className="mt-2 text-xs text-[#77746c]">
                    Tel: {addr.phone}
                    {addr.email && ` • ${addr.email}`}
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-[#dedbd4]/70 pt-3 text-xs">
                  {!isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addrId)}
                      className="font-medium text-[#394132] hover:underline"
                    >
                      Set as default
                    </button>
                  ) : (
                    <span className="text-[11px] text-[#88857d]">Default address</span>
                  )}

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenEdit(addr)}
                      className="text-[#555] hover:text-[#171713] flex items-center gap-1"
                    >
                      <Edit2 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(addrId)}
                      className="text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <Trash2 size={13} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. WISHLIST SECTION
// ==========================================
function WishlistSection({ items, loading, onUpdateItems, isAuthenticated }) {
  const dispatch = useDispatch();

  const handleMoveToCart = (item) => {
    const product = item.product || item;
    const synced = syncProductData(product) || product;
    const inv = synced?.inventory || product?.inventory || item?.inventory;
    const inStock = Boolean(
      inv &&
      inv.inStock !== false &&
      inv.status !== "OUT_OF_STOCK" &&
      (inv.availableQuantity === undefined || inv.availableQuantity > 0) &&
      (synced?.stock === undefined || synced?.stock > 0) &&
      item?.inStock !== false
    );

    if (!inStock) {
      showError("Out of Stock", "This creation is currently out of stock and cannot be added to your shopping bag.");
      return;
    }

    const imgInfo = getProductImage(product);
    const productId = product._id || product.id || item.productId;

    dispatch(
      addToCart({
        productId,
        _id: productId,
        title: product.title || product.name || "House of Hackney Creation",
        price: product.pricing?.sellingPrice ?? product.pricing?.basePrice ?? product.price ?? 125,
        image: imgInfo.url,
        quantity: 1,
      })
    );

    showToast("Added to your shopping bag.");
  };

  const handleRemove = async (productId, variantId) => {
    // Optimistically remove item immediately
    onUpdateItems?.((prev) =>
      prev.filter((item) => {
        const id = item._id || item.id || item.productId || item.product?._id;
        return String(id) !== String(productId);
      })
    );
    removeWishlistItem(productId);

    try {
      await userService.removeFromWishlist(productId, variantId);
    } catch (err) {
      console.warn("Could not remove item from API", err);
    }
  };

  const handleClearAll = async () => {
    const res = await showConfirm(
      "Clear Wishlist",
      "Are you sure you wish to remove all items from your saved treasures?"
    );
    if (!res.isConfirmed) return;

    // Optimistically clear immediately
    onUpdateItems?.([]);
    clearAllWishlist();

    try {
      await userService.clearWishlist();
    } catch (err) {
      console.warn("Could not clear wishlist from API", err);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-[#171713]">Saved Treasures</h2>
          <p className="text-xs text-[#77746c] mt-0.5">
            Your personal curation of British wallpapers, velvets, linens, and accessories.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-medium text-red-600 hover:underline uppercase tracking-wider"
          >
            Clear Wishlist
          </button>
        )}
      </div>

      {/* Guest Sync Banner */}
      {!isAuthenticated && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-[#dedbd4] bg-[#faf8f4] p-4 text-xs">
          <div className="flex items-center gap-2.5 text-[#55534c]">
            <Sparkles size={16} className="text-[#c29b38] shrink-0" />
            <span>
              You are currently viewing a guest wishlist saved on this device. Sign in or register to sync your treasures permanently across all devices.
            </span>
          </div>
          <Link
            to="/login?redirect=/wishlist"
            className="shrink-0 inline-flex items-center gap-1 font-semibold text-[#394132] hover:text-black uppercase tracking-wider text-[11px] underline underline-offset-4"
          >
            <span>SIGN IN TO SYNC</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {loading && items.length === 0 ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-[#dedbd4] bg-white p-8">
          <p className="font-serif text-sm text-[#77746c] animate-pulse">
            Loading your saved creations...
          </p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#dedbd4] bg-white p-12 text-center">
          <Heart size={42} className="mx-auto text-[#bbb8b0]" />
          <h3 className="mt-3 font-serif text-xl text-[#171713]">
            Your wishlist is empty
          </h3>
          <p className="mt-1 text-xs text-[#77746c] max-w-sm mx-auto">
            Save your favourite fabrics, wallpapers, and artisanal home furnishings while browsing.
          </p>
          <Link
            to="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#394132] px-6 py-3 text-xs font-semibold uppercase tracking-[1px] text-white hover:bg-[#282e23] transition-all"
          >
            <span>DISCOVER CREATIONS</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3 w-full">
          {items.map((item, idx) => {
            const product = item.product || item;
            const synced = syncProductData(product) || product;
            const imgInfo = getProductImage(product);
            const productId = product._id || product.id || item.productId;
            const title =
              product.title || product.name || "House of Hackney Luxury Creation";
            const price = product.pricing?.sellingPrice ?? product.pricing?.basePrice ?? product.price ?? 125;
            const category = product.category?.name || product.categoryName || "Botanical Decor";

            const inv = synced?.inventory || product?.inventory || item?.inventory;
            const inStock = Boolean(
              inv &&
              inv.inStock !== false &&
              inv.status !== "OUT_OF_STOCK" &&
              (inv.availableQuantity === undefined || inv.availableQuantity > 0) &&
              (synced?.stock === undefined || synced?.stock > 0) &&
              item?.inStock !== false
            );

            return (
              <div
                key={idx}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-[#dedbd4] bg-white shadow-2xs hover:shadow-md transition-all w-full min-w-0"
              >
                {/* Product Image */}
                <div className="relative aspect-square w-full overflow-hidden bg-[#f6f3ec]">
                  <img
                    src={imgInfo.url}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {!inStock && (
                    <span className="absolute top-3 left-3 z-10 bg-[#171713]/85 text-white text-[9px] uppercase tracking-[1px] px-2.5 py-1 font-semibold rounded-sm">
                      OUT OF STOCK
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemove(productId, item.variant?._id)}
                    aria-label="Remove item"
                    className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-red-600 shadow-sm hover:bg-white hover:scale-110 transition-all cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col justify-between p-4">
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-[1px] text-[#88857d]">
                      {category}
                    </span>
                    <Link
                      to={`/products/${productId}`}
                      className="mt-1 block font-serif text-base font-medium text-[#171713] hover:underline line-clamp-1"
                    >
                      {title}
                    </Link>
                    <p className="mt-1.5 font-serif text-sm font-semibold text-[#171713]">
                      {formatCurrency(price, "GBP")}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!inStock}
                      onClick={() => inStock && handleMoveToCart(item)}
                      className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold uppercase tracking-[0.8px] transition-colors ${
                        inStock
                          ? "bg-[#394132] text-white hover:bg-[#282e23] cursor-pointer"
                          : "bg-[#d5cec3] text-[#7d776c] cursor-not-allowed border border-[#c4bcaf]"
                      }`}
                    >
                      <ShoppingBag size={14} />
                      <span>{inStock ? "MOVE TO BAG" : "OUT OF STOCK"}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. PERSONAL DETAILS SECTION
// ==========================================
function PersonalDetailsSection({ user, onUpdateUser }) {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    gender: user?.gender || "OTHER",
    currency: user?.currency || "GBP",
    language: user?.language || "en",
    timezone: user?.timezone || "Europe/London",
  });

  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName.trim()) {
      showError("Validation Error", "First name is required.");
      return;
    }

    // Immediate optimistic update
    const optimisticUser = { ...user, ...formData };
    onUpdateUser(optimisticUser);
    showToast("Profile details updated successfully.");

    try {
      setSaving(true);
      const updated = await userService.updateProfile(user._id || user.id, formData);
      if (updated) {
        onUpdateUser(updated);
      }
    } catch (err) {
      console.warn("Failed to update profile on server:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#dedbd4] bg-white p-4 sm:p-8 shadow-xs animate-fadeIn space-y-5 sm:space-y-6">
      <div>
        <h2 className="font-serif text-xl sm:text-2xl text-[#171713]">Personal Sanctuary Details</h2>
        <p className="text-xs text-[#77746c] mt-0.5">
          Manage your contact credentials and regional preferences for House of Hackney.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
          {/* First Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
              First Name *
            </label>
            <input
              type="text"
              required
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
              Last Name
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
            />
          </div>

          {/* Email (Readonly) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
              Registered Email (Primary Identity)
            </label>
            <input
              type="email"
              disabled
              value={user?.email || ""}
              className="mt-1.5 w-full rounded-xl border border-[#e8e5dc] bg-[#faf8f4] px-3.5 py-2.5 text-xs text-[#77746c] cursor-not-allowed"
            />
            <p className="mt-1 text-[11px] text-[#99968e]">
              Email is permanently locked to your patron account security.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
              Contact Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+44 20 7739 3901"
              className="mt-1.5 w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
              Gender Salutation
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-[#dedbd4] bg-white px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden cursor-pointer"
            >
              <option value="MALE">Lord / Gentleman (Male)</option>
              <option value="FEMALE">Lady / Gentlewoman (Female)</option>
              <option value="OTHER">Patron (Non-Binary / Prefer not to say)</option>
            </select>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
              Preferred Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-[#dedbd4] bg-white px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden cursor-pointer"
            >
              <option value="GBP">British Pound (£ GBP)</option>
              <option value="USD">US Dollar ($ USD)</option>
              <option value="EUR">Euro (€ EUR)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#dedbd4]">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#394132] px-6 py-2.5 sm:py-3 text-xs font-semibold uppercase tracking-[1px] text-white hover:bg-[#282e23] disabled:opacity-50 transition-all shadow-sm cursor-pointer"
          >
            <span>{saving ? "SAVING..." : "SAVE CHANGES"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// 6. SECURITY & SESSIONS SECTION
// ==========================================
function SecuritySection({ user, sessions, onRefresh }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      showError("Validation Error", "Please provide your current password.");
      return;
    }
    if (newPassword.length < 6) {
      showError("Validation Error", "New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showError("Validation Error", "New password and confirmation do not match.");
      return;
    }

    try {
      setUpdating(true);
      showLoading("Updating password...");
      await userService.changePassword({
        currentPassword,
        newPassword,
        userId: user?._id || user?.id,
        email: user?.email,
      });
      closeAlert();
      showToast("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      closeAlert();
      showError("Could not update password", err?.response?.data?.message || err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRevokeOthers = async () => {
    const res = await showConfirm(
      "Sign Out Other Devices",
      "Are you sure you want to invalidate all other active browser and mobile sessions?"
    );
    if (!res.isConfirmed) return;

    try {
      showLoading("Revoking other sessions...");
      await userService.revokeOtherSessions();
      closeAlert();
      showToast("All other active sessions have been signed out.");
      onRefresh();
    } catch (err) {
      closeAlert();
      showError("Could not revoke sessions", err?.response?.data?.message || err.message);
    }
  };

  const handleRevokeSingle = async (sessionId) => {
    if (!sessionId) return;
    const res = await showConfirm(
      "Sign Out Device",
      "Are you sure you want to terminate this active device session?"
    );
    if (!res.isConfirmed) return;

    try {
      showLoading("Signing out device...");
      await userService.revokeSession(sessionId);
      closeAlert();
      showToast("Device session terminated successfully.");
      onRefresh();
    } catch (err) {
      closeAlert();
      showError("Could not revoke session", err?.response?.data?.message || err.message);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Password Change Box */}
      <div className="rounded-2xl border border-[#dedbd4] bg-white p-4 sm:p-8 shadow-xs">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl text-[#171713]">Password Sanctuary</h2>
          <p className="text-xs text-[#77746c] mt-0.5">
            Ensure your account is protected with a resilient, unique passphrase.
          </p>
        </div>

        <form onSubmit={handlePasswordSubmit} className="mt-5 sm:mt-6 max-w-xl space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
              Current Password *
            </label>
            <div className="relative mt-1.5">
              <input
                type={showCurrent ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-xl border border-[#dedbd4] pr-10 pl-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#88857d] hover:text-[#171713] cursor-pointer"
              >
                {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
              New Password *
            </label>
            <div className="relative mt-1.5">
              <input
                type={showNew ? "text" : "password"}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-xl border border-[#dedbd4] pr-10 pl-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#88857d] hover:text-[#171713] cursor-pointer"
              >
                {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
              Confirm New Password *
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            disabled={updating}
            className="w-full sm:w-auto mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-[#394132] px-6 py-2.5 text-xs font-semibold uppercase tracking-[1px] text-white hover:bg-[#282e23] disabled:opacity-50 transition-all shadow-sm cursor-pointer"
          >
            <span>{updating ? "UPDATING..." : "UPDATE PASSWORD"}</span>
          </button>
        </form>
      </div>

      {/* Active Device Sessions */}
      <div className="rounded-2xl border border-[#dedbd4] bg-white p-4 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h3 className="font-serif text-lg sm:text-xl text-[#171713]">Active Sessions & Devices</h3>
            <p className="text-xs text-[#77746c] mt-0.5">
              Devices currently authorized to access your House of Hackney patron portal.
            </p>
          </div>

          {sessions.length > 1 && (
            <button
              type="button"
              onClick={handleRevokeOthers}
              className="self-start sm:self-auto text-xs font-semibold text-red-600 hover:underline uppercase tracking-wider cursor-pointer"
            >
              Sign Out Other Devices
            </button>
          )}
        </div>

        <div className="mt-5 divide-y divide-[#f2efe9]">
          {sessions.length === 0 ? (
            <div className="py-4 text-xs text-[#77746c]">
              Current session active on this browser.
            </div>
          ) : (
            sessions.map((sess, idx) => {
              const isCurrent = idx === 0;
              const isMobile =
                (sess.deviceType || sess.deviceName || "").toLowerCase().includes("mobile") ||
                (sess.deviceType || sess.deviceName || "").toLowerCase().includes("phone");

              return (
                <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-3.5">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#faf8f4] border border-[#dedbd4] text-[#394132]">
                      {isMobile ? <Smartphone size={16} /> : <Laptop size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[#171713] truncate">
                        {sess.browser || "Web Browser"} on {sess.operatingSystem || sess.deviceName || sess.deviceType || "Device"}
                        {isCurrent && (
                          <span className="ml-2 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                            THIS DEVICE
                          </span>
                        )}
                      </p>
                      <p className="text-[11px] text-[#77746c] truncate">
                        IP: {sess.ipAddress || sess.ip || "127.0.0.1"} &bull; Last active: {formatDate(sess.lastUsedAt || sess.lastActive || sess.createdAt)}
                      </p>
                    </div>
                  </div>

                  {!isCurrent && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSingle(sess._id || sess.id)}
                      className="self-end sm:self-center text-[11px] font-semibold text-red-600 hover:text-red-700 hover:underline uppercase tracking-wider cursor-pointer"
                    >
                      Sign Out
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 7. B2B TRADE CONCIERGE SECTION
// ==========================================
function TradeSection({ tradeProfile, user, onRefresh }) {
  const [applying, setApplying] = useState(false);
  const [formData, setFormData] = useState({
    companyName: tradeProfile?.company?.name || "",
    businessType: tradeProfile?.businessType || "INTERIOR_DESIGNER",
    taxId: tradeProfile?.gstNumber || tradeProfile?.vatNumber || tradeProfile?.company?.taxNumber || "",
    website: tradeProfile?.website || tradeProfile?.company?.website || "",
    companyPhone: tradeProfile?.phone || tradeProfile?.company?.phone || user?.phone || "",
    notes: tradeProfile?.rejectionReason || "",
  });

  useEffect(() => {
    if (tradeProfile || user) {
      setFormData((prev) => ({
        companyName: tradeProfile?.company?.name || prev.companyName || "",
        businessType: tradeProfile?.businessType || prev.businessType || "INTERIOR_DESIGNER",
        taxId: tradeProfile?.gstNumber || tradeProfile?.vatNumber || tradeProfile?.company?.taxNumber || prev.taxId || "",
        website: tradeProfile?.website || tradeProfile?.company?.website || prev.website || "",
        companyPhone: tradeProfile?.phone || tradeProfile?.company?.phone || user?.phone || prev.companyPhone || "",
        notes: tradeProfile?.rejectionReason || prev.notes || "",
      }));
    }
  }, [tradeProfile, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!formData.companyName.trim()) {
      showError("Validation Error", "Company or Studio name is required.");
      return;
    }

    if (!formData.companyPhone.trim()) {
      showError("Validation Error", "Company / Contact phone number is required.");
      return;
    }

    try {
      setApplying(true);
      showLoading("Submitting trade application...");
      const contactPhone = formData.companyPhone.trim();
      await userService.applyTrade({
        companyName: formData.companyName.trim(),
        companyPhone: contactPhone,
        phone: contactPhone,
        businessType: formData.businessType === "HOSPITALITY" ? "HOTEL_HOSPITALITY" : formData.businessType,
        taxId: formData.taxId.trim(),
        gstNumber: formData.taxId.trim(),
        vatNumber: formData.taxId.trim(),
        website: formData.website.trim(),
        notes: formData.notes.trim(),
        companyData: {
          name: formData.companyName.trim(),
          phone: contactPhone,
          website: formData.website.trim(),
          taxNumber: formData.taxId.trim(),
        },
      });
      closeAlert();
      showSuccess(
        "Application Submitted",
        "Your trade partner application has been received by our London design team."
      );
      onRefresh();
    } catch (err) {
      closeAlert();
      showError("Application failed", err?.response?.data?.message || err.message);
    } finally {
      setApplying(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Trade Status Hero */}
      <div className="rounded-2xl border border-[#dedbd4] bg-white p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-xl">
            <span className="text-[11px] font-semibold tracking-[2px] uppercase text-[#c29b38]">
              ARCHITECTURAL & INTERIOR DESIGN PRIVILEGES
            </span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl text-[#171713]">
              House of Hackney Trade Concierge
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-[#66645e] leading-relaxed">
              We collaborate with premier interior designers, architects, and luxury hospitality
              studios globally, providing commercial pricing, bespoke scale alterations, and
              expedited sample dispatch.
            </p>
          </div>

          {/* Status Badge */}
          <div className="rounded-2xl border border-[#dedbd4] bg-[#faf8f4] p-5 text-center shrink-0 min-w-[220px]">
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#88857d]">
              Current Standing
            </span>
            <div className="mt-1 font-serif text-xl font-medium text-[#171713]">
              {tradeProfile?.status === "APPROVED"
                ? "Active Trade Partner"
                : tradeProfile?.status === "PENDING"
                ? "Application Under Review"
                : "Retail Patron Account"}
            </div>
            {tradeProfile?.tier && (
              <span className="mt-1 inline-block rounded-full bg-[#c29b38]/15 px-3 py-0.5 text-[11px] font-semibold text-[#8a681c] border border-[#c29b38]/30">
                {tradeProfile.tier.name || "Silver Tier - 20% Off"}
              </span>
            )}
          </div>
        </div>

        {/* Trade Benefits Grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 border-t border-[#dedbd4] pt-6">
          <div className="rounded-xl bg-[#faf8f4] p-4 border border-[#dedbd4]/60">
            <h4 className="font-serif text-sm font-semibold text-[#171713]">
              Commercial Discount
            </h4>
            <p className="mt-1 text-xs text-[#77746c]">
              20% to 30% wholesale pricing across all British wallpapers, velvets, and furnishings.
            </p>
          </div>

          <div className="rounded-xl bg-[#faf8f4] p-4 border border-[#dedbd4]/60">
            <h4 className="font-serif text-sm font-semibold text-[#171713]">
              Complimentary Swatches
            </h4>
            <p className="mt-1 text-xs text-[#77746c]">
              Priority dispatch of luxury A4 wallpaper and fabric cuttings for client moodboards.
            </p>
          </div>

          <div className="rounded-xl bg-[#faf8f4] p-4 border border-[#dedbd4]/60">
            <h4 className="font-serif text-sm font-semibold text-[#171713]">
              Dedicated Concierge
            </h4>
            <p className="mt-1 text-xs text-[#77746c]">
              Direct line to our bespoke English atelier for custom sizing, repeat alterations & quotes.
            </p>
          </div>
        </div>
      </div>

      {/* Application Form (if not approved) */}
      {tradeProfile?.status !== "APPROVED" && (
        <div className="rounded-2xl border border-[#dedbd4] bg-white p-6 sm:p-8 shadow-xs">
          <h3 className="font-serif text-xl text-[#171713]">
            {tradeProfile?.status === "PENDING"
              ? "Update Trade Application"
              : "Apply for Trade Privileges"}
          </h3>
          <p className="text-xs text-[#77746c] mt-0.5">
            Submit your studio or business credentials for trade account verification.
          </p>

          <form onSubmit={handleApply} className="mt-6 space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
                  Company / Studio Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  placeholder="e.g. Atelier Hackney Interiors"
                  className="mt-1.5 w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
                  Business Discipline
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-[#dedbd4] bg-white px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
                >
                  <option value="INTERIOR_DESIGNER">Interior Designer</option>
                  <option value="ARCHITECT">Architectural Practice</option>
                  <option value="HOTEL_HOSPITALITY">Boutique Hotel / Hospitality</option>
                  <option value="RETAILER">Design Retailer</option>
                  <option value="CONTRACTOR">Commercial Contractor</option>
                  <option value="OTHER">Other Design Trade</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
                  Company / Contact Phone *
                </label>
                <input
                  type="tel"
                  required
                  value={formData.companyPhone}
                  onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                  placeholder="+44 20 7739 3901"
                  className="mt-1.5 w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
                  VAT / Tax Registration ID
                </label>
                <input
                  type="text"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                  placeholder="GB123456789"
                  className="mt-1.5 w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
                  Studio Website / Portfolio
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://studio.com"
                  className="mt-1.5 w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#55534c]">
                Trade Inquiries / Notes
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Mention any upcoming commercial projects or custom requirements..."
                className="mt-1.5 w-full rounded-xl border border-[#dedbd4] px-3.5 py-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={applying}
              className="inline-flex items-center gap-2 rounded-xl bg-[#394132] px-6 py-3 text-xs font-semibold uppercase tracking-[1px] text-white hover:bg-[#282e23] disabled:opacity-50 transition-all shadow-sm cursor-pointer"
            >
              <span>{applying ? "SUBMITTING..." : "SUBMIT TRADE APPLICATION"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
}


// ==========================================
// ORDER DETAILS & INVOICE MODAL
// ==========================================
function OrderDetailsModal({ order, onClose }) {
  const orderId = order._id || order.id || "";
  const status = (order.status || "CONFIRMED").toUpperCase();
  const items = order.items || [];
  const total = order.totalAmount ?? order.total ?? order.pricing?.totalPrice ?? 0;
  const subtotal = order.subtotal ?? (total * 0.83).toFixed(2);
  const tax = order.tax ?? (total * 0.17).toFixed(2);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-[#dedbd4] max-h-[92vh] flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#dedbd4] px-4 sm:px-6 py-3.5 sm:py-4 bg-[#faf8f4]">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <FileText size={18} className="text-[#394132] shrink-0" />
            <h3 className="font-serif text-base sm:text-lg text-[#171713] truncate">
              Order Commission #{orderId.slice(-8).toUpperCase()}
            </h3>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Print Invoice"
              className="p-1.5 rounded-lg border border-[#dedbd4] text-[#555] hover:text-[#171713] hover:bg-white cursor-pointer"
            >
              <Printer size={16} />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="p-1.5 rounded-lg border border-[#dedbd4] text-[#555] hover:text-[#171713] hover:bg-white cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 flex-1 text-xs text-[#171713]">
          {/* Brand Emblem & Header */}
          <div className="flex justify-between items-start border-b border-[#dedbd4] pb-4 gap-2">
            <div>
              <p className="font-serif text-lg sm:text-xl font-bold tracking-wider uppercase text-[#171713]">
                HOUSE OF HACKNEY
              </p>
              <p className="text-[#77746c] text-[10px] sm:text-[11px] mt-0.5">
                St. Michael’s, Castle of Trematon, Cornwall, UK
              </p>
            </div>
            <div className="text-right shrink-0">
              <OrderStatusPill status={status} />
              <p className="mt-1 text-[#77746c] text-[10px] sm:text-[11px]">
                Date: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {/* Delivery & Billing Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 rounded-xl bg-[#faf8f4] p-3.5 sm:p-4 border border-[#dedbd4]/60">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#88857d]">
                Delivery Residence
              </span>
              <p className="mt-1 font-medium">{order.shippingAddress?.fullName || "Client Residence"}</p>
              <p className="text-[#555] leading-relaxed">
                {order.shippingAddress?.addressLine1 || "Standard Delivery Address"}
                <br />
                {order.shippingAddress?.city} {order.shippingAddress?.postalCode}
                <br />
                {order.shippingAddress?.country || "United Kingdom"}
              </p>
            </div>

            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#88857d]">
                Despatch & Courier
              </span>
              <p className="mt-1 font-medium">Royal Mail / DPD Courier</p>
              <p className="text-[#555]">
                Tracking: {order.trackingNumber || "Assigned upon dispatch"}
              </p>
              <p className="text-[#555] mt-1">
                Payment: {order.paymentMethod || "Credit / Debit Card (Stripe)"}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#88857d]">
              Commissioned Creations
            </span>
            <div className="mt-2 divide-y divide-[#f2efe9] border border-[#dedbd4] rounded-xl overflow-hidden">
              {items.map((it, idx) => {
                const prod = it.product || it;
                const img = getProductImage(prod);
                const title = it.title || it.name || prod.title || prod.name || "Creation";
                const price = it.price || it.unitPrice || 0;
                const qty = it.quantity || 1;

                return (
                  <div key={idx} className="flex items-center justify-between p-2.5 sm:p-3 bg-white gap-2 sm:gap-3">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                      <img
                        src={img.url}
                        alt={title}
                        className="h-10 w-10 shrink-0 rounded-lg object-cover border border-[#dedbd4]"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-serif font-medium truncate text-xs sm:text-sm">{title}</p>
                        <p className="text-[10px] text-[#777] truncate">
                          Qty: {qty} &bull; {formatCurrency(price, order.currency || "GBP")}
                        </p>
                      </div>
                    </div>
                    <span className="font-serif font-semibold shrink-0 text-xs sm:text-sm text-right">
                      {formatCurrency(price * qty, order.currency || "GBP")}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Totals */}
          <div className="space-y-1.5 border-t border-[#dedbd4] pt-4">
            <div className="flex justify-between text-[#777]">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, order.currency || "GBP")}</span>
            </div>
            <div className="flex justify-between text-[#777]">
              <span>VAT / Taxes Included</span>
              <span>{formatCurrency(tax, order.currency || "GBP")}</span>
            </div>
            <div className="flex justify-between text-[#777]">
              <span>Delivery / Shipping</span>
              <span>Complimentary</span>
            </div>
            <div className="flex justify-between text-sm sm:text-base font-serif font-bold text-[#171713] border-t border-[#dedbd4] pt-2">
              <span>Grand Total</span>
              <span>{formatCurrency(total, order.currency || "GBP")}</span>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="border-t border-[#dedbd4] bg-[#faf8f4] px-4 sm:px-6 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl bg-[#394132] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#282e23] cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// CANCEL ORDER MODAL
// ==========================================
function CancelOrderModal({ order, reason, setReason, onClose, onSuccess }) {
  const [cancelling, setCancelling] = useState(false);
  const orderId = order._id || order.id || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setCancelling(true);
      showLoading("Cancelling order...");
      await userService.cancelOrder(orderId, reason || "Customer requested cancellation");
      closeAlert();
      showSuccess("Order Cancelled", "Your order has been cancelled and refund initiated.");
      onSuccess();
    } catch (err) {
      closeAlert();
      showError("Could not cancel order", err?.response?.data?.message || err.message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl border border-[#dedbd4] p-6 space-y-4">
        <h3 className="font-serif text-xl text-[#171713]">Cancel Order #{orderId.slice(-8).toUpperCase()}</h3>
        <p className="text-xs text-[#77746c]">
          Please specify the reason for cancelling this commission before dispatch.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            required
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason for cancellation (e.g. Changed interior colour scheme, placed in error)..."
            className="w-full rounded-xl border border-[#dedbd4] p-3 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#dedbd4] px-4 py-2 text-xs font-medium text-[#555] hover:bg-[#faf8f4]"
            >
              Keep Order
            </button>
            <button
              type="submit"
              disabled={cancelling}
              className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50"
            >
              {cancelling ? "Cancelling..." : "Confirm Cancellation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ADD / EDIT ADDRESS MODAL
function AddressFormModal({ address, onClose, onSuccess, onOptimisticSave }) {
  const isEdit = Boolean(address);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    fullName: address?.fullName || "",
    phone: address?.phone || "",
    email: address?.email || "",
    addressLine1: address?.addressLine1 || "",
    addressLine2: address?.addressLine2 || "",
    city: address?.city || "",
    state: address?.state || "",
    postalCode: address?.postalCode || "",
    country: address?.country || "United Kingdom",
    type: address?.type || "HOME",
    isDefault: address?.isDefault || false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || !form.phone.trim() || !form.addressLine1.trim() || !form.city.trim()) {
      showError("Validation Error", "Please fill in all mandatory address fields.");
      return;
    }

    // Immediate optimistic update and close modal
    onOptimisticSave?.(form);
    showToast(isEdit ? "Residence updated successfully." : "New residence added.");
    onClose();

    try {
      setSaving(true);
      if (isEdit) {
        await userService.updateAddress(address._id || address.id, form);
      } else {
        await userService.createAddress(form);
      }
      onSuccess?.();
    } catch (err) {
      console.warn("Could not save address to API", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-[#dedbd4] p-4 sm:p-6 space-y-4 my-auto max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#dedbd4] pb-3">
          <h3 className="font-serif text-lg sm:text-xl text-[#171713]">
            {isEdit ? "Edit Residence" : "Register New Residence"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#888] hover:text-[#111] cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="font-semibold uppercase tracking-wider text-[#555]">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#dedbd4] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="font-semibold uppercase tracking-wider text-[#555]">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#dedbd4] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="font-semibold uppercase tracking-wider text-[#555]">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#dedbd4] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
              />
            </div>

            <div className="col-span-2">
              <label className="font-semibold uppercase tracking-wider text-[#555]">
                Address Line 1 *
              </label>
              <input
                type="text"
                required
                value={form.addressLine1}
                onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                placeholder="House number and street name"
                className="mt-1 w-full rounded-xl border border-[#dedbd4] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
              />
            </div>

            <div className="col-span-2">
              <label className="font-semibold uppercase tracking-wider text-[#555]">
                Address Line 2 (Apartment, suite, unit)
              </label>
              <input
                type="text"
                value={form.addressLine2}
                onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#dedbd4] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="font-semibold uppercase tracking-wider text-[#555]">
                City *
              </label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#dedbd4] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="font-semibold uppercase tracking-wider text-[#555]">
                County / State *
              </label>
              <input
                type="text"
                required
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#dedbd4] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="font-semibold uppercase tracking-wider text-[#555]">
                Postal Code *
              </label>
              <input
                type="text"
                required
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#dedbd4] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="font-semibold uppercase tracking-wider text-[#555]">
                Country *
              </label>
              <input
                type="text"
                required
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#dedbd4] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="font-semibold uppercase tracking-wider text-[#555]">
                Residence Type
              </label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="mt-1 w-full rounded-xl border border-[#dedbd4] bg-white p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:outline-hidden cursor-pointer"
              >
                <option value="HOME">Home Residence</option>
                <option value="OFFICE">Office / Studio</option>
                <option value="SHIPPING">Shipping Residence</option>
                <option value="BILLING">Billing Residence</option>
              </select>
            </div>

            <div className="col-span-2 flex items-center gap-2 pt-2 sm:pt-4">
              <input
                type="checkbox"
                id="isDefaultCheck"
                checked={form.isDefault}
                onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
                className="h-4 w-4 rounded accent-[#394132] cursor-pointer"
              />
              <label htmlFor="isDefaultCheck" className="text-xs text-[#333] cursor-pointer">
                Set as default delivery residence
              </label>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-4 border-t border-[#dedbd4]">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto text-center rounded-xl border border-[#dedbd4] px-4 py-2.5 text-xs font-medium text-[#555] hover:bg-[#faf8f4] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto text-center rounded-xl bg-[#394132] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#282e23] disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : isEdit ? "Update Residence" : "Save Residence"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==========================================
// ORDER STATUS PILL HELPER
// ==========================================
function OrderStatusPill({ status }) {
  const s = (status || "").toUpperCase();
  if (s === "DELIVERED") {
    return (
      <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-800 border border-emerald-300">
        DELIVERED
      </span>
    );
  }
  if (s === "SHIPPED") {
    return (
      <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-800 border border-blue-300">
        SHIPPED
      </span>
    );
  }
  if (s === "PROCESSING") {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-800 border border-amber-300">
        PROCESSING
      </span>
    );
  }
  if (s === "CANCELLED") {
    return (
      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-[10px] font-semibold text-red-800 border border-red-300">
        CANCELLED
      </span>
    );
  }
  return (
    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-[10px] font-semibold text-stone-800 border border-stone-300">
      {s || "CONFIRMED"}
    </span>
  );
}
