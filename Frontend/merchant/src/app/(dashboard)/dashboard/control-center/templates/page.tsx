import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { TemplateGallery } from "@/components/templates/TemplateGallery";
import { DashboardPageShell } from "@/components/layout/DashboardPageShell";

export const metadata: Metadata = {
  title: "Choose Template - Control Center",
  description: "Select a professional template for your storefront",
};

export default async function TemplateSelectionPage() {
  const session = await getServerSession();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  // Get the current store's template
  const store = await prisma.store.findFirst({
    where: {
      id: (session.user as any).storeId || "",
    },
  });

  const currentTemplateId = store?.currentTemplateId;

  return (
    <DashboardPageShell
      title="Choose Your Template"
      category="storefront"
    >
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mt-2 text-gray-600">
            Select from our collection of 54 professionally designed templates.
            Each template is optimized for your industry and includes all the features you need.
          </p>
        </div>

        <TemplateGallery currentTemplateId={currentTemplateId ?? undefined} />
      </div>
    </DashboardPageShell>
  );
}
