import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "@/store/features/product";
import { Button } from "@/components/ui/button";

export default function AllProducts() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { products, loading, error, nextCursor } = useAppSelector(
    (state: any) => state.product,
  );

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts({}));
    }
  }, [dispatch, products.length]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold mb-6">All Products</h2>

      {products?.length === 0 ? (
        <p>No products found</p>
      ) : (
        <>
          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product: any) => (
              <div
                key={product.id}
                className="border rounded-lg p-4 shadow hover:shadow-lg transition cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <img
                  src={product.images?.[0] || "https://via.placeholder.com/150"}
                  alt={product.name}
                  className="w-full h-40 object-cover mb-4 rounded"
                />

                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-gray-500 text-sm">{product.description}</p>

                <p className="mt-2 font-bold">${product.basePrice}</p>
              </div>
            ))}
          </div>

          {/* LOAD MORE (NOW BELOW) */}
          {nextCursor && (
            <div className="flex justify-center mt-10">
              <Button
                onClick={() => dispatch(fetchProducts({ cursor: nextCursor }))}
                className="px-6 py-2"
                variant="outline"
              >
                Load More
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
