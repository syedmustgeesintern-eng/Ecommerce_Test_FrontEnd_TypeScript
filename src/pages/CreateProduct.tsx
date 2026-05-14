// src/pages/CreateProduct.tsx

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/store/hooks";
import {
  createProduct,
  updateProduct,
} from "@/store/features/product/product.thunk";
import { notify } from "@/components/ui/notify";
import { Spinner } from "@/components/ui/spinner";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import CustomSelect from "@/components/CustomSelect";
import client from "@/api/apiClient";
import { Checkbox } from "@/components/ui/checkbox";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import FormField from "@/components/FormField";
import type {
  Category,
  FormAttribute,
  FormState,
  ImageItem,
  ProductDetailsResponse,
} from "../lib/types";
import {
  DEFAULT_ATTRIBUTE_OPTIONS,
  INITIAL_FORM_STATE,
  createEmptyVariant,
  createResetFormState,
  SIZE_OPTIONS,
} from "../lib/constants";
import {
  buildProductPayload,
  mapProductToForm,
  validateProductForm,
} from "../lib/mappers";
import { isEqual } from "@/lib/utils";

export default function CreateProduct() {
  const dispatch = useAppDispatch();
  const { productId } = useParams();
  const location = useLocation();
  const isViewingExisting = Boolean(productId);
  const isEditRoute = location.pathname.includes("/products/edit/");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [productLoading, setProductLoading] = useState(false);
  const [productSkuError, setProductSkuError] = useState("");
  const [variantSkuError, setVariantSkuError] = useState("");
  const [variantsTouched, setVariantsTouched] = useState(false);
  const [initialForm, setInitialForm] = useState<FormState | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM_STATE);

  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [attributeOptions, setAttributeOptions] = useState<
    Array<{ label: string; value: string }>
  >(DEFAULT_ATTRIBUTE_OPTIONS);
  // ---------------- BASIC ----------------

  const handleChange = (e: any) => {
    if (e.target.name === "sku") {
      setProductSkuError("");
    }
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const getVariantIndex = (localId: string) =>
    form.variants.findIndex((variant) => variant.localId === localId);

  const toggleCategory = (categoryId: string) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter((id) => id !== categoryId)
        : [...prev.categoryIds, categoryId],
    }));
  };

  const categoryNameById = useMemo(() => {
    const lookup = new Map<string, string>();

    const walk = (items: Category[]) => {
      items.forEach((category) => {
        lookup.set(category.id, category.name);
        if (category.children?.length) {
          walk(category.children);
        }
      });
    };

    walk(categories);
    return lookup;
  }, [categories]);

  const selectedCategoryLabel = useMemo(() => {
    if (form.categoryIds.length === 0) {
      return "Select categories";
    }

    const names = form.categoryIds
      .map((id) => categoryNameById.get(id))
      .filter(Boolean);

    if (names.length === 0) {
      return `${form.categoryIds.length} categor${
        form.categoryIds.length > 1 ? "ies" : "y"
      } selected`;
    }

    if (names.length <= 2) {
      return names.join(", ");
    }

    return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
  }, [categoryNameById, form.categoryIds]);

  const renderCategoryOptions = (items: Category[], depth = 0) =>
    items.map((category) => {
      const isDisabled =
        category.isActive === false || (isViewingExisting && !isEditRoute);

      return (
        <div key={category.id}>
          <label
            className={`flex cursor-pointer items-center gap-2 rounded px-2 py-2 text-sm transition hover:bg-gray-50 ${
              isDisabled ? "cursor-not-allowed opacity-50" : "text-gray-700"
            }`}
            style={{ paddingLeft: `${8 + depth * 18}px` }}
          >
            <Checkbox
              checked={form.categoryIds.includes(category.id)}
              onCheckedChange={() => toggleCategory(category.id)}
              disabled={isDisabled}
            />

            <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
              <span className="truncate">{category.name}</span>
              {category.children?.length ? (
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                  {category.children.length}
                </span>
              ) : null}
            </span>
          </label>

          {category.children?.length
            ? renderCategoryOptions(category.children, depth + 1)
            : null}
        </div>
      );
    });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await client.get("/categories/tree");
        const categoryList = Array.isArray(res.data)
          ? res.data
          : res.data?.data;
        setCategories(Array.isArray(categoryList) ? categoryList : []);
      } catch (error: any) {
        notify(error?.message || "Failed to fetch categories", "error");
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setProductLoading(true);
        const res = await client.get(`/products/${productId}`);
        const product: ProductDetailsResponse = res.data?.data ?? res.data;
        const mapped = mapProductToForm(product);
        setInitialForm(mapped.form);
        setForm(mapped.form);
        setAttributeOptions(mapped.attributeOptions);
        setImageItems(mapped.images);
        setCurrentIndex(0);
        setVariantsTouched(false);
      } catch (error: any) {
        notify(error?.message || "Failed to fetch product details", "error");
      } finally {
        setProductLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const isDirty = useMemo(() => {
    if (!initialForm) return false;
    return !isEqual(form, initialForm);
  }, [form, initialForm]);
  // ---------------- VARIANTS ----------------

  const addVariant = () => {
    setVariantsTouched(true);
    setForm((prev) => ({
      ...prev,
      variants: [...prev.variants, createEmptyVariant()],
    }));
  };

  const removeVariant = (localId: string) => {
    setVariantsTouched(true);
    const updated = form.variants.filter(
      (variant) => variant.localId !== localId,
    );
    setForm({ ...form, variants: updated });
  };

  const handleVariantChange = (
    localId: string,
    field: string,
    value: string,
  ) => {
    setVariantsTouched(true);
    if (field === "sku") {
      setVariantSkuError("");
    }
    const index = getVariantIndex(localId);
    if (index < 0) return;
    const updated = [...form.variants];
    updated[index] = { ...updated[index], [field]: value };
    setForm({ ...form, variants: updated });
  };

  // ---------------- ATTRIBUTES ----------------

  const addAttribute = (variantLocalId: string) => {
    setVariantsTouched(true);
    const variantIndex = getVariantIndex(variantLocalId);
    if (variantIndex < 0) return;
    const updated = [...form.variants];
    updated[variantIndex].attributes.push({
      attribute: "",
      value: "",
      meta: { hex: "" },
    });
    setForm({ ...form, variants: updated });
  };

  const handleAttributeChange = (
    variantLocalId: string,
    attrIndex: number,
    field: keyof FormAttribute | "hex",
    value: string,
  ) => {
    setVariantsTouched(true);
    const variantIndex = getVariantIndex(variantLocalId);
    if (variantIndex < 0) return;
    const updated = [...form.variants];
    const attribute = updated[variantIndex].attributes[attrIndex];
    if (!attribute) return;

    if (field === "hex") {
      attribute.meta = { ...attribute.meta, hex: value };
    } else {
      attribute[field] = value;
    }

    setForm({ ...form, variants: updated });
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files).filter((file) =>
      file.type.startsWith("image/"),
    );

    const newItems = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setImageItems((prev) => [...prev, ...newItems]);
  };

  // ---------------- SUBMIT ----------------

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setProductSkuError("");
      setVariantSkuError("");

      const includeVariants = !isEditRoute || variantsTouched;
      const validation = validateProductForm(form, { includeVariants });
      if (!validation.isValid) {
        if (validation.message?.toLowerCase().includes("product sku")) {
          setProductSkuError(validation.message);
        }
        if (validation.message?.toLowerCase().includes("variant sku")) {
          setVariantSkuError(validation.message);
        }
        notify(
          validation.message || "Please fix form errors and try again.",
          "error",
        );
        return;
      }

      const { formattedData } = buildProductPayload(form);
      if (!includeVariants && "variants" in formattedData) {
        delete formattedData.variants;
      } else if (includeVariants && !("variants" in formattedData)) {
        formattedData.variants = [];
      }

      const uploadFiles = imageItems
        .map((i) => i.file)
        .filter(Boolean) as File[];

      const res =
        isEditRoute && productId
          ? await dispatch(
              updateProduct({
                productId,
                payload: formattedData,
                files: uploadFiles,
              }),
            ).unwrap()
          : await dispatch(
              createProduct({ payload: formattedData, files: uploadFiles }),
            ).unwrap();

      // ✅ SUCCESS NOTIFY
      notify(
        res?.message ||
          (isEditRoute
            ? "Product updated successfully"
            : "Product created successfully 🚀"),
        "success",
      );

      // ✅ OPTIONAL: reset form
      if (!isEditRoute) {
        setForm(createResetFormState());
        setImageItems([]);
        setVariantsTouched(false);
      }
    } catch (error: any) {
      const errorMessage = String(error?.message || "");
      if (errorMessage.toLowerCase().includes("duplicate sku")) {
        const hasVariantPayload =
          (!isEditRoute || variantsTouched) && form.variants.length > 0;
        if (hasVariantPayload) {
          setVariantSkuError(
            "One or more variant SKUs already exist. Please use unique SKU values.",
          );
        } else {
          setProductSkuError(
            "This product SKU already exists. Please enter a unique SKU.",
          );
        }
        notify(
          "Duplicate SKU detected. Please change SKU and submit again.",
          "error",
        );
      } else if (
        errorMessage.toLowerCase().includes("timeout") ||
        errorMessage.toLowerCase().includes("network error")
      ) {
        notify("Request timed out. Please try again.", "error");
      } else if (
        errorMessage.includes("500") ||
        errorMessage.toLowerCase().includes("internal server error")
      ) {
        notify("Server error occurred. Please try again shortly.", "error");
      } else {
        notify(errorMessage || "Failed to save product", "error");
      }
    } finally {
      setLoading(false);
    }
  };
  const removeImage = (index: number) => {
    const updated = imageItems.filter((_, i) => i !== index);
    setImageItems(updated);

    // fix current index after delete
    if (index === currentIndex && index > 0) {
      setCurrentIndex(index - 1);
    } else if (currentIndex >= updated.length) {
      setCurrentIndex(updated.length - 1);
    }
  };

  const removeAttribute = (variantLocalId: string, attrIndex: number) => {
    setVariantsTouched(true);
    const variantIndex = getVariantIndex(variantLocalId);
    if (variantIndex < 0) return;
    const updated = [...form.variants];

    updated[variantIndex].attributes = updated[variantIndex].attributes.filter(
      (_, i) => i !== attrIndex,
    );

    setForm({ ...form, variants: updated });
  };

  const getSizeOptionsForValue = (value: string) => {
    const hasExactOption = SIZE_OPTIONS.some(
      (option) => option.value === value,
    );
    if (!value || hasExactOption) {
      return SIZE_OPTIONS;
    }

    // Keep backend-provided casing (e.g. "xl") so preloaded values stay visible in preview/edit.
    return [{ label: value, value }, ...SIZE_OPTIONS];
  };
  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {isViewingExisting
            ? isEditRoute
              ? "Edit Product"
              : "Product Details"
            : "Create Product"}
        </h2>

        {/* 👇 Edit button only in VIEW mode */}
        {isViewingExisting && !isEditRoute && (
          <Button onClick={() => navigate(`/products/edit/${productId}`)}>
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {productLoading && (
        <p className="text-sm text-gray-500">Loading product details...</p>
      )}

      {/* BASIC */}
      <div className="grid md:grid-cols-2 gap-4">
        <FormField
          label="Product Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          disabled={isViewingExisting && !isEditRoute}
        />

        <FormField
          label="Base Price"
          name="basePrice"
          type="number"
          value={form.basePrice}
          onChange={handleChange}
          disabled={isViewingExisting && !isEditRoute}
        />
      </div>

      <FormField
        label="Product SKU"
        name="sku"
        value={form.sku}
        onChange={handleChange}
        disabled={isViewingExisting && !isEditRoute}
        error={productSkuError}
      />

      <FormField
        label="Description"
        name="description"
        value={form.description}
        onChange={handleChange}
        disabled={isViewingExisting && !isEditRoute}
      />

      {/* CATEGORY */}
      <div>
        <h3 className="font-semibold mb-2">Categories</h3>
        <details className="relative w-full">
          <summary className="list-none w-full cursor-pointer rounded-md border bg-white px-3 py-2 text-sm text-gray-700 flex items-center justify-between gap-3 group">
            <span className="min-w-0 truncate">{selectedCategoryLabel}</span>

            <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 group-open:rotate-180" />
          </summary>

          <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-md border bg-white shadow">
            {categoriesLoading ? (
              <p className="p-3 text-sm text-gray-500">Loading categories...</p>
            ) : categories.length === 0 ? (
              <p className="p-3 text-sm text-gray-500">No categories found</p>
            ) : (
              <div className="max-h-64 overflow-auto py-1">
                {renderCategoryOptions(categories)}
              </div>
            )}
          </div>
        </details>
      </div>

      {/* IMAGES */}
      <div>
        <h3 className="font-semibold mb-2">Images</h3>

        {imageItems.length === 0 ? (
          <label className="w-full h-56 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center cursor-pointer hover:bg-gray-50 transition">
            <div className="text-center">
              <p className="text-gray-600 text-lg">Click to upload images</p>
              <p className="text-sm text-gray-400">PNG, JPG only</p>
            </div>

            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImage}
              className="hidden"
              disabled={isViewingExisting && !isEditRoute}
            />
          </label>
        ) : (
          <div className="relative">
            {/* CAROUSEL */}
            <Carousel className="w-full relative">
              <CarouselContent>
                {imageItems.map((item, index) => (
                  <CarouselItem key={index}>
                    <div className="relative w-full h-64 rounded-xl overflow-hidden border">
                      <img
                        src={item.url}
                        alt="preview"
                        className="w-full h-full object-cover"
                      />

                      {/* DELETE BUTTON */}
                      {!(isViewingExisting && !isEditRoute) && (
                        <button
                          onClick={() => removeImage(index)}
                          className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full flex items-center justify-center shadow"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>

              {/* ✅ PREVIOUS */}
              <CarouselPrevious className="left-3 bg-black/50 text-white border-none hover:bg-black/70" />

              {/* ✅ NEXT */}
              <CarouselNext className="right-3 bg-black/50 text-white border-none hover:bg-black/70" />
            </Carousel>

            {/* ADD MORE BUTTON */}
            {!(isViewingExisting && !isEditRoute) && (
              <label className="absolute bottom-3 right-3 bg-white text-black px-3 py-1 rounded shadow cursor-pointer flex items-center gap-1">
                <Plus size={16} />
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImage}
                  className="hidden"
                />
              </label>
            )}
          </div>
        )}
      </div>

      {/* VARIANTS */}
      <div>
        <h3 className="font-semibold mb-4">Variants</h3>

        {form.variants.length > 0 && (
          <>
            {form.variants.map((variant, vIndex) => (
              <div
                key={variant.localId}
                className="border p-4 rounded-lg mb-4 space-y-3"
              >
                {/* 🔥 VARIANT HEADER */}
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold">Variant {vIndex + 1}</h4>

                  <button
                    onClick={() => removeVariant(variant.localId)}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full flex items-center justify-center"
                    disabled={isViewingExisting && !isEditRoute}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* VARIANT FIELDS */}
                <div className="grid md:grid-cols-3 gap-3">
                  <FormField
                    label="SKU"
                    name={`variantSku-${vIndex}`}
                    value={variant.sku}
                    onChange={(e) =>
                      handleVariantChange(
                        variant.localId,
                        "sku",
                        e.target.value,
                      )
                    }
                    disabled={isViewingExisting && !isEditRoute}
                    error={variantSkuError}
                  />
                  <FormField
                    label="Price"
                    name={`variantPrice-${vIndex}`}
                    type="number"
                    value={variant.price}
                    onChange={(e) =>
                      handleVariantChange(
                        variant.localId,
                        "price",
                        e.target.value,
                      )
                    }
                    disabled={isViewingExisting && !isEditRoute}
                  />
                  <FormField
                    label="Stock"
                    name={`variantStock-${vIndex}`}
                    type="number"
                    value={variant.stock}
                    onChange={(e) =>
                      handleVariantChange(
                        variant.localId,
                        "stock",
                        e.target.value,
                      )
                    }
                    disabled={isViewingExisting && !isEditRoute}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addAttribute(variant.localId)}
                    disabled={isViewingExisting && !isEditRoute}
                  >
                    + Add Attribute
                  </Button>
                </div>

                {/* ATTRIBUTES */}
                {variant.attributes.some(
                  (a) => a.attribute || a.value || a.meta?.hex,
                ) && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium">Attributes</h4>
                    </div>

                    {variant.attributes.map((attr, aIndex) => (
                      <div key={aIndex} className="border rounded-md p-3 mb-3">
                        {/* ✅ HEADER */}
                        <div className="flex justify-between items-center mb-3 border-b pb-2">
                          <p className="text-sm font-medium text-gray-600">
                            Attribute {aIndex + 1}
                          </p>

                          <button
                            onClick={() =>
                              removeAttribute(variant.localId, aIndex)
                            }
                            className="bg-red-500 hover:bg-red-600 text-white p-1.5 rounded-full"
                            disabled={isViewingExisting && !isEditRoute}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>

                        {/* ✅ CONTENT */}
                        <div className="grid grid-cols-3 gap-3">
                          {/* ATTRIBUTE TYPE */}
                          <CustomSelect
                            options={attributeOptions}
                            value={attr.attribute}
                            onChange={(val) =>
                              handleAttributeChange(
                                variant.localId,
                                aIndex,
                                "attribute",
                                val,
                              )
                            }
                            placeholder="Select Type"
                            className={
                              isViewingExisting && !isEditRoute
                                ? "pointer-events-none opacity-60"
                                : ""
                            }
                          />

                          {/* ✅ SIZE */}
                          {attr.attribute === "size" && (
                            <CustomSelect
                              options={getSizeOptionsForValue(attr.value)}
                              value={attr.value}
                              onChange={(val) =>
                                handleAttributeChange(
                                  variant.localId,
                                  aIndex,
                                  "value",
                                  val,
                                )
                              }
                              placeholder="Select Size"
                              className={
                                isViewingExisting && !isEditRoute
                                  ? "pointer-events-none opacity-60"
                                  : ""
                              }
                            />
                          )}

                          {/* ✅ COLOR */}
                          {attr.attribute === "color" && (
                            <>
                              {/* Color Name */}
                              <FormField
                                label="Color Name"
                                name={`variant-${vIndex}-attribute-${aIndex}-colorName`}
                                value={attr.value}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    variant.localId,
                                    aIndex,
                                    "value",
                                    e.target.value,
                                  )
                                }
                                disabled={isViewingExisting && !isEditRoute}
                              />

                              {/* Color Picker */}
                              <div className="relative w-full  h-8">
                                {/* Hidden input */}
                                <input
                                  type="color"
                                  value={attr.meta?.hex || "#000000"}
                                  onChange={(e) => {
                                    handleAttributeChange(
                                      variant.localId,
                                      aIndex,
                                      "hex",
                                      e.target.value,
                                    );
                                  }}
                                  className="absolute inset-0 w-full h-10 border opacity-0 cursor-pointer"
                                  disabled={isViewingExisting && !isEditRoute}
                                />

                                {/* Visible UI */}
                                <div className="flex items-center justify-between w-full h-10 px-3 border rounded-md bg-white hover:border-gray-400 transition">
                                  <div className="flex items-center gap-2">
                                    <div
                                      className="w-5 h-5 rounded-full border"
                                      style={{
                                        backgroundColor:
                                          attr.meta?.hex || "#000000",
                                      }}
                                    />
                                    <span className="text-sm text-gray-700">
                                      {attr.meta?.hex || "#000000"}
                                    </span>
                                  </div>

                                  <span className="text-xs text-gray-400">
                                    Pick
                                  </span>
                                </div>
                              </div>
                            </>
                          )}

                          {/* ✅ CUSTOM ATTRIBUTE (fallback) */}
                          {attr.attribute &&
                            attr.attribute !== "size" &&
                            attr.attribute !== "color" && (
                              <FormField
                                label="Value"
                                name={`variant-${vIndex}-attribute-${aIndex}-value`}
                                value={attr.value}
                                onChange={(e) =>
                                  handleAttributeChange(
                                    variant.localId,
                                    aIndex,
                                    "value",
                                    e.target.value,
                                  )
                                }
                                disabled={isViewingExisting && !isEditRoute}
                              />
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </>
        )}

        {(!isViewingExisting || isEditRoute) && (
          <Button onClick={addVariant}>+ Add</Button>
        )}
      </div>

      {/* SUBMIT */}
      <div className="flex justify-end">
        {(!isViewingExisting || isEditRoute) && (
          <Button
            onClick={handleSubmit}
            disabled={loading || (!isDirty && isEditRoute)}
          >
            {loading ? (
              <>
                <Spinner className="mr-2" />
                {isEditRoute ? "Updating..." : "Creating..."}
              </>
            ) : isEditRoute ? (
              "Update Product"
            ) : (
              "Submit"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
