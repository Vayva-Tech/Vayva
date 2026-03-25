"use client";

import { getLegalDocument } from "@vayva/shared/content";
import { LegalContentRenderer, LegalPageLayout } from "@vayva/ui";

export default function TermsPage() {
  const document = getLegalDocument("terms");

  if (!document) {
    return <div>Document not found</div>;
  }

  const toc = document.sections
    .filter((s) => s.heading)
    .map((s, idx) => ({ id: `section-${idx}`, label: s.heading! }));

  return (
    <LegalPageLayout
      title={document.title}
      summary={document.summary}
      lastUpdated={document.lastUpdated}
      toc={toc}
    >
      <LegalContentRenderer document={document} />
    </LegalPageLayout>
  );
}
