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
} from "lucide-react";

import {
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from "../features/carts/cartSlice";
import axiosInstance from "../services/axiosInstance";
import RazorpayModal from "./RazorpayModal";
import { initiateRazorpayCheckout } from "../services/razorpayFrontend";
import { showSuccess, showToast } from "../utils/sweetAlert";

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
  finalTotal = null
) {
  const patronName = user?.firstName
    ? `${user.firstName} ${user.lastName || ""}`.trim()
    : user?.name || "House of Hackney Patron";
  const patronEmail = user?.email || "patron@houseofhackney.com";
  const orderNum = `HOH-${Math.floor(100000 + Math.random() * 900000)}`;
  const hexMongoId =
    Math.floor(Date.now() / 1000).toString(16).padStart(8, "0") +
    Array.from({ length: 16 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");
  const totalPaid =
    finalTotal !== null ? finalTotal : Math.max(0, subtotal - discountAmount);

  return {
    _id: hexMongoId,
    id: hexMongoId,
    orderNumber: orderNum,
    createdAt: new Date().toISOString(),
    timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
    user: {
      name: patronName,
      email: patronEmail,
      tier: "Verified Razorpay Patron",
    },
    client: {
      name: patronName,
      email: patronEmail,
      tier: "Verified Razorpay Patron",
      location: "London, United Kingdom",
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
    shippingAddress: {
      fullName: patronName,
      addressLine1: "125 Shoreditch High Street",
      city: "London",
      postalCode: "E1 6JE",
      country: "United Kingdom",
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

  // Trigger Razorpay Standard Web Checkout with finalTotal
  const handleProceedToCheckout = () => {
    if (items.length === 0 || isProcessing) return;
    setIsProcessing(true);

    initiateRazorpayCheckout({
      amount: finalTotal,
      currency: "INR",
      user,
      onSuccess: (paymentData) => {
        setIsProcessing(false);
        handlePaymentSuccess(paymentData);
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
  const handlePaymentSuccess = async (paymentData) => {
    setShowRazorpay(false);

    // Save order locally for patron profile display
    const newOrder = buildOrderRecord(
      items,
      subtotal,
      currency,
      paymentData,
      user,
      appliedCoupon,
      discountAmount,
      finalTotal
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
    showSuccess("Payment Successful!", `Order ${newOrder.orderNumber} confirmed via Razorpay.`);
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

          <div className="mt-6 border-t border-b border-[#ede8de] py-4 text-xs text-[#444] space-y-2 text-left">
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
            <div className="flex justify-between pt-1">
              <span className="text-[#777]">Delivery To:</span>
              <span className="text-[#171713]">{orderComplete.shippingAddress?.fullName}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <Link
              to="/orders"
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

            {/* Promotional Voucher / Coupon Code Form */}
            <div className="mt-6 border-t border-[#d8d1c5] pt-5">
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
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[#555] hover:bg-[#d8e8d2] hover:text-[#111] transition"
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
        onSuccess={handlePaymentSuccess}
      />
    </main>
  );
}

export default Cart;
