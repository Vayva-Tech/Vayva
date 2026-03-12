import React from "react";
import { notFound } from "next/navigation";
import { getLegalDocument } from "@vayva/content";
import { LegalContentRenderer, LegalPageLayout } from "@vayva/ui";

export default function LegalDocPage({
  slug,
}: {
  slug: string;
}): React.JSX.Element {
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
