import * as React from "react";
export interface SectionCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    description?: string;
    headerRight?: React.ReactNode;
    children: React.ReactNode;
}
export declare function SectionCard({ title, description, headerRight, children, className, ...props }: SectionCardProps): React.JSX.Element;
