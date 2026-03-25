/**
 * Menu Engineering AI Service
 * 
 * Provides data-driven menu design, item performance analysis,
 * and strategic menu optimization
 */

import { BaseAIService } from '@vayva/ai-agent';

export interface MenuEngineeringInput {
  /** Menu items with performance data */
  menuItems: Array<{
    itemId: string;
    name: string;
    category: string;
    sellingPrice: number;
    foodCostPercent: number;
    contributionMargin: number;
    salesCount: number;
    popularityPercent?: number; // % of total menu sales
  }>;
  /** Menu layout sections */
  sections?: Array<{
    name: string;
    position: 'prime' | 'secondary' | 'tertiary';
    items: string[]; // item IDs
  }>;
  /** Analysis period */
  analysisPeriod?: {
    start: string;
    end: string;
  };
  /** Business goals */
  goals?: {
    targetOverallFoodCost?: number;
    prioritizeProfitability?: boolean;
    emphasizeLocalIngredients?: boolean;
  };
}

export type MenuEngineeringAIOutput = {
  itemClassification: Array<{
    itemId: string;
    name: string;
    category: 'star' | 'plowhorse' | 'puzzle' | 'dog';
    popularity: number;
    profitability: number;
    strategy: string;
  }>;
  menuAnalysis: {
    averageContributionMargin: number;
    averageFoodCostPercent: number;
    totalSales: number;
    starCount: number;
    plowhorseCount: number;
    puzzleCount: number;
    dogCount: number;
  };
  recommendations: Array<{
    type: 'pricing' | 'positioning' | 'promotion' | 'removal' | 'redesign';
    itemId?: string;
    description: string;
    expectedImpact: string;
    priority: 'high' | 'medium' | 'low';
  }>;
  optimalLayout: {
    primePosition: string[];
    secondaryPosition: string[];
    tertiaryPosition: string[];
  };
};

export class AIMenuEngineeringService extends BaseAIService<MenuEngineeringInput, MenuEngineeringAIOutput> {
  constructor() {
    super({
      model: 'culinary-analyst',
      temperature: 0.4, // Analytical with creative positioning
      requireHumanValidation: false, // Menu analysis is advisory
      confidenceThreshold: 0.75,
    });
  }

  async initialize(): Promise<void> {
    // Hook for engine orchestration
  }

  protected defaultOutput(_input: MenuEngineeringInput): MenuEngineeringAIOutput {
    return {
      itemClassification: [],
      menuAnalysis: {
        averageContributionMargin: 0,
        averageFoodCostPercent: 0,
        totalSales: 0,
        starCount: 0,
        plowhorseCount: 0,
        puzzleCount: 0,
        dogCount: 0,
      },
      recommendations: [],
      optimalLayout: {
        primePosition: [],
        secondaryPosition: [],
        tertiaryPosition: [],
      },
    };
  }

