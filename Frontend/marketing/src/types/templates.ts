// Types for marketing templates
export interface Template {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  category: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TemplateConfig {
  layout: 'default' | 'minimal' | 'full-width';
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
}

export type TemplateType = 'landing' | 'product' | 'checkout' | 'email';
