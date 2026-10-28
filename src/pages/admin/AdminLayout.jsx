import { AnimatePresence, motion } from "framer-motion";
import { RefreshCw, Sparkles } from "lucide-react";
import { AdminProvider, useAdmin } from "./AdminContext";

// V14 Layout Components matching reference video & light green and white theme
import V14Sidebar from "./v14/V14Sidebar";
import V14Header from "./v14/V14Header";
import V14Overview from "./v14/V14Overview";
import V14Program from "./v14/V14Program";
import V14Activity from "./v14/V14Activity";
import V14Manage from "./v14/V14Manage";
import V14Account from "./v14/V14Account";
import V14Reports from "./v14/V14Reports";

// Trade B2B Components (Limited Access Portal)
import TradeOverview from "./v14/trade/TradeOverview";
import TradeQuotations from "./v14/trade/TradeQuotations";
import TradeCatalog from "./v14/trade/TradeCatalog";
import TradeOrders from "./v14/trade/TradeOrders";
import TradeCompanyProfile from "./v14/trade/TradeCompanyProfile";

// Admin / Super Admin Views
import AdminTradeReview from "./v14/admin/AdminTradeReview";
import AdminUsersRoles from "./v14/admin/AdminUsersRoles";
import AdminTaxonomy from "./v14/admin/AdminTaxonomy";
import AdminCommerce from "./v14/admin/AdminCommerce";
import AdminReviews from "./v14/admin/AdminReviews";
import AdminMediaLibrary from "./v14/admin/AdminMediaLibrary";

// Modals
import SpotlightSearchModal from "./components/SpotlightSearchModal";
import NotificationDrawer from "./components/NotificationDrawer";
import ProductFormModal from "./components/ProductFormModal";
import ProductDetailModal from "./components/ProductDetailModal";
import OrderDetailModal from "./components/OrderDetailModal";

function DashboardV14Main() {
  const {
    theme,
    currentRole,
    isActualSuperAdmin,
    activeTab,
    setActiveTab,
    productModalOpen,
    setProductModalOpen,
    editingProduct,
    isInitialLoading,
  } = useAdmin();
  const isDark = theme === "dark";

  // Render content based on top pill navigation tabs and role boundaries
  const renderTabContent = () => {
    // 1. Trade Patron B2B Views (Limited Access)
    if (currentRole === "trade") {
      switch (activeTab) {
        case "trade-overview":
          return <TradeOverview key="trade-overview" />;
        case "trade-quotes":
          return <TradeQuotations key="trade-quotes" />;
        case "trade-catalog":
          return <TradeCatalog key="trade-catalog" />;
        case "trade-orders":
          return <TradeOrders key="trade-orders" />;
        case "trade-profile":
          return <TradeCompanyProfile key="trade-profile" />;
        default:
          return <TradeOverview key="trade-overview-default" />;
      }
    }

    // 2. Super Admin & Manager Views
    switch (activeTab) {
      case "overview":
        return <V14Overview key="overview" />;
      case "manage":
        return <V14Manage key="manage" />;
      case "taxonomy":
        return <AdminTaxonomy key="taxonomy" />;
      case "commerce":
        return <AdminCommerce key="commerce" />;
      case "trade-b2b":
        return <AdminTradeReview key="trade-b2b" />;
      case "reviews":
        return <AdminReviews key="reviews" />;
      case "media":
        return <AdminMediaLibrary key="media" />;
      case "program":
        return <V14Program key="program" />;
      case "activity":
        return <V14Activity key="activity" />;
      case "reports":
        return <V14Reports key="reports" />;
      case "users-roles":
      case "users":
        return currentRole === "super-admin" || isActualSuperAdmin ? (
          <AdminUsersRoles key="users-roles" />
        ) : (
          <V14Overview key="overview-restricted" />
        );
      case "account":
        return <V14Account key="account" />;
      default:
        return <V14Overview key="overview-default" />;
    }
  };

  return (
    <div
      className={`min-h-screen flex font-sans antialiased transition-colors duration-300 relative ${
        isDark
          ? "bg-[#0d130e] text-[#f2f7f3]"
          : "bg-[#f4f7f4] text-[#142617]"
      }`}
    >
      {/* permanently fixed left aside rail */}
      <V14Sidebar />

      {/* main layout container: permanently offset by pl-16 for the 64px rail */}
      <div className="flex-1 flex flex-col min-h-screen pl-16 w-full">
        {/* Fixed Top Header Bar: locked to top: 0, left: 16 (64px), right: 0 just like the sidebar rail */}
        <header className="fixed top-0 left-16 right-0 z-30 shadow-xs backdrop-blur-md">
          <V14Header activeTab={activeTab} setActiveTab={setActiveTab} />
        </header>

        {/* Main Dashboard Canvas with Smooth Page Transition - padded top for fixed header */}
        <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pt-28 md:pt-20">
          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[55vh] gap-4">
              <div className="relative">
                <div className="w-14 h-14 rounded-full border-3 border-[#3e7b52]/20 border-t-[#3e7b52] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles size={18} className="text-[#3e7b52] animate-pulse" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-serif text-lg font-bold">House of Hackney Atelier</h3>
                <p className="text-xs text-[#526956] dark:text-[#859b89] animate-pulse mt-1">
                  Synchronizing live commerce catalog, telemetry & orders...
                </p>
              </div>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentRole}-${activeTab}`}
                initial={{ opacity: 0, y: 12, scale: 0.995 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.995 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                {renderTabContent()}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Modals & Interactive Drawers */}
      <SpotlightSearchModal />
      <NotificationDrawer />
      <ProductFormModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        editingProduct={editingProduct}
      />
      <ProductDetailModal />
      <OrderDetailModal />
    </div>
  );
}

export default function AdminLayout() {
  return (
    <AdminProvider>
      <DashboardV14Main />
    </AdminProvider>
  );
}
