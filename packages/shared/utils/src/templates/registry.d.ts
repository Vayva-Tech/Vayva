/**
 * System Template Registry
 *
 * Single source of truth for all built-in storefront templates.
 * Folder names match `apps/storefront/src/templates/<key>/`.
 */
export type SystemTemplate = {
    key: string;
    name: string;
    category: string;
    description?: string;
    thumbnailPath: string;
};
/**
 * Standard for Template Thumbnails (Wix-like premium feel)
 */
export declare const TEMPLATE_THUMBNAIL_STANDARDS: {
    readonly aspectRatio: "16:10";
    readonly background: "#0B0F0D";
    readonly elements: readonly ["Hero", "Product Grid", "Green Glow CTA"];
};
export declare const SYSTEM_TEMPLATES: SystemTemplate[];
export declare const SYSTEM_TEMPLATE_COUNT: number;
export declare function getSystemTemplateByKey(key: string): SystemTemplate | undefined;
export declare function getSystemTemplateCategories(): string[];
//# sourceMappingURL=registry.d.ts.map