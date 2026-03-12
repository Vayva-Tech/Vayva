
export interface ExtensionSidebarItem {
    id: string;
    label: string;
    href: string;
    icon: string; // Icon name from @vayva/ui
    parentGroup?: "sales" | "ops" | "system" | string;
    permission?: string;
}

export interface ExtensionWidget {
    id: string;
    label: string;
    type: "large_stat" | "chart_line" | "list_activity" | "action_card";
    gridCols: 1 | 2 | 4;
    refreshIntervalMs?: number;
    apiEndpoint?: string; // Endpoint to fetch data for this widget
    icon?: string;
}

export interface ExtensionManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    category: "commerce" | "logistics" | "finance" | "industry" | "marketing" | "productivity";

    // UI Integration Points
    sidebarItems?: ExtensionSidebarItem[];
    dashboardWidgets?: ExtensionWidget[];

    // Object Schema Integration
    primaryObject?: string;
    forms?: Record<string, unknown>; // Form configuration for the objects it manages

    // Settings
    settingsSchema?: Record<string, unknown>; // JSON Schema for extension-specific settings
}

export interface StoreExtension {
    extensionId: string;
    isEnabled: boolean;
    config: Record<string, unknown>;
    installedAt: Date;
}
