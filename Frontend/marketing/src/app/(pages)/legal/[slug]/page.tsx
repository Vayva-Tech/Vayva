import React from "react";
import { notFound } from "next/navigation";
import { getLegalDocument, legalRegistry } from "@vayva/content";
import { LegalContentRenderer, LegalPageLayout } from "@vayva/ui";

// Generate static params for all known slugs
export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return Object.keys(legalRegistry).map((slug) => ({
    slug,
  }));
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<React.JSX.Element> {
  const { slug } = await params;
  const document = getLegalDocument(slug);

  if (!document) {
    notFound();
  }

  const toc = document.sections
    .filter((s) => s.heading)
    .map((s, idx) => ({ id: `section-${idx}`, label: s.heading! }));

  return (
    <LegalPageLayout
      title={document.title}
      summary={document.summary}
      lastUpdated={document.lastUpdated}
      backLink={{ href: "/legal", label: "Back to Legal Hub" }}
      toc={toc}
    >
      <LegalContentRenderer document={document} />
    </LegalPageLayout>
  );
}
