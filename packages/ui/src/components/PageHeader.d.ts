import * as React from "react";
import { type IconName } from "./Icon";
export type PageBreadcrumb = {
    label: string;
    href?: string;
};
export interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: PageBreadcrumb[];
    leadingIcon?: IconName;
    primaryAction?: {
        label: string;
        onClick: () => void;
        icon?: IconName;
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
        icon?: IconName;
    };
    rightSlot?: React.ReactNode;
    className?: string;
}
export declare function PageHeader({ title, description, breadcrumbs, leadingIcon, primaryAction, secondaryAction, rightSlot, className, }: PageHeaderProps): React.JSX.Element;
