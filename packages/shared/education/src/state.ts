/**
 * Education State Management
 *
 * Tracks user education progress per workflow.
 * States: unseen, shown, completed, dismissed
 */

export type EducationState = "unseen" | "shown" | "completed" | "dismissed";

export interface UserEducationRecord {
  userId: string;
  templateId: string;
  workflow: string;
  guidanceId: string;
  state: EducationState;
  shownAt?: Date;
  completedAt?: Date;
  dismissedAt?: Date;
}

export interface GuidanceEligibility {
  shouldShow: boolean;
  reason?: "never_shown" | "already_shown" | "dismissed" | "completed";
}

export class EducationStateManager {
  /**
   * Check if guidance should be shown to user
   */
  static async checkEligibility(
    userId: string,
    guidanceId: string,
  ): Promise<GuidanceEligibility> {
    try {
      const response = await fetch(
        `/api/education/eligibility?userId=${userId}&guidanceId=${guidanceId}`,
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to check guidance eligibility:", error);
      return { shouldShow: false, reason: "already_shown" };
    }
  }

  /**
   * Mark guidance as shown
   */
  static async markShown(userId: string, guidanceId: string): Promise<void> {
    try {
      await fetch("/api/education/mark-shown", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, guidanceId }),
      });
    } catch (error) {
      console.error("Failed to mark guidance as shown:", error);
    }
  }

  /**
   * Mark guidance as completed
   */
  static async markCompleted(
    userId: string,
    guidanceId: string,
  ): Promise<void> {
    try {
      await fetch("/api/education/mark-completed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, guidanceId }),
      });
    } catch (error) {
      console.error("Failed to mark guidance as completed:", error);
    }
  }

  /**
   * Dismiss guidance (user explicitly dismissed)
   */
  static async dismiss(userId: string, guidanceId: string): Promise<void> {
    try {
      await fetch("/api/education/dismiss", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, guidanceId }),
      });
    } catch (error) {
      console.error("Failed to dismiss guidance:", error);
    }
  }

  /**
   * Get all education records for user
   */
  static async getUserEducation(
    userId: string,
  ): Promise<UserEducationRecord[]> {
    try {
      const response = await fetch(`/api/education/user/${userId}`);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to get user education:", error);
      return [];
    }
  }
}

/**
 * Education state transition rules
 */
export const StateTransitions = {
  /**
   * Valid state transitions
   */
  ALLOWED: {
    unseen: ["shown", "dismissed"],
    shown: ["completed", "dismissed"],
    completed: [], // Terminal state
    dismissed: [], // Terminal state
  },

  /**
   * Check if transition is valid
   */
  isValid(from: EducationState, to: EducationState): boolean {
    const allowed = this.ALLOWED as Record<string, string[]>;
    return allowed[from]?.includes(to) || false;
  },
};
