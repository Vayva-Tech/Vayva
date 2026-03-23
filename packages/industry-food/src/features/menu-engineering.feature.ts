// @ts-nocheck
/**
 * Menu Engineering Feature
 * Analyze menu item performance and optimize profitability
 */

import { z } from 'zod';

export const menuEngineeringSchema = z.object({
  menuItemId: z.string(),
  itemName: z.string(),
  category: z.string(),
  price: z.number().positive(),
  cost: z.number().positive(),
  salesVolume: z.number().positive(),
  period: z.string(),
});

export type MenuEngineeringData = z.infer<typeof menuEngineeringSchema>;

export interface MenuItemAnalysis {
  profitability: 'high' | 'low';
  popularity: 'high' | 'low';
  classification: 'star' | 'plowhorse' | 'puzzle' | 'dog';
  contribution: number;
  recommendations: string[];
}

export class MenuEngineeringFeature {
  private avgProfitability = 0;
  private avgPopularity = 0;

  async analyzeMenu(items: MenuEngineeringData[]): Promise<Map<string, MenuItemAnalysis>> {
    // Calculate averages
    this.avgProfitability = items.reduce((sum, item) => sum + (item.price - item.cost), 0) / items.length;
    this.avgPopularity = items.reduce((sum, item) => sum + item.salesVolume, 0) / items.length;

    const analysis = new Map<string, MenuItemAnalysis>();

    items.forEach((item) => {
      const profitability = (item.price - item.cost) >= this.avgProfitability ? 'high' : 'low';
      const popularity = item.salesVolume >= this.avgPopularity ? 'high' : 'low';
      
      // BCG Matrix classification
      let classification: 'star' | 'plowhorse' | 'puzzle' | 'dog';
      if (profitability === 'high' && popularity === 'high') {
        classification = 'star';
      } else if (profitability === 'low' && popularity === 'high') {
        classification = 'plowhorse';
      } else if (profitability === 'high' && popularity === 'low') {
        classification = 'puzzle';
      } else {
        classification = 'dog';
      }

      const recommendations = this.generateRecommendations(item, classification);

      analysis.set(item.menuItemId, {
        profitability,
        popularity,
        classification,
        contribution: (item.price - item.cost) * item.salesVolume,
        recommendations,
      });
    });

    return analysis;
  }

  private generateRecommendations(
    item: MenuEngineeringData,
    classification: string
  ): string[] {
    const recommendations: string[] = [];

    switch (classification) {
      case 'star':
        recommendations.push('Maintain quality and consistency');
        recommendations.push('Feature prominently on menu');
        break;
      case 'plowhorse':
        recommendations.push('Consider modest price increase');
        recommendations.push('Reduce portion size or cost');
        break;
      case 'puzzle':
        recommendations.push('Increase visibility through marketing');
        recommendations.push('Train staff to recommend');
        break;
      case 'dog':
        recommendations.push('Consider removing from menu');
        recommendations.push('Or reposition with new concept');
        break;
    }

    return recommendations;
  }
}
