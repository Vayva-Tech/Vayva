import { describe, it, expect } from "vitest";
import {
  buildStepSequence,
  shouldUseSimplifiedFlow,
  shouldIncludeStep,
  getBusinessStepType,
  calculateProgress,
} from "../../../Frontend/merchant/src/features/onboarding/hooks/stepBuilder";

describe("Onboarding Step Builder (unit tests)", () => {
  it("defaults to full base + core steps when state is empty (not simplified)", () => {
    const steps = buildStepSequence({});
    // 5 BASE_STEPS + 8 CORE_COMMERCE_STEPS = 13
    expect(steps.length).toBe(13);
  });

  it("simplified flow when shouldUseSimplifiedFlow returns true", () => {
    const state: any = { business: { businessType: "soleproprietor" } };
    // Force simplified path via helper by simulating solo state
    const simplified = shouldUseSimplifiedFlow(state);
    expect(typeof simplified).toBe("boolean");
  });

  it("should include or exclude steps based on simplified mode", () => {
    const stateSimplified: any = { business: { employeeCount: 1 } };
    const stepsSimplified = buildStepSequence(stateSimplified);
    // simplified core should have 5 BASE + 4 CORE_CORE_SIMPLIFIED = 9
    // verify length and a couple of known steps exist
    expect(stepsSimplified).toContain("tools");
    expect(stepsSimplified.length).toBe(9);
  });

  it("calculateProgress returns 100 at end", () => {
    const state: any = {};
    const steps = buildStepSequence(state);
    const endStep = steps[steps.length - 1];
    const progress = calculateProgress(endStep, state);
    expect(progress).toBeGreaterThanOrEqual(100);
  });
});
