import { prisma } from "@vayva/db";
import crypto from "crypto";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma as any;

export interface ABTest {
  id: string;
  storeId: string;
  name: string;
  type: "product_price" | "product_title" | "product_image" | "checkout_flow" | "landing_page" | "cta_button";
  targetId: string; // productId, pageId, etc
  status: "draft" | "running" | "paused" | "completed";
  startDate?: Date;
  endDate?: Date;
  trafficSplit: number; // 50 for 50/50
  confidenceLevel: number; // 95 for 95%
  minSampleSize: number;
  winningVariantId?: string;
  autoStop: boolean;
  createdAt: Date;
}

export interface ABVariant {
  id: string;
  testId: string;
  name: string; // "Control", "Variant A", etc
  isControl: boolean;
  changes: Array<{
    field: string;
    originalValue: string;
    newValue: string;
  }>;
  trafficWeight: number; // percentage
  // Stats
  impressions: number;
  conversions: number;
  revenue: number;
  conversionRate: number;
  liftVsControl?: number;
  confidence?: number;
  isWinner: boolean;
}

export interface TestResult {
  testId: string;
  status: "inconclusive" | "winner_found" | "needs_more_data";
  winner?: ABVariant;
  control: ABVariant;
  variants: ABVariant[];
  recommendation: string;
  confidence: number;
  duration: number; // days running
}

export class ABTestingService {
  private readonly DEFAULT_CONFIDENCE = 0.95;
  private readonly DEFAULT_MIN_SAMPLE = 100;

  /**
   * Create a new A/B test
   */
  async createTest(
    storeId: string,
    data: {
      name: string;
      type: ABTest["type"];
      targetId: string;
      trafficSplit?: number;
      confidenceLevel?: number;
      autoStop?: boolean;
    }
  ): Promise<ABTest> {
    const test = await db.aBTest.create({
      data: {
        storeId,
        name: data.name,
        type: data.type,
        targetId: data.targetId,
        status: "draft",
        trafficSplit: data.trafficSplit || 50,
        confidenceLevel: data.confidenceLevel || this.DEFAULT_CONFIDENCE,
        minSampleSize: this.DEFAULT_MIN_SAMPLE,
        autoStop: data.autoStop ?? true,
      },
    });

    return this.mapTest(test);
  }

  /**
   * Add variant to test
   */
  async addVariant(
    testId: string,
    data: {
      name: string;
      isControl?: boolean;
      changes: ABVariant["changes"];
      trafficWeight?: number;
    }
  ): Promise<ABVariant> {
    const test = await db.aBTest.findUnique({ where: { id: testId } });
    if (!test) throw new Error("Test not found");

    const variant = await db.aBVariant.create({
      data: {
        testId,
        name: data.name,
        isControl: data.isControl || false,
        changes: data.changes,
        trafficWeight: data.trafficWeight || (data.isControl ? 50 : 50),
        impressions: 0,
        conversions: 0,
        revenue: 0,
        conversionRate: 0,
        isWinner: false,
      },
    });

    return this.mapVariant(variant);
  }

  /**
   * Start a test
   */
  async startTest(testId: string): Promise<ABTest> {
    const test = await db.aBTest.findUnique({
      where: { id: testId },
      include: { variants: true },
    });

    if (!test) throw new Error("Test not found");
    if (test.variants.length < 2) throw new Error("Need at least 2 variants");
    if (!test.variants.some((v: Record<string, unknown>) => v.isControl)) {
      throw new Error("Need a control variant");
    }

    const updated = await db.aBTest.update({
      where: { id: testId },
      data: {
        status: "running",
        startDate: new Date(),
      },
    });

    return this.mapTest(updated);
  }

  /**
   * Assign variant to user/session
   */
  async assignVariant(
    testId: string,
    sessionId: string
  ): Promise<{ variant: ABVariant; shouldTrack: boolean }> {
    const test = await db.aBTest.findUnique({
      where: { id: testId },
      include: { variants: true },
    });

    if (!test || test.status !== "running") {
      throw new Error("Test not running");
    }

    // Check existing assignment
    const existing = await db.aBAssignment.findUnique({
      where: { testId_sessionId: { testId, sessionId } },
      include: { variant: true },
    });

    if (existing) {
      return { variant: this.mapVariant(existing.variant), shouldTrack: false };
    }

    // Weighted random selection
    const variants = test.variants as Array<Record<string, unknown>>;
    const totalWeight = variants.reduce((sum, v) => sum + Number(v.trafficWeight || 0), 0);
    let random = Math.random() * totalWeight;

    let selected = variants[0];
    for (const variant of variants) {
      random -= Number(variant.trafficWeight || 0);
      if (random <= 0) {
        selected = variant;
        break;
      }
    }

    // Create assignment
    await db.aBAssignment.create({
      data: {
        testId,
        variantId: String(selected.id),
        sessionId,
        assignedAt: new Date(),
      },
    });

    return { variant: this.mapVariant(selected), shouldTrack: true };
  }

