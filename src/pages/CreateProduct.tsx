// src/pages/CreateProduct.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAppDispatch } from "@/store/hooks";
import { createProduct } from "@/store/features/product/product.thunk";
import { notify } from "@/components/ui/notify";
import { Spinner } from "@/components/ui/spinner";

export default function CreateProduct() {
  const dispatch = useAppDispatch();
const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    basePrice: "",
    categoryIds: [""],
    variants: [
      {
        sku: "",
        price: "",
        stock: "",
        attributes: [
          { attribute: "", value: "", meta: { hex: "" } },
        ],
      },
    ],
  });

  const [images, setImages] = useState<File[]>([]);

  // ---------------- BASIC ----------------

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCategoryChange = (index: number, value: string) => {
    const updated = [...form.categoryIds];
    updated[index] = value;
    setForm({ ...form, categoryIds: updated });
  };

  // ---------------- VARIANTS ----------------

  const addVariant = () => {
    setForm({
      ...form,
      variants: [
        ...form.variants,
        {
          sku: "",
          price: "",
          stock: "",
          attributes: [
            { attribute: "", value: "", meta: { hex: "" } },
          ],
        },
      ],
    });
  };

  const removeVariant = (index: number) => {
    const updated = form.variants.filter((_, i) => i !== index);
    setForm({ ...form, variants: updated });
  };

  const handleVariantChange = (index: number, field: string, value: string) => {
    const updated = [...form.variants];
    updated[index][field] = value;
    setForm({ ...form, variants: updated });
  };

  // ---------------- ATTRIBUTES ----------------

  const addAttribute = (variantIndex: number) => {
    const updated = [...form.variants];
    updated[variantIndex].attributes.push({
      attribute: "",
      value: "",
      meta: { hex: "" },
    });
    setForm({ ...form, variants: updated });
  };

  const handleAttributeChange = (
    variantIndex: number,
    attrIndex: number,
    field: string,
    value: string
  ) => {
    const updated = [...form.variants];

    if (field === "hex") {
      updated[variantIndex].attributes[attrIndex].meta.hex = value;
    } else {
      updated[variantIndex].attributes[attrIndex][field] = value;
    }

    setForm({ ...form, variants: updated });
  };

  // ---------------- IMAGE ----------------

const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (!e.target.files) return;

  const files: File[] = Array.from(e.target.files);
  setImages(files);
};

  // ---------------- SUBMIT ----------------

