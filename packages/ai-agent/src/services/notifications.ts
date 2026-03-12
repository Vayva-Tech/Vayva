import { WhatsappManager } from "./whatsapp";
import { logger } from "../lib/logger";
import { urls } from "@vayva/shared";

type MilestoneEvent = "onboarding_complete" | "first_sale" | "kyc_verified";

type MilestoneData = {
    name: string;
    phone?: string;
    storeName?: string;
    storeSlug?: string;
};

export class NotificationService {
    static SYSTEM_INSTANCE: string;

    static async queueEmail(params: {
        to: string;
        template: string;
        data: Record<string, unknown>;
    }): Promise<void> {
        const { to, template, data } = params;
        logger.info(`[Email] Queued ${template} email to ${to}`, { data });
        // In production, this would queue to BullMQ for the worker to process
        // For now, we just log it as the actual email sending is handled by the worker
    }

    static async sendMilestone(event: MilestoneEvent, data: MilestoneData) {
        let message = "";
        switch (event) {
            case "onboarding_complete":
                message = `Welcome to Vayva, ${data.name}! 🚀\n\nYour store *${data.storeName}* is now live at ${data.storeSlug ? urls.storefrontOrigin(data.storeSlug) : ""}.\n\nI am your AI Assistant—send me a message if you want to see how I help your customers! Check your dashboard at ${new URL(urls.merchantBase()).host} to see your first leads.`;
                break;
            case "first_sale":
                message = `Cha-ching! 💰\n\n${data.name}, you just made your FIRST sale on Vayva! Check your dashboard to process the order.`;
                break;
            case "kyc_verified":
                message = `Verified! ✅\n\nHi ${data.name}, your identity has been verified. Payouts are now active for your account.`;
                break;
        }
        if (message && data.phone) {
            // Fire and forget
            WhatsappManager.sendMessage(this.SYSTEM_INSTANCE, data.phone, message)
                .then(() => logger.info(`[Notify] Sent ${event} to ${data.phone}`))
                .catch(e => logger.error(`[Notify] Failed to send ${event}`, e));
        }
    }
}
// Vayva's own Notification Number (System Instance)
NotificationService.SYSTEM_INSTANCE = "vayva_notifications";
