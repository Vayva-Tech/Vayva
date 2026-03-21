import React from "react";
interface AppShellProps {
    children: React.ReactNode;
    sidebar: React.ReactNode;
    header: React.ReactNode;
    className?: string;
}
export declare function AppShell({ children, sidebar, header, className, }: AppShellProps): import("react/jsx-runtime").JSX.Element;
export {};
