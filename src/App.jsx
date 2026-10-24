import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useDispatch } from "react-redux";

import Header from "./componets/layout/Header";
import Footer from "./componets/layout/Footer";
import Cart from "./componets/Cart";
import Home from "./pages/Home";
import Products from "./pages/Products";
import Login from "./pages/Login";
import ProductDetails from "./pages/ProductDetails";
import ProtectedRoute from "./componets/auth/ProtectedRoute";
import Register from "./pages/Register";
import VerifyEmail from "./pages/VerifyEmail";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyResetOtp from "./pages/VerifyResetOtp";
import ResetPassword from "./pages/ResetPassword";
import Inspiration from "./pages/Inspiration";
import OurHouse from "./pages/OurHouse";
import DesignServices from "./pages/DesignServices";
import Trade from "./pages/Trade";
import { restoreSession } from "./features/auth/authService";
import {
  setCredentials,
  logout,
  setAuthInitialized,
} from "./features/auth/authSlice";

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
      <Header />

      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-reset-otp" element={<VerifyResetOtp />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Product & Storefront pages */}
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

        {/* Inspiration & Brand Editorial pages */}
        <Route path="/inspiration" element={<Inspiration />} />
        <Route path="/our-house" element={<OurHouse />} />
        <Route path="/design-services" element={<DesignServices />} />
        <Route path="/trade" element={<Trade />} />

        {/* Protected pages */}
        <Route element={<ProtectedRoute />}>
          {/* Add account, profile, and orders routes here */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <Footer />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
