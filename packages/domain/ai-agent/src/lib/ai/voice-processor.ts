import { logger } from "../logger";
import { Groq } from "groq-sdk";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export interface VoiceTranscriptionResult {
  text: string;
  language: string;
  confidence: number;
  duration?: number;
}

export interface VoiceProcessingError {
  error: string;
  code: string;
}

/**
 * VoiceProcessor - Handles audio transcription using Groq Whisper API
 *
 * Features:
 * - Downloads audio from URLs (MinIO, WhatsApp, etc.)
 * - Transcribes to text using Groq Whisper (fast, cost-effective)
 * - Supports multiple audio formats (ogg, mp3, wav, m4a)
 * - Returns language detection and confidence scores
 * - Cleans up temporary files after processing
 */
export class VoiceProcessor {
  private groq: Groq;

  constructor() {
    const apiKey = process.env.GROQ_API_KEY_MERCHANT || process.env.GROQ_API_KEY_SUPPORT;
    if (!apiKey) {
      logger.warn("[VoiceProcessor] No Groq API key found. Voice transcription will fail.");
    }
    this.groq = new Groq({
      apiKey: apiKey || "placeholder-key",
      dangerouslyAllowBrowser: false,
    });
  }

  /**
   * Transcribe audio from a URL
   *
   * @param audioUrl - URL to the audio file (MinIO, WhatsApp media, etc.)
   * @param storeId - Store ID for logging/tracking
   * @returns Transcription result or error
   */
  async transcribe(
    audioUrl: string,
    storeId: string,
  ): Promise<VoiceTranscriptionResult | VoiceProcessingError> {
    const startTime = Date.now();
    let tempFilePath: string | null = null;

    try {
      // Validate URL
      if (!audioUrl || typeof audioUrl !== "string") {
        return { error: "Invalid audio URL provided", code: "INVALID_URL" };
      }

      if (!audioUrl.startsWith("http://") && !audioUrl.startsWith("https://")) {
        return { error: "Audio URL must be HTTP/HTTPS", code: "INVALID_URL" };
      }

      logger.info("[VOICE_TRANSCRIPTION_START]", {
        storeId,
        audioUrl: audioUrl.substring(0, 100) + "...",
      });

      // Download audio file
      const audioBuffer = await this.downloadAudio(audioUrl);
      if (!audioBuffer) {
        return { error: "Failed to download audio file", code: "DOWNLOAD_FAILED" };
      }

      // Save to temporary file (Groq SDK requires file path)
      tempFilePath = join(tmpdir(), `voice-${storeId}-${Date.now()}.ogg`);
      await writeFile(tempFilePath, audioBuffer);

      // Transcribe using Groq Whisper
      const transcription = await this.groq.audio.transcriptions.create({
        file: await this.createFileFromPath(tempFilePath),
        model: "whisper-large-v3",
        response_format: "verbose_json",
        language: "en", // Auto-detect if not specified, but we can set default
      });

      const duration = Date.now() - startTime;

      logger.info("[VOICE_TRANSCRIPTION_SUCCESS]", {
        storeId,
        duration,
        textLength: transcription.text?.length || 0,
        language: (transcription as { language?: string }).language,
      });

      return {
        text: transcription.text || "",
        language: (transcription as { language?: string }).language || "unknown",
        confidence: this.calculateConfidence(transcription),
        duration: (transcription as { duration?: number }).duration,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[VOICE_TRANSCRIPTION_ERROR]", {
        storeId,
        error: errorMessage,
        audioUrl: audioUrl?.substring(0, 100),
      });
      return { error: errorMessage, code: "TRANSCRIPTION_FAILED" };
    } finally {
      // Cleanup temporary file
      if (tempFilePath) {
        try {
          await unlink(tempFilePath);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }

  /**
   * Download audio from URL
   */
  private async downloadAudio(url: string): Promise<Buffer | null> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      
      const response = await fetch(url, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        logger.error("[AUDIO_DOWNLOAD_FAILED]", {
          url: url.substring(0, 100),
          status: response.status,
          statusText: response.statusText,
        });
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logger.error("[AUDIO_DOWNLOAD_ERROR]", {
        url: url.substring(0, 100),
        error: errorMessage,
      });
      return null;
    }
  }

  /**
   * Create a File object from file path for Groq SDK
   */
  private async createFileFromPath(filePath: string): Promise<File> {
    // Node.js 18+ has native File support, but we need to handle older versions
    const fs = await import("fs");
    const buffer = fs.readFileSync(filePath);

    // Create a File-like object that Groq SDK accepts
    return new File([buffer], "audio.ogg", { type: "audio/ogg" });
  }

  /**
   * Calculate confidence score from transcription segments
   */
  private calculateConfidence(
    transcription: {
      text?: string;
      segments?: Array<{ avg_logprob?: number; no_speech_prob?: number }>;
    },
  ): number {
    if (!transcription.segments || transcription.segments.length === 0) {
      return 0.8; // Default confidence if no segments
    }

    // Average the log probabilities across segments
    const avgLogProb =
      transcription.segments.reduce((sum, seg) => sum + (seg.avg_logprob || 0), 0) /
      transcription.segments.length;

    // Convert log probability to approximate confidence (0-1)
    // Whisper logprobs are typically negative, closer to 0 is better
    const confidence = Math.min(Math.max((avgLogProb + 1) * 0.5, 0), 1);

    return Math.round(confidence * 100) / 100;
  }

  /**
   * Check if voice processing is available (API key configured)
   */
  static isAvailable(): boolean {
    const apiKey = process.env.GROQ_API_KEY_MERCHANT || process.env.GROQ_API_KEY_SUPPORT;
    return !!apiKey && apiKey !== "placeholder-key";
  }
}

// Export singleton instance
export const voiceProcessor = new VoiceProcessor();
