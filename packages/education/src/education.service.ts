import { prisma } from "@vayva/db";

// ============================================================================
// Types
// ============================================================================

export interface Tutorial {
  id: string;
  title: string;
  description?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  durationSeconds?: number;
  category: "onboarding" | "marketing" | "operations" | "advanced";
  difficulty: "beginner" | "intermediate" | "advanced";
  tags: string[];
  isPublished: boolean;
  sortOrder: number;
  completionRate?: number; // per-store stat
  createdAt: Date;
  updatedAt: Date;
}

export interface TutorialProgress {
  id: string;
  storeId: string;
  tutorialId: string;
  userId: string;
  watchedSeconds: number;
  completed: boolean;
  completedAt?: Date;
  lastWatchedAt: Date;
}

export interface LearningPath {
  id: string;
  name: string;
  description?: string;
  category: Tutorial["category"];
  tutorialIds: string[];
  estimatedMinutes: number;
  isActive: boolean;
}

export interface OnboardingChecklist {
  storeId: string;
  completedSteps: string[];
  totalSteps: number;
  percentComplete: number;
  nextStep?: string;
}

// ============================================================================
// Service
// ============================================================================

export class EducationService {
  // --------------------------------------------------------------------------
  // Tutorials
  // --------------------------------------------------------------------------

  /**
   * Fetch all published tutorials, optionally filtered by category
   */
  async getTutorials(options: {
    category?: Tutorial["category"];
    difficulty?: Tutorial["difficulty"];
    tags?: string[];
    includeUnpublished?: boolean;
  } = {}): Promise<Tutorial[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (!options.includeUnpublished) {
      where.isPublished = true;
    }

    if (options.category) where.category = options.category;
    if (options.difficulty) where.difficulty = options.difficulty;
    if (options.tags && options.tags.length > 0) {
      where.tags = { hasSome: options.tags };
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = await (prisma as any).tutorial?.findMany({
        where,
        orderBy: [{ category: "asc" }, { sortOrder: "asc" }],
      });

      if (rows) return rows as Tutorial[];
    } catch {
      // Tutorial model may not exist yet in all schema versions — fall through
    }

    // Fallback: static seed content used until DB migration is applied
    return this.getSeedTutorials(options.category);
  }

