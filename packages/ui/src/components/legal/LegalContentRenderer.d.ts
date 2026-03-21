import React from "react";
import { LegalDocument } from "@vayva/content";
interface LegalContentRendererProps {
    document: LegalDocument;
    className?: string;
    showTitle?: boolean;
}
export declare const LegalContentRenderer: React.FC<LegalContentRendererProps>;
export {};
