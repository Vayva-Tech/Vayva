import React from "react";

export default function OpsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Route groups handle auth and shell rendering
  // This is just a pass-through
  return <>{children}</>;
}
