import client from "@/api/apiClient";
import type { ProductFormPayload } from "@/lib/types";

const toRequestBody = (payload: ProductFormPayload, files?: File[]) => {
  const safeFiles = (files || []).filter(Boolean);
  if (safeFiles.length === 0) {
    return { body: payload, headers: undefined as Record<string, string> | undefined };
  }

  const formData = new FormData();
  formData.append("data", JSON.stringify(payload));
  safeFiles.forEach((file) => formData.append("images", file));
  return {
    body: formData,
    headers: { "Content-Type": "multipart/form-data" },
  };
};

export async function createProduct(
  payload: ProductFormPayload,
  files?: File[],
) {
  const { body, headers } = toRequestBody(payload, files);
  const res = await client.post("/products", body, headers);
  return res.data;
}

export async function updateProduct(
  productId: string,
  payload: ProductFormPayload,
  files?: File[],
) {
  const { body, headers } = toRequestBody(payload, files);
  const res = await client.patch(`/products/${productId}`, body, headers);
  return res.data;
}
