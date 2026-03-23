export const AI_MODEL_RATES: Record<string, { input: number; output: number; displayName: string }> = {
  'openai/gpt-4o-mini': { input: 0.15, output: 0.60, displayName: 'GPT-4o Mini' },
  'meta-llama/llama-3.3-70b-instruct': { input: 0.10, output: 0.32, displayName: 'Llama 3.3 70B' },
  'anthropic/claude-3-sonnet': { input: 3.00, output: 15.00, displayName: 'Claude 3 Sonnet' },
  'mistralai/mistral-large': { input: 0.80, output: 2.40, displayName: 'Mistral Large' },
};

// Rates are in USD per 1M tokens
// NGN conversion: multiply by exchange rate (default 1600)
export const DEFAULT_NGN_RATE = 1600;
