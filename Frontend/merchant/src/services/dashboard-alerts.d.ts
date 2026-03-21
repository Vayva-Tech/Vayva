export interface DashboardAlert {
    id: string;
    title: string;
    message: string;
    severity: "info" | "warning" | "error" | "success" | "critical";
    link?: string;
    href?: string;
    createdAt?: Date;
}
export interface SuggestedAction {
    id: string;
    title: string;
    description?: string;
    reason?: string;
    message?: string;
    actionType?: string;
    priority?: string;
    severity?: string;
    link?: string;
    href?: string;
    icon?: string;
}
export declare function fetchSuggestedActions(storeId: string): Promise<SuggestedAction[]>;
