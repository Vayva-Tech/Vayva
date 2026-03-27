/**
 * Menu Engineering Service
 * Menu optimization, item profitability analysis, and menu mix optimization
 */

import { prisma } from '@vayva/db';

export interface MenuItemAnalysis {
  id: string;
  name: string;
  price: number;
  cost: number;
  margin: number;
  popularity: number;
  popularityLabel: 'STAR' | 'PLOWHORSE' | 'PUZZLE' | 'DOG';
  contributionMargin: number;
}

export class MenuEngineeringService {
  async initialize() {
    console.log('[MenuEngineeringService] Initialized');
  }

  async getMenuItems(businessId: string, menuId?: string): Promise<MenuItemAnalysis[]> {
    const whereClause: any = { businessId };
    if (menuId) {
      whereClause.menuId = menuId;
    }

    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        recipe: {
          include: {
            ingredients: {
              include: {
                ingredient: true,
              },
            },
          },
        },
      },
    });

    return menuItems.map((item) => {
      const cost = item.recipe?.ingredients.reduce((sum, ing) => {
        return sum + (ing.quantity * ing.ingredient.costPerUnit);
      }, 0) || 0;

      const margin = item.price - cost;
      const popularity = item.salesCount || 0;
      
      // Matrix classification
      let popularityLabel: MenuItemAnalysis['popularityLabel'] = 'DOG';
      if (popularity > 100 && margin > 5) {
        popularityLabel = 'STAR';
      } else if (popularity > 100 && margin <= 5) {
        popularityLabel = 'PLOWHORSE';
      } else if (popularity <= 100 && margin > 5) {
        popularityLabel = 'PUZZLE';
      }

      return {
        id: item.id,
        name: item.name,
        price: item.price,
        cost,
        margin,
        popularity,
        popularityLabel,
        contributionMargin: margin * popularity,
      };
    });
  }

  async optimizeMenu(menuId: string): Promise<{ keep: string[]; remove: string[] }> {
    const items = await this.getMenuItems('business-id', menuId);
    
    const keep: string[] = [];
    const remove: string[] = [];

    items.forEach(item => {
      if (item.popularityLabel === 'STAR' || item.popularityLabel === 'PUZZLE') {
        keep.push(item.id);
      } else {
        remove.push(item.id);
      }
    });

    return { keep, remove };
  }
}
