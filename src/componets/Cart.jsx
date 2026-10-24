
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
} from "lucide-react";

import {
  removeFromCart,
  updateCartQuantity,
  clearCart,
} from "../features/carts/cartSlice";

function getItemPrice(item) {
  const price = Number(
    item.price ??
    item.sellingPrice ??
    item.pricing?.sellingPrice ??
    0
  );

  return Number.isFinite(price) ? price : 0;
}

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

function Cart() {
  const dispatch = useDispatch();
  const items = useSelector((state) => state.cart?.items || []);

  const subtotal = items.reduce(
    (total, item) =>
      total + getItemPrice(item) * (Number(item.quantity) || 1),
    0
  );

  const currency = items[0]?.currency || "GBP";

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

          <aside className="border border-[#d8d1c5] p-6 sm:p-7 lg:sticky lg:top-24">
            <h2 className="font-serif text-2xl">Order summary</h2>

            <div className="mt-6 flex items-center justify-between gap-3 border-b border-[#d8d1c5] pb-5 text-sm">
              <span className="text-[#666257]">Subtotal</span>
              <span>{formatPrice(subtotal, currency)}</span>
            </div>

            <p className="mt-5 text-xs leading-6 text-[#666257]">
              Shipping and any applicable taxes are not included in this
              subtotal.
            </p>

            <p className="mt-4 text-xs leading-6 text-[#666257]">
              This cart is a frontend shopping-bag experience. Checkout and
              payment must be connected separately if you decide to support
              online orders.
            </p>

            <Link
              to="/products"
              className="mt-7 flex w-full items-center justify-center gap-2 bg-[#394132] px-5 py-4 text-[10px] tracking-[1.5px] text-white hover:bg-[#26251f]"
            >
              CONTINUE SHOPPING
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}

export default Cart;
