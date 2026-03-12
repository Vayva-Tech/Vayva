export interface Template {
  id: string;
  name: string;
  content: string;
  variables: readonly string[];
}

export interface TemplateCategory {
  id: string;
  name: string;
  templates: Template[];
}