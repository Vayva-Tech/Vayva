import { OpenRouterClient } from "./openrouter-client";

interface CallAIOptions {
  model: string;
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>;
  temperature?: number;
  maxTokens?: number;
  storeId?: string;
  requestId?: string;
}

interface AIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

/**
 * Call AI service to generate content
 * Uses OpenRouter as the underlying implementation
 */
export async function callAI(options: CallAIOptions): Promise<AIResponse> {
  const client = new OpenRouterClient("MERCHANT");
  
  const response = await client.chatCompletion(
    options.messages.map(m => ({ role: m.role, content: m.content })),
    {
      model: options.model,
      temperature: options.temperature,
      maxTokens: options.maxTokens,
      storeId: options.storeId,
      requestId: options.requestId,
    }
  );

  // If response is null (API key missing), return a graceful fallback
  if (!response) {
    return {
      choices: [
        {
          message: {
            content: "AI service is currently unavailable. Please try again later.",
          },
        },
      ],
    };
  }

  // Extract content from ChatCompletion response
  const content = response.choices?.[0]?.message?.content ?? "";

  return {
    choices: [
      {
        message: {
          content,
        },
      },
    ],
  };
}
