"use client";

import type React from "react";
import type { LegalDocument, LegalSection } from "@vayva/content";
import { cn } from "../../utils";

interface LegalContentRendererProps {
  document: LegalDocument;
  className?: string;
  showTitle?: boolean;
}

export const LegalContentRenderer: React.FC<LegalContentRendererProps> = ({
  document: doc,
  className,
  showTitle = false,
}) => {
  return (
    <div className={cn("space-y-16 max-w-none prose prose-slate", className)}>
      {showTitle && (
        <header className="mb-20">
          <h1
            className="text-4xl md:text-5xl font-bold text-black mb-6 tracking-tight"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            {doc.title}
          </h1>
          <p className="text-xl text-gray-500 leading-relaxed font-medium">
            {doc.summary}
          </p>
        </header>
      )}

      <div className="flex flex-col gap-12">
        {doc.sections.map((section, idx) => (
          <SectionRenderer key={idx} section={section} id={`section-${idx}`} />
        ))}
      </div>
    </div>
  );
};

const SectionRenderer = ({
  section,
  id,
}: {
  section: LegalSection;
  id: string;
}) => {
  const isCallout =
    section.type === "callout-important" || section.type === "callout-nigeria";
  const isDefinitions = section.type === "definitions";

  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-32",
        isCallout ? "p-8 md:p-10 rounded-2xl border" : "",
        section.type === "callout-important"
          ? "bg-[#F7F7F7] border-[#E6E6E6]"
          : "",
        section.type === "callout-nigeria"
          ? "bg-green-50/50 border-green-100"
          : "",
      )}
    >
      {section.heading && (
        <div className="flex items-center gap-3 mb-6 group">
          <h2 className="text-2xl md:text-3xl font-bold text-[#0B0B0B] tracking-tight m-0">
            {section.heading}
          </h2>
          <a
            href={`#${id}`}
            aria-hidden="true"
            tabIndex={-1}
            className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-black transition-all cursor-pointer text-xl select-none"
          >
            #
          </a>
        </div>
      )}

      <div
        className={cn(
          "space-y-6 text-gray-700 font-normal",
          isDefinitions ? "grid md:grid-cols-2 gap-8 space-y-0" : "",
        )}
      >
        {/* Render content as paragraphs or definitions */}
        {section.content.map((paragraph, idx) => {
          const parsed = parseMarkdown(paragraph);

          if (isDefinitions && paragraph.includes(":")) {
            const [term, ...defParts] = paragraph.split(":");
            const def = defParts.join(":");
            return (
              <div
                key={idx}
                className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <strong
                  className="block text-black text-sm uppercase tracking-wider mb-2"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(term) }}
                />
                <p
                  className="text-sm leading-relaxed text-gray-500 m-0"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(def) }}
                />
              </div>
            );
          }

          return (
            <p
              key={idx}
              className="text-[17px] md:text-[18px] leading-[1.8] m-0"
              dangerouslySetInnerHTML={{ __html: parsed }}
            />
          );
        })}

        {/* If definitions are stored in the list property, handle them here */}
        {isDefinitions &&
          section.list &&
          section.list.map((item, idx) => {
            if (item.includes(":")) {
              const [term, ...defParts] = item.split(":");
              const def = defParts.join(":");
              return (
                <div
                  key={`list-def-${idx}`}
                  className="p-5 bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <strong
                    className="block text-black text-sm uppercase tracking-wider mb-2"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(term) }}
                  />
                  <p
                    className="text-sm leading-relaxed text-gray-500 m-0"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(def) }}
                  />
                </div>
              );
            }
            return null;
          })}
      </div>

      {section.list && !isDefinitions && (
        <ul className="mt-8 space-y-4 list-none p-0">
          {section.list.map((item, idx) => (
            <li
              key={idx}
              className="flex gap-4 text-[17px] md:text-[18px] leading-[1.8] text-gray-700"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-black mt-3 shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: parseMarkdown(item) }} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

const parseMarkdown = (text: string) => {
  let p = text.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="text-black font-bold">$1</strong>',
  );
  p = p.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" target="_blank" class="text-[#0D1D1E] font-medium underline hover:text-black">$1</a>',
  );
  return p;
};