  /**
   * Track impression
   */
  async trackImpression(variantId: string): Promise<void> {
    await db.aBVariant.update({
      where: { id: variantId },
      data: { impressions: { increment: 1 } },
    });
  }

  /**
   * Track conversion
   */
  async trackConversion(
    testId: string,
    sessionId: string,
    data: { orderId?: string; revenue?: number }
  ): Promise<void> {
    const assignment = await db.aBAssignment.findUnique({
      where: { testId_sessionId: { testId, sessionId } },
    });

    if (!assignment || assignment.converted) return;

    // Mark as converted
    await db.aBAssignment.update({
      where: { id: assignment.id },
      data: { converted: true, convertedAt: new Date(), orderId: data.orderId },
    });

    // Update variant stats
    await db.aBVariant.update({
      where: { id: assignment.variantId },
      data: {
        conversions: { increment: 1 },
        revenue: { increment: data.revenue || 0 },
      },
    });

    // Recalculate rates
    await this.updateVariantStats(assignment.variantId);

    // Check if we should auto-stop
    const test = await db.aBTest.findUnique({ where: { id: testId } });
    if (test?.autoStop) {
      await this.checkForWinner(testId);
    }
  }

  /**
   * Get test results
   */
  async getResults(testId: string): Promise<TestResult> {
    const test = await db.aBTest.findUnique({
      where: { id: testId },
      include: { variants: true },
    });

    if (!test) throw new Error("Test not found");

    const variants = (test.variants as Array<Record<string, unknown>>).map((v) =>
      this.mapVariant(v)
    );
    const control = variants.find((v) => v.isControl);
    const testVariants = variants.filter((v) => !v.isControl);

    if (!control) throw new Error("No control variant found");

    // Calculate confidence and lift
    for (const variant of testVariants) {
      variant.conversionRate = variant.impressions > 0 
        ? variant.conversions / variant.impressions 
        : 0;
      
      variant.liftVsControl =
        control.conversionRate > 0
          ? ((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100
          : 0;

      // Calculate statistical confidence using Z-test
      variant.confidence = this.calculateConfidence(
        control.conversions,
        control.impressions,
        variant.conversions,
        variant.impressions
      );
    }

    // Find winner
    const winner = testVariants.find(
      (v) => v.confidence && v.confidence >= (test.confidenceLevel || this.DEFAULT_CONFIDENCE)
    );

    // Check if enough data
    const totalSamples = variants.reduce((sum, v) => sum + v.impressions, 0);
    const hasEnoughData = totalSamples >= (test.minSampleSize || this.DEFAULT_MIN_SAMPLE);

    // Determine status
    let status: TestResult["status"];
    let recommendation: string;

    if (winner) {
      status = "winner_found";
      recommendation = `${winner.name} is winning with ${winner.liftVsControl?.toFixed(1)}% lift and ${(
        (winner.confidence || 0) * 100
      ).toFixed(0)}% confidence. Consider implementing this variant.`;
    } else if (!hasEnoughData) {
      status = "needs_more_data";
      recommendation = `Need ${test.minSampleSize! - totalSamples} more visitors for statistically significant results.`;
    } else {
      status = "inconclusive";
      recommendation = "No variant has reached statistical significance. Consider running the test longer or testing more dramatic changes.";
    }

    // Calculate duration
    const duration = test.startDate
      ? Math.ceil((Date.now() - new Date(test.startDate).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    return {
      testId,
      status,
      winner,
      control,
      variants: testVariants,
      recommendation,
      confidence: winner?.confidence || 0,
      duration,
    };
  }

  /**
   * Complete test and declare winner
   */
  async completeTest(testId: string, winningVariantId?: string): Promise<ABTest> {
    const updated = await db.aBTest.update({
      where: { id: testId },
      data: {
        status: "completed",
        endDate: new Date(),
        winningVariantId,
      },
    });

    if (winningVariantId) {
      // Mark winner
      await db.aBVariant.update({
        where: { id: winningVariantId },
        data: { isWinner: true },
      });

      // Apply changes based on test type
      await this.applyWinningVariant(testId, winningVariantId);
    }

    return this.mapTest(updated);
  }

  /**
   * Get active tests for a store
   */
  async getStoreTests(
    storeId: string,
    options?: { status?: string; limit?: number }
  ): Promise<ABTest[]> {
    const where: Record<string, unknown> = { storeId };
    if (options?.status) where.status = options.status;

    const tests = await db.aBTest.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.limit || 50,
    });

    return tests.map((t: Record<string, unknown>) => this.mapTest(t));
  }

  /**
   * Pause a running test
   */
  async pauseTest(testId: string): Promise<ABTest> {
    const updated = await db.aBTest.update({
      where: { id: testId },
      data: { status: "paused" },
    });

    return this.mapTest(updated);
  }

  /**
   * Resume a paused test
   */
  async resumeTest(testId: string): Promise<ABTest> {
    const updated = await db.aBTest.update({
      where: { id: testId },
      data: { status: "running" },
    });

    return this.mapTest(updated);
  }

  // Private methods
  private async updateVariantStats(variantId: string): Promise<void> {
    const variant = await db.aBVariant.findUnique({ where: { id: variantId } });
    if (!variant) return;

    const rate = variant.impressions > 0 ? variant.conversions / variant.impressions : 0;

    await db.aBVariant.update({
      where: { id: variantId },
      data: { conversionRate: rate },
    });
  }

  private async checkForWinner(testId: string): Promise<void> {
    const results = await this.getResults(testId);

    if (results.status === "winner_found" && results.winner) {
      await this.completeTest(testId, results.winner.id);
    }
  }

  private calculateConfidence(
    controlConversions: number,
    controlImpressions: number,
    variantConversions: number,
    variantImpressions: number
  ): number {
    // Z-test for proportions
    const p1 = controlConversions / controlImpressions;
    const p2 = variantConversions / variantImpressions;

    const se = Math.sqrt(
      p1 * (1 - p1) / controlImpressions +
      p2 * (1 - p2) / variantImpressions
    );

    if (se === 0) return 0;

    const z = (p2 - p1) / se;

    // Convert Z-score to confidence level (simplified)
    // For production, use a proper normal distribution CDF
    return Math.min(0.99, Math.max(0, 0.5 + z * 0.2));
  }

  private async applyWinningVariant(testId: string, variantId: string): Promise<void> {
    const [test, variant] = await Promise.all([
      db.aBTest.findUnique({ where: { id: testId } }),
      db.aBVariant.findUnique({ where: { id: variantId } }),
    ]);

    if (!test || !variant) return;

    const changes = variant.changes as Array<{ field: string; newValue: string }>;

    switch (test.type) {
      case "product_price":
        await prisma.product.update({
          where: { id: test.targetId },
          data: { price: parseInt(changes[0]?.newValue || "0") },
        });
        break;

      case "product_title":
        await prisma.product.update({
          where: { id: test.targetId },
          data: { title: changes[0]?.newValue },
        });
        break;

      // Add more cases as needed
    }
  }

  private mapTest(data: Record<string, unknown>): ABTest {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      name: String(data.name),
      type: data.type as ABTest["type"],
      targetId: String(data.targetId),
      status: data.status as ABTest["status"],
      startDate: data.startDate as Date,
      endDate: data.endDate as Date,
      trafficSplit: Number(data.trafficSplit),
      confidenceLevel: Number(data.confidenceLevel),
      minSampleSize: Number(data.minSampleSize),
      winningVariantId: data.winningVariantId ? String(data.winningVariantId) : undefined,
      autoStop: Boolean(data.autoStop),
      createdAt: data.createdAt as Date,
    };
  }

  private mapVariant(data: Record<string, unknown>): ABVariant {
    return {
      id: String(data.id),
      testId: String(data.testId),
      name: String(data.name),
      isControl: Boolean(data.isControl),
      changes: (data.changes as ABVariant["changes"]) || [],
      trafficWeight: Number(data.trafficWeight),
      impressions: Number(data.impressions),
      conversions: Number(data.conversions),
      revenue: Number(data.revenue),
      conversionRate: Number(data.conversionRate),
      liftVsControl: data.liftVsControl ? Number(data.liftVsControl) : undefined,
      confidence: data.confidence ? Number(data.confidence) : undefined,
      isWinner: Boolean(data.isWinner),
    };
  }
}

// Export singleton instance
export const abTestingService = new ABTestingService();