const handleSubmit = async () => {
  try {
    setLoading(true);

    // ✅ CLEAN CATEGORY IDS
    const categoryIds = form.categoryIds.filter((id) => id.trim() !== "");

    // ✅ CLEAN VARIANTS
    const cleanedVariants = form.variants
      .map((v) => {
        const cleanedAttributes = v.attributes
          .filter((attr) => attr.attribute && attr.value)
          .map((attr) => ({
            attribute: attr.attribute,
            value: attr.value,
            ...(attr.meta?.hex && { meta: { hex: attr.meta.hex } }),
          }));

        if (!v.sku || !v.price || !v.stock) return null;

        return {
          sku: v.sku,
          price: Number(v.price),
          stock: Number(v.stock),
          ...(cleanedAttributes.length > 0 && {
            attributes: cleanedAttributes,
          }),
        };
      })
      .filter(Boolean);

    const formattedData: any = {
      name: form.name,
      description: form.description,
      basePrice: Number(form.basePrice),
    };

    if (categoryIds.length > 0) {
      formattedData.categoryIds = categoryIds;
    }

    if (cleanedVariants.length > 0) {
      formattedData.variants = cleanedVariants;
    }

    const formData = new FormData();
    formData.append("data", JSON.stringify(formattedData));

    if (images.length > 0) {
      images.forEach((file) => {
        formData.append("images", file);
      });
    }

    const res = await dispatch(createProduct(formData)).unwrap();

    // ✅ SUCCESS NOTIFY
    notify(res?.message || "Product created successfully 🚀", "success");

    // ✅ OPTIONAL: reset form
    setForm({
      name: "",
      description: "",
      basePrice: "",
      categoryIds: [""],
      variants: [
        {
          sku: "",
          price: "",
          stock: "",
          attributes: [{ attribute: "", value: "", meta: { hex: "" } }],
        },
      ],
    });
    setImages([]);

  } catch (error: any) {
    // ❌ ERROR NOTIFY
    notify(error?.message || "Failed to create product", "error");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-5xl mx-auto bg-white p-6 rounded-xl shadow space-y-6">
      <h2 className="text-2xl font-bold">Create Product</h2>

      {/* BASIC */}
      <div className="grid md:grid-cols-2 gap-4">
        <Input
          name="name"
          placeholder="Product Name"
          value={form.name}
          onChange={handleChange}
        />

        <Input
          name="basePrice"
          placeholder="Base Price"
          value={form.basePrice}
          onChange={handleChange}
        />
      </div>

      <Input
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />

      {/* CATEGORY */}
      <div>
        <h3 className="font-semibold mb-2">Categories</h3>
        {form.categoryIds.map((cat, i) => (
          <Input
            key={i}
            value={cat}
            placeholder="Category ID"
            onChange={(e) => handleCategoryChange(i, e.target.value)}
            className="mb-2"
          />
        ))}
      </div>

      {/* IMAGES */}
      <div>
        <h3 className="font-semibold mb-2">Images</h3>
        <input type="file" multiple onChange={handleImage} />
      </div>

      {/* VARIANTS */}
      <div>
        <h3 className="font-semibold mb-4">Variants</h3>

        {form.variants.map((variant, vIndex) => (
          <div key={vIndex} className="border p-4 rounded-lg mb-4 space-y-3">
            <div className="grid md:grid-cols-3 gap-3">
              <Input
                placeholder="SKU"
                value={variant.sku}
                onChange={(e) =>
                  handleVariantChange(vIndex, "sku", e.target.value)
                }
              />
              <Input
                placeholder="Price"
                value={variant.price}
                onChange={(e) =>
                  handleVariantChange(vIndex, "price", e.target.value)
                }
              />
              <Input
                placeholder="Stock"
                value={variant.stock}
                onChange={(e) =>
                  handleVariantChange(vIndex, "stock", e.target.value)
                }
              />
            </div>

            {/* ATTRIBUTES */}
            <div>
              <h4 className="text-sm font-medium mb-2">Attributes</h4>

              {variant.attributes.map((attr, aIndex) => (
                <div key={aIndex} className="grid grid-cols-3 gap-2 mb-2">
                  <Input
                    placeholder="Attribute"
                    value={attr.attribute}
                    onChange={(e) =>
                      handleAttributeChange(
                        vIndex,
                        aIndex,
                        "attribute",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="Value"
                    value={attr.value}
                    onChange={(e) =>
                      handleAttributeChange(
                        vIndex,
                        aIndex,
                        "value",
                        e.target.value
                      )
                    }
                  />
                  <Input
                    placeholder="Hex (#fff)"
                    value={attr.meta?.hex}
                    onChange={(e) =>
                      handleAttributeChange(
                        vIndex,
                        aIndex,
                        "hex",
                        e.target.value
                      )
                    }
                  />
                </div>
              ))}

              <Button onClick={() => addAttribute(vIndex)} variant="outline">
                + Add Attribute
              </Button>
            </div>

            <Button
              variant="destructive"
              onClick={() => removeVariant(vIndex)}
            >
              Remove Variant
            </Button>
          </div>
        ))}

        <Button onClick={addVariant}>+ Add Variant</Button>
      </div>

      {/* SUBMIT */}
      <div className="flex justify-end">
       <Button onClick={handleSubmit} disabled={loading}>
  {loading ? (
    <>
      <Spinner className="mr-2" />
      Creating...
    </>
  ) : (
    "Create Product"
  )}
</Button>
      </div>
    </div>
  );
}