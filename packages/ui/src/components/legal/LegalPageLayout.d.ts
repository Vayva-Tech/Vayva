import React from "react";
interface LegalPageLayoutProps {
    children: React.ReactNode;
    title: string;
    summary?: string;
    lastUpdated?: string;
    backLink?: {
        href: string;
        label: string;
    };
    toc?: {
        id: string;
        label: string;
    }[];
}
export declare const LegalPageLayout: React.FC<LegalPageLayoutProps>;
export {};
