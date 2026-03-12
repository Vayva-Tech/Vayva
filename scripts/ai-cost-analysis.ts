import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function analyzeAICosts() {
  console.log('=== VAYVA AI COST ANALYSIS ===\n');
  
  // Get total usage stats
  const totalStats = await prisma.aiUsageDaily.aggregate({
    _sum: {
      tokensCount: true,
      costKobo: true,
      requestsCount: true
    }
  });

  // Get recent usage (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentStats = await prisma.aiUsageDaily.aggregate({
    where: {
      date: { gte: thirtyDaysAgo }
    },
    _sum: {
      tokensCount: true,
      costKobo: true,
      requestsCount: true
    }
  });

  // Get monthly breakdown
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
  
  const monthlyStats = await prisma.aiUsageDaily.groupBy({
    by: ['date'],
    where: {
      date: { gte: twelveMonthsAgo }
    },
    _sum: {
      tokensCount: true,
      costKobo: true
    }
  });

  // Group by month for better visualization
  const monthlyTotals: Record<string, { tokens: bigint, cost: bigint }> = {};
  
  monthlyStats.forEach(stat => {
    const date = new Date(stat.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyTotals[monthKey]) {
      monthlyTotals[monthKey] = { tokens: 0n, cost: 0n };
    }
    
    monthlyTotals[monthKey].tokens += stat._sum.tokensCount || 0n;
    monthlyTotals[monthKey].cost += stat._sum.costKobo || 0n;
  });

  // Current pricing assumptions (based on code)
  const CURRENT_GROQ_PRICING = {
    input: 0.59,  // $ per million tokens
    output: 0.79  // $ per million tokens
  };

  // DeepSeek pricing (from research)
  const DEEPSEEK_PRICING = {
    input_cache_hit: 0.028,   // $ per million tokens
    input_cache_miss: 0.28,   // $ per million tokens
    output: 0.42              // $ per million tokens
  };

  // Assume 50% cache hit rate for DeepSeek
  const CACHE_HIT_RATE = 0.5;
  const AVERAGE_INPUT_COST = 
    (DEEPSEEK_PRICING.input_cache_hit * CACHE_HIT_RATE) + 
    (DEEPSEEK_PRICING.input_cache_miss * (1 - CACHE_HIT_RATE));

  console.log('📊 CURRENT USAGE METRICS:');
  console.log('========================');
  console.log(`Total Tokens Processed: ${(totalStats._sum.tokensCount || 0n).toLocaleString()} tokens`);
  console.log(`Total Requests Made: ${(totalStats._sum.requestsCount || 0n).toLocaleString()} requests`);
  console.log(`Total Estimated Cost: ₦${(Number(totalStats._sum.costKobo || 0n) / 100).toFixed(2)}`);
  console.log('');

  console.log('📈 RECENT 30-DAY USAGE:');
  console.log('======================');
  console.log(`Tokens: ${(recentStats._sum.tokensCount || 0n).toLocaleString()} tokens`);
  console.log(`Requests: ${(recentStats._sum.requestsCount || 0n).toLocaleString()} requests`);
  console.log(`Cost: ₦${(Number(recentStats._sum.costKobo || 0n) / 100).toFixed(2)}`);
  console.log('');

  console.log('📆 MONTHLY BREAKDOWN (Last 12 months):');
  console.log('=====================================');
  Object.entries(monthlyTotals)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([month, data]) => {
      console.log(`${month}: ${(data.tokens).toLocaleString()} tokens | ₦${(Number(data.cost) / 100).toFixed(2)}`);
    });

  // Cost comparison calculations
  console.log('\n💰 COST COMPARISON ANALYSIS:');
  console.log('============================');
  
  const totalTokens = Number(totalStats._sum.tokensCount || 0n);
  const recentTokens = Number(recentStats._sum.tokensCount || 0n);
  
  // Assume 70% input tokens, 30% output tokens (typical for chat applications)
  const INPUT_RATIO = 0.7;
  const OUTPUT_RATIO = 0.3;
  
  // Current Groq costs
  const groqTotalCost = 
    (totalTokens * INPUT_RATIO * CURRENT_GROQ_PRICING.input / 1_000_000) +
    (totalTokens * OUTPUT_RATIO * CURRENT_GROQ_PRICING.output / 1_000_000);
  
  const groqRecentCost = 
    (recentTokens * INPUT_RATIO * CURRENT_GROQ_PRICING.input / 1_000_000) +
    (recentTokens * OUTPUT_RATIO * CURRENT_GROQ_PRICING.output / 1_000_000);

  // DeepSeek costs (with caching)
  const deepseekTotalCost = 
    (totalTokens * INPUT_RATIO * AVERAGE_INPUT_COST / 1_000_000) +
    (totalTokens * OUTPUT_RATIO * DEEPSEEK_PRICING.output / 1_000_000);
  
  const deepseekRecentCost = 
    (recentTokens * INPUT_RATIO * AVERAGE_INPUT_COST / 1_000_000) +
    (recentTokens * OUTPUT_RATIO * DEEPSEEK_PRICING.output / 1_000_000);

  console.log('CURRENT GROQ COSTS:');
  console.log(`  All-time: $${groqTotalCost.toFixed(2)} USD | ₦${(groqTotalCost * 1500).toFixed(2)}`);
  console.log(`  Recent 30 days: $${groqRecentCost.toFixed(2)} USD | ₦${(groqRecentCost * 1500).toFixed(2)}`);
  console.log('');
  
  console.log('DEEPSEEK COSTS (50% cache rate):');
  console.log(`  All-time: $${deepseekTotalCost.toFixed(2)} USD | ₦${(deepseekTotalCost * 1500).toFixed(2)}`);
  console.log(`  Recent 30 days: $${deepseekRecentCost.toFixed(2)} USD | ₦${(deepseekRecentCost * 1500).toFixed(2)}`);
  console.log('');
  
  const totalSavings = groqTotalCost - deepseekTotalCost;
  const recentSavings = groqRecentCost - deepseekRecentCost;
  const savingsPercentage = (totalSavings / groqTotalCost) * 100;
  
  console.log('💰 POTENTIAL SAVINGS:');
  console.log(`  All-time savings: $${totalSavings.toFixed(2)} USD | ₦${(totalSavings * 1500).toFixed(2)}`);
  console.log(`  Monthly savings: $${(recentSavings * (30/30)).toFixed(2)} USD | ₦${(recentSavings * 1500).toFixed(2)}`);
  console.log(`  Savings percentage: ${savingsPercentage.toFixed(1)}%`);
  console.log('');

  // OpenRouter pricing consideration
  console.log('🌐 OPENROUTER CONSIDERATIONS:');
  console.log('============================');
  console.log('OpenRouter typically adds 10-20% premium over direct provider pricing');
  console.log('But offers benefits like:');
  console.log('  • Single API key for multiple providers');
  console.log('  • Automatic failover between providers');
  console.log('  • Unified billing and monitoring');
  console.log('  • Access to models not directly available');
  console.log('');
  
  const openrouterPremium = 1.15; // 15% premium
  const openrouterCost = deepseekRecentCost * openrouterPremium;
  const openrouterSavings = groqRecentCost - openrouterCost;
  
  console.log(`OpenRouter DeepSeek cost: $${openrouterCost.toFixed(2)} USD/month`);
  console.log(`Net savings with OpenRouter: $${openrouterSavings.toFixed(2)} USD/month (${((openrouterSavings/groqRecentCost)*100).toFixed(1)}%)`);

  await prisma.$disconnect();
}

analyzeAICosts().catch(console.error);