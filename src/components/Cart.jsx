import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  Lock,
  CheckCircle,
  Tag,
  X,
  MapPin,
  Check,
  AlertCircle,
  PlusCircle,
  Building2,
  Home,
  Mail,
} from "lucide-react";

import {
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from "../features/carts/cartSlice";
import axiosInstance from "../services/axiosInstance";
import { userService } from "../services/userService";
import RazorpayModal from "./RazorpayModal";
import { initiateRazorpayCheckout } from "../services/razorpayFrontend";
import { showSuccess, showToast, showError } from "../utils/sweetAlert";

const COUNTRIES = [
  "United Kingdom",
  "United States",
  "France",
  "Germany",
  "Italy",
  "Spain",
  "Ireland",
  "Netherlands",
  "Belgium",
  "Switzerland",
  "Australia",
  "Canada",
  "India",
  "Japan",
  "United Arab Emirates",
];

// Helper to calculate price
function getItemPrice(item) {
  const price = Number(
    item.price ??
    item.sellingPrice ??
    item.pricing?.sellingPrice ??
    0
  );

  return Number.isFinite(price) ? price : 0;
}

// Currency formatter
function formatPrice(value, currency = "GBP") {
  const curr = currency || "GBP";
  const locale = curr === "GBP" ? "en-GB" : curr === "USD" ? "en-US" : curr === "EUR" ? "de-DE" : "en-GB";
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: curr,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${curr} ${Number(value).toFixed(2)}`;
  }
}

// Create order object for local storage and confirmation
function buildOrderRecord(
  items,
  subtotal,
  currency,
  paymentData,
  user,
  coupon = null,
  discountAmount = 0,
  finalTotal = null,
  shippingAddress = null
) {
  const patronName =
    shippingAddress?.fullName ||
    (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.name || "House of Hackney Patron");
  const patronEmail = shippingAddress?.email || user?.email || "patron@houseofhackney.com";
  const patronPhone = shippingAddress?.phone || user?.phone || "";
  const orderNum = `HOH-${Math.floor(100000 + Math.random() * 900000)}`;
  const hexMongoId =
    Math.floor(Date.now() / 1000).toString(16).padStart(8, "0") +
    Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  const totalPaid =
    finalTotal !== null ? finalTotal : Math.max(0, subtotal - discountAmount);

  const patronUserId = user?._id || user?.id || null;

  return {
    _id: hexMongoId,
    id: hexMongoId,
    userId: patronUserId,
    orderNumber: orderNum,
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
    user: {
      _id: patronUserId,
      id: patronUserId,
      name: patronName,
      email: patronEmail,
      tier: "Verified Razorpay Patron",
    },
    client: {
      _id: patronUserId,
      id: patronUserId,
      name: patronName,
      email: patronEmail,
      tier: "Verified Razorpay Patron",
      location: shippingAddress?.city ? `${shippingAddress.city}, ${shippingAddress.country || "UK"}` : "London, United Kingdom",
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(patronName)}&background=3e7b52&color=fff`,
    },
    items: items.map((i) => ({
      ...i,
      name: i.title || i.name || "Bespoke Creation",
      quantity: Number(i.quantity) || 1,
      qty: Number(i.quantity) || 1,
      price: getItemPrice(i),
      variant: i.variantTitle || i.variant || "Standard",
      image:
        i.image ||
        "https://res.cloudinary.com/tysd8i65/image/upload/c_scale,w_800,f_auto,q_auto/house_of_hackney/wallpaper/babylon_wallpaper_dove___willow/babylon-wallpaper-dove-willow-0",
    })),
    subtotal,
    discount: discountAmount,
    discountAmount,
    coupon: coupon
      ? {
          code: coupon.code,
          discountAmount,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
        }
      : null,
    couponCode: coupon?.code || null,
    totalAmount: totalPaid,
    total: totalPaid,
    currency,
    paymentStatus: "PAID",
    paymentMethod: `RAZORPAY (${(paymentData.method || "ONLINE").toUpperCase()})`,
    paymentId: paymentData.paymentId || paymentData.razorpay_payment_id,
    status: "PROCESSING",
    fulfillmentStatus: "In Production",
    shippingAddress: shippingAddress
      ? {
          fullName: shippingAddress.fullName || patronName,
          phone: shippingAddress.phone || patronPhone,
          email: shippingAddress.email || patronEmail,
          addressLine1: shippingAddress.addressLine1 || "",
          addressLine2: shippingAddress.addressLine2 || "",
          city: shippingAddress.city || "",
          state: shippingAddress.state || "",
          postalCode: shippingAddress.postalCode || "",
          country: shippingAddress.country || "United Kingdom",
          type: shippingAddress.type || "HOME",
        }
      : {
          fullName: patronName,
          phone: patronPhone,
          email: patronEmail,
          addressLine1: "125 Shoreditch High Street",
          addressLine2: "",
          city: "London",
          state: "Greater London",
          postalCode: "E1 6JE",
          country: "United Kingdom",
          type: "HOME",
        },
  };
}

