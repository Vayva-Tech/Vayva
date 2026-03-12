import { SeoSettingsForm } from "@/components/settings/SeoSettingsForm";
import { requireAuth } from "@/lib/session.server";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { cookies } from "next/headers";

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export const metadata = {
  title: "SEO Settings | Vayva",
};

export const dynamic = "force-dynamic";

export default async function SeoSettingsPage() {
  const user = await requireAuth();

  const cookieHeader = await getCookieHeader();
  const backendResponse = await fetch(
    `${process?.env?.BACKEND_API_URL}/api/account/store`,
    {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    }
  );

  let store: any = { seoTitle: null, seoDescription: null, socialImage: null };
  if (backendResponse.ok) {
    const data = await backendResponse.json();
    store = {
      seoTitle: data?.settings?.seoTitle || null,
      seoDescription: data?.settings?.seoDescription || null,
      socialImage: data?.settings?.socialImage || null,
    };
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <Breadcrumbs />
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-text-primary">
          Social & SEO Settings
        </h1>
        <p className="text-text-tertiary">
          Control how your store appears on Google, Facebook, Twitter, and
          WhatsApp.
        </p>
      </div>

      <SeoSettingsForm initialData={store} />
    </div>
  );
}
