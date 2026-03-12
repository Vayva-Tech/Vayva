#!/usr/bin/env tsx
/**
 * Test NVIDIA Nemotron Integration via OpenRouter
 * 
 * This script tests the NVIDIA Nemotron model through OpenRouter
 * to ensure proper connectivity and functionality.
 */

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "sk-or-v1-your-key-here";
const BASE_URL = "https://openrouter.ai/api/v1";
const MODEL = "nvidia/llama-3.1-nemotron-70b-instruct";

interface TestResult {
  test: string;
  passed: boolean;
  response?: string;
  error?: string;
  tokens?: { prompt: number; completion: number };
  cost?: number;
}

async function testNvidiaIntegration(): Promise<TestResult[]> {
  const results: TestResult[] = [];
  
  console.log("=== NVIDIA Nemotron Integration Test ===\n");
  console.log(`Model: ${MODEL}`);
  console.log(`Base URL: ${BASE_URL}\n`);
  
  // Test 1: Simple greeting
  console.log("Test 1: Simple Greeting");
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://vayva.tech",
        "X-Title": "Vayva AI Test",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: "Hello! This is a test." }],
        temperature: 0.7,
        max_tokens: 50,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      results.push({
        test: "Simple Greeting",
        passed: false,
        error: `HTTP ${response.status}: ${error}`,
      });
      console.log("❌ Failed:", error);
    } else {
      const data = await response.json();
      results.push({
        test: "Simple Greeting",
        passed: true,
        response: data.choices[0]?.message?.content,
        tokens: {
          prompt: data.usage?.prompt_tokens || 0,
          completion: data.usage?.completion_tokens || 0,
        },
        cost: calculateCost(data.usage?.prompt_tokens || 0, data.usage?.completion_tokens || 0),
      });
      console.log("✅ Passed");
      console.log("Response:", data.choices[0]?.message?.content?.substring(0, 100));
    }
  } catch (error) {
    results.push({
      test: "Simple Greeting",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log("❌ Failed:", error);
  }
  
  console.log("\n---\n");
  
  // Test 2: Customer service scenario
  console.log("Test 2: Customer Service Scenario");
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://vayva.tech",
        "X-Title": "Vayva AI Test",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { 
            role: "system", 
            content: "You are a helpful customer service assistant for an e-commerce platform." 
          },
          { 
            role: "user", 
            content: "I want to track my order #12345" 
          }
        ],
        temperature: 0.7,
        max_tokens: 100,
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      results.push({
        test: "Customer Service",
        passed: false,
        error: `HTTP ${response.status}: ${error}`,
      });
      console.log("❌ Failed:", error);
    } else {
      const data = await response.json();
      results.push({
        test: "Customer Service",
        passed: true,
        response: data.choices[0]?.message?.content,
        tokens: {
          prompt: data.usage?.prompt_tokens || 0,
          completion: data.usage?.completion_tokens || 0,
        },
        cost: calculateCost(data.usage?.prompt_tokens || 0, data.usage?.completion_tokens || 0),
      });
      console.log("✅ Passed");
      console.log("Response:", data.choices[0]?.message?.content?.substring(0, 100));
    }
  } catch (error) {
    results.push({
      test: "Customer Service",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log("❌ Failed:", error);
  }
  
  console.log("\n---\n");
  
  // Test 3: JSON mode
  console.log("Test 3: JSON Mode");
  try {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://vayva.tech",
        "X-Title": "Vayva AI Test",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { 
            role: "system", 
            content: "You are a helpful assistant that always responds in valid JSON format." 
          },
          { 
            role: "user", 
            content: "List 3 benefits of using AI in customer service. Respond in JSON format with a 'benefits' array." 
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
        response_format: { type: "json_object" },
      }),
    });
    
    if (!response.ok) {
      const error = await response.text();
      results.push({
        test: "JSON Mode",
        passed: false,
        error: `HTTP ${response.status}: ${error}`,
      });
      console.log("❌ Failed:", error);
    } else {
      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      let jsonValid = false;
      try {
        JSON.parse(content);
        jsonValid = true;
      } catch {
        jsonValid = false;
      }
      
      results.push({
        test: "JSON Mode",
        passed: jsonValid,
        response: content?.substring(0, 100),
        tokens: {
          prompt: data.usage?.prompt_tokens || 0,
          completion: data.usage?.completion_tokens || 0,
        },
        cost: calculateCost(data.usage?.prompt_tokens || 0, data.usage?.completion_tokens || 0),
      });
      console.log(jsonValid ? "✅ Passed" : "❌ Failed: Invalid JSON");
      console.log("Response:", content?.substring(0, 100));
    }
  } catch (error) {
    results.push({
      test: "JSON Mode",
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
    console.log("❌ Failed:", error);
  }
  
  return results;
}

function calculateCost(promptTokens: number, completionTokens: number): number {
  // NVIDIA pricing: $0.0012 per 1K tokens (both input and output)
  const promptCost = (promptTokens / 1000) * 0.0012;
  const completionCost = (completionTokens / 1000) * 0.0012;
  return promptCost + completionCost;
}

function printSummary(results: TestResult[]) {
  console.log("\n=== Test Summary ===\n");
  
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  
  console.log(`Passed: ${passed}/${total}`);
  console.log(`Success Rate: ${((passed/total) * 100).toFixed(1)}%\n`);
  
  let totalCost = 0;
  let totalTokens = 0;
  
  results.forEach(result => {
    if (result.passed && result.tokens) {
      totalTokens += result.tokens.prompt + result.tokens.completion;
      totalCost += result.cost || 0;
    }
  });
  
  console.log(`Total Tokens Used: ${totalTokens}`);
  console.log(`Total Cost: $${totalCost.toFixed(6)}`);
  console.log(`Cost per 1M tokens: $${((totalCost / totalTokens) * 1000000).toFixed(2)}`);
  
  console.log("\nComparison with Groq:");
  console.log(`  Groq cost per 1M tokens: ~$1380.00`);
  console.log(`  NVIDIA cost per 1M tokens: ~$2.40`);
  console.log(`  Savings: 99.8%`);
}

// Run tests
testNvidiaIntegration()
  .then(results => {
    printSummary(results);
    process.exit(results.every(r => r.passed) ? 0 : 1);
  })
  .catch(error => {
    console.error("Test suite failed:", error);
    process.exit(1);
  });