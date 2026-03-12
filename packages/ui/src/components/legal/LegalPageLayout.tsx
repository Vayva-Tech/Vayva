"use client";

import React, { useState, useEffect } from "react";
import { cn } from "../../utils";
import { Icon } from "../Icon";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../Button";

interface LegalPageLayoutProps {
  children: React.ReactNode;
  title: string;
  summary?: string;
  lastUpdated?: string;
  backLink?: {
    href: string;
    label: string;
  };
  toc?: { id: string; label: string }[];
}

export const LegalPageLayout: React.FC<LegalPageLayoutProps> = ({
  children,
  title,
  summary,
  lastUpdated,
  backLink,
  toc = [],
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-10% 0% -80% 0%" },
    );

    toc.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [toc]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Adjustment for sticky header
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900">
      {/* Top Navigation / Back Link */}
      <div className="max-w-[1280px] mx-auto px-6 pt-12 print:hidden">
        {backLink && (
          <div className="relative inline-flex mb-8">
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-full border-2 border-emerald-200/60" />
            <Link
              href={backLink.href}
              className="relative inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors group px-3 py-1.5 rounded-full border-2 border-slate-900/10 bg-white/90 shadow-[0_10px_24px_rgba(15,23,42,0.1)]"
            >
              <Icon
                name="ArrowLeft"
                size={16}
                className="group-hover:-translate-x-1 transition-transform"
              />
              {backLink.label}
            </Link>
          </div>
        )}
      </div>

      <div className="max-w-[1280px] mx-auto px-6 pb-24 lg:flex lg:gap-20 items-start">
        {/* Sidebar TOC - Desktop */}
        <aside className="hidden lg:block w-[280px] sticky top-24 shrink-0 overflow-y-auto max-h-[calc(100vh-120px)] print:hidden">
          <div className="relative">
            <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-[24px] border-2 border-emerald-200/60" />
            <div className="relative rounded-[22px] border-2 border-slate-900/10 bg-white/90 p-6 shadow-[0_16px_40px_rgba(15,23,42,0.1)]">
              <div className="border-l border-slate-200 pl-6 space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 mb-6">
                  ON THIS PAGE
                </h4>
                {toc.map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    variant="ghost"
                    className={cn(
                      "block w-full text-left text-sm py-2 transition-all duration-300 justify-start h-auto font-normal",
                      activeSection === item.id
                        ? "text-slate-900 font-semibold pl-1 translate-x-1"
                        : "text-slate-500 hover:text-slate-700 pl-0",
                    )}
                  >
                    {item.label}
                  </Button>
                ))}
              </div>

              <div className="mt-12 pt-12 border-t border-slate-200 flex flex-col gap-4">
                <Button
                  onClick={() => window.print()}
                  variant="ghost"
                  className="flex items-center gap-3 text-sm text-slate-500 hover:text-slate-900 justify-start h-auto font-normal"
                >
                  <Icon name="Printer" size={16} />
                  Print this page
                </Button>
                <Button
                  onClick={() => window.print()}
                  variant="ghost"
                  className="flex items-center gap-3 text-sm text-slate-500 hover:text-slate-900 justify-start h-auto font-normal group relative"
                >
                  <Icon name="Download" size={16} />
                  <span>Download PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 max-w-[850px]">
          <header className="mb-20">
            {lastUpdated && (
              <div className="inline-block px-3 py-1 bg-white/80 backdrop-blur rounded-full text-[10px] font-bold text-slate-500 mb-6 uppercase tracking-wider border border-slate-200">
                Last Updated: {lastUpdated}
              </div>
            )}
            <h1 className="text-5xl md:text-6xl font-semibold text-slate-900 mb-8 tracking-tight font-space-grotesk">
              {title}
            </h1>
            {summary && (
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                {summary}
              </p>
            )}
          </header>

          {/* Mobile TOC Accordion */}
          <div className="lg:hidden mb-12 print:hidden">
            <div className="relative">
              <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border-2 border-emerald-200/60" />
              <Button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                variant="ghost"
                className="relative w-full flex items-center justify-between p-4 bg-white/90 backdrop-blur rounded-xl border-2 border-slate-900/10 h-auto font-semibold shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
              >
                <span className="text-sm font-semibold">Table of Contents</span>
                <Icon
                  name={isMobileMenuOpen ? "ChevronUp" : "ChevronDown"}
                  size={18}
                />
              </Button>
            </div>
            <AnimatePresence>
              {isMobileMenuOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden bg-white/80 backdrop-blur border-x border-b border-slate-200 rounded-b-xl"
                >
                  <div className="p-4 flex flex-col gap-3">
                    {toc.map((item) => (
                      <Button
                        key={item.id}
                        onClick={() => scrollToSection(item.id)}
                        variant="ghost"
                        className={cn(
                          "text-left text-sm py-1 transition-colors justify-start h-auto font-normal",
                          activeSection === item.id
                            ? "text-slate-900 font-semibold"
                            : "text-slate-500",
                        )}
                      >
                        {item.label}
                      </Button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="legal-content-body print:text-black print:p-0">
            {children}
          </div>

          <footer className="mt-32 pt-12 border-t border-slate-200 print:hidden text-center md:text-left">
            <p className="text-sm text-slate-500">
              Looking for something else? Visit our
              <Link href="/legal" className="text-slate-900 font-semibold underline">
                Legal Hub
              </Link>
              .
            </p>
          </footer>
        </main>
      </div>

      {/* Print Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          body {
            background: white !important;
            font-size: 12pt !important;
          }
          main {
            max-width: 100% !important;
            border: none !important;
            margin: 0 !important;
            padding: 0 !important;
            max-width: none !important;
          }
          .legal-content-body h2 {
            page-break-after: avoid;
          }
          .legal-content-body p,
          .legal-content-body li {
            page-break-inside: avoid;
          }
        }
      `,
        }}
      />
    </div>
  );
};
