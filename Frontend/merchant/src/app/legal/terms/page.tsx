// @ts-nocheck
"use client";

import { getLegalDocument } from "@vayva/shared/content";
import { LegalPageLayout } from "@vayva/ui";

export default function TermsPage() {
  const document = getLegalDocument("terms");

  if (!document) {
    return <div>Document not found</div>;
  }

  return <LegalPageLayout document={document} />;
}
