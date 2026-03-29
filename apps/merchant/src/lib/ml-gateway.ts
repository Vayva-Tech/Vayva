import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const ML_GATEWAY_URL = process.env.NEXT_PUBLIC_ML_GATEWAY_URL || 'http://localhost:3000';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  source?: 'local' | 'openrouter';
  cost?: number;
  latency_ms?: number;
  context_used?: string[];
}

export interface QueryAIParams {
  query: string;
  merchantId: string;
  stream?: boolean;
}

export interface QueryAIResponse {
  success: boolean;
  answer: string;
  source: 'local' | 'openrouter';
  cost: number;
  latency_ms: number;
  context_used?: string[];
}

/**
 * Hook to query the ML Gateway AI API
 */
export function useAIQuery() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (params: QueryAIParams): Promise<QueryAIResponse> => {
      const response = await fetch(`${ML_GATEWAY_URL}/api/v1/ai/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: params.query,
          merchant_id: params.merchantId,
          stream: params.stream || false,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to query AI');
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Invalidate and refetch any relevant queries
      queryClient.invalidateQueries({ queryKey: ['ai-chat'] });
      
      // Log cost for monitoring (could send to analytics)
      if (data.source === 'openrouter') {
        console.log('💰 OpenRouter query cost:', data.cost);
      }
    },
  });

  return {
    queryAI: mutation.mutate,
    queryAIPromise: mutation.mutateAsync,
    isPending: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

/**
 * Hook to manage chat history
 */
export function useChatHistory(merchantId: string) {
  return useQuery({
    queryKey: ['ai-chat-history', merchantId],
    queryFn: async (): Promise<ChatMessage[]> => {
      // TODO: Fetch from backend when implemented
      // For now, return empty array
      return [];
    },
    enabled: !!merchantId,
  });
}
