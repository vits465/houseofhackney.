import { useState } from "react";
import { Users, Shield, Key, Plus, Check, Search, Lock } from "lucide-react";
import { useAdmin } from "../../AdminContext";
import { showToast } from "../../../../utils/sweetAlert";

const SYSTEM_ROLES = [
  {
    id: "role_01",
    name: "SUPER_ADMIN",
    displayName: "Super Admin (Master Atelier)",
    slug: "super-admin",
    usersCount: 2,
    description: "Complete unrestricted administrative control across all atelier domains and finance.",
    permissions: ["CATALOG_FULL", "TRADE_MANAGEMENT", "ORDERS_FULL", "FINANCE_REPORTS", "USER_MANAGEMENT", "SECURITY_AUDIT"],
  },
  {
    id: "role_02",
    name: "ADMIN",
    displayName: "Admin Manager (Operations)",
    slug: "admin",
    usersCount: 4,
    description: "Operations and catalog manager with quote negotiation and fulfillment controls.",
    permissions: ["CATALOG_FULL", "TRADE_MANAGEMENT", "ORDERS_FULL", "ACTIVITY_VIEW"],
  },
  {
    id: "role_03",
    name: "TRADE_USER",
    displayName: "Trade Patron (B2B Partner)",
    slug: "trade",
    usersCount: 128,
    description: "Professional interior designer or architecture firm with wholesale pricing and credit line.",
    permissions: ["TRADE_CATALOG_VIEW", "TRADE_QUOTATIONS_REQUEST", "TRADE_ORDERS_OWN", "CREDIT_LINE_ACCESS"],
  },
];

const SYSTEM_USERS = [
  {
    id: "usr_01",
    name: "Aditya Chauhan",
    email: "adichauha465@gmail.com",
    role: "Super Admin",
    status: "ACTIVE",
    lastLogin: "Today at 14:15",
  },
  {
    id: "usr_02",
    name: "Eleanor Sterling",
    email: "eleanor@houseofhackney.com",
    role: "Admin Manager",
    status: "ACTIVE",
    lastLogin: "Yesterday at 18:30",
  },
  {
    id: "usr_03",
    name: "Kensington Heritage Procurement",
    email: "procurement@kensingtonheritage.co.uk",
    role: "Trade Patron (B2B)",
    status: "ACTIVE",
    lastLogin: "2 hours ago",
  },
  {
    id: "usr_04",
    name: "Mayfair Atelier Studio",
    email: "eleanor@mayfairatelier.com",
    role: "Trade Patron (Pending)",
    status: "PENDING_REVIEW",
    lastLogin: "Yesterday at 11:20",
  },
];

export default function AdminUsersRoles() {
  const { theme } = useAdmin();
  const isDark = theme === "dark";

  const [activeTab, setActiveTab] = useState("users"); // 'users' | 'roles'
  const [searchQuery, setSearchQuery] = useState("");

  const filteredUsers = SYSTEM_USERS.filter(
    (u) =>
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Users, Roles & Access Control
          </h1>
          <p className="text-xs text-[#627766] mt-0.5">
            Super Admin credential governance, permission matrices, and atelier access boundaries
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div
        className={`p-1.5 rounded-full border max-w-fit flex items-center gap-1 transition-colors ${
          isDark
            ? "bg-[#1d271f] border-[#2e3f31]"
            : "bg-[#f5f9f6] border-[#dce8df]"
        }`}
      >
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeTab === "users"
              ? "bg-[#3e7b52] text-white shadow-sm"
              : isDark
              ? "text-[#859b89] hover:text-white"
              : "text-[#526956] hover:text-[#142617]"
          }`}
        >
          System Users ({SYSTEM_USERS.length})
        </button>

        <button
          onClick={() => setActiveTab("roles")}
          className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
            activeTab === "roles"
              ? "bg-[#3e7b52] text-white shadow-sm"
              : isDark
              ? "text-[#859b89] hover:text-white"
              : "text-[#526956] hover:text-[#142617]"
          }`}
        >
          Security Roles & RBAC ({SYSTEM_ROLES.length})
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div
          className={`rounded-2xl border p-6 transition-colors overflow-hidden ${
            isDark ? "bg-[#141a15] border-[#253327]" : "bg-white border-[#e4ede5]"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#627766]">
              Atelier Accounts
            </span>
            <div className="relative min-w-[220px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#859b89]"
              />
              <input
                type="text"
                placeholder="Search user or email..."
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

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr
                  className={`border-b text-[11px] font-semibold uppercase tracking-wider text-[#627766] ${
                    isDark ? "border-[#253327]" : "border-[#edf2ee]"
                  }`}
                >
                  <th className="pb-3 pl-2">Name & Identity</th>
                  <th className="pb-3">Email Address</th>
                  <th className="pb-3">Security Role</th>
                  <th className="pb-3">Account Status</th>
                  <th className="pb-3 pr-2 text-right">Last Telemetry</th>
                </tr>
              </thead>
              <tbody
                className={`divide-y ${
                  isDark ? "divide-[#202c22]" : "divide-[#edf2ee]"
                }`}
              >
                {filteredUsers.map((u) => (
                  <tr
                    key={u.id}
                    className={`transition-colors ${
                      isDark ? "hover:bg-[#1a231b]" : "hover:bg-[#f8fbf9]"
                    }`}
                  >
                    <td className="py-3.5 pl-2 font-bold">{u.name}</td>
                    <td className="py-3.5 text-[#627766]">{u.email}</td>
                    <td className="py-3.5">
                      <span className="font-semibold text-[#3e7b52]">{u.role}</span>
                    </td>
                    <td className="py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === "ACTIVE"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : "bg-amber-500/15 text-amber-600"
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right text-[#859b89] font-mono text-[11px]">
                      {u.lastLogin}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ROLES TAB */}
      {activeTab === "roles" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SYSTEM_ROLES.map((r) => (
            <div
              key={r.id}
              className={`rounded-2xl border p-6 flex flex-col justify-between transition-colors ${
                isDark ? "bg-[#141a15] border-[#253327]" : "bg-white border-[#e4ede5]"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3e7b52]">
                    {r.slug}
                  </span>
                  <span className="text-xs text-[#627766] font-medium">
                    {r.usersCount} Active Users
                  </span>
                </div>

                <h3 className="font-bold text-base tracking-tight mb-1.5">
                  {r.displayName}
                </h3>
                <p className="text-xs text-[#627766] leading-relaxed mb-4">
                  {r.description}
                </p>

                <div className="space-y-1.5 pt-3 border-t border-inherit">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#627766] block">
                    Granted Permissions:
                  </span>
                  {r.permissions.map((perm, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px]">
                      <Check size={12} className="text-[#3e7b52]" />
                      <span className="font-mono text-[#859b89]">{perm}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-inherit flex items-center justify-between text-xs">
                <span className="text-[#859b89] text-[11px]">RBAC Policy #HO-0{r.id.slice(-2)}</span>
                <span className="text-[#3e7b52] font-semibold">Active</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
