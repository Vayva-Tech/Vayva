export interface ExtensionSidebarItem {
    id: string;
    label: string;
    href: string;
    icon: string;
    parentGroup?: "sales" | "ops" | "system" | string;
    permission?: string;
}
export interface ExtensionWidget {
    id: string;
    label: string;
    type: "large_stat" | "chart_line" | "list_activity" | "action_card";
    gridCols: 1 | 2 | 4;
    refreshIntervalMs?: number;
    apiEndpoint?: string;
    icon?: string;
}
export interface ExtensionManifest {
    id: string;
    name: string;
    version: string;
    description: string;
    category: "commerce" | "logistics" | "finance" | "industry" | "marketing" | "productivity";
    sidebarItems?: ExtensionSidebarItem[];
    dashboardWidgets?: ExtensionWidget[];
    primaryObject?: string;
    forms?: Record<string, unknown>;
    settingsSchema?: Record<string, unknown>;
}
export interface StoreExtension {
    extensionId: string;
    isEnabled: boolean;
    config: Record<string, unknown>;
    installedAt: Date;
}
//# sourceMappingURL=types.d.ts.map