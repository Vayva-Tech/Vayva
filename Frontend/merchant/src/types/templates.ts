import { IndustrySlug } from "../lib/templates/types";

export interface ThemeSection {
  id: string;
  label: string;
  enabled: boolean;
  order?: number;
    settings?: Record<string, unknown>;
}

export interface ThemeConfig {
  sections?: ThemeSection[];
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  [key: string]: any; // Allow custom theme properties
}

export interface Template {
  id: string;
  displayName: string;
  slug: string;
  category: string;
  tier: string;
  description: string;
  bestFor: string;
  workflows: string[];
  configSchema?: {
    settings?: any[];
    sections?: any[];
  };
  industry?: IndustrySlug;
}
