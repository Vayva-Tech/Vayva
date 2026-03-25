import React from "react";
import { notFound } from "next/navigation";
import { LegalPageLayout } from "@vayva/ui";
import { getLegalDocument, legalRegistry, type LegalDocument } from "@vayva/shared/content";

// Map URL slugs to actual document slugs in the registry
const SLUG_TO_REGISTRY_KEY: Record<string, string> = {
  "terms": "terms-of-service",
  "privacy": "privacy-policy",
  "cookies": "cookie-policy",
  "dpa": "data-processing-agreement",
  "data-processing-agreement": "data-processing-agreement",
  "acceptable-use": "acceptable-use",
  "prohibited-items": "prohibited-items",
  "refund-policy": "refund-policy",
  "kyc-safety": "kyc-explainer",
  "eula": "eula",
  "security": "security-policy",
  "copyright": "copyright-policy",
  "accessibility": "accessibility-statement",
  "merchant-agreement": "merchant-agreement",
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function LegalDocumentPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { slug } = await params;
  
  // Map slug to registry key
  const registryKey = SLUG_TO_REGISTRY_KEY[slug];
  
  if (!registryKey) {
    notFound();
  }
  
  try {
    const content = getLegalDocument(registryKey);
    
    if (!content) {
      notFound();
    }
    
    return (
      <LegalPageLayout
        title={content.title}
        description={content.summary}
        backLink={{ href: "/legal", label: "Back to Legal Hub" }}
      >
        <div className="max-w-4xl mx-auto">
          <article className="prose prose-slate max-w-none">
            {content.sections.map((section, idx) => (
              <div key={idx}>
                {section.heading && <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>}
                {section.content.map((paragraph, pIdx) => (
                  <p key={pIdx} className="mb-4">{paragraph}</p>
                ))}
                {section.list && (
                  <ul className="list-disc pl-6 mb-4">
                    {section.list.map((item, lIdx) => (
                      <li key={lIdx}>{item}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </article>
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Last updated: {content.lastUpdated || "Recently"}
            </p>
          </div>
        </div>
      </LegalPageLayout>
    );
  } catch (error) {
    console.error(`Failed to load legal document "${slug}":`, error);
    notFound();
  }
}
