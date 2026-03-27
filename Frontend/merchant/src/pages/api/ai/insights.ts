/**
 * AI Insights API Routes
 * RESTful endpoints for predictive analytics and recommendations
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { aiInsightsEngine, type AIInsight, type PredictiveForecast, type AnomalyDetectionResult } from '@vayva/ai-industry';
import type { IndustrySlug } from '@vayva/domain';

// ============================================================================
// Types
// ============================================================================

interface InsightsResponse {
  insights: AIInsight[];
  forecasts: PredictiveForecast[];
  anomalies: AnomalyDetectionResult[];
  generatedAt: Date;
}

interface ForecastRequest {
  industry: IndustrySlug;
  metric: string;
  timeframe: '7d' | '30d' | '90d' | '1y';
  historicalData: Array<{ date: string; value: number }>;
}

interface ForecastResponse {
  forecast: PredictiveForecast;
}

interface NLQueryRequest {
  query: string;
  industry: IndustrySlug;
  context?: Record<string, unknown>;
}

interface NLQueryResponse {
  answer: string;
  data: unknown;
  visualization?: 'chart' | 'table' | 'metric' | 'list';
  followUpQuestions?: string[];
}

// ============================================================================
// GET /api/ai/insights
// Fetch AI-powered insights for a merchant
// ============================================================================

async function getInsights(req: NextApiRequest, res: NextApiResponse<InsightsResponse>) {
  try {
    const { industry, storeId } = req.query;
    
    if (!industry || typeof industry !== 'string') {
      return res.status(400).json({ error: 'Industry is required' } as any);
    }

    // Generate insights based on industry and merchant data
    const insights: AIInsight[] = [];
    const forecasts: PredictiveForecast[] = [];
    const anomalies: AnomalyDetectionResult[] = [];

    // In production, fetch actual merchant data
    // For now, generate contextual insights based on industry
    const industryInsights = generateIndustryInsights(industry as IndustrySlug);
    insights.push(...industryInsights);

    // Detect anomalies in recent data
    const anomalyData = await fetchMerchantData(industry as IndustrySlug, storeId as string);
    if (anomalyData) {
      const detectedAnomalies = aiInsightsEngine.detectAnomalies({
        metric: 'revenue',
        data: anomalyData.revenueHistory,
      });
      anomalies.push(...detectedAnomalies);
    }

    // Generate forecasts for key metrics
    if (anomalyData) {
      const revenueForecast = await aiInsightsEngine.forecastDemand({
        industry: industry as IndustrySlug,
        metric: 'revenue',
        historicalData: anomalyData.revenueHistory,
        timeframe: '30d',
      });
      forecasts.push(revenueForecast);
    }

    res.status(200).json({
      insights,
      forecasts,
      anomalies,
      generatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error generating insights:', error);
    res.status(500).json({ error: 'Failed to generate insights' } as any);
  }
}

// ============================================================================
// POST /api/ai/forecast
// Generate predictive forecast
// ============================================================================

async function postForecast(req: NextApiRequest, res: NextApiResponse<ForecastResponse>) {
  try {
    const { industry, metric, timeframe, historicalData }: ForecastRequest = req.body;

    if (!industry || !metric || !timeframe || !historicalData) {
      return res.status(400).json({ error: 'Missing required parameters' } as any);
    }

    // Convert string dates to Date objects
    const parsedData = historicalData.map(d => ({
      date: new Date(d.date),
      value: d.value,
    }));

    const forecast = await aiInsightsEngine.forecastDemand({
      industry,
      metric,
      historicalData: parsedData,
      timeframe,
    });

    res.status(200).json({ forecast });
  } catch (error) {
    console.error('Error generating forecast:', error);
    res.status(500).json({ error: 'Failed to generate forecast' } as any);
  }
}

// ============================================================================
// POST /api/ai/natural-language-query
// Process natural language analytics queries
// ============================================================================

async function postNLQuery(req: NextApiRequest, res: NextApiResponse<NLQueryResponse>) {
  try {
    const { query, industry, context }: NLQueryRequest = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' } as any);
    }

    // Parse natural language query
    const parsedQuery = aiInsightsEngine.parseNaturalLanguageQuery(query);
    
    // Execute query against analytics engine
    const result = await executeAnalyticsQuery(parsedQuery, industry, context);

    // Generate follow-up questions
    const followUpQuestions = generateFollowUpQuestions(parsedQuery);

    res.status(200).json({
      answer: parsedQuery.response.answer,
      data: result.data,
      visualization: parsedQuery.response.visualization,
      followUpQuestions,
    });
  } catch (error) {
    console.error('Error processing NL query:', error);
    res.status(500).json({ error: 'Failed to process query' } as any);
  }
}

// ============================================================================
// PUT /api/ai/insights/:id/action
// Take action on an insight
// ============================================================================

async function putInsightAction(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id, action } = req.body;

    if (!id || !action) {
      return res.status(400).json({ error: 'Insight ID and action required' } as any);
    }

    // Log insight action for analytics
    await logInsightAction(id, action);

    // Execute the action
    const result = await executeInsightAction(id, action);

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error('Error executing insight action:', error);
    res.status(500).json({ error: 'Failed to execute action' } as any);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateIndustryInsights(industry: IndustrySlug): AIInsight[] {
  const insights: AIInsight[] = [];

  // Industry-specific insight generation
  switch (industry) {
    case 'retail':
      insights.push(
        {
          id: `insight_retail_${Date.now()}`,
          type: 'opportunity',
          title: 'High-Demand Products Detected',
          description: 'Three products showing 40% higher demand than usual',
          confidence: 0.87,
          impact: 'high',
          category: 'inventory',
          details: 'Products: Item A, Item B, Item C showing unusual traffic and conversion rates',
          recommendation: 'Increase inventory levels by 30% and consider promotional pricing',
          predictedImpact: '+$12,450 revenue potential',
          createdAt: new Date(),
          metadata: { products: ['item-a', 'item-b', 'item-c'] },
        },
        {
          id: `insight_retail_${Date.now() + 1}`,
          type: 'prediction',
          title: 'Weekend Sales Surge Expected',
          description: 'Model predicts 35% increase in weekend orders',
          confidence: 0.82,
          impact: 'medium',
          category: 'revenue',
          details: 'Based on historical patterns and current trends',
          recommendation: 'Ensure adequate staffing and inventory for weekend rush',
          predictedImpact: '+$8,200 projected revenue',
          createdAt: new Date(),
          metadata: { predictedIncrease: 0.35 },
        }
      );
      break;

    case 'fashion':
      insights.push(
        {
          id: `insight_fashion_${Date.now()}`,
          type: 'opportunity',
          title: 'Emerging Trend Alert',
          description: 'Sustainable fashion searches up 120% in your demographic',
          confidence: 0.91,
          impact: 'high',
          category: 'marketing',
          details: 'Customer behavior analysis shows growing interest in eco-friendly products',
          recommendation: 'Launch sustainable collection and highlight eco-friendly materials',
          predictedImpact: '+25% customer engagement',
          createdAt: new Date(),
          metadata: { trendGrowth: 1.2 },
        }
      );
      break;

    case 'grocery':
      insights.push(
        {
          id: `insight_grocery_${Date.now()}`,
          type: 'warning',
          title: 'Expiration Risk Detected',
          description: '$2,340 worth of perishables expiring in 3-5 days',
          confidence: 0.95,
          impact: 'medium',
          category: 'inventory',
          details: 'Dairy and produce categories most affected',
          recommendation: 'Apply 20% discount or bundle with high-demand items',
          predictedImpact: 'Recover $1,870 vs $470 loss',
          createdAt: new Date(),
          metadata: { atRiskValue: 2340 },
        }
      );
      break;

    case 'healthcare-services':
      insights.push(
        {
          id: `insight_healthcare_${Date.now()}`,
          type: 'recommendation',
          title: 'Patient No-Show Risk High',
          description: '15 appointments this week have 60%+ no-show probability',
          confidence: 0.78,
          impact: 'high',
          category: 'operations',
          details: 'Patients with history of cancellations and Monday morning slots',
          recommendation: 'Send reminder SMS 24h before and confirm evening before',
          predictedImpact: 'Recover $4,500 in missed appointments',
          createdAt: new Date(),
          metadata: { atRiskAppointments: 15 },
        }
      );
      break;

    default:
      insights.push(
        {
          id: `insight_default_${Date.now()}`,
          type: 'info',
          title: 'Performance Benchmark',
          description: 'Your performance is 23% above industry average',
          confidence: 0.85,
          impact: 'low',
          category: 'revenue',
          details: 'Strong performance across all key metrics',
          recommendation: 'Continue current strategies and explore growth opportunities',
          predictedImpact: 'Maintain competitive advantage',
          createdAt: new Date(),
          metadata: { performanceDelta: 0.23 },
        }
      );
  }

  return insights;
}

async function fetchMerchantData(
  industry: IndustrySlug,
  storeId: string
): Promise<{ revenueHistory: Array<{ date: Date; value: number }> } | null> {
  // In production, fetch from database
  // For now, return mock data for demonstration
  
  const mockData = {
    revenueHistory: Array.from({ length: 90 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (90 - i));
      
      // Simulate realistic revenue pattern with trend and seasonality
      const baseRevenue = 5000;
      const trend = i * 10;
      const seasonality = Math.sin(i / 7) * 500;
      const noise = (Math.random() - 0.5) * 300;
      
      return {
        date,
        value: baseRevenue + trend + seasonality + noise,
      };
    }),
  };

  return mockData;
}

async function executeAnalyticsQuery(
  parsedQuery: any,
  industry: IndustrySlug,
  context?: Record<string, unknown>
): Promise<{ data: unknown }> {
  // In production, execute actual analytics query
  // For now, return mock response
  return {
    data: {
      metrics: parsedQuery.parsedIntent.metrics,
      timeframe: parsedQuery.parsedIntent.timeframe,
      industry,
    },
  };
}

function generateFollowUpQuestions(parsedQuery: any): string[] {
  const questions: string[] = [];
  
  if (parsedQuery.parsedIntent.action === 'show') {
    questions.push(`How does this compare to last period?`);
    questions.push(`What are the top contributors?`);
  } else if (parsedQuery.parsedIntent.action === 'predict') {
    questions.push(`What assumptions is this based on?`);
    questions.push(`Show me different scenarios`);
  }

  return questions;
}

async function logInsightAction(insightId: string, action: string): Promise<void> {
  // Log to analytics database for tracking insight effectiveness
  console.log(`Insight ${insightId} action: ${action}`);
}

async function executeInsightAction(insightId: string, action: string): Promise<unknown> {
  // Execute the action (e.g., send email, update inventory, create task)
  // This would integrate with other systems
  return { success: true };
}

// ============================================================================
// API Handler
// ============================================================================

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        await getInsights(req, res);
        break;
      case 'POST':
        if (req.url?.includes('/forecast')) {
          await postForecast(req, res);
        } else if (req.url?.includes('/natural-language-query')) {
          await postNLQuery(req, res);
        }
        break;
      case 'PUT':
        await putInsightAction(req, res);
        break;
      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT']);
        res.status(405).end(`Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' } as any);
  }
}
