import { WhatsAppConversation, WhatsAppMessage } from "@vayva/shared";

export type { WhatsAppConversation, WhatsAppMessage };

export interface SendMessageResponse {
  success: boolean;
  message?: WhatsAppMessage;
}
