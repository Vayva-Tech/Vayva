/**
 * Vayva AI Core Service
 * Industry-trained AI Business Assistant
 */

import { OpenRouterClient } from '@vayva/ai-agent'; // Assuming this export exists
import { LRUCache } from 'lru-cache';
import type {
  VayvaAIConfig,
  VayvaAICapabilities,
  AIConversation,
  ConversationMessage,
  Customer,
  ConversationContext,
  ConversationResult,
  IntentClassification,
  ProductRecommendation,
  OrderResult,
  EscalationDecision,
  IndustrySlug,
  LanguageCode,
  ChannelType,
} from './types';
import { languageService } from './languages';
import { getIndustryContext, getIndustryScenarios } from './industry-training';

export interface VayvaAIOptions {
  openRouterApiKey: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
}

export class VayvaAI implements VayvaAICapabilities {
  private config: VayvaAIConfig;
  private aiClient: OpenRouterClient;
  private conversations: LRUCache<string, AIConversation>;
  private options: VayvaAIOptions;

  constructor(config: VayvaAIConfig, options: VayvaAIOptions) {
    this.config = config;
    this.options = {
      model: 'deepseek/deepseek-chat',
      maxTokens: 1024,
      temperature: 0.7,
      ...options,
    };
    this.aiClient = new OpenRouterClient("INDUSTRY"); // Pass context
    this.conversations = new LRUCache({
      max: 1000,
      ttl: 1000 * 60 * 60 * 24, // 24 hours
    });
  }

  /**
   * Start or retrieve a conversation
   */
  async startConversation(
    customer: Customer,
    channel: ChannelType,
    language?: LanguageCode
  ): Promise<AIConversation> {
    const conversationId = `${this.config.storeId}_${customer.id}_${channel}`;
    
    let conversation = this.conversations.get(conversationId);
    
    if (!conversation) {
      const detectedLang = language || languageService.detectLanguage(customer.name || '');
      
      conversation = {
        id: conversationId,
        storeId: this.config.storeId,
        customerId: customer.id,
        channel,
        language: detectedLang,
        industry: this.config.industryTraining,
        messages: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add greeting message
      const greeting = languageService.getGreeting(detectedLang);
      conversation.messages.push({
        id: `msg_${Date.now()}`,
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
        language: detectedLang,
      });

      this.conversations.set(conversationId, conversation);
    }

    return conversation;
  }

  /**
   * Handle complete conversation flow
   */
  async handleCompleteConversation(
    customer: Customer,
    intent: string,
    context?: ConversationContext
  ): Promise<ConversationResult> {
    const conversation = await this.startConversation(customer, 'web');
    
    // Add user message
    conversation.messages.push({
      id: `msg_${Date.now()}`,
      role: 'user',
      content: intent,
      timestamp: new Date(),
      language: conversation.language,
    });

    // Check for escalation
    const escalation = await this.shouldEscalate(conversation);
    if (escalation.shouldEscalate) {
      conversation.status = 'escalated';
      return {
        message: languageService.translate('escalate.human', conversation.language),
        escalate: true,
        escalateReason: escalation.reason,
      };
    }

    // Generate AI response
    const response = await this.generateResponse(conversation, context);
    
    // Add assistant message
    conversation.messages.push({
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: response.message,
      timestamp: new Date(),
      language: conversation.language,
    });

    conversation.updatedAt = new Date();
    this.conversations.set(conversation.id, conversation);

    return response;
  }

  /**
   * Classify user intent
   */
  async classifyIntent(message: string, language: LanguageCode): Promise<IntentClassification> {
    const industryContext = getIndustryContext(this.config.industryTraining);
    
    const systemPrompt = `You are an intent classification AI for a ${this.config.industryTraining} business.
Available intents: greeting, product_inquiry, price_inquiry, order_status, support_request, complaint, general_question, sales_inquiry, booking_request, goodbye

Respond with JSON only:
{
  "intent": "intent_name",
  "confidence": 0.95,
  "entities": {"key": "value"}
}`;

    try {
      const response = await this.aiClient.chatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        {
          model: this.options.model!,
          maxTokens: 256,
          temperature: 0.1,
          jsonMode: true,
        }
      );

      if (!response) {
        throw new Error("AI service unavailable");
      }

      const result = JSON.parse(response.choices[0]?.message?.content || '{}');
      
      return {
        intent: result.intent || 'general_question',
        confidence: result.confidence || 0.5,
        entities: result.entities || {},
      };
    } catch (error) {
      console.error('Intent classification error:', error);
      return {
        intent: 'general_question',
        confidence: 0.5,
        entities: {},
      };
    }
  }

