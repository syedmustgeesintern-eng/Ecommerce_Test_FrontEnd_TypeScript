import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProductById } from "@/store/features/product";
import { addToCart, fetchCart } from "@/store/features/cart";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { notify } from "@/components/ui/notify";
import { useProtectedAction } from "@/hooks/useProtectedAction";

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { selectedProduct, detailsLoading } = useAppSelector(
    (state: any) => state.product,
  );
  const { mutationLoading: cartBusy, cart } = useAppSelector((state) => state.cart);
  const withAuth = useProtectedAction();

  const [selectedImage, setSelectedImage] = useState("");
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (productId) dispatch(fetchProductById(productId));
  }, [productId, dispatch]);

  // Set first image on product load
  useEffect(() => {
    if (selectedProduct?.images?.length) {
      setSelectedImage(selectedProduct.images[0]);
    }
  }, [selectedProduct]);

  const variants = selectedProduct?.variants ?? [];

  // Returns the set of valid values for an attribute at `attrIndex` given prior selections
  const getAvailableValues = (
    attrIndex: number,
    attrName: string,
    currentSelections: Record<string, string>,
    attrs: { name: string }[],
  ): Set<string> => {
    const priorAttrs = attrs.slice(0, attrIndex);
    return new Set(
      variants
        .filter((variant: any) =>
          priorAttrs.every((prior) => {
            if (!currentSelections[prior.name]) return true;
            const va = variant.attributes?.find(
              (a: any) => String(a.attribute).toLowerCase() === prior.name.toLowerCase(),
            );
            return va?.value === currentSelections[prior.name];
          }),
        )
        .flatMap((variant: any) => {
          const va = variant.attributes?.find(
            (a: any) => String(a.attribute).toLowerCase() === attrName.toLowerCase(),
          );
          return va ? [va.value] : [];
        }),
    );
  };

  // Auto-select first valid value of each attribute (cascading) on product load
  useEffect(() => {
    const attrs: { name: string; values: { value: string }[] }[] =
      selectedProduct?.attributes ?? [];
    if (!attrs.length) return;

    const initial: Record<string, string> = {};
    attrs.forEach((attr, i) => {
      const available = getAvailableValues(i, attr.name, initial, attrs);
      const first = attr.values.find((v) => available.has(v.value));
      if (first) initial[attr.name] = first.value;
    });
    setSelectedAttributes(initial);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProduct]);

  // When an attribute changes, cascade-reset all subsequent attributes to first valid value
  const handleAttributeChange = (
    attrIndex: number,
    attrName: string,
    value: string,
    attrs: { name: string; values: { value: string }[] }[],
  ) => {
    let next = { ...selectedAttributes, [attrName]: value };

    for (let i = attrIndex + 1; i < attrs.length; i++) {
      const nextAttr = attrs[i];
      const available = getAvailableValues(i, nextAttr.name, next, attrs);

      if (next[nextAttr.name] && available.has(next[nextAttr.name])) continue;

      const firstValid = nextAttr.values.find((v) => available.has(v.value));
      if (firstValid) {
        next = { ...next, [nextAttr.name]: firstValid.value };
      } else {
        const { [nextAttr.name]: _removed, ...rest } = next;
        next = rest;
      }
    }

    setSelectedAttributes(next);
  };

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;

    const attrKeys = Object.keys(selectedAttributes);

    // No attributes defined → first in-stock variant
    if (!attrKeys.length) {
      return variants.find((v: any) => v.stock > 0) ?? variants[0];
    }

    return (
      variants.find((variant: any) =>
        attrKeys.every((key) => {
          const match = variant.attributes?.find(
            (a: any) => String(a.attribute).toLowerCase() === key.toLowerCase(),
          );
          return match?.value === selectedAttributes[key];
        }),
      ) ?? null
    );
  }, [variants, selectedAttributes]);

  const totalStock = useMemo(
    () => variants.reduce((acc: number, v: any) => acc + v.stock, 0),
    [variants],
  );

  const displayedStock = selectedVariant ? selectedVariant.stock : totalStock;

  // Sync quantity with cart when selected variant changes
  useEffect(() => {
    if (!selectedVariant) return;
    const cartItem = cart?.items.find((item) => item.variant.id === selectedVariant.id);
    setQuantity(cartItem ? cartItem.quantity : 1);
  }, [selectedVariant, cart]);

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      notify("Please select valid attributes.", "error");
      return false;
    }
    if (quantity < 1) {
      notify("Quantity must be at least 1.", "error");
      return false;
    }
    if (quantity > selectedVariant.stock) {
      notify(`Only ${selectedVariant.stock} available in stock.`, "error");
      return false;
    }

    const cartItem = cart?.items.find((item) => item.variant.id === selectedVariant.id);
    const alreadyInCart = cartItem?.quantity ?? 0;
    const delta = quantity - alreadyInCart;

    if (delta <= 0) {
      // notify("Quantity is already set to that amount in your cart.", "warning");
      return false;
    }

    try {
      await dispatch(addToCart({ variantId: selectedVariant.id, quantity: delta })).unwrap();
      notify("Added to cart", "success");
      dispatch(fetchCart());
      return true;
    } catch (e: unknown) {
      const msg =
        e && typeof e === "object" && "message" in e
          ? String((e as { message?: string }).message)
          : "Failed to add to cart";
      notify(msg, "error");
      return false;
    }
  };

  const handleBuyNow = async () => {
    const added = await handleAddToCart();
    if (added) navigate("/checkout");
  };

  if (detailsLoading || !selectedProduct) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="animate-pulse h-[500px] rounded-2xl bg-gray-100" />
      </div>
    );
  }

  const productAttributes: { name: string; values: { value: string; meta: string | null }[] }[] =
    selectedProduct.attributes ?? [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* LEFT — images */}
        <div>
          <div className="aspect-square overflow-hidden rounded-3xl bg-gray-100 border">
            {selectedImage && (
              <img
                src={selectedImage}
                alt={selectedProduct.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex gap-3 mt-4 overflow-x-auto">
            {selectedProduct.images?.map((img: string) => (
              <button
                key={img}
                onClick={() => setSelectedImage(img)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                  selectedImage === img ? "border-black" : "border-transparent"
                }`}
              >
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT — details */}
        <div>
          <Badge
            className={`mb-4 ${
              displayedStock > 0
                ? "bg-green-100 text-green-700 hover:bg-green-100"
                : "bg-red-100 text-red-700 hover:bg-red-100"
            }`}
          >
            {displayedStock > 0 ? "In Stock" : "Out of Stock"}
          </Badge>

          <h1 className="text-4xl font-bold tracking-tight">
            {selectedProduct.name}
          </h1>

          <p className="text-gray-500 mt-4 leading-relaxed">
            {selectedProduct.description || "Premium quality product"}
          </p>

          <div className="mt-6">
            <p className="text-4xl font-bold">${selectedProduct.basePrice}</p>
          </div>

          {/* <div className="mt-4 text-sm text-gray-500">SKU: {selectedProduct.sku}</div>
          <div className="mt-2 text-sm text-gray-500">Stock: {displayedStock}</div> */}

          {/* DYNAMIC ATTRIBUTES */}
          {productAttributes.length > 0 && (
            <div className="mt-8 space-y-6">
              {productAttributes.map((attr, attrIndex) => {
                const available = getAvailableValues(
                  attrIndex,
                  attr.name,
                  selectedAttributes,
                  productAttributes,
                );
                return (
                  <div key={attr.name}>
                    <h3 className="mb-3 font-semibold">
                      {attr.name}
                      {selectedAttributes[attr.name] && (
                        <span className="ml-2 font-normal text-gray-500 text-sm">
                          — {selectedAttributes[attr.name]}
                        </span>
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {attr.values.map((val) => {
                        const isSelected = selectedAttributes[attr.name] === val.value;
                        const isAvailable = available.has(val.value);
                        return (
                          <button
                            key={val.value}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() =>
                              handleAttributeChange(
                                attrIndex,
                                attr.name,
                                val.value,
                                productAttributes,
                              )
                            }
                            className={`rounded-full border px-4 py-2 text-sm transition ${
                              isSelected
                                ? "border-black bg-black text-white"
                                : isAvailable
                                  ? "border-gray-300 text-gray-700 hover:border-black"
                                  : "cursor-not-allowed border-gray-200 text-gray-300 line-through"
                            }`}
                          >
                            {val.value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* QUANTITY + ACTIONS */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="w-32">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Quantity
              </label>
              <Input
                type="number"
                min={1}
                max={selectedVariant?.stock ?? 9999}
                value={quantity}
                onChange={(e) => {
                  const n = Number(e.target.value);
                  if (Number.isFinite(n) && n >= 1) setQuantity(Math.floor(n));
                }}
                disabled={!selectedVariant}
              />
            </div>
            <div className="flex flex-1 flex-wrap gap-4">
              <Button
                size="lg"
                className="rounded-full px-8"
                disabled={
                  !selectedVariant ||
                  cartBusy ||
                  (selectedVariant ? quantity > selectedVariant.stock : true)
                }
                onClick={() => void withAuth(() => handleAddToCart())}
              >
                {cartBusy ? "Adding…" : "Add To Cart"}
              </Button>

              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8"
                type="button"
                disabled={
                  !selectedVariant ||
                  cartBusy ||
                  (selectedVariant ? quantity > selectedVariant.stock : true)
                }
                onClick={() => void withAuth(() => handleBuyNow())}
              >
                Buy Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
