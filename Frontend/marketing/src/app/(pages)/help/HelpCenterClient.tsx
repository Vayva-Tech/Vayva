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

export function HelpCenterClient(): React.JSX.Element {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

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
    <div className="relative w-full min-w-0 overflow-x-hidden text-slate-900">
      {/* Hero — left-aligned, editorial */}
      <section className="pt-16 pb-6 px-4">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 min-w-0">
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-semibold text-slate-900 tracking-tight leading-[1.1] mb-4">
            {helpContent.heroTitle}
          </h1>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <p className="text-slate-600 text-base sm:text-lg max-w-lg shrink-0">
              <span className="md:hidden">Search or pick a topic—articles update as you type.</span>
              <span className="hidden md:inline">{helpContent.heroDescription}</span>
            </p>
            <div className="relative w-full md:w-[320px] shrink-0">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-slate-400 pointer-events-none z-10" />
              <input
                type="text"
                placeholder={helpContent.searchPlaceholder}
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setSearchQuery(e.target?.value);
                  if (e.target?.value.trim()) setActiveCategory(null);
                }}
                className="w-full pl-12 pr-5 py-3 rounded-xl border border-slate-200/80 bg-white focus:ring-2 focus:ring-emerald-500/30 outline-none text-[15px] transition-all text-slate-700 shadow-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Main: Sidebar + Content */}
      <section className="px-4 pb-28">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 min-w-0">
          <div className="grid lg:grid-cols-[220px_1fr_340px] gap-8 items-start min-w-0">
            {/* Left: Category Nav */}
            <nav className="hidden lg:block sticky top-28">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">Topics</p>
              <ul className="space-y-1">
                <li>
                  <Button
                    type="button"
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
                      type="button"
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
                    type="button"
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
                      <Link
                        key={article.id}
                        href={`/help/${article.slug}`}
                        className="group flex w-full items-start gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 text-left shadow-sm transition-colors hover:border-slate-300 hover:shadow-md"
                      >
                        <div className="mt-0.5 shrink-0 rounded-lg bg-white/70 p-2 text-slate-500 transition-colors group-hover:bg-emerald-100 group-hover:text-emerald-700">
                          <Icon
                            name={
                              (HELP_CATEGORIES.find(
                                (c: { name: string; icon: string }) => c.name === article.category,
                              )?.icon || "help-circle") as IconName
                            }
                            size={16}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-1 flex items-center gap-3">
                            <h3 className="text-[15px] font-semibold text-slate-900 transition-colors group-hover:text-emerald-700">
                              {article.title}
                            </h3>
                          </div>
                          <p className="line-clamp-1 text-sm text-slate-500">
                            {article.summary}
                          </p>
                        </div>
                        <ArrowRight
                          size={16}
                          className="mt-1.5 shrink-0 text-slate-300 transition-colors group-hover:text-emerald-600"
                          aria-hidden="true"
                        />
                      </Link>
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

      {/* Mobile AI Chat FAB */}
      <div className="lg:hidden fixed bottom-6 right-6 z-50">
        <Button
          type="button"
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
              type="button"
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
