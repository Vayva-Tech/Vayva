"use client";

import React from "react";

export function LegalLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-transparent flex flex-col">
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-12">
        <div className="bg-white  rounded-2xl border border-gray-100  p-8 md:p-12">
          {children}
        </div>
      </main>
    </div>
  );
}
