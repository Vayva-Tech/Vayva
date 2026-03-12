"use client";

import { use } from "react";
import { LocaleKey } from "@/data/locales";
import { AccountNav } from "@/components/account/AccountNav";

export default function AccountLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = use(params);
  const locale = (lang === "tr" ? "tr" : "en") as LocaleKey;

  return (
    <div className="min-h-screen bg-background/40 backdrop-blur-sm py-12 md:py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1">
            <div className="bg-background/70 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-gray-100 sticky top-24">
              <AccountNav lang={locale} />
            </div>
          </aside>

          {/* Content */}
          <main className="md:col-span-3">{children}</main>
        </div>
      </div>
    </div>
  );
}
