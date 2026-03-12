import { describe, it, expect } from "vitest";
import { TEMPLATE_CATEGORIES, CANONICAL_TEMPLATES, getTemplatesByCategory, } from "../../apps/merchant-admin/src/lib/templates-registry";
import { recommendTemplate, } from "../../apps/merchant-admin/src/lib/templates/recommendation-engine";
describe("Template Registry Integrity", () => {
    it("Hardening-01: Every category must have at least one template", () => {
        TEMPLATE_CATEGORIES.forEach((category) => {
            const templates = getTemplatesByCategory(category.slug);
            expect(templates.length, `Category ${category.slug} is empty`).toBeGreaterThan(0);
        });
    });
    it("Hardening-02: Every template in CANONICAL_TEMPLATES must belong to a valid category", () => {
        const categorySlugs = new Set(TEMPLATE_CATEGORIES.map((c) => c.slug));
        Object.values(CANONICAL_TEMPLATES).forEach((template) => {
            // Check if template.category matches strictly one of the slug types
            // Since we don't have runtime reflection of Typescript Unions, we rely on the registry's CATEGORIES array as source of truth.
            expect(categorySlugs.has(template.category), `Template ${template.id} has unknown category ${template.category}`).toBe(true);
        });
    });
    it("Hardening-03: Bidirectional mapping validity", () => {
        // Ensure that if a category claims to recommend a template, that template actually exists
        TEMPLATE_CATEGORIES.forEach((category) => {
            category.recommendedTemplates.forEach((templateId) => {
                const template = CANONICAL_TEMPLATES[templateId];
                expect(template, `Category ${category.slug} recommends non-existent template ${templateId}`).toBeDefined();
                expect(template.category, `Template ${templateId} is mapped to ${template?.category} but recommended by ${category.slug}`).toBe(category.slug);
            });
        });
    });
});
describe("Recommendation Engine Snapshots", () => {
    // Helper to create minimal state for testing
    const createTestState = (segment, secondary) => ({
        intent: {
            segment: segment,
            secondaryType: secondary,
            goals: [],
        },
    });
    const TEST_CASES = [
        { name: "Fashion Retail", state: createTestState("fashion-clothing") },
        { name: "Electronics", state: createTestState("electronics") },
        { name: "Beauty", state: createTestState("beauty") },
        { name: "Food Restaurant", state: createTestState("food-restaurant") },
        {
            name: "Services Consulting",
            state: createTestState("services-consulting"),
        },
        { name: "Groceries", state: createTestState("groceries") },
        { name: "Home Decor", state: createTestState("home-decor") },
    ];
    TEST_CASES.forEach(({ name, state }) => {
        it(`Hardening-04: Recommendation for ${name} is deterministic`, () => {
            const recommendation = recommendTemplate(state);
            // Snapshot the result. If logic changes (e.g. we change the recommended template for Fashion), this snapshot will fail, alerting us.
            expect(recommendation).toMatchSnapshot();
        });
    });
    it("Hardening-05: Returns null for unknown inputs", () => {
        const state = createTestState("unknown-segment");
        const recommendation = recommendTemplate(state);
        // Should fallback gracefully (null or default logic, currently engine returns null if no match)
        expect(recommendation).toBeNull();
    });
});
