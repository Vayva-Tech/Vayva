"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getArticleBySlug } from "@/lib/help";
import { Button } from "@vayva/ui";

export default function HelpArticlePage(): React.JSX.Element {
  const params = useParams();
  const slug = params?.slug as string;
  const article = getArticleBySlug(slug);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Article not found
          </h1>
          <Link href="/help">
            <Button>Back to Help Center</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pt-32 pb-24 px-4">
      <div className="max-w-[1600px] mx-auto px-6">
        <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground font-medium">
          <Link
            href="/help"
            className="hover:text-foreground transition-colors"
          >
            Help Center
          </Link>
          <span>/</span>
          <span className="text-foreground">{article.category}</span>
        </nav>

        <article className="prose prose-slate prose-lg max-w-none">
          <span className="text-primary text-xs font-bold uppercase tracking-wider">
            {article.category}
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-foreground mb-4 leading-tight">
            {article.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-12 font-medium leading-relaxed">
            {article.summary}
          </p>

          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[32px] border-2 border-emerald-200/60" />
            <div className="relative p-8 bg-white/90 rounded-3xl border-2 border-slate-900/10 text-foreground/80 leading-relaxed space-y-6 shadow-[0_22px_55px_rgba(15,23,42,0.12)]">
            {/* 
                          In a real app, this would use a markdown renderer like react-markdown.
                          For now, we'll split by double newline to simulate paragraphs/headers.
                        */}
            {article?.content?.split("\n").map((line: string, i: number) => {
              const clean = line
                .replace(/\*\*/g, "")
                .replace(/ {2,}$/g, "")
                .trim();
              if (
                line.trim().startsWith("###") ||
                line.trim().startsWith("##") ||
                line.trim().startsWith("#")
              ) {
                return (
                  <h3
                    key={i}
                    className="text-2xl font-bold text-foreground mt-8 mb-4"
                  >
                    {clean.replace(/^#{1,6}\s*/, "")}
                  </h3>
                );
              }
              if (
                clean.startsWith("1.") ||
                clean.startsWith("-") ||
                /^[0-9]+\./.test(clean)
              ) {
                return (
                  <li key={i} className="ml-4 mb-2">
                    {clean.replace(/^[0-9]+\.\s*/, "").replace(/^-\s*/, "")}
                  </li>
                );
              }
              if (clean === "") return null;
              return <p key={i}>{clean}</p>;
            })}
          </div>
          </div>
        </article>

        <div className="mt-16 pt-12 border-t border-border flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-sm text-muted-foreground">
            Last updated: <strong>{article.lastUpdated}</strong>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-bold text-foreground">
              Was this helpful?
            </span>
            <div className="flex gap-2">
              <Button className="px-4 py-2 rounded-lg border border-border hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all text-sm font-bold">
                Yes
              </Button>
              <Button className="px-4 py-2 rounded-lg border border-border hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all text-sm font-bold">
                No
              </Button>
            </div>
          </div>
        </div>

        {/* Sticky Contact Bar */}
        <div className="mt-24">
          <div className="relative">
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[30px] border-2 border-emerald-200/60" />
            <div className="relative p-8 bg-white/90 rounded-3xl border-2 border-slate-900/10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
              <div>
                <h4 className="font-bold text-foreground">Still Stuck?</h4>
                <p className="text-sm text-muted-foreground">
                  Get in touch with an expert who can walk you through it.
                </p>
              </div>
              <a
                href="mailto:support@vayva.ng"
                className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg transition-all hover:scale-105"
              >
                Talk to Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
