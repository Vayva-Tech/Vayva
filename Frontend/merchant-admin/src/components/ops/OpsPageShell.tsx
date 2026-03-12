// Ops Page Shell Component
'use client';

import React from 'react';

interface OpsPageShellProps {
  children: React.ReactNode;
  title?: string;
}

export function OpsPageShell({ children, title }: OpsPageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {title && <h1 className="text-2xl font-bold p-4">{title}</h1>}
      <main className="p-4">{children}</main>
    </div>
  );
}

export default OpsPageShell;
