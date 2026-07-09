import type { JsonObject } from "@/features/admin/types";

const postJson = async (url: string, body: JsonObject) => {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    keepalive: true,
    body: JSON.stringify(body)
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.ok === false) {
    throw new Error(data.error || data.reason || `${url} failed`);
  }

  return data;
};

export const runOrderSideEffects = async (order: JsonObject, createdBy: string) => {
  try {
    return await postJson("/api/order-side-effects", { order, created_by: createdBy });
  } catch (error) {
    console.error("Order side effects failed:", error);
    return { ok: false, error };
  }
};
