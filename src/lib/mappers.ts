import { createEmptyVariant, DEFAULT_ATTRIBUTE_OPTIONS } from "../lib/constants";
import type {
  FormAttribute,
  ProductFormPayload,
  FormState,
  FormVariant,
  ImageItem,
  ProductDetailsResponse,
  VariantFormPayload,
} from "./types";

const normalizeAttributeKey = (name: string) =>
  String(name || "").trim().toLowerCase();

export function mapProductToForm(product: ProductDetailsResponse): {
  form: FormState;
  attributeOptions: Array<{ label: string; value: string }>;
  images: ImageItem[];
} {
  const attributeMetaLookup: Record<
    string,
    Record<string, { hex?: string } | undefined>
  > = {};
  for (const attr of product.attributes || []) {
    const key = normalizeAttributeKey(attr.name);
    attributeMetaLookup[key] ||= {};
    for (const v of attr.values || []) {
      attributeMetaLookup[key][v.value] = v.meta ?? undefined;
    }
  }

  const optionsMap = new Map<string, { label: string; value: string }>();
  for (const option of DEFAULT_ATTRIBUTE_OPTIONS) {
    optionsMap.set(option.value, option);
  }
  for (const attr of product.attributes || []) {
    const key = normalizeAttributeKey(attr.name);
    if (!key) continue;
    if (!optionsMap.has(key)) {
      optionsMap.set(key, { label: attr.name, value: key });
    }
  }

  const variants: FormVariant[] = (product.variants || []).map((v) => {
    const attrs: FormAttribute[] = (v.attributes || [])
      .map((a) => {
       const key = normalizeAttributeKey(a.attribute ?? "");
        if (!key || !a.value) return null;
        const meta = attributeMetaLookup[key]?.[a.value];
        return {
          attribute: key,
          value: a.value,
          ...(meta?.hex ? { meta: { hex: meta.hex } } : {}),
        };
      })
      .filter(Boolean) as FormAttribute[];

    return {
      localId:
        (typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `variant-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`),
      id: v.id,
      sku: v.sku ?? "",
      price: String(v.price ?? ""),
      stock: String(v.stock ?? ""),
      attributes: attrs.length
  ? attrs
  : [{ attribute: "", value: "", meta: { hex: "" } }],
    };
  });

  const form: FormState = {
    name: product.name ?? "",
    description: product.description ?? "",
    basePrice: String(product.basePrice ?? ""),
    sku: product.sku ?? "",
    categoryIds: (product.categories || []).map((c) => c.id),
    variants,
  };

  const images: ImageItem[] = (product.images || []).map((url) => ({ url }));

  return {
    form,
    attributeOptions: Array.from(optionsMap.values()),
    images,
  };
}

export function buildProductPayload(form: FormState) {
  const categoryIds = form.categoryIds.filter(Boolean);

  const cleanedVariants: VariantFormPayload[] = form.variants
    .map((v) => {
      const cleanedAttributes = v.attributes
        .filter((attr) => attr.attribute && attr.value)
        .map((attr) => ({
          attribute: attr.attribute,
          value: attr.value,
          ...(attr.meta?.hex && { meta: { hex: attr.meta.hex } }),
        }));

      const hasRequiredVariantFields =
        String(v.sku ?? "").trim() !== "" &&
        String(v.price ?? "").trim() !== "" &&
        String(v.stock ?? "").trim() !== "";
      if (!hasRequiredVariantFields) return null;

      return {
        ...(v.id ? { id: v.id } : {}),
        sku: v.sku,
        price: Number(v.price),
        stock: Number(v.stock),
        ...(cleanedAttributes.length > 0 && { attributes: cleanedAttributes }),
      };
    })
    .filter(Boolean);

  const formattedData: ProductFormPayload = {
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
  if (String(form.sku || "").trim()) {
    formattedData.sku = form.sku.trim();
  }

  return { formattedData, cleanedVariants };
}

export function validateProductForm(
  form: FormState,
  opts: { includeVariants: boolean },
) {
  if (!String(form.name || "").trim()) {
    return { isValid: false, message: "Product name is required." };
  }

  if (!opts.includeVariants) {
    return { isValid: true };
  }

  if (form.variants.length === 0 && !String(form.sku || "").trim()) {
    return {
      isValid: false,
      message: "Product SKU is required when variants are omitted or empty.",
    };
  }

  const seen = new Set<string>();
  for (const variant of form.variants) {
    const sku = String(variant.sku || "").trim();
    const price = String(variant.price || "").trim();
    const stock = String(variant.stock || "").trim();

    if (!sku || !price || !stock) {
      return {
        isValid: false,
        message: "Each variant requires SKU, price, and stock.",
      };
    }

    const normalizedSku = sku.toLowerCase();
    if (seen.has(normalizedSku)) {
      return {
        isValid: false,
        message: "Duplicate variant SKU found. Each variant SKU must be unique.",
      };
    }
    seen.add(normalizedSku);
  }

  return { isValid: true };
}