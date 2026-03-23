// @ts-nocheck
'use client';
/**
 * Food Industry Components
 * UI components for recipe costing, menu engineering, and kitchen operations
 */

import type { FC } from 'react';
import { useState } from 'react';

// Recipe Cost Calculator
interface RecipeCostCalculatorProps {
  recipe?: {
    id: string;
    name: string;
    servings: number;
    ingredients: Array<{
      name: string;
      quantity: number;
      unit: string;
      costPerUnit: number;
    }>;
  };
  onUpdate?: (recipe: any) => void;
}

export const RecipeCostCalculator: FC<RecipeCostCalculatorProps> = ({
  recipe,
  onUpdate
}) => {
  const [selectedRecipe, setSelectedRecipe] = useState(recipe);

  if (!selectedRecipe) {
    return <div>Select a recipe to calculate costs</div>;
  }

  const totalCost = selectedRecipe.ingredients.reduce(
    (sum, ingredient) => sum + (ingredient.quantity * ingredient.costPerUnit),
    0
  );
  const costPerServing = totalCost / selectedRecipe.servings;

  return (
    <div className="recipe-cost-calculator">
      <h2>Recipe Cost Calculator</h2>
      <div className="recipe-header">
        <h3>{selectedRecipe.name}</h3>
        <p>Servings: {selectedRecipe.servings}</p>
      </div>
      
      <table className="ingredients-table">
        <thead>
          <tr>
            <th>Ingredient</th>
            <th>Quantity</th>
            <th>Unit</th>
            <th>Cost/Unit</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {selectedRecipe.ingredients.map((ingredient, idx) => (
            <tr key={idx}>
              <td>{ingredient.name}</td>
              <td>{ingredient.quantity}</td>
              <td>{ingredient.unit}</td>
              <td>${ingredient.costPerUnit.toFixed(2)}</td>
              <td>${(ingredient.quantity * ingredient.costPerUnit).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={4}><strong>Total Cost:</strong></td>
            <td><strong>${totalCost.toFixed(2)}</strong></td>
          </tr>
          <tr>
            <td colSpan={4}><strong>Cost Per Serving:</strong></td>
            <td><strong>${costPerServing.toFixed(2)}</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

// Menu Engineering Dashboard
interface MenuEngineeringDashboardProps {
  menuItems?: Array<{
    id: string;
    name: string;
    price: number;
    cost: number;
    salesCount: number;
    category: string;
  }>;
}

export const MenuEngineeringDashboard: FC<MenuEngineeringDashboardProps> = ({
  menuItems = []
}) => {
  // Calculate menu engineering metrics
  const itemsWithMetrics = menuItems.map(item => ({
    ...item,
    profitMargin: ((item.price - item.cost) / item.price * 100),
    contribution: (item.price - item.cost) * item.salesCount,
    popularity: item.salesCount,
  }));

  // Calculate averages
  const avgProfitMargin = itemsWithMetrics.reduce((sum, item) => sum + item.profitMargin, 0) / itemsWithMetrics.length;
  const avgPopularity = itemsWithMetrics.reduce((sum, item) => sum + item.popularity, 0) / itemsWithMetrics.length;

  // Classify items
  const classified = itemsWithMetrics.map(item => {
    let classification = 'dog'; // low margin, low popularity
    if (item.profitMargin >= avgProfitMargin && item.popularity >= avgPopularity) {
      classification = 'star';
    } else if (item.profitMargin >= avgProfitMargin && item.popularity < avgPopularity) {
      classification = 'puzzle';
    } else if (item.profitMargin < avgProfitMargin && item.popularity >= avgPopularity) {
      classification = 'plowhorse';
    }

    return { ...item, classification };
  });

  return (
    <div className="menu-engineering-dashboard">
      <h2>Menu Engineering Dashboard</h2>
      
      <div className="matrix-grid">
        <div className="quadrant stars">
          <h3>Stars</h3>
          <p>High Profit, High Popularity</p>
          {classified.filter(i => i.classification === 'star').map(item => (
            <div key={item.id} className="menu-item-badge">{item.name}</div>
          ))}
        </div>
        
        <div className="quadrant plowhorses">
          <h3>Plowhorses</h3>
          <p>Low Profit, High Popularity</p>
          {classified.filter(i => i.classification === 'plowhorse').map(item => (
            <div key={item.id} className="menu-item-badge">{item.name}</div>
          ))}
        </div>
        
        <div className="quadrant puzzles">
          <h3>Puzzles</h3>
          <p>High Profit, Low Popularity</p>
          {classified.filter(i => i.classification === 'puzzle').map(item => (
            <div key={item.id} className="menu-item-badge">{item.name}</div>
          ))}
        </div>
        
        <div className="quadrant dogs">
          <h3>Dogs</h3>
          <p>Low Profit, Low Popularity</p>
          {classified.filter(i => i.classification === 'dog').map(item => (
            <div key={item.id} className="menu-item-badge">{item.name}</div>
          ))}
        </div>
      </div>

      <div className="metrics-summary">
        <div className="metric-card">
          <h3>Avg Profit Margin</h3>
          <p>{avgProfitMargin.toFixed(1)}%</p>
        </div>
        <div className="metric-card">
          <h3>Avg Popularity</h3>
          <p>{avgPopularity.toFixed(0)}</p>
        </div>
      </div>
    </div>
  );
};

// Kitchen Operations Board
interface KitchenOperationsBoardProps {
  orders?: Array<{
    id: string;
    tableNumber: string;
    items: Array<{ name: string; quantity: number; status: string }>;
    timestamp: Date;
    priority: 'normal' | 'rush' | 'vip';
  }>;
}

export const KitchenOperationsBoard: FC<KitchenOperationsBoardProps> = ({
  orders = []
}) => {
  return (
    <div className="kitchen-operations-board">
      <h2>Kitchen Operations</h2>
      <div className="orders-grid">
        {orders.map(order => (
          <div key={order.id} className={`order-card ${order.priority}`}>
            <div className="order-header">
              <span className="table-number">Table {order.tableNumber}</span>
              <span className={`priority-badge ${order.priority}`}>
                {order.priority.toUpperCase()}
              </span>
              <span className="timestamp">
                {order.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <ul className="order-items">
              {order.items.map((item, idx) => (
                <li key={idx} className="order-item">
                  <span className="quantity">{item.quantity}x</span>
                  <span className="name">{item.name}</span>
                  <span className={`status ${item.status}`}>{item.status}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// Inventory Tracker
interface InventoryTrackerProps {
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    parLevel: number;
    reorderPoint: number;
    supplier?: string;
  }>;
  onReorder?: (itemId: string) => void;
}

export const InventoryTracker: FC<InventoryTrackerProps> = ({
  items = [],
  onReorder
}) => {
  return (
    <div className="inventory-tracker">
      <h2>Inventory Levels</h2>
      <table className="inventory-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Current</th>
            <th>Par Level</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const needsReorder = item.quantity <= item.reorderPoint;
            const isBelowPar = item.quantity < item.parLevel;
            
            return (
              <tr key={item.id} className={needsReorder ? 'critical' : ''}>
                <td>{item.name}</td>
                <td>{item.quantity} {item.unit}</td>
                <td>{item.parLevel} {item.unit}</td>
                <td>
                  {needsReorder ? (
                    <span className="status-critical">Needs Reorder</span>
                  ) : isBelowPar ? (
                    <span className="status-warning">Below Par</span>
                  ) : (
                    <span className="status-ok">OK</span>
                  )}
                </td>
                <td>
                  {needsReorder && (
                    <button 
                      onClick={() => onReorder?.(item.id)}
                      className="reorder-btn"
                    >
                      Reorder
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// Nutritional Info Display
interface NutritionalInfoDisplayProps {
  dish?: {
    name: string;
    servingSize: string;
    nutrition: {
      calories: number;
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
      sodium: number;
    };
  };
}

export const NutritionalInfoDisplay: FC<NutritionalInfoDisplayProps> = ({
  dish
}) => {
  if (!dish) {
    return <div>Select a dish to view nutritional information</div>;
  }

  return (
    <div className="nutritional-info-display">
      <h2>{dish.name}</h2>
      <p className="serving-size">Serving Size: {dish.servingSize}</p>
      
      <div className="nutrition-facts">
        <div className="fact-row major">
          <span>Calories</span>
          <span>{dish.nutrition.calories}</span>
        </div>
        
        <div className="fact-row">
          <span>Protein</span>
          <span>{dish.nutrition.protein}g</span>
        </div>
        
        <div className="fact-row">
          <span>Carbohydrates</span>
          <span>{dish.nutrition.carbs}g</span>
        </div>
        
        <div className="fact-row">
          <span>Fat</span>
          <span>{dish.nutrition.fat}g</span>
        </div>
        
        <div className="fact-row">
          <span>Fiber</span>
          <span>{dish.nutrition.fiber}g</span>
        </div>
        
        <div className="fact-row">
          <span>Sodium</span>
          <span>{dish.nutrition.sodium}mg</span>
        </div>
      </div>
    </div>
  );
};

// Menu Builder (Drag & Drop)
interface MenuBuilderProps {
  sections?: Array<{
    id: string;
    name: string;
    items: Array<{ id: string; name: string; price: number }>;
  }>;
  onSectionAdd?: (section: any) => void;
  onItemAdd?: (sectionId: string, item: any) => void;
}

export const MenuBuilder: FC<MenuBuilderProps> = ({
  sections = [],
  onSectionAdd,
  onItemAdd
}) => {
  return (
    <div className="menu-builder">
      <h2>Menu Builder</h2>
      <div className="sections-list">
        {sections.map(section => (
          <div key={section.id} className="menu-section">
            <h3>{section.name}</h3>
            <ul className="menu-items">
              {section.items.map(item => (
                <li key={item.id} className="menu-item">
                  <span className="item-name">{item.name}</span>
                  <span className="item-price">${item.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FOOD_COMPONENTS = {
  RecipeCostCalculator,
  MenuEngineeringDashboard,
  KitchenOperationsBoard,
  InventoryTracker,
  NutritionalInfoDisplay,
  MenuBuilder,
};