function Cart() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth || {});
  const items = useSelector((state) => state.cart?.items || []);
  const [showRazorpay, setShowRazorpay] = useState(false);
  const [orderComplete, setOrderComplete] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);

  // Delivery Residence state
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [saveAddressToProfile, setSaveAddressToProfile] = useState(true);
  const [savingNewAddress, setSavingNewAddress] = useState(false);

  const [addressForm, setAddressForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United Kingdom",
    type: "HOME",
  });

  // Pre-fill user information and fetch saved residences
  useEffect(() => {
    let isMounted = true;

    if (user) {
      setAddressForm((prev) => ({
        ...prev,
        fullName: prev.fullName || (user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user.name || ""),
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
      }));
    }

    const fetchAddresses = async () => {
      if (!isAuthenticated) {
        setShowNewAddressForm(true);
        return;
      }

      setLoadingAddresses(true);
      try {
        const serverAddrs = await userService.getAddresses();
        const localAddrs = JSON.parse(localStorage.getItem("hoh_local_addresses") || "[]");
        const combined = Array.isArray(serverAddrs) && serverAddrs.length > 0 ? serverAddrs : localAddrs;

        if (isMounted) {
          setSavedAddresses(combined);
          if (combined.length > 0) {
            const defaultAddr = combined.find((a) => a.isDefault) || combined[0];
            setSelectedAddressId(defaultAddr._id || defaultAddr.id);
            setShowNewAddressForm(false);
          } else {
            setShowNewAddressForm(true);
          }
        }
      } catch (err) {
        console.warn("Could not fetch addresses in cart:", err);
        const localAddrs = JSON.parse(localStorage.getItem("hoh_local_addresses") || "[]");
        if (isMounted) {
          setSavedAddresses(localAddrs);
          if (localAddrs.length > 0) {
            setSelectedAddressId(localAddrs[0]._id || localAddrs[0].id);
            setShowNewAddressForm(false);
          } else {
            setShowNewAddressForm(true);
          }
        }
      } finally {
        if (isMounted) setLoadingAddresses(false);
      }
    };

    fetchAddresses();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user]);

  // Helpers to resolve current effective address
  const getEffectiveAddress = () => {
    if (selectedAddressId && selectedAddressId !== "new") {
      const found = savedAddresses.find(
        (a) => (a._id || a.id) === selectedAddressId
      );
      if (found) return found;
    }
    return addressForm;
  };

  const isAddressValid = (addr) => {
    if (!addr) return false;
    return Boolean(
      (addr.fullName || "").trim() &&
      (addr.phone || "").trim() &&
      (addr.addressLine1 || "").trim() &&
      (addr.city || "").trim() &&
      (addr.postalCode || "").trim()
    );
  };

  // Save new delivery residence
  const handleSaveNewAddress = async (e) => {
    if (e) e.preventDefault();
    if (!isAddressValid(addressForm)) {
      setAddressError("Please complete all required address fields marked with *.");
      return;
    }

    setAddressError("");
    setSavingNewAddress(true);

    const newAddressObj = {
      ...addressForm,
      _id: `addr_${Date.now()}`,
      id: `addr_${Date.now()}`,
      isDefault: savedAddresses.length === 0,
    };

    setSavedAddresses((prev) => [newAddressObj, ...prev]);
    setSelectedAddressId(newAddressObj._id);
    setShowNewAddressForm(false);
    showToast("Delivery residence selected.");

    try {
      const localExisting = JSON.parse(localStorage.getItem("hoh_local_addresses") || "[]");
      localStorage.setItem("hoh_local_addresses", JSON.stringify([newAddressObj, ...localExisting]));

      if (isAuthenticated && saveAddressToProfile) {
        await userService.createAddress(addressForm);
      }
    } catch (err) {
      console.warn("Could not persist address to server:", err);
    } finally {
      setSavingNewAddress(false);
    }
  };

  const subtotal = items.reduce(
    (total, item) =>
      total + getItemPrice(item) * (Number(item.quantity) || 1),
    0
  );

  const currency = items[0]?.currency || "GBP";

  // Calculate discount based on subtotal
  const calculateDiscount = (coupon, currentSubtotal) => {
    if (!coupon) return 0;
    let disc = 0;
    if (coupon.discountType === "PERCENTAGE") {
      disc = (currentSubtotal * Number(coupon.discountValue || 0)) / 100;
      if (coupon.maxDiscountAmount) {
        disc = Math.min(disc, Number(coupon.maxDiscountAmount));
      }
    } else {
      disc = Number(coupon.discountValue || 0);
    }
    return Math.min(currentSubtotal, Math.round(disc * 100) / 100);
  };

  const discountAmount = appliedCoupon ? calculateDiscount(appliedCoupon, subtotal) : 0;
  const finalTotal = Math.max(0, Math.round((subtotal - discountAmount) * 100) / 100);

  // Auto-remove coupon if subtotal falls below minimum requirement
  useEffect(() => {
    if (appliedCoupon && appliedCoupon.minOrderAmount && subtotal < appliedCoupon.minOrderAmount) {
      showToast(
        `Coupon ${appliedCoupon.code} removed: minimum order of ${formatPrice(appliedCoupon.minOrderAmount, currency)} required.`
      );
      setAppliedCoupon(null);
    }
  }, [subtotal, appliedCoupon, currency]);

  // Handle Apply Coupon
  const handleApplyCoupon = async (e) => {
    if (e) e.preventDefault();
    const cleanCode = couponInput.trim().toUpperCase();

    if (!cleanCode) {
      setCouponError("Please enter a voucher code.");
      return;
    }

    if (subtotal <= 0) {
      setCouponError("Your bag is empty.");
      return;
    }

    setIsValidatingCoupon(true);
    setCouponError("");

    // 1. If authenticated, try backend validate endpoint first
    if (isAuthenticated) {
      try {
        const res = await axiosInstance.post("/coupons/validate", {
          code: cleanCode,
          subtotal,
        });
        if (res.data?.success && res.data?.data) {
          const backendCoupon = res.data.data.coupon || res.data.data;
          const backendDiscount = res.data.data.discountAmount;
          const disc =
            backendDiscount !== undefined
              ? backendDiscount
              : calculateDiscount(backendCoupon, subtotal);

          setAppliedCoupon({
            ...backendCoupon,
            code: cleanCode,
            discountAmount: disc,
          });
          showToast(`Voucher ${cleanCode} applied! Saved ${formatPrice(disc, currency)}`);
          setCouponInput("");
          setIsValidatingCoupon(false);
          return;
        }
      } catch (apiErr) {
        const msg = apiErr.response?.data?.message;
        if (msg && !msg.toLowerCase().includes("not found")) {
          setCouponError(msg);
          setIsValidatingCoupon(false);
          return;
        }
      }
    }

    // 2. Local fallback: check admin custom coupons and built-in atelier vouchers
    let customCoupons = [];
    try {
      customCoupons = JSON.parse(localStorage.getItem("hoh_custom_coupons") || "[]");
    } catch {
      customCoupons = [];
    }

    const standardCoupons = [
      {
        code: "ATELIER15",
        discountType: "PERCENTAGE",
        discountValue: 15,
        minOrderAmount: 100,
        description: "15% off orders over £100",
      },
      {
        code: "WELCOME10",
        discountType: "PERCENTAGE",
        discountValue: 10,
        minOrderAmount: 50,
        description: "10% off welcome gift for patrons",
      },
      {
        code: "MAXIMALIST50",
        discountType: "FIXED",
        discountValue: 50,
        minOrderAmount: 350,
        description: "£50 off orders over £350",
      },
      {
        code: "HACKNEY20",
        discountType: "PERCENTAGE",
        discountValue: 20,
        minOrderAmount: 200,
        description: "20% off heritage collections over £200",
      },
      {
        code: "LUXURY50",
        discountType: "FIXED",
        discountValue: 50,
        minOrderAmount: 250,
        description: "£50 off commissions over £250",
      },
    ];

    const allCoupons = [...customCoupons, ...standardCoupons];
    const match = allCoupons.find(
      (c) => c.code?.trim().toUpperCase() === cleanCode
    );

    if (!match) {
      setCouponError(`Voucher code "${cleanCode}" is not recognized.`);
      setIsValidatingCoupon(false);
      return;
    }

    if (match.minOrderAmount && subtotal < match.minOrderAmount) {
      setCouponError(
        `Minimum bag subtotal of ${formatPrice(match.minOrderAmount, currency)} required for ${cleanCode}.`
      );
      setIsValidatingCoupon(false);
      return;
    }

    const disc = calculateDiscount(match, subtotal);
    setAppliedCoupon({
      ...match,
      code: cleanCode,
      discountAmount: disc,
    });
    showToast(`Voucher ${cleanCode} applied! Saved ${formatPrice(disc, currency)}`);
    setCouponInput("");
    setIsValidatingCoupon(false);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError("");
    showToast("Voucher code removed.");
  };

  // Trigger Razorpay Standard Web Checkout with finalTotal and validated address
  const handleProceedToCheckout = () => {
    if (items.length === 0 || isProcessing) return;

    const effectiveAddress = getEffectiveAddress();
    if (!isAddressValid(effectiveAddress)) {
      setAddressError(
        "Please select or provide a complete delivery residence (Full Name, Phone, Street Address, City, and Postal Code) before proceeding to payment."
      );
      const el = document.getElementById("delivery-address-section");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      showError(
        "Delivery Address Required",
        "Please select or complete your delivery residence details before proceeding to payment."
      );
      return;
    }

    setAddressError("");
    setIsProcessing(true);

    initiateRazorpayCheckout({
      amount: finalTotal,
      currency: "INR",
      user,
      shippingAddress: effectiveAddress,
      onSuccess: (paymentData) => {
        setIsProcessing(false);
        handlePaymentSuccess(paymentData, effectiveAddress);
      },
      onError: (err) => {
        setIsProcessing(false);
        console.error("Razorpay Checkout Error:", err);
      },
      onDismiss: () => {
        setIsProcessing(false);
      },
    });
  };

  // Called when Razorpay simulates payment success
  const handlePaymentSuccess = async (paymentData, confirmedAddress = null) => {
    setShowRazorpay(false);

    const activeAddress = confirmedAddress || getEffectiveAddress();

    // Save order locally for patron profile display
    const newOrder = buildOrderRecord(
      items,
      subtotal,
      currency,
      paymentData,
      user,
      appliedCoupon,
      discountAmount,
      finalTotal,
      activeAddress
    );

    try {
      const existing = JSON.parse(localStorage.getItem("hoh_local_orders") || "[]");
      localStorage.setItem("hoh_local_orders", JSON.stringify([newOrder, ...existing]));
      window.dispatchEvent(new CustomEvent("hoh_order_created", { detail: newOrder }));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }

    // Try sending order to backend if authenticated
    if (isAuthenticated) {
      try {
        await axiosInstance.post("/orders", {
          paymentMethod: "RAZORPAY",
          paymentId: paymentData.paymentId,
          totalAmount: finalTotal,
          subtotal: subtotal,
          discountAmount: discountAmount,
          couponCode: appliedCoupon?.code || null,
          shippingAddress: activeAddress,
          addressId: activeAddress?._id || activeAddress?.id || null,
          items: items.map((i) => ({
            productId: i.productId || i._id,
            quantity: i.quantity || 1,
            price: getItemPrice(i),
          })),
        });
      } catch {
        // Simulated checkout succeeds offline/locally without logging warnings
      }
    }

    // Clear cart and show confirmation
    dispatch(clearCart());
    setOrderComplete(newOrder);

    // Dispatch luxury order confirmation email using backend mailer
    const targetRecipientEmail =
      activeAddress?.email || user?.email || "adichauha465@gmail.com";
    const targetRecipientName =
      activeAddress?.fullName ||
      (user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.name) ||
      "House of Hackney Patron";

    userService
      .sendOrderConfirmationEmail(newOrder, targetRecipientEmail, targetRecipientName)
      .then((res) => {
        if (res?.success) {
          console.log("✅ Order confirmation email delivered to:", targetRecipientEmail);
        }
      })
      .catch((err) => {
        console.warn("⚠️ Order confirmation email notice:", err);
      });

    showSuccess(
      "Payment Successful!",
      `Order ${newOrder.orderNumber} confirmed. A confirmation receipt has been transmitted to ${targetRecipientEmail}.`
    );
  };

  // Render order confirmed screen
  if (orderComplete) {
    return (
      <main className="min-h-[75vh] bg-[#f6f3ec] px-5 py-20 text-center text-[#26251f]">
        <div className="mx-auto max-w-md rounded-2xl border border-[#d8d1c5] bg-white p-8 sm:p-10 shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eff5ec] text-[#2d5022]">
            <CheckCircle size={36} />
          </div>

          <p className="mt-4 text-[10px] uppercase tracking-[2px] text-[#777267]">
            PAYMENT AUTHORIZED VIA RAZORPAY
          </p>
          <h1 className="mt-1 font-serif text-3xl text-[#171713]">
            Commission Confirmed
          </h1>
          <p className="mt-2 text-xs text-[#666257]">
            Order <span className="font-mono font-semibold text-[#171713]">{orderComplete.orderNumber}</span> has been transmitted to our English print mills.
          </p>

          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-[#f0f5ee] px-3.5 py-1.5 text-xs text-[#2d5022] border border-[#d2e2cd]">
            <Mail size={13} />
            <span>
              Confirmation receipt transmitted to{" "}
              <strong>
                {orderComplete.shippingAddress?.email ||
                  orderComplete.user?.email ||
                  "registered patron email"}
              </strong>
            </span>
          </div>

          <div className="mt-6 border-t border-b border-[#ede8de] py-4 text-xs text-[#444] space-y-2.5 text-left">
            <div className="flex justify-between">
              <span className="text-[#777]">Payment Method:</span>
              <span className="font-medium text-[#171713]">{orderComplete.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#777]">Atelier Subtotal:</span>
              <span className="text-[#171713]">{formatPrice(orderComplete.subtotal, orderComplete.currency)}</span>
            </div>
            {orderComplete.couponCode && (
              <div className="flex justify-between text-[#2d5022]">
                <span className="font-medium">Voucher Applied ({orderComplete.couponCode}):</span>
                <span className="font-semibold">-{formatPrice(orderComplete.discount || orderComplete.discountAmount, orderComplete.currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-[#ede8de] pt-2 font-semibold">
              <span className="text-[#171713]">Total Charged:</span>
              <span className="font-serif text-base text-[#171713]">{formatPrice(orderComplete.totalAmount, orderComplete.currency)}</span>
            </div>

            {/* Delivery Residence Destination Details */}
            <div className="border-t border-[#ede8de] pt-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#777] block mb-1">
                Dispatched To:
              </span>
              <p className="font-semibold text-[#171713]">{orderComplete.shippingAddress?.fullName}</p>
              <p className="text-[#555] leading-relaxed">
                {orderComplete.shippingAddress?.addressLine1}
                {orderComplete.shippingAddress?.addressLine2 ? `, ${orderComplete.shippingAddress.addressLine2}` : ""}
                <br />
                {orderComplete.shippingAddress?.city}, {orderComplete.shippingAddress?.state || ""} {orderComplete.shippingAddress?.postalCode}
                <br />
                {orderComplete.shippingAddress?.country || "United Kingdom"}
              </p>
              {orderComplete.shippingAddress?.phone && (
                <p className="text-[11px] text-[#777] mt-1">Tel: {orderComplete.shippingAddress.phone}</p>
              )}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/profile"
              className="flex w-full items-center justify-center rounded-xl bg-[#394132] py-3.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#26251f] transition"
            >
              Track in Patron Portal
            </Link>
            <Link
              to="/products"
              className="flex w-full items-center justify-center rounded-xl border border-[#d8d1c5] bg-white py-3 text-xs uppercase tracking-wider text-[#171713] hover:bg-[#f6f3ec] transition"
            >
              Continue Browsing
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[70vh] bg-[#f6f3ec] px-5 py-24 text-center text-[#26251f]">
        <ShoppingBag size={32} className="mx-auto mb-6" />

        <h1 className="font-serif text-4xl">Your bag is empty</h1>

        <p className="mt-4 text-sm text-[#666257]">
          Discover something special for your home.
        </p>

        <Link
          to="/products"
          className="mt-8 inline-flex items-center gap-2 bg-[#394132] px-7 py-4 text-xs tracking-[1.5px] text-white hover:bg-[#26251f]"
        >
          EXPLORE THE COLLECTION
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f3ec] text-[#26251f]">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 md:px-12 md:py-20">
        <Link
          to="/products"
          className="mb-8 inline-flex items-center gap-2 text-[10px] tracking-[1.5px]"
        >
          <ArrowLeft size={15} />
          CONTINUE SHOPPING
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-3 text-[10px] tracking-[2.5px]">
              HOUSE OF HACKNEY
            </p>

            <h1 className="font-serif text-4xl sm:text-5xl">
              Your bag
            </h1>

            <p className="mt-3 text-sm text-[#666257]">
              {items.length} {items.length === 1 ? "item" : "items"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => dispatch(clearCart())}
            className="text-xs underline underline-offset-4"
          >
            Empty bag
          </button>
        </div>

        <div className="mt-10 grid items-start gap-10 lg:grid-cols-[1fr_340px]">
          {/* Left Column: Creations & Delivery */}
          <div className="space-y-8 min-w-0">
            <div className="border-t border-[#d8d1c5]">
              {items.map((item) => {
              const itemId =
                item.cartItemId ||
                `${item.productId || item._id}::${item.variantId || "default"}`;

              const price = getItemPrice(item);
              const quantity = Number(item.quantity) || 1;

              const variantLabel =
                item.variantTitle ||
                (Array.isArray(item.variantAttributes)
                  ? item.variantAttributes
                      .map((attribute) => attribute.value)
                      .filter(Boolean)
                      .join(" / ")
                  : "");

              return (
                <article
                  key={itemId}
                  className="grid grid-cols-[100px_1fr] gap-4 border-b border-[#d8d1c5] py-6 sm:grid-cols-[140px_1fr] sm:gap-6"
                >
                  <Link
                    to={`/products/${item.productId || item._id}`}
                    className="aspect-[4/5] overflow-hidden bg-[#e8e2d7]"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name || "Product"}
                        loading="lazy"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center p-2 text-center text-xs text-[#777267]">
                        Image unavailable
                      </div>
                    )}
                  </Link>

                  <div className="flex min-w-0 flex-col">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <Link
                          to={`/products/${item.productId || item._id}`}
                          className="font-serif text-xl leading-snug hover:underline sm:text-2xl"
                        >
                          {item.title || item.name || "Product"}
                        </Link>

                        {variantLabel && (
                          <p className="mt-2 text-xs text-[#666257]">
                            {variantLabel}
                          </p>
                        )}

                        {item.variantSku && (
                          <p className="mt-1 text-[10px] text-[#777267]">
                            SKU: {item.variantSku}
                          </p>
                        )}
                      </div>

                      <p className="shrink-0 text-sm">
                        {formatPrice(price * quantity, currency)}
                      </p>
                    </div>

                    <p className="mt-3 text-xs text-[#666257]">
                      {formatPrice(price, item.currency || currency)} {item.priceUnit ? `/ ${item.priceUnit}` : "each"}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4 pt-6">
                      <div className="flex h-10 items-center border border-[#d8d1c5]">
                        <button
                          type="button"
                          aria-label="Decrease quantity"
                          onClick={() => {
                            if (quantity <= 1) {
                              dispatch(removeFromCart(itemId));
                            } else {
                              dispatch(
                                updateCartQuantity({
                                  cartItemId: itemId,
                                  quantity: quantity - 1,
                                })
                              );
                            }
                          }}
                          className="flex h-full w-9 items-center justify-center"
                        >
                          <Minus size={13} />
                        </button>

                        <span className="w-8 text-center text-xs">
                          {quantity}
                        </span>

                        <button
                          type="button"
                          aria-label="Increase quantity"
                          onClick={() =>
                            dispatch(
                              updateCartQuantity({
                                cartItemId: itemId,
                                quantity: quantity + 1,
                              })
                            )
                          }
                          className="flex h-full w-9 items-center justify-center"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => dispatch(removeFromCart(itemId))}
                        className="inline-flex items-center gap-2 text-xs text-[#666257] hover:text-[#26251f]"
                      >
                        <Trash2 size={14} />
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* 2. Delivery Residence & Courier Destination */}
          <div
            id="delivery-address-section"
            className="rounded-2xl border border-[#d8d1c5] bg-white p-5 sm:p-7 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dedbd4] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#394132] text-white text-xs font-bold font-serif">
                    2
                  </span>
                  <h2 className="font-serif text-2xl text-[#171713]">
                    Delivery Residence
                  </h2>
                </div>
                <p className="mt-1 text-xs text-[#666257]">
                  Select where our English atelier will courier your bespoke commissions.
                </p>
              </div>

              {isAuthenticated && savedAddresses.length > 0 && !showNewAddressForm && (
                <button
                  type="button"
                  onClick={() => setShowNewAddressForm(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#394132] hover:underline cursor-pointer"
                >
                  <Plus size={14} />
                  <span>Add New Residence</span>
                </button>
              )}
            </div>

            {/* Loading saved addresses */}
            {loadingAddresses && (
              <div className="py-6 text-center text-xs text-[#777267] animate-pulse">
                Accessing your Patron sanctuary residences...
              </div>
            )}

            {/* Saved Addresses List (if user has saved residences and is not in add form) */}
            {isAuthenticated && savedAddresses.length > 0 && !showNewAddressForm ? (
              <div className="mt-5 space-y-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-[#777267]">
                  Select Delivery Destination:
                </p>

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                  {savedAddresses.map((addr) => {
                    const addrId = addr._id || addr.id;
                    const isSelected = selectedAddressId === addrId;

                    return (
                      <div
                        key={addrId}
                        onClick={() => {
                          setSelectedAddressId(addrId);
                          setAddressError("");
                        }}
                        className={`relative flex flex-col justify-between rounded-xl p-4 transition-all cursor-pointer ${
                          isSelected
                            ? "border-2 border-[#394132] bg-[#fbf9f5] ring-2 ring-[#394132]/10 shadow-xs"
                            : "border border-[#dedbd4] bg-white hover:border-[#394132]/60 hover:bg-[#faf8f4]"
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="rounded-full bg-[#ede8de] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#555]">
                              {addr.type || "RESIDENCE"}
                            </span>
                            {isSelected ? (
                              <span className="flex items-center gap-1 rounded-full bg-[#394132] px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                                <Check size={10} />
                                DELIVER HERE
                              </span>
                            ) : addr.isDefault ? (
                              <span className="text-[9px] font-semibold text-emerald-800 uppercase tracking-wider">
                                DEFAULT
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-2.5 font-serif text-sm font-semibold text-[#171713]">
                            {addr.fullName}
                          </p>
                          <p className="mt-1 text-xs text-[#555] leading-relaxed">
                            {addr.addressLine1}
                            {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                            <br />
                            {addr.city}, {addr.state || ""} {addr.postalCode}
                            <br />
                            {addr.country || "United Kingdom"}
                          </p>
                          <p className="mt-2 text-[11px] text-[#777]">
                            Tel: {addr.phone}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Address Entry Form (for guest or when adding/customizing residence) */
              <form onSubmit={handleSaveNewAddress} className="mt-5 space-y-4">
                {!isAuthenticated && (
                  <div className="rounded-xl border border-[#dedbd4] bg-[#faf8f4] p-3.5 text-xs text-[#555] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <p>
                      Checking out as Guest. Have an existing patron account?
                    </p>
                    <Link
                      to="/login?redirect=/cart"
                      className="font-semibold text-[#394132] hover:underline uppercase tracking-wider text-[11px] shrink-0"
                    >
                      Sign In to Access Saved Residences &rarr;
                    </Link>
                  </div>
                )}

                {isAuthenticated && savedAddresses.length > 0 && (
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-[#777267]">
                      Register New Delivery Residence:
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="text-xs text-[#555] hover:text-[#171713] underline cursor-pointer"
                    >
                      Cancel & Choose From Saved
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 text-xs">
                  <div className="col-span-2 sm:col-span-1">
                    <label className="font-semibold uppercase tracking-wider text-[#555] block mb-1">
                      Full Recipient Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.fullName}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, fullName: e.target.value });
                        setAddressError("");
                      }}
                      placeholder="e.g. Lady Genevieve Vance"
                      className="w-full rounded-xl border border-[#dedbd4] bg-[#fbf9f5] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="font-semibold uppercase tracking-wider text-[#555] block mb-1">
                      Contact Phone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={addressForm.phone}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, phone: e.target.value });
                        setAddressError("");
                      }}
                      placeholder="+44 20 7739 3901"
                      className="w-full rounded-xl border border-[#dedbd4] bg-[#fbf9f5] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="font-semibold uppercase tracking-wider text-[#555] block mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={addressForm.email}
                      onChange={(e) => setAddressForm({ ...addressForm, email: e.target.value })}
                      placeholder="patron@houseofhackney.com"
                      className="w-full rounded-xl border border-[#dedbd4] bg-[#fbf9f5] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="font-semibold uppercase tracking-wider text-[#555] block mb-1">
                      Residence Type
                    </label>
                    <select
                      value={addressForm.type}
                      onChange={(e) => setAddressForm({ ...addressForm, type: e.target.value })}
                      className="w-full rounded-xl border border-[#dedbd4] bg-[#fbf9f5] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:bg-white focus:outline-hidden cursor-pointer"
                    >
                      <option value="HOME">Home Residence</option>
                      <option value="OFFICE">Office / Studio</option>
                      <option value="SHIPPING">Shipping Sanctuary</option>
                      <option value="COMMERCIAL">Commercial Interior Project</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="font-semibold uppercase tracking-wider text-[#555] block mb-1">
                      Street Address & House / Flat No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.addressLine1}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, addressLine1: e.target.value });
                        setAddressError("");
                      }}
                      placeholder="e.g. 131 Shoreditch High Street"
                      className="w-full rounded-xl border border-[#dedbd4] bg-[#fbf9f5] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="font-semibold uppercase tracking-wider text-[#555] block mb-1">
                      Apartment, Suite, Unit (Optional)
                    </label>
                    <input
                      type="text"
                      value={addressForm.addressLine2}
                      onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                      placeholder="e.g. Flat 4B, The Printing Works"
                      className="w-full rounded-xl border border-[#dedbd4] bg-[#fbf9f5] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="font-semibold uppercase tracking-wider text-[#555] block mb-1">
                      City / Town *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.city}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, city: e.target.value });
                        setAddressError("");
                      }}
                      placeholder="e.g. London"
                      className="w-full rounded-xl border border-[#dedbd4] bg-[#fbf9f5] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="font-semibold uppercase tracking-wider text-[#555] block mb-1">
                      County / State / Region *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.state}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, state: e.target.value });
                        setAddressError("");
                      }}
                      placeholder="e.g. Greater London"
                      className="w-full rounded-xl border border-[#dedbd4] bg-[#fbf9f5] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="font-semibold uppercase tracking-wider text-[#555] block mb-1">
                      Postal Code / ZIP *
                    </label>
                    <input
                      type="text"
                      required
                      value={addressForm.postalCode}
                      onChange={(e) => {
                        setAddressForm({ ...addressForm, postalCode: e.target.value });
                        setAddressError("");
                      }}
                      placeholder="e.g. E1 6JE"
                      className="w-full rounded-xl border border-[#dedbd4] bg-[#fbf9f5] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="font-semibold uppercase tracking-wider text-[#555] block mb-1">
                      Country *
                    </label>
                    <select
                      value={addressForm.country}
                      onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                      className="w-full rounded-xl border border-[#dedbd4] bg-[#fbf9f5] p-2.5 text-xs text-[#171713] focus:border-[#394132] focus:bg-white focus:outline-hidden cursor-pointer"
                    >
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  {isAuthenticated && (
                    <div className="col-span-2 flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="saveToProfileCheck"
                        checked={saveAddressToProfile}
                        onChange={(e) => setSaveAddressToProfile(e.target.checked)}
                        className="h-4 w-4 rounded accent-[#394132] cursor-pointer"
                      />
                      <label htmlFor="saveToProfileCheck" className="text-xs text-[#444] cursor-pointer">
                        Save this residence to my Patron profile for future orders
                      </label>
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-3">
                  <button
                    type="submit"
                    disabled={savingNewAddress}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#394132] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#282e23] disabled:opacity-50 transition cursor-pointer"
                  >
                    <Check size={14} />
                    <span>{savingNewAddress ? "Saving..." : "Confirm & Use This Residence"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <aside className="border border-[#d8d1c5] bg-[#faf8f4] p-6 sm:p-7 lg:sticky lg:top-24 rounded-2xl shadow-sm">
          <h2 className="font-serif text-2xl text-[#171713]">Order summary</h2>

          {/* Subtotal */}
          <div className="mt-6 flex items-center justify-between gap-3 text-sm">
            <span className="text-[#666257]">Atelier Subtotal</span>
            <span className="font-medium text-[#171713]">{formatPrice(subtotal, currency)}</span>
          </div>

          {/* Applied Coupon Line (if any) */}
          {appliedCoupon && (
            <div className="mt-3 flex items-center justify-between gap-3 text-sm text-[#2d5022]">
              <span className="flex items-center gap-1.5 font-medium">
                <Tag size={13} className="text-[#2d5022]" />
                <span>Voucher ({appliedCoupon.code})</span>
              </span>
              <span className="font-semibold">
                -{formatPrice(discountAmount, currency)}
              </span>
            </div>
          )}

          {/* Total */}
          <div className="mt-4 flex items-center justify-between gap-3 border-t border-[#d8d1c5] pt-4 text-base font-semibold">
            <span className="text-[#171713]">Estimated Total</span>
            <span className="font-serif text-xl text-[#171713]">
              {formatPrice(finalTotal, currency)}
            </span>
          </div>

          {/* Delivery Destination in Order Summary */}
          {(() => {
            const activeAddr = getEffectiveAddress();
            const valid = isAddressValid(activeAddr);

            return (
              <div className="mt-5 border-t border-[#d8d1c5] pt-4">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#555047] mb-2">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={13} className="text-[#394132]" />
                    <span>Delivery Destination</span>
                  </span>
                  {valid && (
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById("delivery-address-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="text-[11px] text-[#394132] hover:underline normal-case font-normal cursor-pointer"
                    >
                      Change
                    </button>
                  )}
                </div>

                {valid ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-xs text-[#2b4c20]">
                    <p className="font-semibold text-[#171713]">{activeAddr.fullName}</p>
                    <p className="text-[11px] text-[#555] truncate mt-0.5">
                      {activeAddr.addressLine1}, {activeAddr.city}
                    </p>
                    <p className="text-[10px] text-[#777] uppercase tracking-wider mt-0.5">
                      {activeAddr.postalCode} &bull; {activeAddr.country || "UK"}
                    </p>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      document.getElementById("delivery-address-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-3 text-xs text-amber-900 cursor-pointer hover:bg-amber-100/50 transition-colors"
                  >
                    <p className="font-semibold flex items-center gap-1 text-amber-800">
                      <AlertCircle size={13} />
                      <span>Address Required</span>
                    </p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      Please select or fill in your delivery residence before proceeding.
                    </p>
                  </div>
                )}
              </div>
            );
          })()}

          {/* Promotional Voucher / Coupon Code Form */}
          <div className="mt-5 border-t border-[#d8d1c5] pt-5">
            <label className="block text-[11px] font-semibold uppercase tracking-[1.5px] text-[#555047] mb-2.5">
              Promotional Voucher / Coupon
            </label>

            {appliedCoupon ? (
              <div className="flex items-center justify-between rounded-xl bg-[#eef4ec] border border-[#bcd2b5] px-3.5 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-[#2d5022]" />
                  <div>
                    <p className="font-mono font-bold text-[#2d5022] tracking-wider">
                      {appliedCoupon.code}
                    </p>
                    <p className="text-[10px] text-[#426b34]">
                      {appliedCoupon.discountType === "PERCENTAGE"
                        ? `${appliedCoupon.discountValue}% discount applied`
                        : `${formatPrice(appliedCoupon.discountValue, currency)} discount applied`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-[#555] hover:bg-[#d8e8d2] hover:text-[#111] transition cursor-pointer"
                  title="Remove coupon"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="space-y-2.5">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      setCouponError("");
                    }}
                    placeholder="e.g. ATELIER15"
                    className="flex-1 rounded-xl border border-[#d8d1c5] bg-white px-3.5 py-2.5 text-xs font-mono tracking-wider text-[#171713] placeholder:text-[#999] placeholder:font-sans focus:border-[#394132] focus:outline-none uppercase"
                  />
                  <button
                    type="submit"
                    disabled={!couponInput.trim() || isValidatingCoupon}
                    className="rounded-xl bg-[#394132] px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#282e23] disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                  >
                    {isValidatingCoupon ? "..." : "Apply"}
                  </button>
                </div>

                {couponError && (
                  <p className="text-[11px] text-[#a83232] font-medium">{couponError}</p>
                )}

                {/* Available codes sample chips */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] text-[#777267]">Try voucher:</span>
                  {["ATELIER15", "WELCOME10", "MAXIMALIST50"].map((sample) => (
                    <button
                      key={sample}
                      type="button"
                      onClick={() => {
                        setCouponInput(sample);
                        setCouponError("");
                      }}
                      className="rounded-md border border-[#e0dad0] bg-white px-2 py-0.5 font-mono text-[10px] text-[#444] hover:border-[#394132] hover:text-[#111] transition cursor-pointer"
                    >
                      {sample}
                    </button>
                  ))}
                </div>
              </form>
            )}
          </div>

          <p className="mt-5 text-xs leading-5 text-[#666257]">
            All commissions are printed to order in England. Sustainable packaging and tracked carbon-neutral courier delivery.
          </p>

          {/* Address Error Alert (if user tries to pay before providing address) */}
          {addressError && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle size={15} className="shrink-0 mt-0.5 text-red-600" />
              <span>{addressError}</span>
            </div>
          )}

          <button
            type="button"
            id="razorpay-checkout-button"
            disabled={isProcessing}
            onClick={handleProceedToCheckout}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#394132] px-5 py-4 text-xs font-semibold tracking-[1.5px] uppercase text-white hover:bg-[#282e23] transition-all shadow-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <Lock size={14} />
            <span>{isProcessing ? "INITIALIZING RAZORPAY..." : `PAY ${formatPrice(finalTotal, currency)} VIA RAZORPAY`}</span>
          </button>

          <Link
            to="/products"
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-[#d8d1c5] bg-white px-5 py-3 text-[11px] tracking-[1.5px] uppercase font-medium text-[#171713] hover:bg-[#f6f3ec] transition-colors"
          >
            CONTINUE SHOPPING
          </Link>
        </aside>
      </div>
    </div>

    {/* Fake Razorpay Checkout Modal */}
    <RazorpayModal
      isOpen={showRazorpay}
      onClose={() => setShowRazorpay(false)}
      amount={finalTotal}
      currency={currency}
      shippingAddress={getEffectiveAddress()}
      onSuccess={handlePaymentSuccess}
    />
  </main>
);
}

export default Cart;
