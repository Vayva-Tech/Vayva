import { getAuthToken } from "./auth";

export type MobileNavTab = {
  key: string;
  title: string;
  href: string;
  icon: string;
};

export type MobileNavResponse = {
  success: boolean;
  data?: {
    industrySlug: string;
    tabs: MobileNavTab[];
  };
  error?: string;
};

function getApiOrigin(): string {
  const raw = process.env.EXPO_PUBLIC_API_URL;
  if (typeof raw !== "string" || !raw.trim()) return "";
  return raw.replace(/\/$/, "");
}

export async function fetchMobileNav(): Promise<MobileNavResponse> {
  const origin = getApiOrigin();
  if (!origin) {
    return { success: false, error: "Missing EXPO_PUBLIC_API_URL." };
  }

  const token = await getAuthToken();
  if (!token) {
    return { success: false, error: "Not authenticated." };
  }

  const res = await fetch(`${origin}/api/mobile/nav`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "x-vayva-client": "mobile",
    },
  });

  const payload = (await res.json().catch(() => ({}))) as MobileNavResponse;
  if (!res.ok) {
    return {
      success: false,
      error: payload?.error || "Failed to load navigation",
    };
  }

  return payload;
}
