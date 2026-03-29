import Fastify from 'fastify';
import cors from '@fastify/cors';
import axios from 'axios';
import neo4j, { Driver } from 'neo4j-driver';
import { z } from 'zod';

// ============================================================================
// CONFIGURATION
// ============================================================================

const config = {
  ollamaUrl: process.env.ML_OLLAMA_URL || 'http://localhost:11434',
  qdrantUrl: process.env.ML_QDRANT_URL || 'http://localhost:6333',
  embeddingUrl: process.env.ML_EMBEDDING_URL || 'http://localhost:8001',
  neo4jUri: process.env.ML_NEO4J_URI || 'bolt://localhost:7687',
  neo4jUser: process.env.ML_NEO4J_USER || 'neo4j',
  neo4jPassword: process.env.ML_NEO4J_PASSWORD || 'local_password_123',
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openRouterUrl: process.env.OPENROUTER_URL || 'https://openrouter.ai/api/v1/chat/completions',
  port: parseInt(process.env.ML_GATEWAY_PORT || '3000'),
  host: process.env.ML_GATEWAY_HOST || '0.0.0.0'
};

// ============================================================================
// TYPES & SCHEMAS
// ============================================================================

interface QueryClassification {
  requires_internet: boolean;
  requires_merchant_data: boolean;
  simple_math: boolean;
  intent: string;
}

interface QueryResult {
  answer: string;
  source: 'local' | 'openrouter' | 'hybrid';
  cost: number;
  latency_ms: number;
  context_used?: string[];
}

const QueryRequestSchema = z.object({
  query: z.string().min(1),
  merchant_id: z.string().min(1),
  stream: z.boolean().optional().default(false)
});

type QueryRequest = z.infer<typeof QueryRequestSchema>;

// ============================================================================
// QUERY ROUTER CLASS
// ============================================================================

class QueryRouter {
  private neo4jDriver: Driver | null = null;

  constructor() {
    this.initializeNeo4j();
  }

  private async initializeNeo4j() {
    try {
      this.neo4jDriver = neo4j.driver(
        config.neo4jUri,
        neo4j.auth.basic(config.neo4jUser, config.neo4jPassword)
      );
      
      // Test connection
      await this.neo4jDriver.verifyConnectivity();
      console.log('✓ Neo4j connected');
    } catch (error) {
      console.error('✗ Neo4j connection failed:', error);
    }
  }

  /**
   * Classify query intent using keyword matching
   * Can be enhanced with ML classifier later
   */
  private classifyQuery(query: string): QueryClassification {
    const internetKeywords = [
      'competitor', 'market trend', 'industry benchmark', 'news', 'weather',
      'social media', 'review site', 'latest', 'trending', 'forecast'
    ];

    const merchantDataKeywords = [
      'my sales', 'my inventory', 'my customers', 'my products',
      'last week', 'yesterday', 'this month', 'order', 'customer',
      'product', 'stock', 'revenue', 'profit'
    ];

    const mathKeywords = ['%', 'average', 'total', 'sum', 'calculate', 'margin'];

    const lowerQuery = query.toLowerCase();

    return {
      requires_internet: internetKeywords.some(kw => lowerQuery.includes(kw)),
      requires_merchant_data: merchantDataKeywords.some(kw => lowerQuery.includes(kw)),
      simple_math: mathKeywords.some(kw => lowerQuery.includes(kw)),
      intent: this.detectIntent(query)
    };
  }

  private detectIntent(query: string): string {
    const patterns: Record<string, string> = {
      '^(what|show|list).*(product|inventory)': 'product_query',
      '^(who|which).*(customer|client)': 'customer_query',
      '^(how much|what).*(sale|revenue|profit)': 'sales_query',
      '^(calculate|compute|find).*(average|total|sum)': 'calculation',
      '^(generate|create|write).*(message|email)': 'content_generation'
    };

    for (const [pattern, intent] of Object.entries(patterns)) {
      if (new RegExp(pattern, 'i').test(query)) {
        return intent;
      }
    }

    return 'general_query';
  }

