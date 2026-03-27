/**
 * Email Campaign Utilities
 * 
 * Shared utilities for sending automated email campaigns via BullMQ queues.
 * Used by trial nurture, win-back, milestone, and other campaign workers.
 */

import { Queue } from "bullmq";
import { QUEUES } from "@vayva/shared";
import { logger } from "@vayva/shared";

// Email template types
export type EmailTemplateName =
  // Trial Nurture Sequence
  | "trial-day-7"
  | "trial-day-3"
  | "trial-day-1"
  | "trial-expired"
  // Win-Back Sequence
  | "winback-day-3"
  | "winback-day-7"
  | "winback-day-14"
  | "winback-day-30"
  // Milestone Celebrations
  | "milestone-first-order"
  | "milestone-revenue"
  // Other
  | string;

// Common email data interface
export interface EmailData {
  merchantName?: string;
  storeName?: string;
  daysRemaining?: number;
  daysSinceExpiry?: number;
  milestoneType?: string;
  milestoneValue?: number | string;
  [key: string]: any;
}

// Email queue instance (lazy initialized)
let _emailQueue: Queue | null = null;

/**
 * Get or create email queue instance
 */
export function getEmailQueue(): Queue {
  if (!_emailQueue) {
    _emailQueue = new Queue(QUEUES.EMAIL_OUTBOUND, {
      connection: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
      },
    });
    
    logger.info("[EMAIL_UTILS] Email queue initialized", {
      redisHost: process.env.REDIS_HOST || "localhost",
      redisPort: process.env.REDIS_PORT || "6379",
    });
  }
  return _emailQueue;
}

/**
 * Send a campaign email via BullMQ queue
 * 
 * @param to - Recipient email address
 * @param subject - Email subject line
 * @param react - React email component
 * @param headers - Optional email headers for tracking/categorization
 * @returns Promise resolving when email is queued
 */
export async function sendCampaignEmail({
  to,
  subject,
  react,
  headers,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
  headers?: Record<string, string>;
}): Promise<void> {
  try {
    const queue = getEmailQueue();
    
    await queue.add("send", {
      to,
      subject,
      react,
      headers,
    });

    logger.info("[EMAIL_UTILS] Campaign email queued successfully", {
      to,
      subject,
    });
  } catch (error: unknown) {
    const err = error instanceof Error ? error : new Error(String(error));
    logger.error("[EMAIL_UTILS] Failed to queue campaign email", {
      error: err.message,
      to,
      subject,
    });
    throw error;
  }
}

/**
 * Render email template based on name
 * 
 * @param templateName - Name of the email template
 * @param data - Template data/props
 * @returns Rendered React email component
 */
export function renderEmailTemplate(
  templateName: EmailTemplateName,
  data: EmailData
): React.ReactElement {
  // Dynamic imports to avoid circular dependencies
  switch (templateName) {
    // Trial Nurture Sequence
    case "trial-day-7": {
      const { TrialDay7 } = require("@vayva/emails/templates/trial-day-7");
      return TrialDay7(data);
    }
    case "trial-day-3": {
      const { TrialDay3 } = require("@vayva/emails/templates/trial-day-3");
      return TrialDay3(data);
    }
    case "trial-day-1": {
      const { TrialDay1 } = require("@vayva/emails/templates/trial-day-1");
      return TrialDay1(data);
    }
    case "trial-expired": {
      const { TrialExpired } = require("@vayva/emails/templates/trial-expired");
      return TrialExpired(data);
    }
    
    // Win-Back Sequence
    case "winback-day-3": {
      const { WinbackDay3 } = require("@vayva/emails/templates/winback-day-3");
      return WinbackDay3(data);
    }
    case "winback-day-7": {
      const { WinbackDay7 } = require("@vayva/emails/templates/winback-day-7");
      return WinbackDay7(data);
    }
    case "winback-day-14": {
      const { WinbackDay14 } = require("@vayva/emails/templates/winback-day-14");
      return WinbackDay14(data);
    }
    case "winback-day-30": {
      const { WinbackDay30 } = require("@vayva/emails/templates/winback-day-30");
      return WinbackDay30(data);
    }
    
    // Milestone Celebrations
    case "milestone-first-order": {
      const { MilestoneFirstOrder } = require("@vayva/emails/templates/milestone-first-order");
      return MilestoneFirstOrder(data);
    }
    case "milestone-revenue": {
      const { MilestoneRevenue } = require("@vayva/emails/templates/milestone-revenue");
      return MilestoneRevenue(data);
    }
    
    default:
      logger.warn("[EMAIL_UTILS] Unknown template, using trial-day-7 as fallback", {
        templateName,
      });
      const { TrialDay7 } = require("@vayva/emails/templates/trial-day-7");
      return TrialDay7(data);
  }
}

