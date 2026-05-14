import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchMyProducts, type Product } from "@/store/features/product";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Search,
  Trash2,
} from "lucide-react";

const PAGE_LIMIT = 20;

export default function MyProducts() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { myProducts, loading, error, myNextCursor } = useAppSelector(
    (state) => state.product,
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  const [cursorHistory, setCursorHistory] = useState<Array<string | null>>([]);

  // initial fetch
  useEffect(() => {
    dispatch(fetchMyProducts({ cursor: currentCursor, limit: PAGE_LIMIT }));
  }, [currentCursor, dispatch]);

  const handleNextPage = () => {
    if (!myNextCursor || loading) return;
    setCursorHistory((prev) => [...prev, currentCursor]);
    setCurrentCursor(myNextCursor);
  };

  const handlePreviousPage = () => {
    if (cursorHistory.length === 0 || loading) return;

    const previousCursor = cursorHistory[cursorHistory.length - 1] ?? null;
    setCursorHistory((prev) => prev.slice(0, -1));
    setCurrentCursor(previousCursor);
  };

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return myProducts;

    return myProducts.filter((product) => {
      return (
        product.name?.toLowerCase().includes(query) ||
        (product.description || "").toLowerCase().includes(query) ||
        String(product.basePrice).includes(query)
      );
    });
  }, [myProducts, searchQuery]);

  if (loading && !myProducts.length)
    return <p className="text-center mt-10">Loading...</p>;

  if (error)
    return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Products</h2>

        <Button onClick={() => navigate("/products/create")}>
          Create Product
        </Button>
      </div>

      {/* SEARCH */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search your products..."
          className="h-11 pl-10 rounded-full"
        />
      </div>

      {filteredProducts.length === 0 ? (
        <p>No products found</p>
      ) : (
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
              {filteredProducts.map((product: Product) => (
                <tr key={product.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">
                    <img
                      src={
                        product.images?.[0] ||
                        "https://via.placeholder.com/100"
                      }
                      alt={product.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                  </td>

                  <td className="p-3 font-medium">{product.name}</td>

                  <td className="p-3">${product.basePrice}</td>

                  <td className="p-3 text-sm text-gray-500 truncate max-w-[200px]">
                    {product.description}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => navigate(`/products/${product.id}`)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() =>
                          navigate(`/products/edit/${product.id}`)
                        }
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => console.log("Delete", product.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500">
          Page {cursorHistory.length + 1} · Showing up to {PAGE_LIMIT} records
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreviousPage}
            disabled={cursorHistory.length === 0 || loading}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button
            type="button"
            onClick={handleNextPage}
            disabled={!myNextCursor || loading}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {loading && myProducts.length > 0 && (
        <div className="flex justify-center mt-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black" />
        </div>
      )}
    </div>
  );
}
