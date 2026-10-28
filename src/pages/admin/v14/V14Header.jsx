import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Search,
  Bell,
  Clock,
  ChevronDown,
  Shield,
  Award,
  Crown,
  Check,
  Building2,
  LogOut,
  RefreshCw,
} from "lucide-react";
import { useAdmin } from "../AdminContext";
import { showToast, showConfirm } from "../../../utils/sweetAlert";
import { logout } from "../../../features/auth/authSlice";
import BrandLogo from "../../../components/common/BrandLogo";

export default function V14Header({ activeTab, setActiveTab }) {
  const {
    theme,
    currentRole,
    setCurrentRole,
    authUser,
    tradeProfile,
    setSpotlightOpen,
    setNotificationsOpen,
    unreadCount,
    isInitialLoading,
    isRefreshing,
    refreshData,
    isActualAdmin,
  } = useAdmin();
  const isDark = theme === "dark";
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setRoleDropdownOpen(false);
    const confirmed = await showConfirm(
      "Sign out of Atelier?",
      "Are you sure you want to end your current session? You will be redirected to the sign in page."
    );
    if (confirmed && confirmed.isConfirmed) {
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("hoh_preview_role");
      dispatch(logout());
      showToast("Signed out of House of Hackney.");
      navigate("/login", { replace: true });
    }
  };

  // Tab definitions dynamically tailored to each role
  const getTabsForRole = () => {
    switch (currentRole) {
      case "trade":
        return [
          { id: "trade-overview", label: "Trade Hub" },
          { id: "trade-quotes", label: "Quotations" },
          { id: "trade-catalog", label: "Wholesale Catalog" },
          { id: "trade-orders", label: "My Orders" },
          { id: "trade-profile", label: "Company Profile" },
        ];
      case "admin":
        return [
          { id: "overview", label: "Overview" },
          { id: "manage", label: "Products" },
          { id: "taxonomy", label: "Taxonomy" },
          { id: "commerce", label: "Commerce" },
          { id: "trade-b2b", label: "Trade B2B" },
          { id: "reviews", label: "Reviews" },
          { id: "media", label: "Media Assets" },
          { id: "activity", label: "Activity" },
          { id: "program", label: "Program" },
        ];
      case "super-admin":
      default:
        return [
          { id: "overview", label: "Overview" },
          { id: "manage", label: "Products" },
          { id: "taxonomy", label: "Taxonomy" },
          { id: "commerce", label: "Commerce" },
          { id: "trade-b2b", label: "Trade B2B" },
          { id: "reviews", label: "Reviews" },
          { id: "media", label: "Media Assets" },
          { id: "program", label: "Program" },
          { id: "activity", label: "Activity" },
          { id: "reports", label: "Reports" },
          { id: "users-roles", label: "Users & Roles" },
        ];
    }
  };

  const tabs = getTabsForRole();

  // Role info display helpers
  const roleDisplayConfig = {
    "super-admin": {
      label: "Super Admin",
      subLabel: "Master Atelier",
      icon: Crown,
      badgeColor: "bg-[#3e7b52] text-white",
    },
    admin: {
      label: "Admin Manager",
      subLabel: "Operations",
      icon: Shield,
      badgeColor: "bg-[#4a8a5f] text-white",
    },
    trade: {
      label: "Trade Patron",
      subLabel: tradeProfile?.company?.name || "Kensington Heritage",
      icon: Award,
      badgeColor: "bg-[#2e623f] text-white",
    },
  };

  const currentRoleConfig =
    roleDisplayConfig[currentRole] || roleDisplayConfig["super-admin"];
  const RoleIcon = currentRoleConfig.icon;

  const handleSelectRole = (newRole) => {
    if (!isActualAdmin) return;
    setCurrentRole(newRole);
    setRoleDropdownOpen(false);
  };

  return (
    <header
      className={`px-4 sm:px-8 py-2.5 sm:py-3.5 flex flex-col justify-between border-b transition-colors duration-300 relative z-30 ${
        isDark
          ? "bg-[#141a15] border-[#253327] text-[#f2f7f3]"
          : "bg-[#ffffff] border-[#e4ede5] text-[#142617]"
      }`}
    >
      <div className="w-full flex items-center justify-between">
        {/* Left: Brand Icon + Title (Enhanced Size & Responsive) */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-shrink-0">
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            title="Visit House of Hackney Storefront"
            className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-[#2a5b36] via-[#3e7b52] to-[#559a68] text-white shadow-md shadow-[#3e7b52]/20 border border-white/20 transition-transform duration-200 hover:scale-105 p-2 flex-shrink-0"
          >
            <BrandLogo className="w-7 h-3.5 sm:w-9 sm:h-4.5 object-contain fill-white" />
          </Link>
          <div className="flex flex-col">
            <span
              className={`font-serif font-bold text-xs sm:text-base md:text-lg tracking-tight leading-none ${
                isDark ? "text-[#f2f7f3]" : "text-[#142617]"
              }`}
            >
              House of Hackney
            </span>
            <span
              className={`text-[8px] sm:text-[10px] font-mono tracking-widest uppercase font-bold mt-1 ${
                isDark ? "text-[#7ec792]" : "text-[#2e683f]"
              }`}
            >
              {currentRole === "trade" ? "B2B Trade Portal" : "ADMIN DASHBOARD"}
            </span>
          </div>
        </div>

        {/* Center: Rounded Pill Navbar with Smooth Framer Motion Slide */}
        <nav
          className={`hidden md:flex items-center p-1 rounded-full border shadow-sm transition-colors overflow-x-auto max-w-[58vw] scrollbar-none ${
            isDark
              ? "bg-[#1d271f] border-[#2e3f31]"
              : "bg-[#f5f9f6] border-[#dce8df]"
          }`}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-3.5 py-1.5 rounded-full text-xs font-sans font-medium transition-colors duration-200 select-none whitespace-nowrap flex-shrink-0 ${
                  isActive
                    ? "text-white font-semibold"
                    : isDark
                    ? "text-[#9db3a1] hover:text-white"
                    : "text-[#526956] hover:text-[#142617]"
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="headerActiveTabPill"
                    className="absolute inset-0 rounded-full bg-[#3e7b52] shadow-sm shadow-[#3e7b52]/30"
                    transition={{ type: "spring", stiffness: 450, damping: 32 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right: Role Switcher Capsule, Search, Notifications, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Role Display: Switcher Pill for Genuine Admins ONLY, Static Secure Badge for Trade Patrons */}
          {isActualAdmin ? (
            <div className="relative">
              <button
                onClick={() => setRoleDropdownOpen((prev) => !prev)}
                title="Switch Access View (Super Admin / Admin / Trade Patron Preview)"
                className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full border transition-all text-xs font-semibold shadow-sm ${
                  isDark
                    ? "bg-[#1d271f] border-[#2e3f31] hover:bg-[#253528] text-white"
                    : "bg-[#edf6f0] border-[#d4e6d7] hover:bg-[#e4f1e8] text-[#1c4026]"
                }`}
              >
                <RoleIcon size={13} className="text-[#3e7b52]" />
                <span className="truncate max-w-[90px] sm:max-w-none">
                  {currentRoleConfig.label}
                </span>
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${
                    roleDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Role Dropdown */}
              <AnimatePresence>
                {roleDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setRoleDropdownOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 mt-2 w-64 rounded-2xl border shadow-xl p-2 z-50 text-xs ${
                        isDark
                          ? "bg-[#162017] border-[#293d2c] text-white"
                          : "bg-white border-[#dce8df] text-[#142617]"
                      }`}
                    >
                      <div className="px-3 py-1.5 border-b border-inherit mb-1">
                        <span className="text-[10px] uppercase font-bold text-[#627766] tracking-wider block">
                          Switch Role View
                        </span>
                        <span className="text-[10px] text-[#859b89]">
                          Preview endpoints and access control
                        </span>
                      </div>

                      {/* Super Admin Option */}
                      <button
                        onClick={() => handleSelectRole("super-admin")}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors text-left ${
                          currentRole === "super-admin"
                            ? "bg-[#3e7b52]/15 text-[#3e7b52] font-bold"
                            : isDark
                            ? "hover:bg-[#1f2d21]"
                            : "hover:bg-[#f2f7f3]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Crown size={15} className="text-[#3e7b52]" />
                          <div>
                            <p className="font-bold">Super Admin</p>
                            <p className="text-[10px] text-[#627766]">
                              Master Atelier · Full system access
                            </p>
                          </div>
                        </div>
                        {currentRole === "super-admin" && <Check size={14} />}
                      </button>

                      {/* Admin Manager Option */}
                      <button
                        onClick={() => handleSelectRole("admin")}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors text-left ${
                          currentRole === "admin"
                            ? "bg-[#3e7b52]/15 text-[#3e7b52] font-bold"
                            : isDark
                            ? "hover:bg-[#1f2d21]"
                            : "hover:bg-[#f2f7f3]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Shield size={15} className="text-[#3e7b52]" />
                          <div>
                            <p className="font-bold">Admin Manager</p>
                            <p className="text-[10px] text-[#627766]">
                              Catalog, Orders & Trade Review
                            </p>
                          </div>
                        </div>
                        {currentRole === "admin" && <Check size={14} />}
                      </button>

                      {/* Trade Patron Option */}
                      <button
                        onClick={() => handleSelectRole("trade")}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition-colors text-left ${
                          currentRole === "trade"
                            ? "bg-[#3e7b52]/15 text-[#3e7b52] font-bold"
                            : isDark
                            ? "hover:bg-[#1f2d21]"
                            : "hover:bg-[#f2f7f3]"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Award size={15} className="text-[#3e7b52]" />
                          <div>
                            <p className="font-bold">Trade Patron (B2B)</p>
                            <p className="text-[10px] text-[#627766]">
                              Limited access · Quotes & Credit
                            </p>
                          </div>
                        </div>
                        {currentRole === "trade" && <Check size={14} />}
                      </button>

                      {/* Sign Out Option */}
                      <div className="pt-2 mt-2 border-t border-inherit">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 p-2 rounded-xl transition-colors text-left text-rose-500 hover:bg-rose-500/10 font-bold"
                        >
                          <LogOut size={15} />
                          <div>
                            <p className="font-bold">Log Out</p>
                            <p className="text-[10px] text-[#859b89]">End current session</p>
                          </div>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-xs select-none ${
                isDark
                  ? "bg-[#1d271f] border-[#2e3f31] text-[#7ec792]"
                  : "bg-[#edf6f0] border-[#d4e6d7] text-[#1c4026]"
              }`}
            >
              <Award size={13} className="text-[#3e7b52]" />
              <span className="truncate">Trade Patron (B2B)</span>
            </div>
          )}

          {/* Live Sync / API Telemetry Status & Manual Refresh Button */}
          <button
            onClick={() => {
              if (!isRefreshing && !isInitialLoading) {
                showToast("Flushing cache and re-syncing atelier data...");
                refreshData?.();
              }
            }}
            title={
              isRefreshing || isInitialLoading
                ? "Synchronizing live atelier records..."
                : "Live connected • Click to re-sync database"
            }
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full border text-xs font-semibold transition-all shadow-xs ${
              isRefreshing || isInitialLoading
                ? "bg-[#3e7b52]/15 border-[#3e7b52]/40 text-[#3e7b52]"
                : isDark
                ? "bg-[#1d271f] border-[#2e3f31] text-[#9db3a1] hover:text-white hover:bg-[#253528]"
                : "bg-white border-[#d8e6dc] text-[#526956] hover:text-[#142617] hover:bg-[#edf6f0]"
            }`}
          >
            <RefreshCw
              size={12}
              className={`${
                isRefreshing || isInitialLoading
                  ? "animate-spin text-[#3e7b52]"
                  : "text-[#3e7b52]"
              }`}
            />
            <span className="hidden sm:inline text-[11px] font-sans font-medium">
              {isRefreshing || isInitialLoading ? "Syncing..." : "Live"}
            </span>
          </button>

          {/* Search Circle */}
          <button
            onClick={() => setSpotlightOpen(true)}
            title="Search (Ctrl+K)"
            className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
              isDark
                ? "bg-[#1d271f] border-[#2e3f31] text-[#9db3a1] hover:text-white hover:bg-[#253528]"
                : "bg-white border-[#d8e6dc] text-[#526956] hover:text-[#142617] hover:bg-[#edf6f0]"
            }`}
          >
            <Search size={14} />
          </button>

          {/* Bell Circle */}
          <button
            onClick={() => setNotificationsOpen(true)}
            title="Notifications"
            className={`relative flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
              isDark
                ? "bg-[#1d271f] border-[#2e3f31] text-[#9db3a1] hover:text-white hover:bg-[#253528]"
                : "bg-white border-[#d8e6dc] text-[#526956] hover:text-[#142617] hover:bg-[#edf6f0]"
            }`}
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#3e7b52] animate-pulse" />
            )}
          </button>

          {/* Storefront Link Circle */}
          <Link
            to="/"
            target="_blank"
            rel="noreferrer"
            title="View Storefront Boutique"
            className={`hidden sm:flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
              isDark
                ? "bg-[#1d271f] border-[#2e3f31] text-[#9db3a1] hover:text-white hover:bg-[#253528]"
                : "bg-white border-[#d8e6dc] text-[#526956] hover:text-[#142617] hover:bg-[#edf6f0]"
            }`}
          >
            <Clock size={14} />
          </Link>

          {/* Sign Out Action Circle */}
          <button
            onClick={handleLogout}
            title="Sign Out of Atelier"
            className={`flex items-center justify-center w-8 h-8 rounded-full border transition-colors ${
              isDark
                ? "bg-[#1d271f] border-[#2e3f31] text-rose-400 hover:text-white hover:bg-rose-500/20"
                : "bg-white border-[#d8e6dc] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
            }`}
          >
            <LogOut size={13} />
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Pill Scrollbar (Only on screens < md) */}
      <div className="flex md:hidden w-full overflow-x-auto pt-2 pb-0.5 gap-1.5 scrollbar-none border-t border-inherit mt-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1 rounded-full text-[11px] font-sans font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                isActive
                  ? "bg-[#3e7b52] text-white font-semibold shadow-xs"
                  : isDark
                  ? "bg-[#1c271e] text-[#9db3a1] hover:text-white"
                  : "bg-[#edf6f0] text-[#526956] hover:text-[#142617]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}