  /**
   * Main routing logic
   */
  async routeQuery(query: string, merchantId: string): Promise<QueryResult> {
    const startTime = Date.now();
    const classification = this.classifyQuery(query);

    console.log('\n🔍 Query Classification:');
    console.log(`   Query: "${query}"`);
    console.log(`   Intent: ${classification.intent}`);
    console.log(`   Requires Internet: ${classification.requires_internet}`);
    console.log(`   Requires Merchant Data: ${classification.requires_merchant_data}`);

    try {
      // Route 1: Internet research required → OpenRouter (PAID)
      if (classification.requires_internet) {
        console.log('🌐 Routing to OpenRouter (internet research)');
        return await this.useOpenRouter(query, merchantId, startTime);
      }

      // Route 2: Merchant data required → Local RAG
      if (classification.requires_merchant_data) {
        console.log('🏠 Routing to local RAG (merchant data)');
        return await this.useLocalRAG(query, merchantId, startTime);
      }

      // Route 3: Simple query → Local LLM
      console.log('💬 Routing to local LLM (simple query)');
      return await this.useLocalLLM(query, startTime);

    } catch (error) {
      console.error('✗ Query processing failed:', error);
      throw error;
    }
  }

  /**
   * Use OpenRouter for internet research queries
   */
  private async useOpenRouter(query: string, merchantId: string, startTime: number): Promise<QueryResult> {
    if (!config.openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const response = await axios.post(
      config.openRouterUrl,
      {
        model: 'meta-llama/llama-3-70b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful AI assistant for merchants. Provide accurate, helpful responses.'
          },
          {
            role: 'user',
            content: query
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openRouterApiKey}`,
          'HTTP-Referer': 'https://vayva.ng',
          'Content-Type': 'application/json'
        }
      }
    );

    const latency = Date.now() - startTime;
    const cost = 0.002; // Approximate cost per query

    return {
      answer: response.data.choices[0].message.content,
      source: 'openrouter',
      cost: cost,
      latency_ms: latency
    };
  }

  /**
   * Use local RAG pipeline for merchant data queries
   */
  private async useLocalRAG(query: string, merchantId: string, startTime: number): Promise<QueryResult> {
    const context: string[] = [];

    // Step 1: Generate embedding for query
    console.log('   → Generating embedding...');
    const embeddingResponse = await axios.post(`${config.embeddingUrl}/embed`, {
      text: query,
      normalize: true
    });

    const queryEmbedding = embeddingResponse.data.embedding;

    // Step 2: Search Qdrant for relevant products
    console.log('   → Searching Qdrant...');
    try {
      const searchResponse = await axios.post(
        `${config.qdrantUrl}/collections/vayva_products_local/search`,
        {
          vector: queryEmbedding,
          limit: 5,
          with_payload: true
        }
      );

      const productContext = searchResponse.data.result
        .map((r: any) => r.payload?.name || r.payload?.text)
        .filter(Boolean)
        .join(', ');

      if (productContext) {
        context.push(`Products: ${productContext}`);
      }
    } catch (error) {
      console.log('   ⊘ Qdrant search failed (collection may not exist yet)');
    }

    // Step 3: Query Neo4j for graph relationships
    console.log('   → Querying Neo4j...');
    if (this.neo4jDriver) {
      try {
        const session = this.neo4jDriver.session();
        const result = await session.run(
          `MATCH (m:Merchant {id: $merchantId})-[:HAS_ORDER]->(o:Order)-[:CONTAINS]->(p:Product)
           RETURN p.name as product, o.total_amount as amount
           LIMIT 5`,
          { merchantId }
        );

        const graphContext = result.records
          .map((record: any) => `${record.get('product')} (₦${record.get('amount')})`)
          .join(', ');

        if (graphContext) {
          context.push(`Recent orders: ${graphContext}`);
        }

        await session.close();
      } catch (error) {
        console.log('   ⊘ Neo4j query failed (graph may not be populated yet)');
      }
    }

    // Step 4: Build prompt with context
    const systemPrompt = `You are an AI assistant for merchants. Use ONLY the provided context to answer questions. If you don't know or the context is empty, say "I don't have enough information about that."`;

    const userPrompt = `Context from merchant database:
${context.join('\n\n')}

Question: ${query}

Answer using ONLY the provided context. If there's no relevant context, say so.`;

    // Step 5: Query local Ollama LLM
    console.log('   → Querying local LLM (Phi-3)...');
    const ollamaResponse = await axios.post(`${config.ollamaUrl}/api/generate`, {
      model: 'phi3:mini',
      prompt: userPrompt,
      system: systemPrompt,
      stream: false
    });

    const latency = Date.now() - startTime;

    return {
      answer: ollamaResponse.data.response,
      source: 'local',
      cost: 0,
      latency_ms: latency,
      context_used: context
    };
  }

  /**
   * Use local LLM for simple queries
   */
  private async useLocalLLM(query: string, startTime: number): Promise<QueryResult> {
    const response = await axios.post(`${config.ollamaUrl}/api/generate`, {
      model: 'phi3:mini',
      prompt: query,
      stream: false
    });

    const latency = Date.now() - startTime;

    return {
      answer: response.data.response,
      source: 'local',
      cost: 0,
      latency_ms: latency
    };
  }

  async close() {
    if (this.neo4jDriver) {
      await this.neo4jDriver.close();
    }
  }
}

// ============================================================================
// FASTIFY SERVER SETUP
// ============================================================================

const fastify = Fastify({
  logger: true
});

// Register plugins
await fastify.register(cors, {
  origin: true,
  credentials: true
});

await fastify.register(require('@fastify/formbody'));

// Initialize router
const queryRouter = new QueryRouter();

// ============================================================================
// API ENDPOINTS
// ============================================================================

/**
 * POST /api/v1/ai/query
 * Main query endpoint with intelligent routing
 */
fastify.post('/api/v1/ai/query', async (request: any, reply: any) => {
  try {
    // Validate request
    const validated = QueryRequestSchema.parse(request.body);
    const { query, merchant_id } = validated;

    // Route query
    const result = await queryRouter.routeQuery(query, merchant_id);

    // Log for monitoring
    console.log('\n✅ Query Result:');
    console.log(`   Source: ${result.source}`);
    console.log(`   Cost: ₦${result.cost.toFixed(4)}`);
    console.log(`   Latency: ${result.latency_ms}ms`);

    return {
      success: true,
      answer: result.answer,
      source: result.source,
      cost: result.cost,
      latency_ms: result.latency_ms,
      context_used: result.context_used
    };

  } catch (error: any) {
    console.error('✗ Query failed:', error.message);
    
    if (error instanceof z.ZodError) {
      return reply.code(400).send({
        success: false,
        error: 'Invalid request',
        details: error.errors
      });
    }

    return reply.code(500).send({
      success: false,
      error: error.message || 'Query processing failed'
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
fastify.get('/health', async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      ollama: config.ollamaUrl,
      qdrant: config.qdrantUrl,
      embedding: config.embeddingUrl,
      neo4j: config.neo4jUri
    }
  };
});

/**
 * GET /metrics
 * Basic metrics endpoint
 */
fastify.get('/metrics', async () => {
  return {
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    config: {
      port: config.port,
      host: config.host
    }
  };
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

const start = async () => {
  try {
    await fastify.listen({ port: config.port, host: config.host });
    console.log(`\n🚀 ML Gateway running on http://${config.host}:${config.port}`);
    console.log('\nEndpoints:');
    console.log('  POST /api/v1/ai/query - Intelligent query routing');
    console.log('  GET  /health          - Health check');
    console.log('  GET  /metrics         - Service metrics');
    console.log('\nConfiguration:');
    console.log(`  Ollama:       ${config.ollamaUrl}`);
    console.log(`  Qdrant:       ${config.qdrantUrl}`);
    console.log(`  Embedding:    ${config.embeddingUrl}`);
    console.log(`  Neo4j:        ${config.neo4jUri}`);
    console.log(`  OpenRouter:   ${config.openRouterApiKey ? 'Configured' : 'Not configured'}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await queryRouter.close();
  await fastify.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n👋 Shutting down gracefully...');
  await queryRouter.close();
  await fastify.close();
  process.exit(0);
});

start();
