// Control Center Engine - Core business logic for store configuration and appearance
import { apiJson } from "@/lib/api-client-shared";
import { logEngineError } from "@/lib/engines/log-engine-error";

export interface StoreSettings {
  id: string;
  name: string;
  description: string;
  logo?: string;
  favicon?: string;
  contact: {
    email: string;
    phone?: string;
    address?: string;
  };
  socialMedia: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp?: string;
  };
  businessInfo: {
    registrationNumber?: string;
    taxId?: string;
    businessType: string;
  };
  preferences: {
    currency: string;
    timezone: string;
    dateFormat: string;
    timeFormat: string;
    language: string;
  };
  domains: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ThemeSettings {
  id: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  borderRadius: string;
  buttonStyle: 'rounded' | 'square' | 'pill';
  headerStyle: 'minimal' | 'bold' | 'elegant';
  footerStyle: 'simple' | 'detailed' | 'minimal';
  customCss?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationMenu {
  id: string;
  name: string;
  items: NavigationItem[];
  location: 'header' | 'footer' | 'sidebar';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NavigationItem {
  id: string;
  title: string;
  url: string;
  type: 'link' | 'dropdown' | 'megamenu';
  parentId?: string;
  children?: NavigationItem[];
  icon?: string;
  target: '_self' | '_blank';
  sortOrder: number;
}

export class ControlCenterEngine {
  // Store Settings
  static async getStoreSettings(): Promise<StoreSettings> {
    try {
      return await apiJson<StoreSettings>('/api/control-center/settings');
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_GET_STORE_SETTINGS]', error);
      throw error;
    }
  }

  static async updateStoreSettings(updates: Partial<StoreSettings>): Promise<StoreSettings> {
    try {
      return await apiJson<StoreSettings>('/api/control-center/settings', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_UPDATE_STORE_SETTINGS]', error);
      throw error;
    }
  }

  // Theme Settings
  static async getThemeSettings(): Promise<ThemeSettings> {
    try {
      return await apiJson<ThemeSettings>('/api/control-center/theme');
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_GET_THEME_SETTINGS]', error);
      throw error;
    }
  }

  static async updateThemeSettings(updates: Partial<ThemeSettings>): Promise<ThemeSettings> {
    try {
      return await apiJson<ThemeSettings>('/api/control-center/theme', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_UPDATE_THEME_SETTINGS]', error);
      throw error;
    }
  }

  static async resetThemeToDefault(): Promise<ThemeSettings> {
    try {
      return await apiJson<ThemeSettings>('/api/control-center/theme/reset', {
        method: 'POST',
      });
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_RESET_THEME]', error);
      throw error;
    }
  }

  // Navigation
  static async getAllMenus(): Promise<NavigationMenu[]> {
    try {
      return await apiJson<NavigationMenu[]>('/api/control-center/navigation');
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_GET_MENUS]', error);
      throw error;
    }
  }

  static async getMenuById(id: string): Promise<NavigationMenu> {
    try {
      return await apiJson<NavigationMenu>(`/api/control-center/navigation/${id}`);
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_GET_MENU]', error);
      throw error;
    }
  }

  static async createMenu(menu: Omit<NavigationMenu, 'id' | 'createdAt' | 'updatedAt'>): Promise<NavigationMenu> {
    try {
      return await apiJson<NavigationMenu>('/api/control-center/navigation', {
        method: 'POST',
        body: JSON.stringify(menu),
      });
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_CREATE_MENU]', error);
      throw error;
    }
  }

  static async updateMenu(id: string, updates: Partial<NavigationMenu>): Promise<NavigationMenu> {
    try {
      return await apiJson<NavigationMenu>(`/api/control-center/navigation/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_UPDATE_MENU]', error);
      throw error;
    }
  }

  static async deleteMenu(id: string): Promise<void> {
    try {
      await apiJson(`/api/control-center/navigation/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_DELETE_MENU]', error);
      throw error;
    }
  }

  static async reorderMenuItems(menuId: string, items: NavigationItem[]): Promise<NavigationMenu> {
    try {
      return await apiJson<NavigationMenu>(`/api/control-center/navigation/${menuId}/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ items }),
      });
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_REORDER_MENU_ITEMS]', error);
      throw error;
    }
  }

  // Domains
  static async getAllDomains(): Promise<{ domains: string[]; primaryDomain: string }> {
    try {
      return await apiJson('/api/control-center/domains');
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_GET_DOMAINS]', error);
      throw error;
    }
  }

  static async addDomain(domain: string): Promise<{ domains: string[] }> {
    try {
      return await apiJson('/api/control-center/domains', {
        method: 'POST',
        body: JSON.stringify({ domain }),
      });
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_ADD_DOMAIN]', error);
      throw error;
    }
  }

  static async removeDomain(domain: string): Promise<{ domains: string[] }> {
    try {
      return await apiJson('/api/control-center/domains', {
        method: 'DELETE',
        body: JSON.stringify({ domain }),
      });
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_REMOVE_DOMAIN]', error);
      throw error;
    }
  }

  static async setPrimaryDomain(domain: string): Promise<{ primaryDomain: string }> {
    try {
      return await apiJson('/api/control-center/domains/primary', {
        method: 'PATCH',
        body: JSON.stringify({ domain }),
      });
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_SET_PRIMARY_DOMAIN]', error);
      throw error;
    }
  }

  // Business Hours
  static async getBusinessHours(): Promise<unknown> {
    try {
      return await apiJson('/api/control-center/business-hours');
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_GET_BUSINESS_HOURS]', error);
      throw error;
    }
  }

  static async updateBusinessHours(hours: unknown): Promise<unknown> {
    try {
      return await apiJson('/api/control-center/business-hours', {
        method: 'PATCH',
        body: JSON.stringify(hours),
      });
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_UPDATE_BUSINESS_HOURS]', error);
      throw error;
    }
  }

  // Analytics and Health
  static async getStoreHealth(): Promise<{
    online: boolean;
    performanceScore: number;
    seoScore: number;
    securityScore: number;
    lastUpdated: string;
  }> {
    try {
      return await apiJson('/api/control-center/health');
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_GET_STORE_HEALTH]', error);
      throw error;
    }
  }

  static async getStoreAnalytics(period: '7d' | '30d' | '90d'): Promise<{
    visitors: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: number;
    topPages: Array<{ url: string; views: number }>;
  }> {
    try {
      return await apiJson(`/api/control-center/analytics?period=${period}`);
    } catch (error) {
      logEngineError('[CONTROL_ENGINE_GET_STORE_ANALYTICS]', error);
      throw error;
    }
  }
}