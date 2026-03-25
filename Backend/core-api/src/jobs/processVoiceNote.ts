import { VoiceProcessor, SalesAgent } from "@vayva/ai-agent";
import { logger } from "@vayva/shared";
import { prisma } from "@vayva/db";
import { getAiPackage } from "@/lib/ai/ai-packages";
import { AICreditService } from "@/lib/ai/credit-service";

interface VoiceNoteJobData {
  storeId: string;
  conversationId: string;
  audioUrl: string;
  customerPhone: string;
  customerName?: string;
  metadata?: {
    duration?: number;
    mimeType?: string;
  };
}

/**
 * ProcessVoiceNoteJob - Handles transcription and AI response for voice messages
 *
 * Flow:
 * 1. Download and transcribe voice note using Groq Whisper
 * 2. Store transcription in conversation history
 * 3. Pass transcribed text to SalesAgent for response generation
 * 4. Send AI response back to customer via WhatsApp
 */
export class ProcessVoiceNoteJob {
  static async execute(jobData: VoiceNoteJobData): Promise<{
    success: boolean;
    transcription?: string;
    aiResponse?: string;
    error?: string;
  }> {
    const { storeId, conversationId, audioUrl, customerPhone, customerName, metadata } =
      jobData;

    const startTime = Date.now();

    try {
      // Enforce plan packaging: voice is Pro+ only
      const sub = await prisma.merchantAiSubscription
        .findUnique({ where: { storeId }, select: { planKey: true } })
        .catch(() => null);
      const pkg = getAiPackage(sub?.planKey);
      if (!pkg.voiceEnabled) {
        logger.info("[VOICE_JOB_BLOCKED_BY_PLAN]", { storeId, conversationId });
        await this.sendFallbackMessage(
          storeId,
          customerPhone,
          "I’ve received your voice message, but voice notes are not enabled on this plan. Please type your message and I’ll help right away.",
        );
        return {
          success: false,
          error: "Voice notes not enabled for this plan",
        };
      }

      // Check if voice notes are enabled for this merchant
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      const settings = store?.settings as Record<string, unknown> | null;
      const aiAgent = settings?.aiAgent as Record<string, unknown> | null;
      const allowVoiceNotes = (aiAgent?.allowVoiceNotes as boolean) ?? true;

      if (!allowVoiceNotes) {
        logger.info("[VOICE_JOB_DISABLED]", { storeId, conversationId });

        // Notify customer that voice notes are not accepted
        await this.sendFallbackMessage(
          storeId,
          customerPhone,
          "I've received your voice message, but I'm currently only able to read text messages. Please type your message and I'll be happy to help!",
        );

        return {
          success: false,
          error: "Voice notes disabled for this store",
        };
      }

      logger.info("[VOICE_JOB_START]", {
        storeId,
        conversationId,
        audioUrl: audioUrl?.substring(0, 100),
        duration: metadata?.duration,
      });

      if (typeof metadata?.duration === "number" && metadata.duration > pkg.maxVoiceSeconds) {
        await this.sendFallbackMessage(
          storeId,
          customerPhone,
          `That voice note is a bit long for this plan (max ${pkg.maxVoiceSeconds}s). Please send a shorter voice note or type your message.`,
        );
        return { success: false, error: "Voice note too long" };
      }

      // Meter voice note: reserve message budget for transcription (reply is metered by SalesAgent as 1 AI message)
      const transcriptionDebit = Math.max(0, pkg.voiceNoteMessageCost - 1);
      if (transcriptionDebit > 0) {
        const debit = await AICreditService.deductCredits(storeId, transcriptionDebit, {
          requestId: `voice-transcribe-${conversationId}-${Date.now()}`,
          skipInsufficientCheck: false,
        });
        if (!debit.success || debit.blocked) {
          await this.sendFallbackMessage(
            storeId,
            customerPhone,
            "I can’t process voice notes right now because this store has reached its AI message limit. Please type your message or top up to continue.",
          );
          return { success: false, error: "Insufficient AI messages for voice transcription" };
        }
      }

      // 1. Transcribe the voice note
      const voiceProcessor = new VoiceProcessor();
      const transcriptionResult = await voiceProcessor.transcribe(audioUrl, storeId);

      // Check for transcription errors
      if ("error" in transcriptionResult) {
        logger.error("[VOICE_JOB_TRANSCRIPTION_FAILED]", {
          storeId,
          conversationId,
          error: transcriptionResult.error,
          code: transcriptionResult.code,
        });

        // Notify customer that voice couldn't be processed
        await this.sendFallbackMessage(
          storeId,
          customerPhone,
          "I couldn't understand that voice message. Could you please type your message instead?",
        );

        return {
          success: false,
          error: transcriptionResult.error,
        };
      }

      const { text: transcription, language, confidence } = transcriptionResult;

      logger.info("[VOICE_JOB_TRANSCRIPTION_SUCCESS]", {
        storeId,
        conversationId,
        transcriptionLength: transcription.length,
        language,
        confidence,
        duration: metadata?.duration,
      });

      // 2. Store transcription in conversation history
      await this.storeTranscription(storeId, conversationId, {
        audioUrl,
        transcription,
        language,
        confidence,
        customerPhone,
        customerName,
      });

      // 3. Get conversation history for context
      const history = await this.getConversationHistory(storeId, conversationId);

      // 4. Pass to SalesAgent for response
      const aiResponse = await SalesAgent.handleMessage(
        storeId,
        [
          ...history,
          {
            role: "user",
            content: transcription,
            metadata: {
              type: "voice",
              audioUrl,
              originalLanguage: language,
            },
          },
        ],
        { conversationId },
      );

      const processingTime = Date.now() - startTime;

      logger.info("[VOICE_JOB_COMPLETE]", {
        storeId,
        conversationId,
        processingTime,
        hasResponse: !!aiResponse?.message,
      });

      // 5. Store AI response
      if (aiResponse?.message) {
        await this.storeAIResponse(storeId, conversationId, {
          message: aiResponse.message,
          inReplyTo: transcription,
          customerPhone,
        });
      }

      return {
        success: true,
        transcription,
        aiResponse: aiResponse?.message,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[VOICE_JOB_ERROR]", {
        storeId,
        conversationId,
        error: errorMessage,
      });

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Store transcription in conversation/thread history
   */
  private static async storeTranscription(
    storeId: string,
    conversationId: string,
    data: {
      audioUrl: string;
      transcription: string;
      language: string;
      confidence: number;
      customerPhone: string;
      customerName?: string;
    },
  ): Promise<void> {
    try {
      // Check if conversation exists, create if not
      const conversation = await prisma.conversation.upsert({
        where: { id: conversationId },
        create: {
          id: conversationId,
          storeId,
          contactId: "", // Will be set properly when contact is identified
          status: "OPEN",
        },
        update: {
          lastMessageAt: new Date(),
        },
      });

      // Store the transcription as a message
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          storeId,
          direction: "INBOUND",
          type: "AUDIO",
          textBody: data.transcription,
          mediaId: data.audioUrl,
          status: "QUEUED",
        },
      });
    } catch (error) {
      logger.error("[STORE_TRANSCRIPTION_ERROR]", { storeId, conversationId, error });
    }
  }

  /**
   * Get conversation history for AI context
   */
  private static async getConversationHistory(
    storeId: string,
    conversationId: string,
  ): Promise<Array<{ role: string; content: string }>> {
    try {
      const messages = await prisma.message.findMany({
        where: {
          conversationId,
          storeId,
        },
        orderBy: { createdAt: "asc" },
        take: 10, // Last 10 messages for context
      });

      return messages.map((msg) => ({
        role: msg.direction === "INBOUND" ? "user" : "assistant",
        content: msg.textBody || "",
      }));
    } catch (error) {
      logger.error("[GET_HISTORY_ERROR]", { storeId, conversationId, error });
      return [];
    }
  }

  /**
   * Store AI response in conversation history
   */
  private static async storeAIResponse(
    storeId: string,
    conversationId: string,
    data: {
      message: string;
      inReplyTo: string;
      customerPhone: string;
    },
  ): Promise<void> {
    try {
      await prisma.message.create({
        data: {
          conversationId,
          storeId,
          direction: "OUTBOUND",
          type: "TEXT",
          textBody: data.message,
          status: "SENT",
        },
      });
    } catch (error) {
      logger.error("[STORE_AI_RESPONSE_ERROR]", { storeId, conversationId, error });
    }
  }

  /**
   * Send fallback message when voice processing fails
   */
  private static async sendFallbackMessage(
    storeId: string,
    customerPhone: string,
    message: string,
  ): Promise<void> {
    try {
      // Queue outbound message
      const { Queue } = await import("bullmq");
      const { getRedis } = await import("@vayva/redis");
      const { QUEUES } = await import("@vayva/shared");

      const redis = await getRedis();
      const queue = new Queue(QUEUES.WHATSAPP_OUTBOUND, {
        connection: redis,
      });

      await queue.add("outbound", {
        storeId,
        to: customerPhone,
        body: message,
        type: "text",
      });
    } catch (error) {
      logger.error("[FALLBACK_MESSAGE_ERROR]", { storeId, customerPhone, error });
    }
  }
}
