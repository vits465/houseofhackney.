import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/common/ScrollToTop";
import Cart from "./components/Cart";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetOtp from "./pages/VerifyResetOtp";
import ResetPassword from "./pages/ResetPassword";
import Inspiration from "./pages/Inspiration";
import OurHouse from "./pages/OurHouse";
import DesignServices from "./pages/DesignServices";
import Trade from "./pages/Trade";
import TradeLogin from "./pages/TradeLogin";
import TradeRegister from "./pages/TradeRegister";
import Profile from "./pages/Profile";
import HelpFaq from "./pages/HelpFaq";
import Legal from "./pages/Legal";
import GiftVoucher from "./pages/GiftVoucher";
import { restoreSession } from "./features/auth/authService";
import {
  setCredentials,
  logout,
  setAuthInitialized,
} from "./features/auth/authSlice";

// Admin panel
import AdminLayout from "./pages/admin/AdminLayout";
import AdminProtectedRoute from "./components/auth/AdminProtectedRoute";

function NotFound() {
  return (
    <main className="bg-[#f6f3ec] px-5 py-20 text-center text-[#171713]">
      <h1 className="font-serif text-3xl">Page not found</h1>
      <Link to="/" className="mt-5 inline-block underline underline-offset-4">
        Return home
      </Link>
    </main>
  );
}

function AppContent() {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  useEffect(() => {
    let active = true;

    const initializeAuth = async () => {
      try {
        const credentials = await restoreSession();

        if (active && credentials) {
          dispatch(setCredentials(credentials));
        }
      } catch {
        sessionStorage.removeItem("refreshToken");

        if (active) {
          dispatch(logout());
        }
      } finally {
        if (active) {
          dispatch(setAuthInitialized(true));
        }
      }
    };

    initializeAuth();

    return () => {
      active = false;
    };
  }, [dispatch]);

  return (
    <>
      {!isAdmin && <Header />}

      <Routes>
        {/* Admin routes */}
        <Route element={<AdminProtectedRoute />}>
          <Route path="/admin/*" element={<AdminLayout />} />
        </Route>

        {/* Auth routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/trade/login" element={<TradeLogin />} />
        <Route path="/trade-login" element={<TradeLogin />} />
        <Route path="/trade/register" element={<TradeRegister />} />
        <Route path="/trade-register" element={<TradeRegister />} />
        <Route path="/trade/signup" element={<TradeRegister />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Store and products */}
        <Route path="/products" element={<Products />} />
        <Route path="/products/:productId" element={<ProductDetails />} />
        <Route path="/shop" element={<Products />} />
        <Route path="/shop/:categorySlug" element={<Products />} />
        <Route path="/category/:categorySlug" element={<Products />} />
        <Route path="/products/category/:categorySlug" element={<Products />} />
        <Route path="/collections" element={<Products />} />
        <Route path="/collections/:collectionSlug" element={<Products />} />
        <Route path="/styles" element={<Products />} />
        <Route path="/styles/:styleSlug" element={<Products />} />
        <Route path="/colours" element={<Products />} />
        <Route path="/colours/:colourSlug" element={<Products />} />
        <Route path="/search" element={<Products />} />
        <Route path="/cart" element={<Cart />} />

        {/* Editorial and services */}
        <Route path="/inspiration" element={<Inspiration />} />
        <Route path="/our-house" element={<OurHouse />} />
        <Route path="/design-services" element={<DesignServices />} />
        <Route path="/trade" element={<Trade />} />

        {/* Help and FAQs */}
        <Route path="/help" element={<HelpFaq />} />
        <Route path="/faq" element={<HelpFaq />} />
        <Route path="/faqs" element={<HelpFaq />} />
        <Route path="/contact" element={<HelpFaq />} />

        {/* Legal pages */}
        <Route path="/privacy" element={<Legal defaultTopic="privacy" />} />
        <Route path="/terms" element={<Legal defaultTopic="terms" />} />
        <Route path="/cookies" element={<Legal defaultTopic="cookies" />} />
        <Route path="/accessibility" element={<Legal defaultTopic="accessibility" />} />
        <Route path="/legal" element={<Legal />} />
        <Route path="/legal/:topic" element={<Legal />} />

        {/* Stockists and showrooms */}
        <Route path="/stockists" element={<OurHouse defaultTab="showrooms" />} />
        <Route path="/our-stockists" element={<OurHouse defaultTab="showrooms" />} />
        <Route path="/showrooms" element={<OurHouse defaultTab="showrooms" />} />

        {/* Samples and vouchers */}
        <Route path="/samples" element={<Products />} />
        <Route path="/samples/:category" element={<Products />} />
        <Route path="/gift-voucher" element={<GiftVoucher />} />
        <Route path="/gift-card" element={<GiftVoucher />} />
        <Route path="/vouchers" element={<GiftVoucher />} />
        <Route path="/wishlist" element={<Profile defaultTab="wishlist" />} />

        {/* Customer account pages */}
        <Route element={<ProtectedRoute />}>
          <Route path="/account" element={<Profile />} />
          <Route path="/account/:tab" element={<Profile />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:tab" element={<Profile />} />
          <Route path="/orders" element={<Profile defaultTab="orders" />} />
          <Route path="/addresses" element={<Profile defaultTab="addresses" />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isAdmin && <Footer />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      
      <ScrollToTop />
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
