import { TEMPLATE_REGISTRY } from "@/lib/templates-registry";
import type { TemplateEntry } from "@/lib/templates/types";

type TierLevel = "free" | "growth" | "pro";

interface TemplateSummary {
    id: string;
    name: string;
    slug: string;
    category: string;
    tier: string;
    description: string;
    bestFor: string;
    workflows: string[];
    setupTime: string;
    volume: string;
    teamSize: string;
    configures: string[];
    customizable: string[];
    previewImage: string;
    creates: {
        pages: string[];
        sections: string[];
        objects: string[];
    };
}

export const TEMPLATES: TemplateSummary[] = Object.values(TEMPLATE_REGISTRY).map((t: TemplateEntry) => ({
    id: t.templateId,
    name: t.displayName,
    slug: t.slug,
    category: t.industry,
    tier: t.requiredPlan,
    description: t.compare?.headline || "",
    bestFor: t.compare?.bestFor?.[0] || "Merchants",
    workflows: t.compare?.keyModules || [],
    setupTime: "5 minutes",
    volume: "any",
    teamSize: "any",
    configures: [],
    customizable: [],
    previewImage: t.preview?.thumbnailUrl || "/marketing/templates/simple-retail.png",
    creates: {
        pages: [],
        sections: [],
        objects: []
    }
}));

export function getTemplateBySlug(slug: string): TemplateSummary | undefined {
    return TEMPLATES.find((t) => t.slug === slug);
}

export function isTierAccessible(userTier: TierLevel, requiredTier: TierLevel): boolean {
    const tierHierarchy: Record<TierLevel, number> = {
        free: 0,
        growth: 1,
        pro: 2,
    };
    return tierHierarchy[userTier] >= tierHierarchy[requiredTier];
}
