export interface IntelligenceQuery {
  id: string;
  query: string;
  response?: string;
  createdAt: Date;
}

export interface IntelligenceInsight {
  id: string;
  type: string;
  data: Record<string, any>;
  confidence: number;
}