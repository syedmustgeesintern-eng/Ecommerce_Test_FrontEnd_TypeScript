import { useNavigate } from "react-router-dom";
import type { Product } from "@/store/features/product";

interface ProductCardProps {
  product: Product;
}

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

export default function ProductCard({ product }: ProductCardProps) {
  const navigate = useNavigate();

  const isOutOfStock =
    product.variants?.length > 0 &&
    product.variants.every((v) => v.stock === 0);

  const isNew =
    !isOutOfStock &&
    !!product.createdAt &&
    Date.now() - new Date(product.createdAt).getTime() < TEN_DAYS_MS;

  const goToDetails = () => navigate(`/products/details/${product.id}`);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={(e) => e.key === "Enter" && goToDetails()}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100
        shadow-sm hover:shadow-2xl hover:shadow-black/10
        hover:-translate-y-1 hover:border-gray-200
        transition-all duration-300 cursor-pointer outline-none
        focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2"
    >
      {/* IMAGE */}
      <div className="relative overflow-hidden aspect-square bg-gray-100">
        <img
          src={
            product.images?.[0] ||
            "https://via.placeholder.com/500x500?text=Product"
          }
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Status badge */}
        {isOutOfStock ? (
          <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            Out of Stock
          </div>
        ) : isNew ? (
          <div className="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 rounded-full">
            New
          </div>
        ) : null}

        {/* Hover overlay CTA */}
        <div
          className="absolute inset-0 flex items-end justify-center pb-4
            opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        >
          <span className="bg-white text-black text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg">
            View Details →
          </span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4">
        <h3 className="font-semibold text-lg text-gray-900 line-clamp-1 group-hover:text-gray-700 transition-colors duration-200">
          {product.name}
        </h3>

        <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">
          {product.description || "Premium quality product"}
        </p>

        <div className="flex items-center justify-between mt-4">
          <p className="text-lg font-bold text-black">${product.basePrice}</p>

          <span
            className="text-xs font-medium text-gray-400 group-hover:text-black
              transition-colors duration-200"
          >
            Shop now
          </span>
        </div>
      </div>
    </div>
  );
}
