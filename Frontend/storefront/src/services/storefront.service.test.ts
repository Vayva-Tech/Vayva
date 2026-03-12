import { describe, it, expect } from "vitest";
import { StorefrontService } from "./storefront.service";

describe("StorefrontService", () => {
  it("should be defined", () => {
    expect(StorefrontService).toBeDefined();
  });

  it("should have getStore method", () => {
    expect(typeof StorefrontService.getStore).toBe("function");
  });
});
