import { describe, it, expect } from "vitest";
import {
  ALL_TEMPLATES,
  TEMPLATE_CATEGORIES,
} from "../../template-gallery/index";

describe("template gallery integrity", () => {
  it("each active category lists only templates that exist", () => {
    const byId = new Map(ALL_TEMPLATES.map((t) => [t.id, t]));
    for (const cat of TEMPLATE_CATEGORIES) {
      if (!cat.isActive) continue;
      expect(
        cat.templates.length,
        `category ${cat.slug} has no templates`,
      ).toBeGreaterThan(0);
      for (const id of cat.templates) {
        expect(
          byId.has(id),
          `category ${cat.slug} references missing template ${id}`,
        ).toBe(true);
      }
    }
  });

  it("every gallery template appears in at least one active category list", () => {
    const covered = new Set<string>();
    for (const cat of TEMPLATE_CATEGORIES) {
      if (!cat.isActive) continue;
      for (const id of cat.templates) {
        covered.add(id);
      }
    }
    for (const t of ALL_TEMPLATES) {
      expect(covered.has(t.id), `template ${t.id} is missing from TEMPLATE_CATEGORIES`).toBe(
        true,
      );
    }
  });
});
