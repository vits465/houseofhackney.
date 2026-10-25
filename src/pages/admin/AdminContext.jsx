import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import adminApiService from "./services/adminApiService";
import {
  INITIAL_METRICS,
  RECENT_ORDERS,
  NOTIFICATIONS,
  REVENUE_TIMELINE,
} from "./mockData";
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

  // Dynamic state
  const [orders, setOrders] = useState(RECENT_ORDERS);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
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
        setSelectedOrder(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch initial backend Trade & Product data
  const loadBackendData = useCallback(async () => {
    setLoadingTradeData(true);
    setLoadingProducts(true);
    try {
      const [profileData, creditData, quotesData, pendingApps, tiersData, prodsData] =
        await Promise.all([
          adminApiService.getMyTradeProfile(),
          adminApiService.getMyCredit(),
          adminApiService.getUserQuotes(),
          adminApiService.getPendingTradeApplications(),
          adminApiService.getTradeTiers(),
          adminApiService.getProducts(),
        ]);

      setTradeProfile(profileData);
      setTradeCredit(creditData);
      setTradeQuotations(quotesData || []);
      setPendingApplications(pendingApps || []);
      setTradeTiers(tiersData || []);
      setProducts(prodsData || []);
    } catch (err) {
      console.warn("Error loading backend data:", err);
    } finally {
      setLoadingTradeData(false);
      setLoadingProducts(false);
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

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId ? { ...ord, fulfillmentStatus: newStatus } : ord
      )
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) => ({ ...prev, fulfillmentStatus: newStatus }));
    }
  };

  const addNewOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
  };

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
        notifications,
        unreadCount,
        markAllNotificationsAsRead,
        markNotificationAsRead,
        revenuePeriod,
        setRevenuePeriod,
        chartMetric,
        setChartMetric,
        metrics: INITIAL_METRICS,
        revenueTimeline: REVENUE_TIMELINE,
        // Products & Catalog CRUD
        products,
        loadingProducts,
        editingProduct,
        productModalOpen,
        setProductModalOpen,
        addProduct,
        editProduct,
        deleteProduct,
        openCreateProductModal,
        openEditProductModal,
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
