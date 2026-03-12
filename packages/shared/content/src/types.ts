export interface LegalSection {
  heading?: string;
  content: string[]; // Paragraphs. For formatting, use simple markdown-like syntax if needed, or just strings.
  list?: string[];
  type?:
    | "text"
    | "list"
    | "callout-important"
    | "callout-nigeria"
    | "definitions";
}

export interface LegalDocument {
  slug: string; // e.g., 'terms-of-service'
  title: string;
  summary: string;
  lastUpdated: string; // ISO Date or formatted string
  sections: LegalSection[];
  version?: string;
}

export interface LegalRegistry {
  [key: string]: LegalDocument;
}
