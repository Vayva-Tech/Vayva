"use client";

import React, { useState } from "react";
import { Icon, type IconName, Button } from "@vayva/ui";
import Link from "next/link";
import {
  IconSearch as Search,
  IconArrowRight as ArrowRight,
  IconX as X,
  IconSparkles as Sparkles,
} from "@tabler/icons-react";
import { HELP_ARTICLES, HELP_CATEGORIES, type HelpArticle } from "@/lib/help";
import { HelpAIChat } from "@/components/marketing/HelpAIChat";
import { helpContent } from "@/data/marketing-content";

function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*/g, "")
    .replace(/ {2,}$/gm, "");
}

export function HelpCenterClient(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<HelpArticle | null>(
    null,
  );

  const filteredArticles = searchQuery.trim()
    ? HELP_ARTICLES.filter(
        (a: HelpArticle) =>
          a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.category?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : activeCategory
      ? HELP_ARTICLES.filter((a: HelpArticle) => a.category === activeCategory)
      : HELP_ARTICLES;

  return (
    <div className="relative overflow-hidden text-slate-900">
      {/* Hero — left-aligned, editorial */}
      <section className="pt-16 pb-6 px-4">
        <div className="max-w-[1600px] mx-auto px-6">
          <h1 className="text-4xl md:text-6xl font-semibold text-slate-900 tracking-tight leading-[1.1] mb-4">
            {helpContent.heroTitle}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <p className="text-slate-600 text-lg max-w-lg shrink-0">
              {helpContent.heroDescription}
            </p>
            <div className="relative w-full md:w-[320px] shrink-0">
              <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border-2 border-emerald-200/60" />
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  placeholder={helpContent.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    setSearchQuery(e.target?.value);
                    if (e.target?.value.trim()) setActiveCategory(null);
                  }}
                  className="w-full pl-12 pr-5 py-3 rounded-xl border-2 border-slate-900/10 bg-white/90 backdrop-blur-sm focus:ring-2 focus:ring-emerald-500/30 outline-none text-[15px] transition-all text-slate-700 shadow-[0_12px_28px_rgba(15,23,42,0.08)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main: Sidebar + Content */}
      <section className="px-4 pb-28">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="grid lg:grid-cols-[220px_1fr_340px] gap-8 items-start">
            {/* Left: Category Nav */}
            <nav className="hidden lg:block sticky top-28">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Topics</p>
              <ul className="space-y-1">
                <li>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setActiveCategory(null);
                      setSearchQuery("");
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium h-auto justify-start ${
                      !activeCategory && !searchQuery
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    All articles
                  </Button>
                </li>
                {HELP_CATEGORIES.map((cat: { name: string; icon: string }) => (
                  <li key={cat.name}>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setActiveCategory(cat.name);
                        setSearchQuery("");
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-2.5 h-auto justify-start ${
                        activeCategory === cat.name
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                      }`}
                    >
                      <Icon name={cat.icon as IconName} size={14} />
                      {cat.name}
                    </Button>
                  </li>
                ))}
              </ul>

              {/* Contact links */}
              <div className="mt-10 pt-6 border-t border-slate-200">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                  {helpContent.contactTitle}
                </p>
                {helpContent.contactLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 transition-colors py-1.5"
                  >
                    <Icon name={link.icon as IconName} size={14} />
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>

            {/* Mobile: Category selector */}
            <div className="lg:hidden mb-4">
              <select
                value={activeCategory || ""}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  setActiveCategory(e.target?.value || null);
                  setSearchQuery("");
                }}
                className="w-full px-4 py-3 rounded-xl bg-white/70 backdrop-blur-sm text-sm font-medium text-slate-700"
                aria-label="Select help topic"
              >
                <option value="">All articles</option>
                {HELP_CATEGORIES.map((cat: { name: string; icon: string }) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Center: Articles */}
            <div className="min-w-0">
              {filteredArticles.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="text-slate-500">
                    {helpContent.emptySearchDescription} &ldquo;{searchQuery}&rdquo;
                  </p>
                  <Button
                    variant="link"
                    onClick={() => {
                      setSearchQuery("");
                      setActiveCategory(null);
                    }}
                    className="text-emerald-600 font-semibold text-sm mt-2 h-auto p-0"
                  >
                    Clear search
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredArticles.map((article: HelpArticle) => (
                    <div key={article.id} className="relative">
                      <div className="absolute inset-0 translate-x-2 translate-y-2 rounded-2xl border-2 border-emerald-200/60" />
                      <Button
                        variant="ghost"
                        onClick={() => setSelectedArticle(article)}
                        className="relative group flex items-start gap-4 p-5 rounded-2xl border-2 border-slate-900/10 bg-white/90 hover:bg-white w-full text-left h-auto shadow-[0_14px_32px_rgba(15,23,42,0.08)]"
                      >
                        <div className="mt-0.5 p-2 rounded-lg bg-white/70 text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors shrink-0">
                          <Icon
                            name={
                              (HELP_CATEGORIES.find(
                                (c: { name: string; icon: string }) => c.name === article.category,
                              )?.icon || "help-circle") as IconName
                            }
                            size={16}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-1">
                            <h3 className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors text-[15px]">
                              {article.title}
                            </h3>
                          </div>
                          <p className="text-sm text-slate-500 line-clamp-1">
                            {article.summary}
                          </p>
                        </div>
                        <ArrowRight
                          size={16}
                          className="text-slate-300 group-hover:text-emerald-600 transition-colors mt-1.5 shrink-0"
                        />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right: AI Chat (Desktop) */}
            <div className="hidden lg:block">
              <div className="sticky top-28">
                <HelpAIChat />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Article Popup Modal */}
      {selectedArticle && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setSelectedArticle(null)}
        >
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <div className="relative" onClick={(e: unknown) => (e as React.MouseEvent).stopPropagation()}>
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[28px] border-2 border-emerald-200/60" />
            <div className="relative bg-white rounded-2xl border-2 border-slate-900/10 shadow-[0_24px_60px_rgba(15,23,42,0.12)] max-w-lg w-full max-h-[80vh] overflow-y-auto p-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSelectedArticle(null)}
              className="absolute top-4 right-4 h-9 w-9 rounded-lg text-slate-500 hover:text-slate-900"
              aria-label="Close article"
            >
              <X size={18} />
            </Button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-emerald-100 text-emerald-600">
                <Icon
                  name={
                    (HELP_CATEGORIES.find(
                      (c: { name: string; icon: string }) => c.name === selectedArticle.category,
                    )?.icon || "HelpCircle") as IconName
                  }
                  size={18}
                />
              </div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {selectedArticle.category}
              </span>
            </div>

            <h2 className="text-2xl font-semibold text-slate-900 mb-3 leading-tight">
              {selectedArticle.title}
            </h2>

            <p className="text-slate-500 text-sm mb-6">
              {selectedArticle.summary}
            </p>

            <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line">
              {stripMarkdown(selectedArticle.content)}
            </div>

            {selectedArticle.lastUpdated && (
              <p className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-500">
                Last updated:{" "}
                {new Date(selectedArticle.lastUpdated).toLocaleDateString(
                  "en-NG",
                  { year: "numeric", month: "long", day: "numeric" },
                )}
              </p>
            )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile AI Chat FAB */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsAiOpen(!isAiOpen)}
          className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition-transform"
          aria-label="Toggle AI support chat"
        >
          {isAiOpen ? <X size={22} /> : <Sparkles size={22} />}
        </Button>
      </div>

      {/* Mobile AI Chat Overlay */}
      {isAiOpen && (
        <div
          role="dialog"
          aria-label="AI support chat"
          aria-modal="true"
          className="lg:hidden fixed inset-0 z-[60] pt-16 px-4 bg-white/90 backdrop-blur-sm"
        >
          <div className="max-w-md mx-auto h-[85vh]">
            <HelpAIChat />
            <Button
              variant="ghost"
              onClick={() => setIsAiOpen(false)}
              className="w-full mt-3 py-3 text-slate-500 font-semibold text-sm rounded-xl h-auto"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
