import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  LayoutGrid,
  Calendar,
  FileText,
  Users,
  Settings,
  HelpCircle,
  Sun,
  Moon,
  Building2,
  FileSpreadsheet,
  Package,
  ShieldCheck,
  Award,
  LogOut,
} from "lucide-react";
import { useAdmin } from "../AdminContext";
import { showToast, showConfirm } from "../../../utils/sweetAlert";
import { logout } from "../../../features/auth/authSlice";

export default function V14Sidebar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme, currentRole, activeTab, setActiveTab } = useAdmin();
  const isDark = theme === "dark";

  const handleLogout = async () => {
    const confirmed = await showConfirm(
      "Sign out of Atelier?",
      "Are you sure you want to end your current session? You will be redirected to the sign in page."
    );
    if (confirmed) {
      sessionStorage.removeItem("refreshToken");
      sessionStorage.removeItem("hoh_preview_role");
      dispatch(logout());
      showToast("Signed out of House of Hackney.");
      navigate("/login", { replace: true });
    }
  };

  // Role-tailored rail items
  const getRailItems = () => {
    if (currentRole === "trade") {
      return [
        {
          id: "trade-overview",
          icon: LayoutGrid,
          tooltip: "Trade Hub Overview",
          match: ["trade-overview"],
        },
        {
          id: "trade-quotes",
          icon: FileSpreadsheet,
          tooltip: "Trade Quotations",
          match: ["trade-quotes"],
        },
        {
          id: "trade-catalog",
          icon: Package,
          tooltip: "Wholesale Catalog",
          match: ["trade-catalog"],
        },
        {
          id: "trade-orders",
          icon: FileText,
          tooltip: "My Trade Orders",
          match: ["trade-orders"],
        },
        {
          id: "trade-profile",
          icon: Building2,
          tooltip: "Company Profile & Tier",
          match: ["trade-profile"],
        },
      ];
    }

    // Super Admin & Manager
    const adminRail = [
      {
        id: "overview",
        icon: LayoutGrid,
        tooltip: "Master Overview",
        match: ["overview"],
      },
      {
        id: "manage",
        icon: FileText,
        tooltip: "Products & Catalog (CRUD)",
        match: ["manage"],
      },
      {
        id: "trade-b2b",
        icon: ShieldCheck,
        tooltip: "Trade B2B Portal Admin",
        match: ["trade-b2b"],
      },
      {
        id: "program",
        icon: Users,
        tooltip: "VIP Patron Program",
        match: ["program"],
      },
      {
        id: "activity",
        icon: Calendar,
        tooltip: "Activity Telemetry",
        match: ["activity"],
      },
      {
        id: "reports",
        icon: Settings,
        tooltip: "Financial Reports",
        match: ["reports", "users-roles"],
      },
    ];

    return adminRail;
  };

  const railItems = getRailItems();

  return (
    <aside
      className={`fixed top-0 bottom-0 left-0 w-16 h-screen flex flex-col items-center justify-between py-6 border-r transition-colors duration-300 z-40 select-none shadow-[1px_0_12px_rgba(0,0,0,0.03)] ${
        isDark
          ? "bg-[#131b14] border-[#243527] text-[#f2f7f3]"
          : "bg-[#ffffff] border-[#e2ece4] text-[#142617]"
      }`}
    >
      {/* Top: Vertical Sun/Moon Toggle from Video (Light Green & White) */}
      <div
        className={`flex flex-col items-center p-1 rounded-full border transition-colors ${
          isDark
            ? "bg-[#1c271e] border-[#2c3d2e]"
            : "bg-[#edf6f0] border-[#d4e6d7]"
        }`}
      >
        <button
          onClick={() => isDark && toggleTheme()}
          title="Switch to Light Theme"
          className={`p-2 rounded-full transition-all duration-200 relative ${
            !isDark
              ? "bg-white text-[#3e7b52] shadow-sm scale-105"
              : "text-[#859b89] hover:text-[#f2f7f3]"
          }`}
        >
          <Sun size={15} className="stroke-[2.2]" />
        </button>

        <button
          onClick={() => !isDark && toggleTheme()}
          title="Switch to Dark Theme"
          className={`p-2 rounded-full transition-all duration-200 relative ${
            isDark
              ? "bg-[#2d4031] text-[#7ec792] shadow-sm scale-105"
              : "text-[#627766] hover:text-[#142617]"
          }`}
        >
          <Moon size={15} className="stroke-[2.2]" />
        </button>
      </div>

      {/* Middle: Vertical Rail Icons mapped to Active Tabs */}
      <div className="flex flex-col items-center gap-3 w-full px-2">
        {railItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.match.includes(activeTab);

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                } else {
                  setActiveTab(item.id);
                }
              }}
              title={item.tooltip}
              className={`relative flex items-center justify-center w-10 h-10 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? "text-white shadow-sm shadow-[#3e7b52]/25"
                  : isDark
                  ? "text-[#859b89] hover:text-white hover:bg-[#1d271f]"
                  : "text-[#627766] hover:text-[#142617] hover:bg-[#edf6f0]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveCapsule"
                  className="absolute inset-0 rounded-2xl bg-[#3e7b52]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon size={18} className="relative z-10 stroke-[2.1]" />

              {/* Tooltip on hover */}
              <span className="absolute left-14 px-2.5 py-1 rounded-md bg-[#131b14] text-white text-[11px] font-sans font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-md">
                {item.tooltip}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom: Help Circle & Logout */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => showToast("House of Hackney Atelier Support")}
          title="Atelier Support & Assistance"
          className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-colors ${
            isDark
              ? "text-[#859b89] hover:text-white hover:bg-[#1d271f]"
              : "text-[#627766] hover:text-[#142617] hover:bg-[#edf6f0]"
          }`}
        >
          <HelpCircle size={18} className="stroke-[2.1]" />
        </button>

        <button
          onClick={handleLogout}
          title="Sign Out of Atelier"
          className={`flex items-center justify-center w-10 h-10 rounded-2xl transition-colors group relative ${
            isDark
              ? "text-rose-400 hover:text-white hover:bg-rose-500/20"
              : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          }`}
        >
          <LogOut size={18} className="stroke-[2.1] group-hover:scale-110 transition-transform" />
          <span className="absolute left-14 px-2.5 py-1 rounded-md bg-[#131b14] text-white text-[11px] font-sans font-medium whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-md">
            Sign Out
          </span>
        </button>
      </div>
    </aside>
  );
}
