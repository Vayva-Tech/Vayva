import { logger } from "../logger.js";

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
 * Stub implementation - full implementation requires Groq Whisper API
 */
export class VoiceProcessor {
  async transcribe(audioUrl: string, _storeId: string): Promise<TranscriptionResult | TranscriptionError> {
    logger.info("[VoiceProcessor] Transcription requested", { audioUrl });
    
    // Stub: Return error since full implementation requires Whisper API
    return {
      error: "Voice transcription not implemented",
      code: "NOT_IMPLEMENTED",
    };
  }
}
