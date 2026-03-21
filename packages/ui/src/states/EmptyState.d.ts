import * as React from "react";
import { IconName } from "../components/Icon";
interface EmptyStateProps {
    title: string;
    description: string;
    action?: React.ReactNode;
    actionLabel?: string;
    onAction?: () => void;
    icon?: IconName;
}
export declare function EmptyState({ title, description, action, actionLabel, onAction, icon, }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
export {};
