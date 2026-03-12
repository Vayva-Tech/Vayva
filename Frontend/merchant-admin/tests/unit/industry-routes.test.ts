import { describe, it, expect } from "vitest";
import {
  isRouteAllowedForIndustry,
  getIndustryAllowedRoutes,
} from "@/lib/industry/allowed-routes";

describe("isRouteAllowedForIndustry", () => {
  // --- Null / missing industry → allow everything ---
  it("allows all routes when industrySlug is null", () => {
    expect(isRouteAllowedForIndustry("/dashboard/vehicles", null)).toBe(true);
    expect(isRouteAllowedForIndustry("/dashboard/nightlife/events", null)).toBe(
      true,
    );
  });

  // --- Universal routes always allowed ---
  it("allows universal routes for any industry", () => {
    const universals = [
      "/dashboard",
      "/dashboard/analytics",
      "/dashboard/account",
      "/dashboard/billing",
      "/dashboard/settings",
      "/dashboard/settings/profile",
      "/dashboard/settings/industry",
      "/dashboard/control-center",
      "/dashboard/autopilot",
      "/dashboard/extensions",
      "/dashboard/support",
      "/dashboard/support/new",
      "/dashboard/socials",
      "/dashboard/inbox",
      "/dashboard/referrals",
      "/dashboard/notifications",
      "/dashboard/setup-checklist",
      "/dashboard/wa-agent",
    ];

    for (const route of universals) {
      expect(isRouteAllowedForIndustry(route, "food")).toBe(true);
      expect(isRouteAllowedForIndustry(route, "automotive")).toBe(true);
      expect(isRouteAllowedForIndustry(route, "education")).toBe(true);
    }
  });

  // --- Food industry ---
  it("allows food-specific routes for food industry", () => {
    expect(isRouteAllowedForIndustry("/dashboard/menu-items", "food")).toBe(
      true,
    );
    expect(isRouteAllowedForIndustry("/dashboard/menu-items/new", "food")).toBe(
      true,
    );
    expect(
      isRouteAllowedForIndustry("/dashboard/menu-items/abc123", "food"),
    ).toBe(true);
    expect(isRouteAllowedForIndustry("/dashboard/kitchen", "food")).toBe(true);
    expect(isRouteAllowedForIndustry("/dashboard/orders", "food")).toBe(true);
  });

  it("blocks non-food routes for food industry", () => {
    expect(isRouteAllowedForIndustry("/dashboard/vehicles", "food")).toBe(
      false,
    );
    expect(isRouteAllowedForIndustry("/dashboard/properties", "food")).toBe(
      false,
    );
    expect(isRouteAllowedForIndustry("/dashboard/stays", "food")).toBe(false);
    expect(isRouteAllowedForIndustry("/dashboard/courses", "food")).toBe(false);
    expect(
      isRouteAllowedForIndustry("/dashboard/nightlife/events", "food"),
    ).toBe(false);
  });

  // --- Automotive industry ---
  it("allows automotive-specific routes", () => {
    expect(isRouteAllowedForIndustry("/dashboard/vehicles", "automotive")).toBe(
      true,
    );
    expect(
      isRouteAllowedForIndustry("/dashboard/vehicles/new", "automotive"),
    ).toBe(true);
    expect(
      isRouteAllowedForIndustry("/dashboard/vehicles/abc123", "automotive"),
    ).toBe(true);
    expect(isRouteAllowedForIndustry("/dashboard/leads", "automotive")).toBe(
      true,
    );
    expect(
      isRouteAllowedForIndustry("/dashboard/leads/abc123", "automotive"),
    ).toBe(true);
  });

  it("blocks non-automotive routes for automotive industry", () => {
    expect(
      isRouteAllowedForIndustry("/dashboard/menu-items", "automotive"),
    ).toBe(false);
    expect(isRouteAllowedForIndustry("/dashboard/kitchen", "automotive")).toBe(
      false,
    );
    expect(isRouteAllowedForIndustry("/dashboard/stays", "automotive")).toBe(
      false,
    );
    expect(isRouteAllowedForIndustry("/dashboard/bookings", "automotive")).toBe(
      false,
    );
  });

  // --- Real estate industry ---
  it("allows real estate routes", () => {
    expect(
      isRouteAllowedForIndustry("/dashboard/properties", "real_estate"),
    ).toBe(true);
    expect(
      isRouteAllowedForIndustry("/dashboard/properties/new", "real_estate"),
    ).toBe(true);
    expect(
      isRouteAllowedForIndustry("/dashboard/viewings", "real_estate"),
    ).toBe(true);
  });

  it("blocks non-real-estate routes", () => {
    expect(
      isRouteAllowedForIndustry("/dashboard/vehicles", "real_estate"),
    ).toBe(false);
    expect(
      isRouteAllowedForIndustry("/dashboard/menu-items", "real_estate"),
    ).toBe(false);
    expect(isRouteAllowedForIndustry("/dashboard/orders", "real_estate")).toBe(
      false,
    );
  });

  // --- Education industry ---
  it("allows education routes", () => {
    expect(isRouteAllowedForIndustry("/dashboard/courses", "education")).toBe(
      true,
    );
    expect(
      isRouteAllowedForIndustry("/dashboard/courses/new", "education"),
    ).toBe(true);
    expect(
      isRouteAllowedForIndustry("/dashboard/enrollments", "education"),
    ).toBe(true);
  });

  // --- Nightlife industry ---
  it("allows nightlife routes", () => {
    expect(
      isRouteAllowedForIndustry("/dashboard/nightlife/events", "nightlife"),
    ).toBe(true);
    expect(
      isRouteAllowedForIndustry("/dashboard/nightlife/events/new", "nightlife"),
    ).toBe(true);
    expect(
      isRouteAllowedForIndustry(
        "/dashboard/nightlife/events/abc123",
        "nightlife",
      ),
    ).toBe(true);
  });

  // --- Retail industry (commerce) ---
  it("allows standard commerce routes for retail", () => {
    expect(isRouteAllowedForIndustry("/dashboard/products", "retail")).toBe(
      true,
    );
    expect(isRouteAllowedForIndustry("/dashboard/products/new", "retail")).toBe(
      true,
    );
    expect(isRouteAllowedForIndustry("/dashboard/orders", "retail")).toBe(true);
    expect(
      isRouteAllowedForIndustry("/dashboard/orders/abc123", "retail"),
    ).toBe(true);
    expect(isRouteAllowedForIndustry("/dashboard/fulfillment", "retail")).toBe(
      true,
    );
    expect(isRouteAllowedForIndustry("/dashboard/inventory", "retail")).toBe(
      true,
    );
    expect(isRouteAllowedForIndustry("/dashboard/marketing", "retail")).toBe(
      true,
    );
    expect(isRouteAllowedForIndustry("/dashboard/finance", "retail")).toBe(
      true,
    );
  });

  it("blocks non-retail routes for retail", () => {
    expect(isRouteAllowedForIndustry("/dashboard/menu-items", "retail")).toBe(
      false,
    );
    expect(isRouteAllowedForIndustry("/dashboard/kitchen", "retail")).toBe(
      false,
    );
    expect(isRouteAllowedForIndustry("/dashboard/vehicles", "retail")).toBe(
      false,
    );
    expect(isRouteAllowedForIndustry("/dashboard/stays", "retail")).toBe(false);
    expect(
      isRouteAllowedForIndustry("/dashboard/nightlife/events", "retail"),
    ).toBe(false);
  });

  // --- B2B industry ---
  it("allows B2B-specific routes", () => {
    expect(
      isRouteAllowedForIndustry("/dashboard/wholesale-catalog", "b2b"),
    ).toBe(true);
    expect(isRouteAllowedForIndustry("/dashboard/quotes", "b2b")).toBe(true);
  });
});

describe("getIndustryAllowedRoutes", () => {
  it("returns null for null industry", () => {
    expect(getIndustryAllowedRoutes(null)).toBeNull();
  });

  it("returns a Set for valid industry", () => {
    const routes = getIndustryAllowedRoutes("food");
    expect(routes).toBeInstanceOf(Set);
    expect(routes!.has("/dashboard")).toBe(true);
    expect(routes!.has("/dashboard/menu-items")).toBe(true);
    expect(routes!.has("/dashboard/kitchen")).toBe(true);
  });

  it("includes universal routes for all industries", () => {
    const routes = getIndustryAllowedRoutes("automotive");
    expect(routes!.has("/dashboard/analytics")).toBe(true);
    expect(routes!.has("/dashboard/settings")).toBe(true);
    expect(routes!.has("/dashboard/account")).toBe(true);
  });
});
