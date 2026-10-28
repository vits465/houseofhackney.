import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import adminApiService from "./services/adminApiService";
import { showToast } from "../../utils/sweetAlert";

const AdminContext = createContext(null);

export function AdminProvider({ children }) {
  // Theme state: "light" (Light Green and White) by default
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("hoh_admin_theme") || "light";
  });

  // Redux active user
  const authUser = useSelector((state) => state.auth?.user);

  // Determine initial role:
  // Check if preview role was explicitly chosen in session, otherwise inspect authUser roles
  const [currentRole, setCurrentRoleState] = useState(() => {
    const savedRole = sessionStorage.getItem("hoh_preview_role");
    if (savedRole) return savedRole;

    if (authUser?.roles?.length) {
      const slugs = authUser.roles.map((r) =>
        typeof r === "string" ? r.toLowerCase() : r.slug?.toLowerCase() || ""
      );
      if (slugs.includes("super-admin") || slugs.includes("super_admin")) {
        return "super-admin";
      }
      if (slugs.includes("admin") || slugs.includes("manager")) {
        return "admin";
      }
      if (
        slugs.includes("trade") ||
        slugs.includes("trade-user") ||
        slugs.includes("trade_user")
      ) {
        return "trade";
      }
    }
    // Default preview role
    return "super-admin";
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    return currentRole === "trade" ? "trade-overview" : "overview";
  });

  const [spotlightOpen, setSpotlightOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [newProductOpen, setNewProductOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Real-time dynamic state
  const [orders, setOrders] = useState(() => {
    try {
      const local = JSON.parse(localStorage.getItem("hoh_local_orders") || "[]");
      if (Array.isArray(local)) return local;
    } catch {}
    return [];
  });
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState("30D");
  const [chartMetric, setChartMetric] = useState("revenue");

  // Trade B2B state
  const [tradeProfile, setTradeProfile] = useState(null);
  const [tradeCredit, setTradeCredit] = useState(null);
  const [tradeQuotations, setTradeQuotations] = useState([]);
  const [pendingApplications, setPendingApplications] = useState([]);
  const [tradeTiers, setTradeTiers] = useState([]);
  const [loadingTradeData, setLoadingTradeData] = useState(false);

  // Products & Catalog State
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState(null);
  const [viewProductModalOpen, setViewProductModalOpen] = useState(false);

  // Global Sync & Loading Flags
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sync theme
  useEffect(() => {
    localStorage.setItem("hoh_admin_theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Global keyboard shortcuts (Ctrl+K or Cmd+K for Spotlight)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSpotlightOpen((prev) => !prev);
      }
      if (e.key === "Escape") {
        setSpotlightOpen(false);
        setNotificationsOpen(false);
        setNewProductOpen(false);
        setProductModalOpen(false);
        setViewProductModalOpen(false);
        setSelectedOrder(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch initial backend Trade, Product, User & Order data in real-time
  const loadBackendData = useCallback(async (isManual = false) => {
    if (isManual) {
      setIsRefreshing(true);
      adminApiService.clearCache();
    } else {
      setLoadingTradeData(true);
      setLoadingProducts(true);
    }
    try {
      const [
        profileData,
        creditData,
        quotesData,
        pendingApps,
        tiersData,
        prodsData,
        liveOrdersRes,
        liveUsersRes,
        catsData,
        brandsData,
      ] = await Promise.all([
        adminApiService.getMyTradeProfile().catch(() => null),
        adminApiService.getMyCredit().catch(() => null),
        adminApiService.getUserQuotes().catch(() => []),
        adminApiService.getPendingTradeApplications().catch(() => []),
        adminApiService.getTradeTiers().catch(() => []),
        adminApiService.getProducts({}, false).catch(() => []),
        adminApiService.getOrders().catch(() => []),
        adminApiService.getUsers().catch(() => []),
        adminApiService.getCategories().catch(() => []),
        adminApiService.getBrands().catch(() => []),
      ]);

      setTradeProfile(profileData);
      setTradeCredit(creditData);
      setTradeQuotations(quotesData || []);
      setPendingApplications(pendingApps || []);
      setTradeTiers(tiersData || []);

      const validProds = Array.isArray(prodsData) ? prodsData : prodsData?.data || [];
      setProducts(validProds);

      const validUsers = Array.isArray(liveUsersRes) ? liveUsersRes : liveUsersRes?.data || [];
      setUsers(validUsers);

      const validCats = Array.isArray(catsData) ? catsData : catsData?.data || [];
      setCategories(validCats);

      const validBrands = Array.isArray(brandsData) ? brandsData : brandsData?.data || [];
      setBrands(validBrands);

      // Merge real backend orders with local checkout orders
      let localOrders = [];
      try {
        localOrders = JSON.parse(localStorage.getItem("hoh_local_orders") || "[]");
      } catch (e) {}

      const rawOrders = Array.isArray(liveOrdersRes) ? liveOrdersRes : liveOrdersRes?.data || [];
      const combinedOrders = Array.isArray(localOrders) && localOrders.length > 0
        ? [...localOrders, ...rawOrders.filter(ro => !localOrders.some(lo => (lo._id || lo.id) === (ro._id || ro.id)))]
        : rawOrders;

      setOrders(combinedOrders);

      // Generate dynamic real-time notifications
      const dynamicNotifs = [];
      combinedOrders.slice(0, 5).forEach((o, i) => {
        const patron = o.shippingAddress?.fullName || o.user?.name || "Patron";
        const amt = o.totalAmount || o.grandTotal || o.total || 0;
        dynamicNotifs.push({
          id: `notif_ord_${o._id || o.id || i}`,
          title: `Order: ${o.orderNumber || 'Commission'}`,
          description: `${patron} completed purchase for £${Number(amt).toLocaleString()}`,
          category: "orders",
          time: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-GB") : "Just now",
          unread: i < 2,
        });
      });

      validProds.filter(p => (p.stock !== undefined && p.stock < 15)).slice(0, 3).forEach((p, i) => {
        dynamicNotifs.push({
          id: `notif_stock_${p._id || p.id || i}`,
          title: "Low Inventory Alert",
          description: `${p.name} has only ${p.stock || 0} units left in atelier warehouse.`,
          category: "inventory",
          time: "Live telemetry",
          unread: true,
        });
      });

      if (pendingApps && pendingApps.length > 0) {
        dynamicNotifs.push({
          id: "notif_trade_pending",
          title: "Trade B2B Applications",
          description: `${pendingApps.length} trade designer application(s) awaiting review.`,
          category: "trade",
          time: "Action required",
          unread: true,
        });
      }

      setNotifications(dynamicNotifs);
    } catch (err) {
      console.warn("Error loading backend data:", err);
    } finally {
      setLoadingTradeData(false);
      setLoadingProducts(false);
      setIsRefreshing(false);
      setIsInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBackendData();
  }, [loadBackendData]);

  // Product CRUD Methods
  const addProduct = async (productData) => {
    const res = await adminApiService.createProduct(productData);
    const newProd = res?.data || {
      _id: `prod_${Date.now()}`,
      ...productData,
    };
    setProducts((prev) => [newProd, ...prev]);
    return newProd;
  };

  const editProduct = async (id, updateData) => {
    await adminApiService.updateProduct(id, updateData);
    setProducts((prev) =>
      prev.map((p) =>
        (p._id === id || p.id === id) ? { ...p, ...updateData } : p
      )
    );
  };

  const deleteProduct = async (id) => {
    await adminApiService.deleteProduct(id);
    setProducts((prev) =>
      prev.filter((p) => p._id !== id && p.id !== id)
    );
  };

  const openCreateProductModal = () => {
    setEditingProduct(null);
    setProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProductModalOpen(true);
  };

  const openViewProductModal = async (prod) => {
    if (!prod) return;
    setViewingProduct(prod);
    setViewProductModalOpen(true);
    // Asynchronously try to fetch full product details to ensure all variants and specifications are populated
    try {
      const prodId = prod._id || prod.id;
      if (prodId) {
        const full = await adminApiService.getProductById(prodId);
        if (full) {
          setViewingProduct((prev) => (prev?._id === prodId || prev?.id === prodId ? full : prev));
        }
      }
    } catch (err) {
      console.warn("Product detail enrichment error:", err);
    }
  };

  const closeViewProductModal = () => {
    setViewProductModalOpen(false);
    setViewingProduct(null);
  };

  const refreshProducts = async () => {
    setLoadingProducts(true);
    try {
      const prodsData = await adminApiService.getProducts({}, true);
      setProducts(prodsData || []);
      showToast(`Loaded ${prodsData?.length || 0} catalog products.`);
    } catch (err) {
      console.warn("Failed to refresh products:", err);
      showToast("Could not refresh products from backend.");
    } finally {
      setLoadingProducts(false);
    }
  };

  // Role Switcher function with security tab reset
  const switchRole = (newRole) => {
    sessionStorage.setItem("hoh_preview_role", newRole);
    setCurrentRoleState(newRole);

    if (newRole === "trade") {
      setActiveTab("trade-overview");
      showToast("Switched to Trade Patron B2B Portal (Limited Access)");
    } else if (newRole === "admin") {
      setActiveTab("overview");
      showToast("Switched to Admin Manager Mode");
    } else {
      setActiveTab("overview");
      showToast("Switched to Super Admin Master Atelier");
    }
  };

  // Trade Actions: Request quote
  const requestQuote = async ({ items, customerNotes }) => {
    try {
      const res = await adminApiService.requestQuote({ items, customerNotes });
      if (res?.data) {
        setTradeQuotations((prev) => [res.data, ...prev]);
        showToast("Quotation request submitted to House of Hackney Atelier.");
        return res.data;
      }
    } catch (err) {
      showToast("Failed to request quote: " + err.message);
    }
  };

  // Trade Actions: Approve quote
  const approveQuote = async (quoteId) => {
    try {
      await adminApiService.approveQuote(quoteId);
      setTradeQuotations((prev) =>
        prev.map((q) => (q._id === quoteId ? { ...q, status: "APPROVED" } : q))
      );
      showToast("Quotation approved. You may now convert it to an active order.");
    } catch (err) {
      showToast("Error approving quote: " + err.message);
    }
  };

  // Trade Actions: Convert quote to order
  const convertQuoteToOrder = async (quoteId, shippingAddress) => {
    try {
      const res = await adminApiService.convertQuoteToOrder(quoteId, shippingAddress);
      const orderNumber = res?.data?.orderNumber || `TRD-ORD-${Date.now().toString().slice(-5)}`;

      // Update quote status
      setTradeQuotations((prev) =>
        prev.map((q) =>
          q._id === quoteId
            ? { ...q, status: "CONVERTED", convertedOrderNumber: orderNumber }
            : q
        )
      );

      // Deduct available credit if credit available
      if (tradeCredit) {
        const quoteObj = tradeQuotations.find((q) => q._id === quoteId);
        const amount = quoteObj?.grandTotal || quoteObj?.subtotal || 2000;
        setTradeCredit((prev) => ({
          ...prev,
          usedCredit: (prev.usedCredit || 0) + amount,
          availableCredit: Math.max(0, (prev.availableCredit || 0) - amount),
        }));
      }

      showToast(`Quotation converted to Order ${orderNumber}!`);
      return orderNumber;
    } catch (err) {
      showToast("Conversion failed: " + err.message);
    }
  };

  // Admin Actions: Review application
  const reviewApplication = async (appId, { status, tierId, creditLimit, rejectionReason }) => {
    try {
      await adminApiService.reviewTradeApplication(appId, {
        status,
        tierId,
        creditLimit,
        rejectionReason,
      });

      setPendingApplications((prev) => prev.filter((a) => a._id !== appId));
      showToast(`Trade application ${status.toLowerCase()} successfully.`);
    } catch (err) {
      showToast("Error reviewing application: " + err.message);
    }
  };

  // Admin Actions: Negotiate quotation
  const negotiateQuote = async (quoteId, { negotiatedItems, discount, adminNotes }) => {
    try {
      await adminApiService.negotiateQuote(quoteId, {
        negotiatedItems,
        discount,
        adminNotes,
      });

      setTradeQuotations((prev) =>
        prev.map((q) => {
          if (q._id === quoteId) {
            const negotiatedSubtotal = negotiatedItems.reduce(
              (acc, it) => acc + (it.negotiatedPrice || 100) * (it.quantity || 1),
              0
            );
            return {
              ...q,
              status: "NEGOTIATING",
              negotiatedSubtotal,
              discount,
              grandTotal: Math.max(0, negotiatedSubtotal - discount),
              adminNotes,
            };
          }
          return q;
        })
      );
      showToast("Quotation pricing and concessions updated.");
    } catch (err) {
      showToast("Error negotiating quote: " + err.message);
    }
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications((prev) =>
      prev.map((item) => ({ ...item, unread: false }))
    );
  };

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, unread: false } : item))
    );
  };

  // Sync real-time when an order is created on frontend
  useEffect(() => {
    const handleSyncOrders = (e) => {
      try {
        const newOrd = e.detail;
        if (newOrd) {
          setOrders((prev) => [newOrd, ...prev.filter((o) => (o.id || o._id) !== (newOrd.id || newOrd._id))]);
        } else {
          const local = JSON.parse(localStorage.getItem("hoh_local_orders") || "[]");
          if (Array.isArray(local)) {
            setOrders((prev) => {
              const localIds = new Set(local.map((o) => o.id || o._id));
              return [...local, ...prev.filter((o) => !localIds.has(o.id || o._id))];
            });
          }
        }
      } catch (err) {
        console.warn("Real-time order sync error:", err);
      }
    };

    window.addEventListener("hoh_order_created", handleSyncOrders);
    window.addEventListener("storage", handleSyncOrders);
    return () => {
      window.removeEventListener("hoh_order_created", handleSyncOrders);
      window.removeEventListener("storage", handleSyncOrders);
    };
  }, []);

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) =>
        (ord.id === orderId || ord._id === orderId || ord.orderNumber === orderId)
          ? { ...ord, fulfillmentStatus: newStatus, status: newStatus }
          : ord
      )
    );
    if (
      selectedOrder &&
      (selectedOrder.id === orderId || selectedOrder._id === orderId || selectedOrder.orderNumber === orderId)
    ) {
      setSelectedOrder((prev) => ({ ...prev, fulfillmentStatus: newStatus, status: newStatus }));
    }
    // Persist to local storage if it's a local order
    try {
      const local = JSON.parse(localStorage.getItem("hoh_local_orders") || "[]");
      const updated = local.map((ord) =>
        (ord.id === orderId || ord._id === orderId || ord.orderNumber === orderId)
          ? { ...ord, fulfillmentStatus: newStatus, status: newStatus }
          : ord
      );
      localStorage.setItem("hoh_local_orders", JSON.stringify(updated));
    } catch (e) {}
  };

  const addNewOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

  // Dynamic Real-Time Metrics calculated from live orders & users
  const dynamicMetrics = useMemo(() => {
    const rawRevenue = orders.reduce((sum, o) => {
      return sum + (Number(o.grandTotal || o.totalAmount || o.total) || 0);
    }, 0);
    const rawOrdersCount = orders.length;
    const aov = rawOrdersCount > 0 ? Math.round(rawRevenue / rawOrdersCount) : 0;
    const patronsCount = users.length > 0 ? users.length : (orders.length > 0 ? orders.length : 1);

    return {
      revenue: {
        title: "Net Atelier Revenue",
        value: `£${rawRevenue.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        raw: rawRevenue,
        change: "+100%",
        isPositive: true,
        comparison: "Live dynamic orders revenue",
        target: `£${Math.max(10000, rawRevenue * 1.2).toLocaleString()}`,
        targetPercent: rawRevenue > 0 ? 100 : 0,
        sparkline: [0, Math.round(rawRevenue * 0.3), Math.round(rawRevenue * 0.7), rawRevenue],
      },
      orders: {
        title: "Bespoke & Retail Orders",
        value: String(rawOrdersCount),
        raw: rawOrdersCount,
        change: `${rawOrdersCount} live`,
        isPositive: true,
        comparison: "From live database & checkout",
        target: `${rawOrdersCount + 10} orders`,
        targetPercent: 100,
        sparkline: [0, Math.round(rawOrdersCount * 0.5), rawOrdersCount],
      },
      aov: {
        title: "Average Basket Value",
        value: `£${aov.toFixed(2)}`,
        raw: aov,
        change: "+5.4%",
        isPositive: true,
        comparison: "Calculated from completed commissions",
        target: "£350.00",
        targetPercent: aov > 0 ? 100 : 0,
        sparkline: [0, Math.round(aov * 0.7), aov],
      },
      clients: {
        title: "VIP Patrons & Accounts",
        value: String(patronsCount),
        raw: patronsCount,
        change: `${patronsCount} active`,
        isPositive: true,
        comparison: "Registered atelier users",
        target: `${patronsCount + 5} target`,
        targetPercent: 100,
        sparkline: [0, Math.round(patronsCount * 0.5), patronsCount],
      },
    };
  }, [orders, users]);

  const dynamicRevenueTimeline = useMemo(() => {
    const list = orders.map((o) => {
      const d = o.createdAt ? new Date(o.createdAt) : new Date();
      const label = d.toLocaleDateString("en-GB", { month: "short", day: "numeric" });
      const rev = Number(o.grandTotal || o.totalAmount || o.total || 0);
      return {
        label,
        revenue: rev,
        orders: 1,
        trade: Math.round(rev * 0.4),
        top: o.items?.[0]?.name || "Bespoke Creation",
      };
    });
    return {
      "30D": list.length > 0 ? list : [{ label: "Today", revenue: 0, orders: 0, trade: 0, top: "Awaiting commissions" }],
    };
  }, [orders]);

  const unreadCount = notifications.filter((n) => n.unread).length;

  return (
    <AdminContext.Provider
      value={{
        theme,
        toggleTheme,
        currentRole,
        setCurrentRole: switchRole,
        authUser,
        sidebarCollapsed,
        setSidebarCollapsed,
        activeTab,
        setActiveTab,
        spotlightOpen,
        setSpotlightOpen,
        notificationsOpen,
        setNotificationsOpen,
        newProductOpen,
        setNewProductOpen,
        selectedOrder,
        setSelectedOrder,
        orders,
        setOrders,
        updateOrderStatus,
        addNewOrder,
        users,
        categories,
        brands,
        notifications,
        unreadCount,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        revenuePeriod,
        setRevenuePeriod,
        chartMetric,
        setChartMetric,
        metrics: dynamicMetrics,
        revenueTimeline: dynamicRevenueTimeline,
        // Products & Catalog CRUD
        products,
        loadingProducts,
        editingProduct,
        productModalOpen,
        setProductModalOpen,
        viewingProduct,
        viewProductModalOpen,
        openCreateProductModal,
        openEditProductModal,
        openViewProductModal,
        closeViewProductModal,
        refreshProducts,
        addProduct,
        editProduct,
        deleteProduct,
        // Trade B2B
        tradeProfile,
        tradeCredit,
        tradeQuotations,
        pendingApplications,
        tradeTiers,
        loadingTradeData,
        requestQuote,
        approveQuote,
        convertQuoteToOrder,
        reviewApplication,
        negotiateQuote,
        isInitialLoading,
        isRefreshing,
        refreshData: () => loadBackendData(true),
        reloadBackendData: loadBackendData,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
