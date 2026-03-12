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

export interface EditorService {
  id: string;
  name: string;
  price: number;
  duration: number;
  description: string | null;
}

export interface EditorDish {
  id: string;
  name: string;
  price: number;
  image: string | null;
  category: string | null;
}

export interface EditorProperty {
  id: string;
  name: string;
  price: number;
  images: string[];
  location: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  status: string;
}

export interface EditorCourse {
  id: string;
  name: string;
  category: string;
  price: number;
  currency: string;
  thumbnail: string | null;
  isPublished: boolean;
}

export interface EditorEvent {
  id: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  status: string;
  image: string | null;
  venue: string | null;
}

export interface EditorVehicle {
  id: string;
  name: string;
  type: string;
  licensePlate: string;
  capacity: number | null;
  isActive: boolean;
}

export interface EditorStay {
  id: string;
  name: string;
  type: string;
  maxGuests: number;
  price: number;
  image: string | null;
  isActive: boolean;
}

export interface EditorProject {
  id: string;
  title: string;
  slug: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  images: any;
  description: string | null;
}

export interface EditorPost {
  id: string;
  name: string;
  slug: string;
  status: string;
  publishedAt: string | null;
  image: string | null;
  excerpt: string | null;
}

export interface EditorCampaign {
  id: string;
  name: string;
  status: string;
  channel: string;
  scheduledAt: string | null;
  createdAt: string;
}

async function fetchEditorData<T>(path: string): Promise<T[]> {
  const url = new URL(path, window.location.origin);
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  const json = await res.json();
  return json.data || [];
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

  async getEnabledExtensions(): Promise<string[]> {
    const url = new URL("/api/editor-data/extensions", window.location.origin);
    const res = await fetch(url.toString());
    if (!res.ok) throw new Error("Failed to fetch enabled extensions");
    const json = await res.json();
    return json.data || [];
  },

  async getServices(): Promise<EditorService[]> {
    return fetchEditorData<EditorService>("/api/editor-data/services");
  },

  async getDishes(): Promise<EditorDish[]> {
    return fetchEditorData<EditorDish>("/api/editor-data/dishes");
  },

  async getProperties(): Promise<EditorProperty[]> {
    return fetchEditorData<EditorProperty>("/api/editor-data/properties");
  },

  async getCourses(): Promise<EditorCourse[]> {
    return fetchEditorData<EditorCourse>("/api/editor-data/courses");
  },

  async getEvents(): Promise<EditorEvent[]> {
    return fetchEditorData<EditorEvent>("/api/editor-data/events");
  },

  async getVehicles(): Promise<EditorVehicle[]> {
    return fetchEditorData<EditorVehicle>("/api/editor-data/vehicles");
  },

  async getStays(): Promise<EditorStay[]> {
    return fetchEditorData<EditorStay>("/api/editor-data/stays");
  },

  async getProjects(): Promise<EditorProject[]> {
    return fetchEditorData<EditorProject>("/api/editor-data/projects");
  },

  async getPosts(): Promise<EditorPost[]> {
    return fetchEditorData<EditorPost>("/api/editor-data/posts");
  },

  async getCampaigns(): Promise<EditorCampaign[]> {
    return fetchEditorData<EditorCampaign>("/api/editor-data/campaigns");
  },
};