  /**
   * Get a single tutorial by ID
   */
  async getTutorial(id: string): Promise<Tutorial | null> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = await (prisma as any).tutorial?.findUnique({ where: { id } });
      if (row) return row as Tutorial;
    } catch {
      // fall through
    }

    return this.getSeedTutorials().find((t) => t.id === id) ?? null;
  }

  // --------------------------------------------------------------------------
  // Progress tracking
  // --------------------------------------------------------------------------

  /**
   * Record tutorial watch progress for a user
   */
  async recordProgress(
    storeId: string,
    userId: string,
    tutorialId: string,
    watchedSeconds: number
  ): Promise<TutorialProgress> {
    const tutorial = await this.getTutorial(tutorialId);
    const duration = tutorial?.durationSeconds ?? 0;
    const completed = duration > 0 ? watchedSeconds >= duration * 0.9 : watchedSeconds > 0;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const upserted = await (prisma as any).tutorialProgress?.upsert({
        where: { storeId_userId_tutorialId: { storeId, userId, tutorialId } },
        update: {
          watchedSeconds: Math.max(watchedSeconds, 0),
          completed,
          completedAt: completed ? new Date() : undefined,
          lastWatchedAt: new Date(),
        },
        create: {
          storeId,
          userId,
          tutorialId,
          watchedSeconds,
          completed,
          completedAt: completed ? new Date() : undefined,
          lastWatchedAt: new Date(),
        },
      });

      if (upserted) return upserted as TutorialProgress;
    } catch {
      // fall through if model not available
    }

    // Return in-memory progress object if DB unavailable
    return {
      id: `${storeId}-${userId}-${tutorialId}`,
      storeId,
      userId,
      tutorialId,
      watchedSeconds,
      completed,
      completedAt: completed ? new Date() : undefined,
      lastWatchedAt: new Date(),
    };
  }

  /**
   * Get progress for all tutorials for a user
   */
  async getUserProgress(storeId: string, userId: string): Promise<TutorialProgress[]> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = await (prisma as any).tutorialProgress?.findMany({
        where: { storeId, userId },
        orderBy: { lastWatchedAt: "desc" },
      });

      if (rows) return rows as TutorialProgress[];
    } catch {
      // fall through
    }

    return [];
  }

  // --------------------------------------------------------------------------
  // Onboarding checklist
  // --------------------------------------------------------------------------

  /**
   * Get the onboarding checklist state for a store
   */
  async getOnboardingChecklist(storeId: string): Promise<OnboardingChecklist> {
    const allSteps = [
      "setup_store_profile",
      "add_first_product",
      "configure_payments",
      "configure_shipping",
      "set_store_domain",
      "launch_first_campaign",
      "invite_team_member",
    ];

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = await (prisma as any).onboardingStep?.findMany({
        where: { storeId, completed: true },
        select: { step: true },
      });

      const completedSteps: string[] = rows ? rows.map((r: { step: string }) => r.step) : [];
      const nextStep = allSteps.find((s) => !completedSteps.includes(s));

      return {
        storeId,
        completedSteps,
        totalSteps: allSteps.length,
        percentComplete: Math.round((completedSteps.length / allSteps.length) * 100),
        nextStep,
      };
    } catch {
      return {
        storeId,
        completedSteps: [],
        totalSteps: allSteps.length,
        percentComplete: 0,
        nextStep: allSteps[0],
      };
    }
  }

  /**
   * Mark an onboarding step as complete
   */
  async completeOnboardingStep(storeId: string, step: string): Promise<void> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (prisma as any).onboardingStep?.upsert({
        where: { storeId_step: { storeId, step } },
        update: { completed: true, completedAt: new Date() },
        create: { storeId, step, completed: true, completedAt: new Date() },
      });
    } catch {
      // Model not available yet — silently no-op
    }
  }

  // --------------------------------------------------------------------------
  // Learning paths
  // --------------------------------------------------------------------------

  /**
   * Get predefined learning paths for a category
   */
  getLearningPaths(category?: Tutorial["category"]): LearningPath[] {
    const paths: LearningPath[] = [
      {
        id: "lp-onboarding",
        name: "Quick Store Setup",
        description: "Get your store live in under 30 minutes",
        category: "onboarding",
        tutorialIds: ["1", "2", "3"],
        estimatedMinutes: 25,
        isActive: true,
      },
      {
        id: "lp-marketing",
        name: "Marketing Fundamentals",
        description: "Drive traffic and convert customers",
        category: "marketing",
        tutorialIds: ["4", "5", "6"],
        estimatedMinutes: 40,
        isActive: true,
      },
      {
        id: "lp-operations",
        name: "Operations Mastery",
        description: "Streamline your daily business operations",
        category: "operations",
        tutorialIds: ["7", "8", "9"],
        estimatedMinutes: 35,
        isActive: true,
      },
    ];

    return category ? paths.filter((p) => p.category === category) : paths;
  }

  // --------------------------------------------------------------------------
  // Seed data (fallback when DB model is unavailable)
  // --------------------------------------------------------------------------

  private getSeedTutorials(category?: Tutorial["category"]): Tutorial[] {
    const now = new Date();

    const tutorials: Tutorial[] = [
      {
        id: "1",
        title: "Setting Up Your Store",
        description: "A step-by-step guide to launching your store on Vayva",
        videoUrl: "https://youtu.be/example-setup",
        thumbnailUrl: "/tutorials/setup-store.jpg",
        durationSeconds: 480,
        category: "onboarding",
        difficulty: "beginner",
        tags: ["setup", "getting-started"],
        isPublished: true,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "2",
        title: "Adding Your First Product",
        description: "Learn how to add products, variants, and inventory",
        videoUrl: "https://youtu.be/example-products",
        thumbnailUrl: "/tutorials/add-product.jpg",
        durationSeconds: 360,
        category: "onboarding",
        difficulty: "beginner",
        tags: ["products", "inventory"],
        isPublished: true,
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "3",
        title: "Configuring Payments with Paystack",
        description: "Accept cards, bank transfers and USSD on your store",
        videoUrl: "https://youtu.be/example-payments",
        thumbnailUrl: "/tutorials/payments.jpg",
        durationSeconds: 300,
        category: "onboarding",
        difficulty: "beginner",
        tags: ["payments", "paystack"],
        isPublished: true,
        sortOrder: 3,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "4",
        title: "Running Effective Ad Campaigns",
        description: "Use Vayva's campaign builder to target the right customers",
        videoUrl: "https://youtu.be/example-ads",
        thumbnailUrl: "/tutorials/ads.jpg",
        durationSeconds: 600,
        category: "marketing",
        difficulty: "intermediate",
        tags: ["ads", "campaigns", "marketing"],
        isPublished: true,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "5",
        title: "Social Commerce: Selling on Instagram",
        description: "Sync your catalog and sell directly through Instagram",
        videoUrl: "https://youtu.be/example-social",
        thumbnailUrl: "/tutorials/social.jpg",
        durationSeconds: 420,
        category: "marketing",
        difficulty: "intermediate",
        tags: ["social", "instagram", "catalog"],
        isPublished: true,
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "6",
        title: "Managing Orders and Fulfilment",
        description: "Process, pack and ship orders efficiently",
        videoUrl: "https://youtu.be/example-orders",
        thumbnailUrl: "/tutorials/orders.jpg",
        durationSeconds: 540,
        category: "operations",
        difficulty: "beginner",
        tags: ["orders", "fulfilment", "shipping"],
        isPublished: true,
        sortOrder: 1,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: "7",
        title: "Inventory Management Best Practices",
        description: "Avoid stockouts with smart reorder rules and par levels",
        videoUrl: "https://youtu.be/example-inventory",
        thumbnailUrl: "/tutorials/inventory.jpg",
        durationSeconds: 660,
        category: "operations",
        difficulty: "intermediate",
        tags: ["inventory", "stock", "reorder"],
        isPublished: true,
        sortOrder: 2,
        createdAt: now,
        updatedAt: now,
      },
    ];

    if (category) return tutorials.filter((t) => t.category === category);
    return tutorials;
  }
}

export const educationService = new EducationService();