/**
 * Get email subject based on template name
 * 
 * @param templateName - Name of the email template
 * @param data - Template data for personalization
 * @returns Personalized subject line
 */
export function getEmailSubject(
  templateName: EmailTemplateName,
  data: EmailData
): string {
  const subjects: Record<EmailTemplateName, string> = {
    // Trial Nurture
    "trial-day-7": `${data.storeName || "Your"} — 7 days left to explore Vayva`,
    "trial-day-3": `${data.storeName || "Your"} — Only 3 days remaining`,
    "trial-day-1": `⏰ Last day! Don't lose access to ${data.storeName || "your store"}`,
    "trial-expired": `Trial expired — Grace period active for ${data.storeName || "your store"}`,
    
    // Win-Back
    "winback-day-3": `We miss you! Special offer inside 🎁`,
    "winback-day-7": `${data.merchantName || "There"} — Your customers are waiting`,
    "winback-day-14": `Final chance: 50% off to restart ${data.storeName || "your business"}`,
    "winback-day-30": `Fresh start invitation for ${data.storeName || "your brand"}`,
    
    // Milestones
    "milestone-first-order": `🎉 Congratulations! Your first AI-powered order`,
    "milestone-revenue": `🚀 Amazing milestone: ₦${data.milestoneValue} in revenue!`,
  };

  return subjects[templateName] || `Update from Vayva`;
}

/**
 * Helper to send trial nurture emails
 */
export async function sendTrialNurtureEmail(
  to: string,
  storeName: string,
  merchantName: string,
  daysRemaining: number
): Promise<void> {
  let templateName: EmailTemplateName;
  
  if (daysRemaining === 7) {
    templateName = "trial-day-7";
  } else if (daysRemaining === 3) {
    templateName = "trial-day-3";
  } else if (daysRemaining === 1) {
    templateName = "trial-day-1";
  } else {
    logger.warn("[EMAIL_UTILS] Invalid days remaining for trial nurture", {
      daysRemaining,
    });
    return;
  }

  const data: EmailData = {
    merchantName,
    storeName,
    daysRemaining,
  };

  const subject = getEmailSubject(templateName, data);
  const react = renderEmailTemplate(templateName, data);

  await sendCampaignEmail({
    to,
    subject,
    react,
    headers: {
      "X-Trial-Days-Remaining": daysRemaining.toString(),
      "X-Email-Type": "trial-nurture",
    },
  });
}

/**
 * Helper to send win-back emails
 */
export async function sendWinBackEmail(
  to: string,
  storeName: string,
  merchantName: string,
  daysSinceExpiry: number
): Promise<void> {
  let templateName: EmailTemplateName;
  
  if (daysSinceExpiry >= 3 && daysSinceExpiry < 4) {
    templateName = "winback-day-3";
  } else if (daysSinceExpiry >= 7 && daysSinceExpiry < 8) {
    templateName = "winback-day-7";
  } else if (daysSinceExpiry >= 14 && daysSinceExpiry < 15) {
    templateName = "winback-day-14";
  } else if (daysSinceExpiry >= 30 && daysSinceExpiry < 31) {
    templateName = "winback-day-30";
  } else {
    logger.warn("[EMAIL_UTILS] Invalid days since expiry for win-back", {
      daysSinceExpiry,
    });
    return;
  }

  const data: EmailData = {
    merchantName,
    storeName,
    daysSinceExpiry,
  };

  const subject = getEmailSubject(templateName, data);
  const react = renderEmailTemplate(templateName, data);

  await sendCampaignEmail({
    to,
    subject,
    react,
    headers: {
      "X-Days-Since-Expiry": daysSinceExpiry.toString(),
      "X-Email-Type": "win-back",
    },
  });
}

/**
 * Helper to send milestone celebration emails
 */
export async function sendMilestoneEmail(
  to: string,
  storeName: string,
  merchantName: string,
  milestoneType: string,
  milestoneValue: number | string
): Promise<void> {
  const templateName: EmailTemplateName = `milestone-${milestoneType}`;
  
  const data: EmailData = {
    merchantName,
    storeName,
    milestoneType,
    milestoneValue,
  };

  const subject = getEmailSubject(templateName, data);
  const react = renderEmailTemplate(templateName, data);

  await sendCampaignEmail({
    to,
    subject,
    react,
    headers: {
      "X-Milestone-Type": milestoneType,
      "X-Email-Type": "milestone-celebration",
    },
  });
}
