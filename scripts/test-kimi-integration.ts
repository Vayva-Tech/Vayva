import { DeepSeekClient } from '../packages/ai-agent/src/lib/ai/deepseek-client';

// Test Kimi integration through OpenRouter
async function testKimiIntegration() {
  console.log('=== Kimi API Integration Test ===\n');
  
  // Test with your OpenRouter key
  const kimiApiKey = process.env.KIMI_API_KEY_MERCHANT || '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';
  
  // Create a test client (we'll adapt it for Kimi)
  const testClient = {
    apiKey: kimiApiKey,
    baseUrl: 'https://openrouter.ai/api/v1',
    
    async chatCompletion(messages: any[]) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://vayva.tech', // Required by OpenRouter
            'X-Title': 'Vayva AI Test' // Required by OpenRouter
          },
          body: JSON.stringify({
            model: 'moonshotai/kimi-k2.5', // Correct Kimi model through OpenRouter
            messages: messages,
            temperature: 0.7,
            max_tokens: 100
          })
        });
        
        if (!response.ok) {
          const error = await response.text();
          console.error('API Error:', response.status, error);
          return null;
        }
        
        const data = await response.json();
        return data;
      } catch (error) {
        console.error('Request failed:', error);
        return null;
      }
    }
  };
  
  // Test 1: Simple greeting
  console.log('Test 1: Simple greeting');
  const greetingResponse = await testClient.chatCompletion([
    { role: 'user', content: 'Hello! This is a test message.' }
  ]);
  
  if (greetingResponse) {
    console.log('✅ Greeting test passed');
    console.log('Response:', greetingResponse.choices?.[0]?.message?.content || 'No response');
  } else {
    console.log('❌ Greeting test failed');
  }
  
  console.log('\n---\n');
  
  // Test 2: Reasoning task
  console.log('Test 2: Reasoning task');
  const reasoningResponse = await testClient.chatCompletion([
    { role: 'user', content: 'What are 3 advantages of using Kimi AI over other providers?' }
  ]);
  
  if (reasoningResponse) {
    console.log('✅ Reasoning test passed');
    console.log('Response:', reasoningResponse.choices?.[0]?.message?.content || 'No response');
  } else {
    console.log('❌ Reasoning test failed');
  }
  
  console.log('\n---\n');
  
  // Test 3: Cost estimation
  if (greetingResponse?.usage) {
    const { prompt_tokens, completion_tokens } = greetingResponse.usage;
    const estimatedCost = ((prompt_tokens * 0.12) + (completion_tokens * 0.60)) / 1_000_000;
    console.log('Test 3: Cost estimation');
    console.log(`Prompt tokens: ${prompt_tokens}`);
    console.log(`Completion tokens: ${completion_tokens}`);
    console.log(`Estimated cost: $${estimatedCost.toFixed(6)}`);
    console.log(`Estimated cost in ₦: ₦${(estimatedCost * 1500).toFixed(2)}`);
  }
  
  console.log('\n=== Test Complete ===');
}

// Run the test
testKimiIntegration().catch(console.error);