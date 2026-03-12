/**
 * API Client for the Vayva Webstudio Plugin
 *
 * This client calls the `editor-data` endpoints in merchant-admin.
 * Since the plugin runs in the context of the merchant admin (iframe or same-origin),
 * it relies on the merchant's session cookie.
 */

export interface EditorProduct {
  id: string;
  name: string;
  handle: string;
  price: number;
  thumbnail: string | null;
}

export interface EditorCollection {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

export const VayvaPluginApi = {
  async getProducts(query = "", limit = 20): Promise<EditorProduct[]> {
    const url = new URL("/api/editor-data/products", window.location.origin);
    if (query) url.searchParams.set("query", query);
    url.searchParams.set("limit", limit.toString());

    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch products");
    const json = await res.json();
    return json.data || [];
  },

  async getCollections(): Promise<EditorCollection[]> {
    const url = new URL("/api/editor-data/collections", window.location.origin);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch collections");
    const json = await res.json();
    return json.data || [];
  },
};
