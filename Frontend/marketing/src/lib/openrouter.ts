type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export async function openRouterChatCompletion(options: {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  maxTokens?: number;
}): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY || "";
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      "HTTP-Referer": "https://vayva.tech",
      "X-Title": "Vayva Marketing",
    },
    body: JSON.stringify({
      model: options.model || "google/gemini-2.5-flash",
      messages: options.messages,
      temperature: typeof options.temperature === "number" ? options.temperature : 0.7,
      max_tokens: typeof options.maxTokens === "number" ? options.maxTokens : 512,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`OpenRouter error ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: unknown } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : String(content ?? "");
}

