import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { LogOut } from "lucide-react";
import { useAdmin } from "../AdminContext";
import { showToast, showConfirm } from "../../../utils/sweetAlert";
import { logout } from "../../../features/auth/authSlice";

export default function V14Account() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, authUser } = useAdmin();
  const isDark = theme === "dark";

  const handleLogout = async () => {
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

  const displayName = authUser?.name || [authUser?.firstName, authUser?.lastName].filter(Boolean).join(" ") || "Aditya Chauhan";
  const email = authUser?.email || "adichauha465@gmail.com";
  const roleDisplay = currentRole === "super-admin" ? "Super Admin (Master Atelier)" : currentRole === "trade" ? "B2B Trade Partner" : "Atelier Operations Manager";

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1
          className={`text-2xl sm:text-3xl font-sans font-bold tracking-tight ${
            isDark ? "text-[#f2f7f3]" : "text-[#142617]"
          }`}
        >
          Account Profile & Permissions
        </h1>
        <p
          className={`text-xs sm:text-sm mt-1 font-sans ${
            isDark ? "text-[#9db3a1]" : "text-[#526956]"
          }`}
        >
          Curator administrative credentials and atelier security.
        </p>
      </div>

      <div
        className={`p-7 rounded-3xl border shadow-sm space-y-6 ${
          isDark
            ? "bg-[#18231a] border-[#293a2c] text-[#f2f7f3]"
            : "bg-white border-[#e2ece5] text-[#142617]"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#3e7b52] text-white flex items-center justify-center font-serif font-bold text-xl ring-2 ring-[#3e7b52]/30 shadow-sm">
            {displayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h3
              className={`font-sans font-bold text-lg ${
                isDark ? "text-[#f2f7f3]" : "text-[#142617]"
              }`}
            >
              {displayName}
            </h3>
            <p
              className={`text-xs ${
                isDark ? "text-[#9db3a1]" : "text-[#526956]"
              }`}
            >
              {email} • {roleDisplay}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans pt-4 border-t border-current/10">
          <div>
            <label className="block font-semibold mb-1">Display Name</label>
            <input
              type="text"
              defaultValue={displayName}
              className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none transition-colors ${
                isDark
                  ? "bg-[#141a15] border-[#253327] text-[#f2f7f3] focus:border-[#4a8b5e]"
                  : "bg-[#f5f9f6] border-[#d8e6dc] text-[#142617] focus:border-[#3e7b52]"
              }`}
            />
          </div>

          <div>
            <label className="block font-semibold mb-1">Curator Email</label>
            <input
              type="email"
              defaultValue={email}
              className={`w-full px-3.5 py-2.5 rounded-xl border focus:outline-none transition-colors ${
                isDark
                  ? "bg-[#141a15] border-[#253327] text-[#f2f7f3] focus:border-[#4a8b5e]"
                  : "bg-[#f5f9f6] border-[#d8e6dc] text-[#142617] focus:border-[#3e7b52]"
              }`}
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-current/10">
          <button
            onClick={handleLogout}
            className="px-5 py-2.5 rounded-full border border-rose-300 dark:border-rose-900/60 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-sans font-bold transition-colors flex items-center gap-2"
          >
            <LogOut size={13} />
            Sign Out of Atelier
          </button>

          <button
            onClick={() => showToast("Account changes saved.")}
            className="px-6 py-2.5 rounded-full bg-[#3e7b52] hover:bg-[#346945] text-white text-xs font-sans font-bold transition-colors shadow-sm shadow-[#3e7b52]/20"
          >
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
