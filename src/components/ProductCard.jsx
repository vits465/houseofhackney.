import { Heart } from "lucide-react";
import { useWishlist } from "../utils/wishlist";

// Product card with wishlist toggle
const ProductCard = ({ product, media }) => {
  const { isWishlisted, toggleWishlist } = useWishlist();

  const image =
    media?.thumbnail?.secureUrl ||
    media?.thumbnail?.url ||
    product?.image ||
    "";

  const productId = product?._id || product?.id;
  const wishlisted = isWishlisted(productId);

  return (
    <div className="group overflow-hidden rounded-xl border border-[#1a1a1a] bg-[#0f0f0f] text-white transition-transform duration-300 hover:-translate-y-1">
      <div className="relative aspect-[4/5] overflow-hidden bg-[#171717]">
        {image ? (
          <img
            src={image}
            alt={media?.thumbnail?.altText || product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Image unavailable
          </div>
        )}

        {/* Wishlist button */}
        <button
          type="button"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-10 flex h-8 w-8 items-center justify-center rounded-full transition cursor-pointer ${
            wishlisted
              ? "bg-white text-[#b83232] scale-105"
              : "bg-black/40 text-white hover:bg-white hover:text-[#b83232]"
          }`}
        >
          <Heart size={15} className={wishlisted ? "fill-[#b83232]" : ""} />
        </button>
      </div>

      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-widest text-[#d6b36a]">
          {product.category?.name || product.productType || "Collection"}
        </p>

        <h3 className="text-lg font-medium">{product.name}</h3>

        {product.price != null && (
          <p className="text-sm text-gray-300">
            {product.currency || "£"}
            {product.price}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
