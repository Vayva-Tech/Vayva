// @ts-nocheck
"use client";

import { getLegalDocument } from "@vayva/shared/content";
import { LegalPageLayout } from "@vayva/ui";

export default function PrivacyPage() {
  const document = getLegalDocument("privacy");

  if (!document) {
    return <div>Document not found</div>;
  }

  return <LegalPageLayout document={document} />;
}
