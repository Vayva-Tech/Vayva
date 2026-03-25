import React from "react";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pages under `/legal/*` use `@vayva/ui`'s `LegalPageLayout`, which already
  // provides its own full-page structure. Avoid double-wrapping here.
  return children;
}
