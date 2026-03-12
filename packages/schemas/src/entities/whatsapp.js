import { z } from "zod";
import { ConversationStatus } from "../enums";
export const MessageSchema = z.object({
    id: z.string().uuid(),
    conversationId: z.string().uuid(),
    sender: z.enum(["USER", "AGENT", "AI", "SYSTEM"]),
    content: z.string(),
    metadata: z.record(z.any()).optional(), // For templates, buttons
    timestamp: z.date(),
});
export const AIActionSchema = z.object({
    id: z.string().uuid(),
    conversationId: z.string().uuid(),
    type: z.enum(["RECOMMEND_PRODUCT", "CREATE_ORDER", "ANSWER_QUERY"]),
    confidence: z.number().min(0).max(1),
    parameters: z.record(z.any()),
    wasAccepted: z.boolean().optional(),
    createdAt: z.date(),
});
export const ConversationSchema = z.object({
    id: z.string().uuid(),
    storeId: z.string().uuid(),
    customerPhone: z.string(), // The key identifier
    customerName: z.string().optional(),
    status: z.nativeEnum(ConversationStatus).default(ConversationStatus.OPEN),
    unreadCount: z.number().int().default(0),
    lastMessageAt: z.date(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
