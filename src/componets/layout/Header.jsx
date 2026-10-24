import { memo, useEffect, useRef, useState, useTransition } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { logoutUser } from "../../features/auth/authActions";
import {
  Search,
  ShoppingBag,
  Menu,
  UserRound,
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
  const [loggingOut, setLoggingOut] = useState(false);
  const [activeNavTab, setActiveNavTab] = useState("SHOP");
  const [activeCategory, setActiveCategory] = useState(null);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

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

  const { isAuthenticated, initialized } = useSelector(
    (state) => state.auth || {}
  );
  const cartItems = useSelector(
    (state) => state.cart?.items || []
  );

  const cartCount = cartItems.reduce(
    (sum, item) => sum + (Number(item.quantity) || 1),
    0
  );

  // Sync activeNavTab with current route if visiting inspiration or our-house directly
  useEffect(() => {
    if (location.pathname.startsWith("/inspiration")) {
      startTransition(() => setActiveNavTab("INSPIRATION"));
    } else if (location.pathname.startsWith("/our-house")) {
      startTransition(() => setActiveNavTab("OUR HOUSE"));
    }
  }, [location.pathname]);

  // Robust window scroll listener for sticky header and 2-section alternating logo
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const scrolled = currentScrollY > 45;
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
    if (tab === "INSPIRATION") {
      setActiveCategory("Gallery");
    } else if (tab === "OUR HOUSE") {
      setActiveCategory("About");
    } else {
      setActiveCategory(null);
    }
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
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          className="text-xs tracking-[1px] hover:underline disabled:opacity-50 font-medium"
        >
          {loggingOut ? "SIGNING OUT..." : "LOGOUT"}
        </button>
      ) : (
        <Link
          to="/login"
          aria-label="Login"
          className="text-xs tracking-[1px] hover:underline font-medium"
        >
          LOGIN
        </Link>
      )
    ) : null;

  // Show sub-navbar if not scrolled OR if user is hovering header / has open category
  const showSubNavbar = !isScrolled || isHeaderHovered || activeCategory !== null;

  return (
    <>
      {/* Spacer to prevent layout jump when header becomes sticky fixed */}
      {isScrolled && (
        <div className="hidden lg:block h-[132px]" aria-hidden="true" />
      )}

      <header
        className={`z-50 bg-[#f6f3ec] text-[#111] transition-all duration-300 ease-in-out ${
          isScrolled
            ? "fixed inset-x-0 top-0 shadow-[0_4px_20px_rgba(0,0,0,0.06)] border-b border-[#dedbd4]"
            : "relative border-b border-[#dedbd4]"
        }`}
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => {
          setIsHeaderHovered(false);
          setActiveCategory(null);
        }}
      >
        {/* Top Announcement Bar: slides up smoothly when scrolling */}
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isScrolled ? "max-h-0 opacity-0 py-0" : "max-h-12 opacity-100"
          }`}
        >
          <AnnouncementBar />
        </div>

        {/* Main Header Row */}
        <div className="grid min-h-[64px] md:min-h-[74px] grid-cols-3 items-center px-4 md:px-9 transition-all duration-300">
          {/* Left Mode Switcher */}
          <div className="flex items-center">
            {/* Mobile Hamburger Button */}
            <button
              type="button"
              onClick={openMobileMenu}
              aria-label="Open menu"
              aria-expanded={isMobileOpen}
              className="grid h-10 w-10 place-items-center md:hidden"
            >
              <Menu size={28} strokeWidth={1.5} />
            </button>

            {/* Desktop Tabs: SHOP, INSPIRATION, OUR HOUSE */}
            <div className="hidden items-center gap-2 lg:gap-4 md:flex">
              {/* SHOP TAB */}
              <button
                type="button"
                onClick={() => handleTabChange("SHOP")}
                onMouseEnter={() => handleTabChange("SHOP")}
                className={`text-xs tracking-[1.2px] uppercase transition-all duration-300 cursor-pointer ${
                  !isScrolled && activeNavTab === "SHOP"
                    ? "rounded-xl bg-[#394132] px-5 py-2.5 font-medium text-white shadow-sm"
                    : isScrolled
                    ? `px-3 py-2 font-medium hover:underline ${
                        activeNavTab === "SHOP"
                          ? "text-[#171713] font-semibold underline underline-offset-4"
                          : "text-[#3e4237]"
                      }`
                    : "px-3 py-2.5 font-medium text-[#171713] hover:underline"
                }`}
              >
                SHOP
              </button>

              {/* INSPIRATION TAB */}
              <button
                type="button"
                onClick={() => handleTabChange("INSPIRATION")}
                onMouseEnter={() => handleTabChange("INSPIRATION")}
                className={`text-xs tracking-[1.2px] uppercase transition-all duration-300 cursor-pointer ${
                  !isScrolled && activeNavTab === "INSPIRATION"
                    ? "rounded-xl bg-[#394132] px-5 py-2.5 font-medium text-white shadow-sm"
                    : isScrolled
                    ? `px-3 py-2 font-medium hover:underline ${
                        activeNavTab === "INSPIRATION"
                          ? "text-[#171713] font-semibold underline underline-offset-4"
                          : "text-[#3e4237]"
                      }`
                    : "px-3 py-2.5 font-medium text-[#171713] hover:underline"
                }`}
              >
                INSPIRATION
              </button>

              {/* OUR HOUSE TAB */}
              <button
                type="button"
                onClick={() => handleTabChange("OUR HOUSE")}
                onMouseEnter={() => handleTabChange("OUR HOUSE")}
                className={`text-xs tracking-[1.2px] uppercase transition-all duration-300 cursor-pointer ${
                  !isScrolled && activeNavTab === "OUR HOUSE"
                    ? "rounded-xl bg-[#394132] px-5 py-2.5 font-medium text-white shadow-sm"
                    : isScrolled
                    ? `px-3 py-2 font-medium hover:underline ${
                        activeNavTab === "OUR HOUSE"
                          ? "text-[#171713] font-semibold underline underline-offset-4"
                          : "text-[#3e4237]"
                      }`
                    : "px-3 py-2.5 font-medium text-[#171713] hover:underline"
                }`}
              >
                OUR HOUSE
              </button>
            </div>
          </div>

          {/* Center Logo with Smooth Down-to-Up 2-Section Reel Transition */}
          <Link
            to="/"
            aria-label="House of Hackney home"
            className="justify-self-center relative flex items-center justify-center min-w-[140px] md:min-w-[220px] h-12 text-[#171713] overflow-hidden group select-none"
          >
            {/* Logo 1: Monogram Crest Logo */}
            <div className={getLogoClass("monogram")}>
              <BrandLogo className="h-[36px] w-[72px] md:h-[44px] md:w-[88px] transition-transform duration-300 group-hover:scale-105" />
            </div>

            {/* Logo 2: Wordmark Logo HOUSE OF HACKNEY */}
            <div className={getLogoClass("wordmark")}>
              <span className="font-serif text-[13px] sm:text-[15px] md:text-[17px] font-semibold tracking-[0.26em] md:tracking-[0.3em] text-[#171713] uppercase whitespace-nowrap transition-colors duration-300 group-hover:opacity-75">
                HOUSE OF HACKNEY
              </span>
            </div>
          </Link>

          {/* Right Action Icons & Links */}
          <div className="flex items-center justify-end gap-3 md:gap-5">
            <Link
              to="/design-services"
              className="hidden text-xs tracking-[1px] hover:underline xl:block font-medium"
            >
              DESIGN SERVICES
            </Link>

            <Link
              to="/trade"
              className="hidden text-xs tracking-[1px] hover:underline md:block font-medium"
            >
              TRADE
            </Link>

            <Link
              to="/search"
              aria-label="Search"
              className="grid h-9 w-9 md:h-10 md:w-10 place-items-center rounded-xl border border-[#d8d5ce] hover:bg-white transition-colors"
            >
              <Search size={20} strokeWidth={1.5} />
            </Link>

            {renderAuthLink()}

            <Link
              to="/account"
              aria-label="Account"
              className="hidden md:block hover:opacity-75 transition-opacity"
            >
              <UserRound size={21} strokeWidth={1.5} />
            </Link>

            <Link
              to="/cart"
              aria-label="Shopping bag"
              className="relative hover:opacity-75 transition-opacity p-1"
            >
              <ShoppingBag size={21} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#394132] px-1 text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Sub-navbar Row: categories and megamenu */}
        <div
          className={`transition-all duration-300 ease-in-out ${
            showSubNavbar
              ? "max-h-[500px] opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <Navbar
            activeNavTab={activeNavTab}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
          />
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <MobileMenu
        isOpen={isMobileOpen}
        onClose={closeMobileMenu}
        activeTab={activeNavTab}
        setActiveTab={handleTabChange}
      />
    </>
  );
}

export default memo(Header);
