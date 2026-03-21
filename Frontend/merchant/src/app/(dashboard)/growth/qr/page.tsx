import { QRCodeGenerator } from "@/components/growth/QRCodeGenerator";
import { requireAuth } from "@/lib/session.server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export const dynamic = "force-dynamic";

export default async function QRCodePage() {
  const user = await requireAuth();

  const cookieHeader = await getCookieHeader();
  const backendResponse = await fetch(
    `${process?.env?.BACKEND_API_URL}/api/auth/merchant/me`,
    {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    }
  );

  if (!backendResponse.ok) {
    notFound();
  }

  const data = await backendResponse.json();
  const store = data?.store;

  if (!store?.slug) {
    notFound();
  }

  // Construct store URL - ensure it handles dev/prod environments correctly
  const protocol = process.env?.NODE_ENV === "production" ? "https" : "http";
  const rootDomain =
    process.env?.NEXT_PUBLIC_ROOT_DOMAIN ||
    (process.env?.NODE_ENV === "production"
      ? "vayva.ng"
      : "vayva.localhost:3000");
  const storeUrl = `${protocol}://${store.slug}.${rootDomain}`;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Offline Traffic Generator
        </h1>
        <p className="text-gray-400 max-w-md mx-auto">
          Bridge the gap between your physical location and your digital store.
        </p>
      </div>

      <QRCodeGenerator storeUrl={storeUrl} storeName={store.name || "My Store"} />
    </div>
  );
}
