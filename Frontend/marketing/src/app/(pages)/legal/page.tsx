import React from "react";
import Link from "next/link";
import { legalContent } from "@/data/marketing-content";

export default function LegalHubPage(): React.JSX.Element {
  return (
    <div className="relative w-full min-w-0 overflow-x-hidden text-slate-900">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16 min-w-0">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 min-w-0">
          {/* Sidebar - Independent scroll on hover */}
          <aside className="w-full lg:w-64 shrink-0 min-w-0 hidden lg:block">
            <nav className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400">
              <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Legal Documents</h3>
                  <ul className="space-y-2">
                    {legalContent.nav.map((doc, index) => (
                      <li key={`${doc.href}-${doc.title}`}>
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
            </nav>
          </aside>

          {/* Mobile sidebar - normal scroll */}
          <aside className="lg:hidden w-full shrink-0 min-w-0">
            <nav className="sticky top-24">
              <div className="rounded-[22px] border border-slate-200/80 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900 mb-4">Legal Documents</h3>
                  <ul className="space-y-2">
                    {legalContent.nav.map((doc, index) => (
                      <li key={`${doc.href}-${doc.title}`}>
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
                    <div
                      key={item.href}
                      className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
                    >
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">
                          <Link href={item.href} className="hover:underline">
                            {item.title}
                          </Link>
                        </h3>
                        <p className="text-slate-600">{item.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <div className="mt-10">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                <p className="text-sm text-slate-500">{legalContent.disclaimer}</p>
              </div>
            </div>

            <div className="mt-8">
              <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm min-w-0">
                    {legalContent.meta.map((item) => (
                      <div key={item.label}>
                        <dt className="font-semibold text-slate-900">{item.label}</dt>
                        <dd className="text-slate-500">{item.value}</dd>
                      </div>
                    ))}
                  </dl>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
