import React from "react";
import { LegalLayoutClient } from "./LegalLayoutClient";

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LegalLayoutClient>{children}</LegalLayoutClient>;
}
