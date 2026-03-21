import type { DesignCategory } from "@/components/vayva-ui/VayvaThemeProvider";
import type { SuggestedAction } from "@/services/dashboard-actions";
import type { DashboardAlert } from "@/services/dashboard-alerts";
interface ProductHealthItem {
    id: string;
    title: string;
    unitsSold?: number;
    stock?: number;
}
interface PrimaryObjectHealthProps {
    label: string;
    topSelling: ProductHealthItem[];
    lowStock: ProductHealthItem[];
    deadStock: ProductHealthItem[];
    isLoading?: boolean;
    designCategory: DesignCategory;
}
export declare function PrimaryObjectHealth({ label, topSelling, lowStock, deadStock, isLoading, designCategory, }: PrimaryObjectHealthProps): import("react/jsx-runtime").JSX.Element;
interface LiveOpsItem {
    key: string;
    label: string;
    value: number | string | null;
    icon: string;
    emptyText?: string;
}
interface LiveOperationsProps {
    title: string;
    items: LiveOpsItem[];
    isLoading?: boolean;
    designCategory: DesignCategory;
}
export declare function LiveOperations({ title, items, isLoading, designCategory, }: LiveOperationsProps): import("react/jsx-runtime").JSX.Element;
interface AlertsListProps {
    alerts: DashboardAlert[];
    isLoading?: boolean;
    designCategory: DesignCategory;
}
export declare function AlertsList({ alerts, isLoading, designCategory }: AlertsListProps): import("react/jsx-runtime").JSX.Element;
interface SuggestedActionsListProps {
    actions: SuggestedAction[];
    isLoading?: boolean;
    designCategory: DesignCategory;
}
export declare function SuggestedActionsList({ actions, isLoading, designCategory, }: SuggestedActionsListProps): import("react/jsx-runtime").JSX.Element;
export {};
