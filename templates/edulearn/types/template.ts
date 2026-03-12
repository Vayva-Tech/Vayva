export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  category: string;
  industries: string[];
  features: {
    courses: boolean;
    workshops: boolean;
    community: boolean;
    store: boolean;
    certificates: boolean;
    challenges: boolean;
    progressTracking: boolean;
    mentorProfiles: boolean;
  };
  theme: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      success: string;
      warning: string;
      info: string;
    };
    fonts: {
      heading: string;
      body: string;
    };
    borderRadius: string;
  };
  navigation: {
    sidebar: NavItem[];
    resources: NavItem[];
  };
  editableRegions: string[];
  database: {
    tables: string[];
  };
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}

export interface TenantConfig {
  tenantId: string;
  templateId: string;
  name: string;
  logo?: string;
  colors?: Partial<TemplateConfig["theme"]["colors"]>;
  fonts?: Partial<TemplateConfig["theme"]["fonts"]>;
  features?: Partial<TemplateConfig["features"]>;
  customDomain?: string;
  enabled: boolean;
}
