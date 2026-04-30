import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyProducts } from "@/store/features/product";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function MyProducts() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { myProducts, loading, error, myNextCursor } = useAppSelector(
    (state: any) => state.product,
  );

  useEffect(() => {
    if (!myProducts.length) {
      dispatch(fetchMyProducts({}));
    }
  }, [dispatch, myProducts.length]);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <h2 className="text-2xl font-bold mb-6">My Products</h2>

      {myProducts.length === 0 ? (
        <p>No products found</p>
      ) : (
        <>
          {/* TABLE */}
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="text-left p-3">Image</th>
                  <th className="text-left p-3">Name</th>
                  <th className="text-left p-3">Price</th>
                  <th className="text-left p-3">Description</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>

              <tbody>
                {myProducts.map((product: any) => (
                  <tr key={product.id} className="border-t hover:bg-gray-50">
                    <td className="p-3">
                      <img
                        src={
                          product.images?.[0] ||
                          "https://via.placeholder.com/100"
                        }
                        className="w-12 h-12 rounded object-cover"
                      />
                    </td>

                    <td className="p-3 font-medium">{product.name}</td>
                    <td className="p-3">${product.basePrice}</td>
                    <td className="p-3 text-sm text-gray-500 truncate max-w-[200px]">
                      {product.description}
                    </td>

                    <td className="p-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        View
                      </Button>

                      <Button
                        size="sm"
                        onClick={() => navigate(`/products/edit/${product.id}`)}
                      >
                        Edit
                      </Button>

                      <Button size="sm" variant="destructive">
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LOAD MORE */}
          {myNextCursor && (
            <div className="flex justify-center mt-10">
              <Button
                onClick={() =>
                  dispatch(fetchMyProducts({ cursor: myNextCursor }))
                }
                disabled={loading}
              >
                {loading ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
