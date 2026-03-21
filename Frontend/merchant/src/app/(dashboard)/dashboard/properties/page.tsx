import { requireAuth } from "@/lib/session.server";
import { PropertiesClient } from "./PropertiesClient";
import { cookies } from "next/headers";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Properties & Listings | Vayva Dashboard",
  description: "Manage your rental units and property listings.",
};

export default async function PropertiesPage() {
  const user = await requireAuth();
  const storeId = user.storeId;

  const cookieHeader = await getCookieHeader();
  const backendResponse = await fetch(
    `${process?.env?.BACKEND_API_URL}/api/properties`,
    {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    }
  );

  let properties: any[] = [];
  if (backendResponse.ok) {
    const data = await backendResponse.json();
    properties = Array.isArray(data) ? data : data.properties || [];
  }

  return <PropertiesClient initialProperties={properties} />;
}