  protected async buildPrompt(input: MenuEngineeringInput): Promise<string> {
    const prompt = `You are an expert menu engineering consultant. Analyze this menu's performance and provide strategic recommendations for optimization.

MENU OVERVIEW:
${input.menuItems.length} items across ${new Set(input.menuItems.map(i => i.category)).size} categories
${input.analysisPeriod ? `Analysis Period: ${input.analysisPeriod.start} to ${input.analysisPeriod.end}` : ''}
${input.goals?.targetOverallFoodCost ? `Target Overall Food Cost: ${input.goals.targetOverallFoodCost}%` : ''}
${input.goals?.prioritizeProfitability ? 'Goal: Prioritize profitability over volume' : ''}

MENU ITEMS PERFORMANCE:
${input.menuItems.map(item => `- ${item.name} (${item.category}): $${item.sellingPrice} | FC: ${item.foodCostPercent}% | CM: $${item.contributionMargin.toFixed(2)} | Sales: ${item.salesCount}${item.popularityPercent ? ` (${item.popularityPercent}%)` : ''}`).join('\n')}

${input.sections?.length ? `\nCURRENT MENU LAYOUT:\n${input.sections.map(s => `${s.name} (${s.position}): ${s.items.join(', ')}`).join('\n')}` : ''}

Please provide comprehensive menu engineering analysis including:
1. Classify each item using menu engineering matrix (star/plowhorse/puzzle/dog)
2. Calculate overall menu performance metrics
3. Strategic recommendations for pricing, positioning, promotion, or removal
4. Optimal menu layout suggestions

Format your response as JSON with this exact structure:
{
  "itemClassification": [
    {
      "itemId": "Item ID",
      "name": "Item name",
      "category": "star|plowhorse|puzzle|dog",
      "popularity": 0-10,
      "profitability": 0-10,
      "strategy": "Recommended approach"
    }
  ],
  "menuAnalysis": {
    "averageContributionMargin": average_margin,
    "averageFoodCostPercent": avg_food_cost,
    "totalSales": total_sales_count,
    "starCount": count,
    "plowhorseCount": count,
    "puzzleCount": count,
    "dogCount": count
  },
  "recommendations": [
    {
      "type": "pricing|positioning|promotion|removal|redesign",
      "itemId": "Item ID if applicable",
      "description": "What to do",
      "expectedImpact": "Expected outcome",
      "priority": "high|medium|low"
    }
  ],
  "optimalLayout": {
    "primePosition": ["item_ids_for_prime_spots"],
    "secondaryPosition": ["item_ids_for_secondary"],
    "tertiaryPosition": ["item_ids_for_tertiary"]
  }
}

Use menu engineering principles:
- Stars: High popularity, high profit → Promote and protect
- Plowhorses: High popularity, low profit → Increase price or reduce cost
- Puzzles: Low popularity, high profit → Promote and reposition
- Dogs: Low popularity, low profit → Remove or reengineer

Consider psychological pricing, visual hierarchy, and customer behavior patterns.`;

    return prompt;
  }

