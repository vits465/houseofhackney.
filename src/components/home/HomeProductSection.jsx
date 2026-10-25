
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { getProducts, getProductMedia } from "../../services/productservice";

function HomeProductSection({ title, subtitle, filter }) {
  const [products, setProducts] = useState([]);
  const [mediaMap, setMediaMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      try {
        const allProducts = await getProducts();

        const filtered = allProducts
          .filter((product) => {
            if (product.status !== "PUBLISHED") return false;
            return filter(product);
          })
          .slice(0, 4);

        if (cancelled) return;
        setProducts(filtered);

        const results = await Promise.allSettled(
          filtered.map(async (product) => ({
            id: product._id,
            media: await getProductMedia(product._id),
          }))
        );

        if (cancelled) return;

        const images = {};
        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value.media) {
            images[result.value.id] = result.value.media;
          }
        });

        setMediaMap(images);
      } catch (error) {
        console.error("Unable to load homepage products:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [filter]);

  return (
    <section className="px-5 py-14 sm:px-8 md:px-12 md:py-20">
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="mb-3 text-[10px] tracking-[2px]">{subtitle}</p>
          <h2 className="font-serif text-3xl sm:text-4xl">{title}</h2>
        </div>

        <Link
          to="/products"
          className="inline-flex shrink-0 items-center gap-2 text-[10px] tracking-[1.2px] underline underline-offset-4"
        >
          VIEW ALL <ArrowRight size={14} />
        </Link>
      </div>

      {loading ? (
        <p className="py-8 text-sm text-[#777267]">Discovering products...</p>
      ) : products.length === 0 ? (
        <p className="py-8 text-sm text-[#777267]">
          No products available in this collection yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-5 lg:grid-cols-4">
          {products.map((product) => {
            const media = mediaMap[product._id];
            const image =
              media?.thumbnail?.secureUrl ||
              media?.thumbnail?.url ||
              "";

            return (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="group min-w-0"
              >
                <div className="aspect-[4/5] overflow-hidden bg-[#e8e2d7]">
                  {image ? (
                    <img
                      src={image}
                      alt={media?.thumbnail?.altText || product.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[#777267]">
                      Image unavailable
                    </div>
                  )}
                </div>

                <p className="mt-4 text-[10px] uppercase tracking-[1.5px] text-[#777267]">
                  {product.category?.name || product.productType || "House of Hackney"}
                </p>

                <h3 className="mt-1 font-serif text-lg sm:text-xl">
                  {product.name}
                </h3>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default HomeProductSection;
