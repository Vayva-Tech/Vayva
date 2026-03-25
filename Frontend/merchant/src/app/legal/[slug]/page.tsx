"use client";

import React from "react";
import { notFound } from "next/navigation";
import { getLegalDocument } from "@vayva/shared/content";
import { LegalContentRenderer, LegalPageLayout } from "@vayva/ui";

export default function MerchantLegalDocPage({
  params,
}: {
  params: { slug: string };
}): React.JSX.Element {
  const document = getLegalDocument(params.slug);

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
      toc={toc}
      backLink={{ href: "/legal", label: "Back to Legal hub" }}
    >
      <LegalContentRenderer document={document} />
    </LegalPageLayout>
  );
}

