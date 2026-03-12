/**
 * Vayva AI Industry Types
 * Core type definitions for the industry-trained AI assistant
 */

export type IndustrySlug = 
  | 'fashion' 
  | 'restaurant' 
  | 'realestate' 
  | 'healthcare'
  | 'retail'
  | 'electronics'
  | 'beauty'
  | 'grocery'
  | 'events'
  | 'automotive'
  | 'education'
  | 'services';

export type LanguageCode = 'en' | 'yo' | 'ha' | 'ig' | 'pcm';

export type ChannelType = 'whatsapp' | 'web' | 'mobile' | 'voice';

export type MerchantTone = 'professional' | 'friendly' | 'casual';

export interface VayvaAIConfig {
  languages: LanguageCode[];
  channels: ChannelType[];
  industryTraining: IndustrySlug;
  merchantTone: MerchantTone;
  autoResponse: boolean;
  escalationRules: EscalationRule[];
  storeId: string;
  merchantId: string;
}

export interface EscalationRule {
  id: string;
  condition: 'complex_query' | 'negative_sentiment' | 'high_value' | 'custom';
  threshold: number;
  action: 'notify' | 'transfer' | 'schedule';
  target: string;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  language?: LanguageCode;
  intent?: string;
  confidence?: number;
}

export interface AIConversation {
  id: string;
  storeId: string;
  customerId?: string;
  channel: ChannelType;
  language: LanguageCode;
  industry: IndustrySlug;
  messages: ConversationMessage[];
  intent?: string;
  status: 'active' | 'completed' | 'escalated';
  createdAt: Date;
  updatedAt: Date;
}

export interface IntentClassification {
  intent: string;
  confidence: number;
  entities: Record<string, string>;
}

export interface ProductRecommendation {
  productId: string;
  name: string;
  price: number;
  image?: string;
  reason: string;
  confidence: number;
}

export interface OrderResult {
  success: boolean;
  orderId?: string;
  total?: number;
  message: string;
}

export interface ConversationResult {
  message: string;
  recommendations?: ProductRecommendation[];
  order?: OrderResult;
  escalate?: boolean;
  escalateReason?: string;
}

export interface EscalationDecision {
  shouldEscalate: boolean;
  reason?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

export interface TrainingScenario {
  id: string;
  category: 'faq' | 'product' | 'order' | 'support' | 'sales';
  industry: IndustrySlug;
  language: LanguageCode;
  question: string;
  answer: string;
  variations: string[];
  entities?: Record<string, string>;
}

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  greeting: string;
  fallback: LanguageCode;
  rtl: boolean;
}

export interface ChannelConfig {
  type: ChannelType;
  enabled: boolean;
  config: Record<string, unknown>;
}

export interface VayvaAICapabilities {
  handleCompleteConversation: (
    customer: Customer,
    intent: string,
    context?: ConversationContext
  ) => Promise<ConversationResult>;
  classifyIntent: (message: string, language: LanguageCode) => Promise<IntentClassification>;
  recommendProducts: (
    customer: Customer,
    context: string,
    industry: IndustrySlug
  ) => Promise<ProductRecommendation[]>;
  processOrder: (conversation: AIConversation) => Promise<OrderResult>;
  shouldEscalate: (conversation: AIConversation) => Promise<EscalationDecision>;
  translateAndRespond: (message: string, targetLang: LanguageCode) => Promise<string>;
}

export interface Customer {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  storeId: string;
  preferences?: Record<string, unknown>;
  orderHistory?: CustomerOrder[];
}

export interface CustomerOrder {
  id: string;
  total: number;
  status: string;
  createdAt: Date;
  items: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface ConversationContext {
  previousOrders?: CustomerOrder[];
  cartItems?: Array<{ productId: string; quantity: number }>;
  browsingHistory?: string[];
  location?: string;
  preferences?: Record<string, unknown>;
}

export interface IndustryContext {
  industry: IndustrySlug;
  terminology: Record<string, string>;
  workflows: string[];
  kpis: string[];
  commonIssues: string[];
}
