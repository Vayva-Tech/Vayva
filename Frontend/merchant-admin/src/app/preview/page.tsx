import { getServerSession, type User } from "next-auth";
import { authOptions } from "@/lib/auth";
import { TemplateRenderer } from "@/components/templates/TemplateRenderer";
import { StoreProvider } from "@/context/StoreContext";
import { cookies } from "next/headers";

type SessionUser = User & {
  storeId?: string;
}

async function getCookieHeader(): Promise<string> {
  const cookieStore = await cookies();
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

export default async function PreviewPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return (
      <div className="h-screen flex items-center justify-center">
        Unauthorized Preview
      </div>
    );
  }

  const storeId = (session.user as SessionUser).storeId;
  if (!storeId) return <div>No Store Context</div>;

  const cookieHeader = await getCookieHeader();
  const backendResponse = await fetch(
    `${process?.env?.BACKEND_API_URL}/api/storefront/draft`,
    {
      headers: {
        cookie: cookieHeader,
      },
      cache: "no-store",
    }
  );

  if (!backendResponse.ok) {
    return <div>No template selected. Please go to the Template Gallery.</div>;
  }

  const draft = await backendResponse.json();

  return (
    <StoreProvider>
      <TemplateRenderer
        templateId={draft?.draft?.activeTemplateId || draft?.activeTemplateId}
        config={draft?.draft?.themeConfig || draft?.themeConfig}
        storeName={draft?.draft?.store?.name || draft?.store?.name || "My Store"}
        isDemo={false}
      />
    </StoreProvider>
  );
}
