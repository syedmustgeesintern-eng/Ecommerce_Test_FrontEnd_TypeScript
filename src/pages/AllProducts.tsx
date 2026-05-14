import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useNavigate } from "react-router-dom";
import { fetchProducts } from "@/store/features/product";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import client from "@/api/apiClient";
import CustomSelect from "@/components/CustomSelect";
import type { Category } from "@/lib/types";
import type { Product } from "@/store/features/product";
import { Filter, Search, X } from "lucide-react";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

type ProductCategory = string | { id?: string; name?: string };
type SelectOption = { label: string; value: string };

const collectCategoryIds = (category: Category): string[] => [
  category.id,
  ...(category.children || []).flatMap(collectCategoryIds),
];

const buildCategoryOptions = (
  categories: Category[],
  depth = 0,
): SelectOption[] =>
  categories.flatMap((category) => {
    if (category.isActive === false) {
      return [];
    }

    const prefix = depth > 0 ? `${"-".repeat(depth)} ` : "";

    return [
      { label: `${prefix}${category.name}`, value: category.id },
      ...buildCategoryOptions(category.children || [], depth + 1),
    ];
  });

export default function AllProducts() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { products, loading, error, nextCursor } = useAppSelector(
    (state) => state.product,
  );

  const observer = useRef<IntersectionObserver | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const lastProductRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;

      if (observer.current) {
        observer.current.disconnect();
      }

      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && nextCursor) {
          dispatch(fetchProducts({ cursor: nextCursor }));
        }
      });

      if (node) {
        observer.current.observe(node);
      }
    },
    [loading, nextCursor, dispatch],
  );

  useEffect(() => {
    if (!products.length) {
      dispatch(fetchProducts({}));
    }
  }, [dispatch, products.length]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await client.get("/categories/tree");
        const categoryList = Array.isArray(res.data)
          ? res.data
          : res.data?.data;
        setCategories(Array.isArray(categoryList) ? categoryList : []);
      } catch {
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategoryIds([]);
    setMinPrice("");
    setMaxPrice("");
  };

  const categoryOptions = useMemo(
    () => [
      { label: "All categories", value: "all" },
      ...buildCategoryOptions(categories),
    ],
    [categories],
  );

  const selectedCategoryValue = selectedCategoryIds[0] || "all";

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategoryIds(categoryId === "all" ? [] : [categoryId]);
  };

  const selectedCategoryFilterIds = useMemo(() => {
    const selected = new Set(selectedCategoryIds);

    const walk = (items: Category[]) => {
      items.forEach((category) => {
        if (selectedCategoryIds.includes(category.id)) {
          collectCategoryIds(category).forEach((id) => selected.add(id));
        }

        if (category.children?.length) {
          walk(category.children);
        }
      });
    };

    walk(categories);
    return selected;
  }, [categories, selectedCategoryIds]);

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);

    return products.filter((product) => {
      const productPrice = Number(product.basePrice);
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        (product.description || "").toLowerCase().includes(query);

      const matchesCategory =
        selectedCategoryFilterIds.size === 0 ||
        product.categories?.some((category: ProductCategory) => {
          const categoryId =
            typeof category === "string" ? category : category.id;
          return Boolean(
            categoryId && selectedCategoryFilterIds.has(categoryId),
          );
        });

      const matchesMinPrice = min === null || productPrice >= min;
      const matchesMaxPrice = max === null || productPrice <= max;

      return (
        matchesSearch && matchesCategory && matchesMinPrice && matchesMaxPrice
      );
    });
  }, [products, searchQuery, selectedCategoryFilterIds, minPrice, maxPrice]);

  const activeFilterCount =
    selectedCategoryIds.length + (minPrice ? 1 : 0) + (maxPrice ? 1 : 0);

  // 🔥 TEMP LOGIC (replace with backend later)
  const topRatedProducts = filteredProducts.slice(0, 8);
  const mostPopularProducts = [...filteredProducts].reverse().slice(0, 8);

  // ✅ Reusable Card
  const ProductCard = ({ product }: { product: Product }) => {
    const isOutOfStock =
      product.variants?.length > 0 &&
      product.variants.every((v) => v.stock === 0);
    const isNew =
      !isOutOfStock &&
      !!product.createdAt &&
      Date.now() - new Date(product.createdAt).getTime() <
        10 * 24 * 60 * 60 * 1000;

    return (
      <div
        className="group bg-white rounded-2xl overflow-hidden border border-gray-100
  shadow-sm hover:shadow-2xl hover:shadow-black/10
  hover:-translate-y-1 hover:border-gray-200
  transition-all duration-300 cursor-pointer"
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

          {isOutOfStock ? (
            <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              Out of Stock
            </div>
          ) : isNew ? (
            <div className="absolute top-3 left-3 bg-black text-white text-xs px-2 py-1 rounded-full">
              New
            </div>
          ) : null}
        </div>

        {/* CONTENT */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {product.name}
          </h3>

          <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">
            {product.description || "Premium quality product"}
          </p>

          {/* PRICE + CTA */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-lg font-bold text-black">${product.basePrice}</p>

            <Button
              size="sm"
              className="rounded-full px-4 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300"
              onClick={() => navigate(`/products/details/${product.id}`)}
            >
              View
            </Button>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !products.length) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse rounded-2xl bg-gray-100 h-[320px]"
            />
          ))}
        </div>
      </div>
    );
  }
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search products"
            className="h-11 rounded-full bg-white pl-10 pr-4"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          className="relative rounded-full bg-white px-4 h-11 flex items-center gap-2 hover:bg-gray-50 transition"
          onClick={() => setIsFilterOpen(true)}
          aria-label="Open filters"
        >
          <Filter className="size-4" />
          <span className="text-sm font-medium text-gray-700">Filters</span>

          {activeFilterCount > 0 && (
            <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-black text-xs text-white">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* 🔥 TOP RATED */}
      <h2 className="text-2xl font-bold mb-4">Top Rated</h2>

      <Carousel className="w-full mb-10">
        <CarouselContent className="-ml-2">
          {topRatedProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-2 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* 🚀 MOST POPULAR */}
      <h2 className="text-2xl font-bold mb-4">Most Popular</h2>

      <Carousel className="w-full mb-10">
        <CarouselContent>
          {mostPopularProducts.map((product) => (
            <CarouselItem
              key={product.id}
              className="basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* 🧾 ALL PRODUCTS */}
      <h2 className="text-2xl font-bold mb-6">All Products</h2>

      {filteredProducts.length === 0 ? (
        <p>No products found</p>
      ) : (
        <>
          {/* GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product, index) => {
              const isLast = index === filteredProducts.length - 1;

              return (
                <div key={product.id} ref={isLast ? lastProductRef : null}>
                  <ProductCard product={product} />
                </div>
              );
            })}
          </div>
        </>
      )}
      {loading && products.length > 0 && (
        <div className="flex justify-center mt-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        </div>
      )}

      {isFilterOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsFilterOpen(false)}
          />

          <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Filters</h3>
                <p className="text-sm text-gray-500">
                  Refine products by category and price.
                </p>
              </div>

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setIsFilterOpen(false)}
                aria-label="Close filters"
              >
                <X />
              </Button>
            </div>

            <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6">
              <section>
                <h4 className="mb-3 font-semibold text-gray-900">Category</h4>

                {categoriesLoading ? (
                  <p className="text-sm text-gray-500">Loading categories...</p>
                ) : categories.length === 0 ? (
                  <p className="text-sm text-gray-500">No categories found</p>
                ) : (
                  <CustomSelect
                    options={categoryOptions}
                    value={selectedCategoryValue}
                    onChange={handleCategoryChange}
                    placeholder="Select category"
                  />
                )}
              </section>

              <section>
                <h4 className="mb-3 font-semibold text-gray-900">
                  Price Range
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Min
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={minPrice}
                      onChange={(event) => setMinPrice(event.target.value)}
                      placeholder="0"
                      className="h-10 bg-white"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">
                      Max
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={maxPrice}
                      onChange={(event) => setMaxPrice(event.target.value)}
                      placeholder="500"
                      className="h-10 bg-white"
                    />
                  </div>
                </div>
              </section>
            </div>

            <div className="flex gap-3 border-t px-6 py-5">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={clearFilters}
              >
                Clear
              </Button>
              <Button
                type="button"
                className="flex-1"
                onClick={() => setIsFilterOpen(false)}
              >
                Apply
              </Button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