  protected async parseResponse(
    rawResponse: string,
    input: MenuEngineeringInput
  ): Promise<MenuEngineeringAIOutput> {
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate structure
      if (!parsed.itemClassification || !Array.isArray(parsed.itemClassification)) {
        throw new Error('Missing item classification array');
      }

      if (!parsed.menuAnalysis) {
        throw new Error('Missing menu analysis');
      }

      // Add validation rules
      this.addValidationRule({
        id: 'classifies_all_items',
        validate: (data: MenuEngineeringAIOutput) =>
          data.itemClassification.length === input.menuItems.length,
        errorMessage: 'Not all menu items classified',
        isCritical: true,
      });

      this.addValidationRule({
        id: 'has_recommendations',
        validate: (data: MenuEngineeringAIOutput) => data.recommendations.length > 0,
        errorMessage: 'No recommendations provided',
        isCritical: false,
      });

      this.addValidationRule({
        id: 'valid_categories',
        validate: (data: MenuEngineeringAIOutput) =>
          data.itemClassification.every((item) =>
            ['star', 'plowhorse', 'puzzle', 'dog'].includes(item.category)
          ),
        errorMessage: 'Invalid menu engineering category',
        isCritical: true,
      });

      return {
        itemClassification: parsed.itemClassification,
        menuAnalysis: parsed.menuAnalysis,
        recommendations: parsed.recommendations || [],
        optimalLayout: parsed.optimalLayout || {
          primePosition: [],
          secondaryPosition: [],
          tertiaryPosition: [],
        },
      } as MenuEngineeringAIOutput;
    } catch (error) {
      console.error('[MenuEngineering] Failed to parse response:', error);
      throw error;
    }
  }

  /**
   * Analyze complete menu performance
   */
  async analyzeMenu(menuItems: MenuEngineeringInput['menuItems']): Promise<{
    stars: string[];
    plowhorses: string[];
    puzzles: string[];
    dogs: string[];
    overallMetrics: {
      avgFoodCost: number;
      avgMargin: number;
      totalRevenue: number;
    };
  }> {
    await this.initialize();
    
    const result = await this.execute({ menuItems });
    
    const stars = result.itemClassification
      .filter(i => i.category === 'star')
      .map(i => i.name);
    
    const plowhorses = result.itemClassification
      .filter(i => i.category === 'plowhorse')
      .map(i => i.name);
    
    const puzzles = result.itemClassification
      .filter(i => i.category === 'puzzle')
      .map(i => i.name);
    
    const dogs = result.itemClassification
      .filter(i => i.category === 'dog')
      .map(i => i.name);
    
    return {
      stars,
      plowhorses,
      puzzles,
      dogs,
      overallMetrics: {
        avgFoodCost: result.menuAnalysis.averageFoodCostPercent,
        avgMargin: result.menuAnalysis.averageContributionMargin,
        totalRevenue: result.menuAnalysis.totalSales,
      },
    };
  }

  /**
   * Calculate menu item scores
   */
  calculateItemScores(menuItems: MenuEngineeringInput['menuItems']): Array<{
    itemId: string;
    popularityScore: number; // 1-10
    profitabilityScore: number; // 1-10
    overallScore: number;
  }> {
    const maxSales = Math.max(...menuItems.map(i => i.salesCount));
    const minSales = Math.min(...menuItems.map(i => i.salesCount));
    const maxMargin = Math.max(...menuItems.map(i => i.contributionMargin));
    const minMargin = Math.min(...menuItems.map(i => i.contributionMargin));

    return menuItems.map(item => {
      // Normalize popularity (0-10 scale)
      const popularityScore = maxSales !== minSales
        ? ((item.salesCount - minSales) / (maxSales - minSales)) * 10
        : 5;
      
      // Normalize profitability (0-10 scale)
      const profitabilityScore = maxMargin !== minMargin
        ? ((item.contributionMargin - minMargin) / (maxMargin - minMargin)) * 10
        : 5;
      
      // Weighted overall score (can adjust weights)
      const overallScore = (popularityScore * 0.4) + (profitabilityScore * 0.6);
      
      return {
        itemId: item.itemId,
        popularityScore: Math.round(popularityScore * 10) / 10,
        profitabilityScore: Math.round(profitabilityScore * 10) / 10,
        overallScore: Math.round(overallScore * 10) / 10,
      };
    });
  }

  /**
   * Recommend menu layout optimization
   */
  recommendLayout(
    itemClassifications: Array<{ itemId: string; category: string; profitability: number }>,
    menuSections: Array<{ name: string; position: string; capacity: number }>
  ): {
    sectionAssignments: Array<{
      section: string;
      items: string[];
      rationale: string;
    }>;
  } {
    // Sort items by priority
    const sorted = [...itemClassifications].sort((a, b) => {
      // Stars and high-profit puzzles first
      const categoryPriority = {
        'star': 4,
        'puzzle': 3,
        'plowhorse': 2,
        'dog': 1,
      };
      
      const catDiff = (categoryPriority[b.category as keyof typeof categoryPriority] || 0) - 
                      (categoryPriority[a.category as keyof typeof categoryPriority] || 0);
      
      if (catDiff !== 0) return catDiff;
      
      // Then by profitability
      return b.profitability - a.profitability;
    });

    const assignments: Array<{ section: string; items: string[]; rationale: string }> = [];
    let itemIndex = 0;

    menuSections.forEach(section => {
      const itemsForSection: string[] = [];
      
      for (let i = 0; i < section.capacity && itemIndex < sorted.length; i++) {
        itemsForSection.push(sorted[itemIndex].itemId);
        itemIndex++;
      }
      
      let rationale = '';
      if (section.position === 'prime') {
        rationale = 'High-visibility area for stars and high-profit items';
      } else if (section.position === 'secondary') {
        rationale = 'Supporting section for plowhorses and puzzles to promote';
      } else {
        rationale = 'Lower-priority placement for dogs or test items';
      }
      
      assignments.push({
        section: section.name,
        items: itemsForSection,
        rationale,
      });
    });

    return { sectionAssignments: assignments };
  }
}
