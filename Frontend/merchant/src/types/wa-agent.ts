export type SocialChannel = "whatsapp" | "instagram";

export type WhatsAppCatalogMode = "StrictCatalogOnly" | string;
export type WhatsAppPaymentGuidanceMode = "ExplainAndLink" | string;

export interface ApiEnvelope<T> {
  data?: T;
}

export type BusinessHours = Record<string, unknown>;

export interface WaAgentSettings {
  enabled: boolean;
  businessHours: BusinessHours;
  autoReplyOutsideHours: boolean;
  catalogMode: WhatsAppCatalogMode;
  allowImageUnderstanding: boolean;
  orderStatusAccess: boolean;
  paymentGuidanceMode: WhatsAppPaymentGuidanceMode;
  maxDailyMsgsPerUser: number;
  humanHandoffEnabled: boolean;
}

export type TonePreset = "Friendly" | "Professional" | "Casual" | string;
export type BrevityMode = "Short" | "Medium" | "Long" | string;

export interface WaAgentProfile {
  agentName: string;
  tonePreset: TonePreset;
  greetingTemplate: string;
  signoffTemplate: string;
  persuasionLevel: number;
  brevityMode: BrevityMode;
  oneQuestionRule: boolean;
  prohibitedClaims: string[];
}

export interface SupportConversation {
  id: string;
  unreadCount: number;
  needsAttention?: boolean;
  customerId: string;
  status: "open" | "resolved";
  lastMessageAt: string;
  [key: string]: unknown;
}

export interface SupportThread {
  id: string;
  [key: string]: unknown;
}

export interface SupportApproval {
  id: string;
  [key: string]: unknown;
}

export type ApprovalAction = string;

export interface KnowledgeBaseEntry {
  id: string;
  sourceType: "FILE" | "MANUAL" | string;
  content?: string | null;
}

export interface UiKnowledgeBaseItem {
  id: string;
  question: string;
  answer: string;
  fullContent: string | null | undefined;
  tags: string[];
  category: string;
  status: "active" | "inactive" | string;
}