  /**
   * Generate product recommendations
   */
  async recommendProducts(
    customer: Customer,
    context: string,
    industry: IndustrySlug
  ): Promise<ProductRecommendation[]> {
    // In production, this would query the product database
    // and use AI to generate personalized recommendations
    
    const mockRecommendations: ProductRecommendation[] = [
      {
        productId: 'prod_1',
        name: 'Recommended Product 1',
        price: 15000,
        reason: 'Based on your preferences',
        confidence: 0.85,
      },
      {
        productId: 'prod_2',
        name: 'Recommended Product 2',
        price: 25000,
        reason: 'Popular in your area',
        confidence: 0.78,
      },
    ];

    return mockRecommendations;
  }

  /**
   * Process an order from conversation
   */
  async processOrder(conversation: AIConversation): Promise<OrderResult> {
    // In production, this would integrate with the order system
    
    return {
      success: true,
      orderId: `ORD_${Date.now()}`,
      total: 50000,
      message: languageService.translate('order.confirmation', conversation.language),
    };
  }

  /**
   * Determine if conversation should escalate to human
   */
  async shouldEscalate(conversation: AIConversation): Promise<EscalationDecision> {
    const lastMessages = conversation.messages.slice(-5);
    const userMessages = lastMessages.filter(m => m.role === 'user');
    
    // Check escalation rules
    for (const rule of this.config.escalationRules) {
      if (rule.condition === 'complex_query') {
        // Check for complex indicators
        const complexIndicators = ['complaint', 'refund', 'legal', 'manager', 'supervisor'];
        const hasComplex = userMessages.some(m => 
          complexIndicators.some(i => m.content.toLowerCase().includes(i))
        );
        
        if (hasComplex) {
          return {
            shouldEscalate: true,
            reason: 'Complex query detected',
            priority: 'high',
          };
        }
      }
      
      if (rule.condition === 'negative_sentiment') {
        // Simple sentiment check
        const negativeWords = ['angry', 'frustrated', 'terrible', 'worst', 'hate', 'awful'];
        const negativeCount = userMessages.filter(m => 
          negativeWords.some(w => m.content.toLowerCase().includes(w))
        ).length;
        
        if (negativeCount >= rule.threshold) {
          return {
            shouldEscalate: true,
            reason: 'Negative sentiment detected',
            priority: 'high',
          };
        }
      }
    }

    return {
      shouldEscalate: false,
      priority: 'low',
    };
  }

  /**
   * Translate and respond in target language
   */
  async translateAndRespond(message: string, targetLang: LanguageCode): Promise<string> {
    if (targetLang === 'en') {
      return message;
    }

    const systemPrompt = `Translate the following message to ${languageService.getConfig(targetLang).name}.
Maintain the tone and meaning. Respond with only the translation.`;

    try {
      const response = await this.aiClient.chatCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        {
          model: this.options.model!,
          maxTokens: 512,
          temperature: 0.3,
        }
      );

      if (!response) {
        return message;
      }

      return response.choices[0]?.message?.content || message;
    } catch (error) {
      console.error('Translation error:', error);
      return message;
    }
  }

  /**
   * Generate AI response
   */
  private async generateResponse(
    conversation: AIConversation,
    context?: ConversationContext
  ): Promise<ConversationResult> {
    const industryContext = getIndustryContext(this.config.industryTraining);
    const scenarios = getIndustryScenarios(this.config.industryTraining, conversation.language);
    
    // Build system prompt with industry context
    const systemPrompt = `You are Vayva AI, an intelligent assistant for a ${this.config.industryTraining} business.

Industry Context:
${JSON.stringify(industryContext?.terminology, null, 2)}

Tone: ${this.config.merchantTone}
Language: ${conversation.language}

Respond naturally and helpfully. If you cannot help, offer to connect with a human.`;

    // Build message history
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      ...conversation.messages.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    try {
      const response = await this.aiClient.chatCompletion(
        messages,
        {
          model: this.options.model!,
          maxTokens: this.options.maxTokens,
          temperature: this.options.temperature,
        }
      );

      if (!response) {
        throw new Error("AI service unavailable");
      }

      const aiResponse = response.choices[0]?.message?.content || 
        languageService.translate('help.available', conversation.language);

      return {
        message: aiResponse,
      };
    } catch (error) {
      console.error('Response generation error:', error);
      return {
        message: languageService.translate('escalate.human', conversation.language),
        escalate: true,
        escalateReason: 'AI error',
      };
    }
  }

  /**
   * Get conversation by ID
   */
  getConversation(conversationId: string): AIConversation | undefined {
    return this.conversations.get(conversationId);
  }

  /**
   * Get all active conversations for a store
   */
  getStoreConversations(storeId: string): AIConversation[] {
    const conversations: AIConversation[] = [];
    this.conversations.forEach((conv) => {
      if (conv.storeId === storeId) {
        conversations.push(conv);
      }
    });
    return conversations;
  }

  /**
   * End conversation
   */
  endConversation(conversationId: string): void {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.status = 'completed';
      conversation.updatedAt = new Date();
      this.conversations.set(conversationId, conversation);
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<VayvaAIConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export default VayvaAI;
