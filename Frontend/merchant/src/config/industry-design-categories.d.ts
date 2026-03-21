import type { DesignCategory } from "@/components/vayva-ui/VayvaThemeProvider";
export declare const INDUSTRY_DESIGN_CATEGORIES: Record<string, DesignCategory>;
export declare const DESIGN_CATEGORY_LABELS: Record<DesignCategory, string>;
export declare const DEFAULT_PRESETS: Record<DesignCategory, string>;
export declare function getDesignCategoryForIndustry(industrySlug: string): DesignCategory;
export declare function getDefaultPresetForCategory(category: DesignCategory): string;
export declare function hasDesignCategoryOverride(industrySlug: string): boolean;
