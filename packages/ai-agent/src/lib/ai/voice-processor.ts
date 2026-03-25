import { logger } from "../logger";

export interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
}

export interface TranscriptionError {
  error: string;
  code: string;
}

/**
 * VoiceProcessor - Handles voice note transcription
 * Transcribes audio using OpenRouter multimodal audio inputs.
 */
export class VoiceProcessor {
  async transcribe(audioUrl: string, _storeId: string): Promise<TranscriptionResult | TranscriptionError> {
    const apiKey = process.env.OPENROUTER_API_KEY || "";
    if (!apiKey) return { error: "OPENROUTER_API_KEY not configured", code: "NO_API_KEY" };

    try {
      const res = await fetch(audioUrl, { signal: AbortSignal.timeout(30_000) });
      if (!res.ok) return { error: "Failed to download audio", code: "DOWNLOAD_FAILED" };

      const contentType = (res.headers.get("content-type") || "").toLowerCase();
      const u = audioUrl.toLowerCase();
      const format =
        contentType.includes("audio/wav") || u.endsWith(".wav")
          ? "wav"
          : contentType.includes("audio/mpeg") || u.endsWith(".mp3")
            ? "mp3"
            : contentType.includes("audio/mp4") || u.endsWith(".m4a")
              ? "m4a"
              : "ogg";

      const buf = Buffer.from(await res.arrayBuffer());
      const base64 = buf.toString("base64");

      const llm = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
                { type: "input_audio", inputAudio: { data: base64, format } },
              ],
            },
          ],
        }),
        signal: AbortSignal.timeout(45_000),
      });

      if (!llm.ok) return { error: "Transcription failed", code: "TRANSCRIPTION_FAILED" };
      const data = (await llm.json()) as any;
      const text = String(data?.choices?.[0]?.message?.content || "").trim();
      return { text, language: "unknown", confidence: 0.8 };
    } catch (e: unknown) {
      logger.warn("[VoiceProcessor] Transcription error", undefined, { error: String(e) });
      return { error: "Transcription error", code: "TRANSCRIPTION_ERROR" };
    }
  }
}
