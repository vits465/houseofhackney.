import { useState } from "react";
import { X, CheckCheck, Bell, Sparkles, AlertCircle, ShoppingBag, Shield } from "lucide-react";
import { useAdmin } from "../AdminContext";

export default function NotificationDrawer() {
  const {
    notificationsOpen,
    setNotificationsOpen,
    theme,
    notifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    unreadCount,
  } = useAdmin();

  const [activeFilter, setActiveFilter] = useState("all");
  const isDark = theme === "dark";

  if (!notificationsOpen) return null;

  const filtered = notifications.filter((n) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "unread") return n.unread;
    return n.category === activeFilter;
  });

  const getCategoryIcon = (category) => {
    switch (category) {
      case "orders":
        return <ShoppingBag size={14} className="text-[#3e7b52] dark:text-[#74b886]" />;
      case "inventory":
        return <AlertCircle size={14} className="text-amber-500" />;
      case "trade":
        return <Shield size={14} className="text-[#3e7b52] dark:text-[#74b886]" />;
      default:
        return <Sparkles size={14} className="text-[#3e7b52] dark:text-[#74b886]" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setNotificationsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          className={`w-screen max-w-md border-l shadow-2xl flex flex-col transition-all duration-300 ${
            isDark
              ? "bg-[#18201a] border-[#293a2c] text-[#f2f7f3]"
              : "bg-white border-[#e2ece4] text-[#1e2a21]"
          }`}
        >
          {/* Header */}
          <div
            className={`p-5 border-b flex items-center justify-between ${
              isDark ? "border-[#293a2c]" : "border-[#e5ede6]"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`p-2 rounded-2xl ${
                  isDark
                    ? "bg-[#212c23] text-[#74b886]"
                    : "bg-[#eaf5ed] text-[#347847]"
                }`}
              >
                <Bell size={18} />
              </div>
              <div>
                <h3 className="font-sans text-base font-bold">Atelier Alerts</h3>
                <p
                  className={`text-xs ${
                    isDark ? "text-[#8a9d8e]" : "text-[#788c7e]"
                  }`}
                >
                  {unreadCount} unread transmissions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  title="Mark all as read"
                  className={`p-1.5 rounded-lg border text-xs font-mono transition-colors ${
                    isDark
                      ? "bg-[#141a15] border-[#253327] text-[#74b886]"
                      : "bg-[#f5f9f6] border-[#d8e6dc] text-[#2d5538]"
                  }`}
                >
                  <CheckCheck size={16} />
                </button>
              )}
              <button
                onClick={() => setNotificationsOpen(false)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isDark
                    ? "bg-[#141a15] border-[#253327]"
                    : "bg-[#f5f9f6] border-[#d8e6dc]"
                }`}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Filter Pills */}
          <div
            className={`px-5 py-3 border-b flex items-center gap-2 overflow-x-auto text-xs scrollbar-none ${
              isDark ? "border-[#293a2c]" : "border-[#e5ede6]"
            }`}
          >
            {[
              { id: "all", label: "All" },
              { id: "unread", label: `Unread (${unreadCount})` },
              { id: "orders", label: "Orders" },
              { id: "inventory", label: "Inventory" },
              { id: "trade", label: "VIP Trade" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1 rounded-full font-sans transition-all whitespace-nowrap ${
                  activeFilter === f.id
                    ? "bg-[#3e7b52] text-white font-semibold shadow-sm shadow-[#3e7b52]/20"
                    : isDark
                    ? "bg-[#141a15] text-[#9db3a1] hover:text-[#f2f7f3]"
                    : "bg-[#edf6f0] text-[#526956] hover:text-[#142617]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Notification Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3 scrollbar-thin">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-xs opacity-60 font-sans">
                No notifications in this filter category.
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markNotificationAsRead(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative ${
                    item.unread
                      ? isDark
                        ? "bg-[#212c23] border-[#364b39]"
                        : "bg-[#f4f9f5] border-[#cce1d2]"
                      : isDark
                      ? "bg-[#141a15] border-[#253327] opacity-80"
                      : "bg-[#fcfdfc] border-[#e7f0e9] opacity-80"
                  }`}
                >
                  {item.unread && (
                    <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-[#4a8b5e] animate-pulse" />
                  )}

                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`p-1.5 rounded-xl ${
                        isDark ? "bg-[#141a15]" : "bg-[#ffffff]"
                      }`}
                    >
                      {getCategoryIcon(item.category)}
                    </span>
                    <span className="text-xs font-sans font-bold">
                      {item.title}
                    </span>
                  </div>

                  <p
                    className={`text-xs font-sans leading-relaxed ${
                      isDark ? "text-[#8a9d8e]" : "text-[#627766]"
                    }`}
                  >
                    {item.message}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-current/10 text-[10px] font-mono">
                    <span
                      className={isDark ? "text-[#7f9183]" : "text-[#8fa194]"}
                    >
                      {item.time}
                    </span>
                    <span className="text-[#3e7b52] dark:text-[#74b886] font-semibold uppercase">
                      {item.category}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
