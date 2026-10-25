import { useEffect, useState } from "react";
import { getProducts, getProductMedia } from "../services/productservice";
import ProductCard from "./ProductCard";

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [mediaMap, setMediaMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getProducts();
        setProducts(data);

        const publishedProducts = data.filter(
          (product) => product.status === "PUBLISHED"
        );

        const results = await Promise.allSettled(
          publishedProducts.map(async (product) => {
            const media = await getProductMedia(product._id);

            return {
              id: product._id,
              media,
            };
          })
        );

        const nextMediaMap = {};

        results.forEach((result) => {
          if (result.status === "fulfilled" && result.value.media) {
            nextMediaMap[result.value.id] = result.value.media;
          }
        });

        setMediaMap(nextMediaMap);
      } catch (err) {
        setError("Unable to load products. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <p className="py-12 text-center text-gray-400">
        Loading products...
      </p>
    );
  }

  if (error) {
    return (
      <p className="py-12 text-center text-red-400">
        {error}
      </p>
    );
  }

  const visibleProducts = products.filter(
    (product) => product.status === "PUBLISHED"
  );

  return (
    <section className="bg-black px-5 py-12 text-white md:px-10 lg:px-16">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#d6b36a]">
            House of Hackney
          </p>

          <h2 className="text-3xl font-semibold md:text-4xl">
            Discover Our Collection
          </h2>
        </div>

        {visibleProducts.length === 0 ? (
          <p className="text-gray-400">No published products found.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                media={mediaMap[product._id]}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default ProductList;
