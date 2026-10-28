import { memo, useEffect, useRef, useState, useTransition } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { logoutUser } from "../../features/auth/authActions";
import {
  Search,
  ShoppingBag,
  Menu,
  UserRound,
  Heart,
} from "lucide-react";

import {
  showConfirm,
  showError,
  showToast,
} from "../../utils/sweetAlert";

import AnnouncementBar from "./AnnouncementBar";
import Navbar from "./Navbar";
import BrandLogo from "../common/BrandLogo";
import MobileMenu from "./MobileMenu";
import SearchModal from "./SearchModal";
import { useWishlist } from "../../utils/wishlist";

function calculateTargetLogo(scrollY) {
  // When near the top, always show the monogram crest
  if (scrollY < 140) return "monogram";

  const sections = Array.from(
    document.querySelectorAll("main section, main > div > section, [data-section]")
  );

  let passed = 0;
  if (sections.length >= 3) {
    const offset = scrollY + 140;
    for (let i = 0; i < sections.length; i++) {
      if (offset >= sections[i].offsetTop) {
        passed = i;
      }
    }
  } else {
    // Fallback based on ~600px section height
    passed = Math.floor(scrollY / 600);
  }

  // 2-section cycle:
  // sections 0, 1 -> monogram
  // sections 2, 3 (after 2 sections down!) -> wordmark
  // sections 4, 5 (after 2 more sections!) -> monogram
  // sections 6, 7 -> wordmark
  return Math.floor(passed / 2) % 2 === 1 ? "wordmark" : "monogram";
}

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState("SHOP");
  const [activeCategory, setActiveCategory] = useState(null);

  // Logo state for smooth down-to-up transition every 2 sections
  const [logoState, setLogoState] = useState({
    activeLogo: "monogram",
    prevLogo: null,
    animating: false,
    direction: "up",
  });

  const lastScrollYRef = useRef(0);
  const currentLogoRef = useRef("monogram");
  const animTimerRef = useRef(null);

  const [, startTransition] = useTransition();

  const navigate = useNavigate();
  const location = useLocation();

  const { user, isAuthenticated, initialized } = useSelector(
    (state) => state.auth || {}
  );
  const cartItems = useSelector(
    (state) => state.cart?.items || []
  );

  const { count: wishlistCount } = useWishlist();

  const cartCount = cartItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0
  );

  // Sync activeNavTab with current route
  useEffect(() => {
    if (location.pathname.startsWith("/inspiration")) {
      startTransition(() => setActiveNavTab("INSPIRATION"));
    } else if (location.pathname.startsWith("/our-house")) {
      startTransition(() => setActiveNavTab("OUR HOUSE"));
    } else {
      startTransition(() => setActiveNavTab("SHOP"));
    }
    setActiveCategory(null);
    setIsMobileOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Robust window scroll listener for sticky header shadow and 2-section alternating logo
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrolled = currentScrollY > 15;
          setIsScrolled(scrolled);

          // Determine scroll direction
          const isDown = currentScrollY >= lastScrollYRef.current;
          const dir = isDown ? "up" : "down";
          lastScrollYRef.current = currentScrollY;

          // Check if logo needs to switch based on 2-section intervals
          const target = calculateTargetLogo(currentScrollY);
          if (target !== currentLogoRef.current) {
            const previous = currentLogoRef.current;
            currentLogoRef.current = target;

            if (animTimerRef.current) {
              clearTimeout(animTimerRef.current);
            }

            setLogoState({
              activeLogo: target,
              prevLogo: previous,
              animating: true,
              direction: dir,
            });

            animTimerRef.current = setTimeout(() => {
              setLogoState((prev) => ({
                ...prev,
                animating: false,
                prevLogo: null,
              }));
              animTimerRef.current = null;
            }, 650);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (animTimerRef.current) {
        clearTimeout(animTimerRef.current);
      }
    };
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;

    const result = await showConfirm(
      "Leave our House?",
      "Are you sure you want to sign out of your account?"
    );

    if (!result.isConfirmed) return;

    setLoggingOut(true);

    try {
      await logoutUser();
      showToast("You have signed out successfully");
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      showError(
        "Unable to sign out",
        "Something went wrong while signing out. Please try again."
      );
    } finally {
      setLoggingOut(false);
    }
  };

  const openMobileMenu = () => setIsMobileOpen(true);
  const closeMobileMenu = () => setIsMobileOpen(false);

  const handleTabChange = (tab) => {
    setActiveNavTab(tab);
    setActiveCategory(null);
  };

  const getLogoClass = (type) => {
    const { animating, activeLogo, prevLogo, direction } = logoState;

    if (animating) {
      if (type === activeLogo) {
        return direction === "up"
          ? "animate-slideInUp relative flex items-center justify-center"
          : "animate-slideInDown relative flex items-center justify-center";
      }
      if (type === prevLogo) {
        return direction === "up"
          ? "animate-slideOutUp absolute inset-0 flex items-center justify-center pointer-events-none"
          : "animate-slideOutDown absolute inset-0 flex items-center justify-center pointer-events-none";
      }
      return "opacity-0 pointer-events-none absolute inset-0 flex items-center justify-center";
    }

    if (type === activeLogo) {
      return "relative opacity-100 translate-y-0 flex items-center justify-center";
    }
    return "opacity-0 pointer-events-none absolute inset-0 flex items-center justify-center";
  };

  const renderAuthLink = () =>
    initialized ? (
      isAuthenticated ? (
        <div className="hidden lg:flex items-center gap-2 sm:gap-3">
          <Link
            to="/account"
            className="text-xs tracking-[1px] hover:underline font-semibold text-[#171713] uppercase flex items-center gap-1.5"
          >
            <span>{user?.firstName ? user.firstName : "ACCOUNT"}</span>
          </Link>
          <span className="text-[#dedbd4]">|</span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            className="text-xs tracking-[1px] hover:underline disabled:opacity-50 font-medium text-[#77746c] hover:text-[#171713] cursor-pointer"
          >
            {loggingOut ? "..." : "LOGOUT"}
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          aria-label="Login"
          className="hidden lg:block text-xs tracking-[1px] hover:underline font-medium"
        >
          LOGIN
        </Link>
      )
    ) : null;

  return (
    <>
      {/* Top Announcement Bar (scrolls naturally with page) */}
      <div className="w-full bg-[#2d3326] text-white">
        <AnnouncementBar />
      </div>

      {/* Sticky Header: Pins cleanly to the top without jumping or spacers */}
      <header
        className={`sticky top-0 z-50 bg-[#f6f3ec] text-[#111] border-b border-[#dedbd4] transition-shadow duration-300 ${
          isScrolled ? "shadow-[0_4px_20px_rgba(0,0,0,0.06)]" : ""
        }`}
        onMouseLeave={() => {
          setActiveCategory(null);
        }}
      >
        {/* Main Header Row */}
        <div className="flex min-h-[58px] sm:min-h-[64px] md:min-h-[72px] items-center justify-between px-3 sm:px-6 md:px-9 max-w-full overflow-hidden">
          {/* Left Zone: Hamburger and search on mobile, category tabs on desktop */}
          <div className="flex items-center flex-1 justify-start gap-1 sm:gap-2">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={openMobileMenu}
              aria-label="Open menu"
              aria-expanded={isMobileOpen}
              className="grid h-10 w-10 place-items-center lg:hidden text-[#171713] hover:opacity-75 cursor-pointer touch-manipulation z-20"
            >
              <Menu size={24} strokeWidth={1.5} className="pointer-events-none" />
            </button>

            {/* Mobile Quick Search Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products and stores"
              className="grid h-9 w-9 place-items-center lg:hidden text-[#171713] hover:opacity-75 cursor-pointer"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            {/* Desktop Tabs: SHOP, INSPIRATION, OUR HOUSE */}
            <div className="hidden items-center gap-2 xl:gap-3 lg:flex">
              {/* SHOP TAB */}
              <button
                type="button"
                onClick={() => handleTabChange("SHOP")}
                onMouseEnter={() => handleTabChange("SHOP")}
                className={`text-xs tracking-[1.2px] uppercase transition-all duration-200 cursor-pointer ${
                  activeNavTab === "SHOP"
                    ? "rounded-xl bg-[#394132] px-4 py-2 font-medium text-white shadow-sm"
                    : "px-3.5 py-2 font-medium text-[#171713] hover:text-[#394132] hover:underline"
                }`}
              >
                SHOP
              </button>

              {/* INSPIRATION TAB */}
              <button
                type="button"
                onClick={() => handleTabChange("INSPIRATION")}
                onMouseEnter={() => handleTabChange("INSPIRATION")}
                className={`text-xs tracking-[1.2px] uppercase transition-all duration-200 cursor-pointer ${
                  activeNavTab === "INSPIRATION"
                    ? "rounded-xl bg-[#394132] px-4 py-2 font-medium text-white shadow-sm"
                    : "px-3.5 py-2 font-medium text-[#171713] hover:text-[#394132] hover:underline"
                }`}
              >
                INSPIRATION
              </button>

              {/* OUR HOUSE TAB */}
              <button
                type="button"
                onClick={() => handleTabChange("OUR HOUSE")}
                onMouseEnter={() => handleTabChange("OUR HOUSE")}
                className={`text-xs tracking-[1.2px] uppercase transition-all duration-200 cursor-pointer ${
                  activeNavTab === "OUR HOUSE"
                    ? "rounded-xl bg-[#394132] px-4 py-2 font-medium text-white shadow-sm"
                    : "px-3.5 py-2 font-medium text-[#171713] hover:text-[#394132] hover:underline"
                }`}
              >
                OUR HOUSE
              </button>
            </div>
          </div>

          {/* Center Logo with Smooth Down-to-Up 2-Section Reel Transition */}
          <div className="flex items-center justify-center shrink-0 px-2">
            <Link
              to="/"
              aria-label="House of Hackney home"
              className="relative flex items-center justify-center min-w-[90px] sm:min-w-[120px] md:min-w-[200px] h-11 md:h-12 text-[#171713] overflow-hidden group select-none"
            >
              {/* Logo 1: Monogram Crest Logo */}
              <div className={getLogoClass("monogram")}>
                <BrandLogo className="h-[28px] w-[56px] sm:h-[34px] sm:w-[68px] md:h-[44px] md:w-[88px] transition-transform duration-300 group-hover:scale-105" />
              </div>

              {/* Logo 2: Wordmark Logo HOUSE OF HACKNEY */}
              <div className={getLogoClass("wordmark")}>
                <span className="font-serif text-[11px] sm:text-[13px] md:text-[16px] lg:text-[17px] font-semibold tracking-[0.18em] sm:tracking-[0.24em] md:tracking-[0.3em] text-[#171713] uppercase whitespace-nowrap transition-colors duration-300 group-hover:opacity-75">
                  HOUSE OF HACKNEY
                </span>
              </div>
            </Link>
          </div>

          {/* Right Action Icons & Links */}
          <div className="flex items-center flex-1 justify-end gap-1.5 sm:gap-3 md:gap-5">
            <Link
              to="/design-services"
              className="hidden text-xs tracking-[1px] hover:underline xl:block font-medium"
            >
              DESIGN SERVICES
            </Link>

            <Link
              to="/trade"
              className="hidden text-xs tracking-[1px] hover:underline lg:block font-medium"
            >
              TRADE
            </Link>

            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search products and stores"
              className="hidden lg:grid h-9 w-9 md:h-10 md:w-10 place-items-center rounded-xl border border-[#d8d5ce] hover:bg-white text-[#171713] transition-colors cursor-pointer"
            >
              <Search size={20} strokeWidth={1.5} />
            </button>

            {renderAuthLink()}

            {/* Mobile Patron Profile Icon */}
            <Link
              to={isAuthenticated ? "/account" : "/login"}
              aria-label="Account"
              className="lg:hidden grid h-9 w-9 place-items-center hover:opacity-75 transition-opacity text-[#171713]"
            >
              <UserRound size={21} strokeWidth={1.5} />
            </Link>

            {/* Wishlist Link with dynamic badge */}
            <Link
              to="/wishlist"
              aria-label="Wishlist"
              className="relative grid h-9 w-9 place-items-center hover:opacity-75 transition-opacity text-[#171713]"
            >
              <Heart size={21} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#b83232] px-1 text-[10px] font-bold text-white shadow-sm">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Bag with badge */}
            <Link
              to="/cart"
              aria-label="Shopping bag"
              className="relative grid h-9 w-9 place-items-center hover:opacity-75 transition-opacity text-[#171713]"
            >
              <ShoppingBag size={21} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0.5 right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#394132] px-1 text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Sub-navbar Row: categories and megamenu */}
        <Navbar
          activeNavTab={activeNavTab}
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
        />
      </header>

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileOpen}
        onClose={closeMobileMenu}
        activeTab={activeNavTab}
        setActiveTab={handleTabChange}
      />

      {/* Interactive House of Hackney Search Modal Overlay */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

export default memo(Header);
