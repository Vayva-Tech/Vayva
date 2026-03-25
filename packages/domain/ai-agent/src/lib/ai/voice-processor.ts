import { logger } from "../logger";

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
 * VoiceProcessor - Voice transcription is currently disabled
 *
 * Features:
 * - Downloads audio from URLs (MinIO, WhatsApp, etc.)
 */
export class VoiceProcessor {
  constructor() {}

  private async downloadAudio(audioUrl: string): Promise<{
    base64: string;
    format: "wav" | "mp3" | "ogg" | "m4a" | "aac" | "flac" | "aiff";
  } | null> {
    const res = await fetch(audioUrl, { signal: AbortSignal.timeout(30_000) });
    if (!res.ok) return null;

    const contentType = (res.headers.get("content-type") || "").toLowerCase();
    const u = audioUrl.toLowerCase();

    const format: "wav" | "mp3" | "ogg" | "m4a" | "aac" | "flac" | "aiff" =
      contentType.includes("audio/wav") || u.endsWith(".wav")
        ? "wav"
        : contentType.includes("audio/mpeg") || u.endsWith(".mp3")
          ? "mp3"
          : contentType.includes("audio/ogg") || u.endsWith(".ogg") || u.endsWith(".oga")
            ? "ogg"
            : contentType.includes("audio/mp4") || u.endsWith(".m4a")
              ? "m4a"
              : contentType.includes("audio/aac") || u.endsWith(".aac")
                ? "aac"
                : contentType.includes("audio/flac") || u.endsWith(".flac")
                  ? "flac"
                  : contentType.includes("audio/aiff") || u.endsWith(".aiff") || u.endsWith(".aif")
                    ? "aiff"
                    : "ogg";

    const buf = Buffer.from(await res.arrayBuffer());
    return { base64: buf.toString("base64"), format };
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
    const apiKey = process.env.OPENROUTER_API_KEY || "";
    if (!apiKey) {
      return { error: "OPENROUTER_API_KEY not configured", code: "NO_API_KEY" };
    }

    const audio = await this.downloadAudio(audioUrl);
    if (!audio) {
      return { error: "Failed to download audio", code: "DOWNLOAD_FAILED" };
    }

    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://vayva.tech",
          "X-Title": "Vayva Voice",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          temperature: 0,
          max_tokens: 512,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Transcribe this audio. Return only the transcript text." },
                {
                  type: "input_audio",
                  inputAudio: { data: audio.base64, format: audio.format },
                },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(45_000),
      });

      if (!res.ok) {
        const detail = await res.text().catch(() => "");
        logger.warn("[VOICE_TRANSCRIPTION_FAILED]", undefined, {
          storeId,
          status: res.status,
          detail: detail.slice(0, 200),
        });
        return { error: "Transcription failed", code: "TRANSCRIPTION_FAILED" };
      }

      const data = (await res.json()) as any;
      const text = String(data?.choices?.[0]?.message?.content || "").trim();
      if (!text) {
        return { error: "Empty transcription", code: "EMPTY_TRANSCRIPT" };
      }

      return {
        text,
        language: "unknown",
        confidence: 0.8,
      };
    } catch (e: unknown) {
      logger.warn("[VOICE_TRANSCRIPTION_ERROR]", undefined, { storeId, error: String(e) });
      return { error: "Transcription error", code: "TRANSCRIPTION_ERROR" };
    }
  }

  /**
   * Check if voice processing is available (API key configured)
   */
  static isAvailable(): boolean {
    return Boolean(process.env.OPENROUTER_API_KEY);
  }
}

// Export singleton instance
export const voiceProcessor = new VoiceProcessor();
