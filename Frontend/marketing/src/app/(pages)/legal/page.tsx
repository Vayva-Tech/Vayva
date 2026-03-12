import React from "react";
import Link from "next/link";
import { legalContent } from "@/data/marketing-content";

export default function LegalHubPage(): React.JSX.Element {
  return (
    <div className="relative text-slate-900">
      <div className="max-w-[1600px] mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          <aside className="w-full lg:w-64 flex-shrink-0">
            <nav className="sticky top-24">
              <div className="relative">
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[24px] border-2 border-emerald-200/60" />
                <div className="relative rounded-[22px] border-2 border-slate-900/10 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.1)]">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Legal Documents</h3>
                  <ul className="space-y-2">
                    {legalContent.nav.map((doc, index) => (
                      <li key={doc.href}>
                        <Link
                          href={doc.href}
                          className={`block px-3 py-2 text-sm rounded-lg ${
                            index === 0
                              ? "bg-white/80 text-slate-900 font-semibold border border-slate-200"
                              : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                          }`}
                        >
                          {doc.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </nav>
          </aside>

          <main className="flex-1 max-w-3xl">
            <div className="mb-12">
              <h1 className="text-4xl font-semibold text-slate-900 mb-4">
                {legalContent.title}
              </h1>
              <p className="text-lg text-slate-600 leading-relaxed">
                {legalContent.description}
              </p>
            </div>

            {legalContent.sections.map((section) => (
              <section key={section.title} className="mb-12">
                <h2 className="text-2xl font-semibold text-slate-900 mb-6">
                  {section.title}
                </h2>
                <div className="space-y-6">
                  {section.items.map((item) => (
                    <div key={item.href} className="relative">
                      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[22px] border-2 border-emerald-200/60" />
                      <div className="relative rounded-2xl border-2 border-slate-900/10 bg-white/90 p-6 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          <Link href={item.href} className="hover:underline">
                            {item.title}
                          </Link>
                        </h3>
                        <p className="text-slate-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[22px] border-2 border-emerald-200/60" />
                <div className="relative rounded-2xl border-2 border-slate-900/10 bg-white/90 p-6 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                  <p className="text-sm text-slate-500">{legalContent.disclaimer}</p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[22px] border-2 border-emerald-200/60" />
                <div className="relative rounded-2xl border-2 border-slate-900/10 bg-white/90 p-6 shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    {legalContent.meta.map((item) => (
                      <div key={item.label}>
                        <dt className="font-semibold text-slate-900">{item.label}</dt>
                        <dd className="text-slate-500">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
