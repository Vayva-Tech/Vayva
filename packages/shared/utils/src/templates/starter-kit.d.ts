/**
 * Vayva Starter Kit Metadata
 *
 * Defines design tokens, reusable sections, and template packs
 * for Webstudio integration.
 */
export declare const VAYVA_DESIGN_TOKENS: {
    readonly colors: {
        readonly background: "#0B0F0D";
        readonly surface: "#101814";
        readonly surface2: "#0E1411";
        readonly text: "#E9F5EE";
        readonly textMuted: "#A7BDB0";
        readonly border: "rgba(255,255,255,0.08)";
        readonly primary: "#22C55E";
        readonly glow: "0 0 20px rgba(34, 197, 94, 0.3)";
    };
    readonly typography: {
        readonly fontFamily: "Inter, sans-serif";
        readonly sizes: {
            readonly xs: "12px";
            readonly sm: "14px";
            readonly base: "16px";
            readonly lg: "18px";
            readonly xl: "24px";
            readonly "2xl": "32px";
            readonly "3xl": "40px";
        };
        readonly lineHeights: {
            readonly tight: 1.4;
            readonly normal: 1.6;
        };
    };
    readonly spacing: readonly [4, 8, 12, 16, 24, 32, 48, 64];
    readonly radius: {
        readonly sm: "12px";
        readonly md: "16px";
        readonly lg: "24px";
    };
    readonly shadows: {
        readonly card: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)";
        readonly glow: "0 0 30px rgba(34, 197, 94, 0.4)";
    };
};
export type VayvaSectionType = "HERO_A" | "HERO_B" | "PRODUCT_GRID" | "FEATURED_COLLECTION" | "TESTIMONIALS" | "PRICING" | "FAQ" | "CONTACT" | "FOOTER" | "HEADER";
export declare const CORE_SECTIONS: readonly [{
    readonly type: "HERO_A";
    readonly name: "Classic Hero";
    readonly description: "Headline, subcopy, CTA, and side image.";
}, {
    readonly type: "HERO_B";
    readonly name: "Centered Hero";
    readonly description: "Impactful centered headline with glow CTA.";
}, {
    readonly type: "PRODUCT_GRID";
    readonly name: "Product Grid";
    readonly description: "Responsive grid linking to Vayva products.";
}, {
    readonly type: "FEATURED_COLLECTION";
    readonly name: "Featured Collection";
    readonly description: "Highlight a specific product collection.";
}, {
    readonly type: "TESTIMONIALS";
    readonly name: "Testimonials";
    readonly description: "3-card social proof section.";
}, {
    readonly type: "PRICING";
    readonly name: "Pricing Plans";
    readonly description: "Compare service tiers and features.";
}, {
    readonly type: "FAQ";
    readonly name: "FAQ Accordion";
    readonly description: "Clean question and answer layout.";
}, {
    readonly type: "CONTACT";
    readonly name: "Contact Form";
    readonly description: "Direct inquiry form with map placeholder.";
}, {
    readonly type: "FOOTER";
    readonly name: "Vayva Footer";
    readonly description: "Sticky footer with links and payment badges.";
}, {
    readonly type: "HEADER";
    readonly name: "Vayva Nav";
    readonly description: "Sticky responsive navigation with CTA.";
}];
export declare const COMMERCE_ROUTES: {
    readonly shop: "/products";
    readonly product: "/products/[slug]";
    readonly cart: "/cart";
    readonly checkout: "/checkout";
    readonly trackOrder: "/order/track";
};
export type TemplatePack = {
    id: string;
    name: string;
    systemTemplateKey: string;
    pages: string[];
    sections: VayvaSectionType[];
};
export declare const TEMPLATE_PACKS: TemplatePack[];
//# sourceMappingURL=starter-kit.d.ts.map