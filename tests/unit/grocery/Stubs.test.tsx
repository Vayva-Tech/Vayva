/**
 * Grocery Dashboard Components Unit Tests
 * Comprehensive test coverage for all 6 grocery dashboard components
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { 
  PromotionPerformance, 
  PriceOptimization, 
  ExpirationTracking, 
  SupplierDeliveries, 
  StockLevels, 
  ActionRequired 
} from '@vayva/industry-grocery/components';

// Mock API responses
const mockPromotions = [
  {
    id: 'promo-1',
    name: 'BOGO Pizza Special',
    type: 'bogo' as const,
    itemsCount: 15,
    liftPercentage: 45,
    redemptionRate: 23.5,
    startDate: '2026-03-01T00:00:00Z',
    endDate: '2026-03-31T23:59:59Z',
    status: 'active' as const,
    revenue: 12450,
    discountGiven: 2100,
    unitsSold: 234,
  },
  {
    id: 'promo-2',
    name: '20% Off Dairy',
    type: 'percentage' as const,
    itemsCount: 28,
    liftPercentage: 32,
    redemptionRate: 18.2,
    startDate: '2026-03-15T00:00:00Z',
    endDate: '2026-04-15T23:59:59Z',
    status: 'active' as const,
    revenue: 8750,
    discountGiven: 1500,
    unitsSold: 156,
  },
];

const mockROI = {
  revenue: 21200,
  discountGiven: 3600,
  roi: 488.89,
};

describe('PromotionPerformance', () => {
  describe('Rendering', () => {
    it('displays component title correctly', () => {
      render(<PromotionPerformance promotions={[]} roi={{ revenue: 0, discountGiven: 0, roi: 0 }} />);
      expect(screen.getByText('🏷️ Promotion Performance')).toBeInTheDocument();
    });

    it('shows active promotions count badge', () => {
      render(<PromotionPerformance promotions={mockPromotions} roi={mockROI} />);
      expect(screen.getByText('2 Active')).toBeInTheDocument();
    });

    it('handles empty promotions array gracefully', () => {
      render(<PromotionPerformance promotions={[]} roi={mockROI} />);
      expect(screen.getByText('No active promotions')).toBeInTheDocument();
      expect(screen.getByText('Create a promotion to boost sales')).toBeInTheDocument();
    });
  });

  describe('ROI Calculations', () => {
    it('displays total revenue formatted with commas', () => {
      render(<PromotionPerformance promotions={mockPromotions} roi={mockROI} />);
      expect(screen.getByText('$21,200')).toBeInTheDocument();
    });

    it('displays discount given amount', () => {
      render(<PromotionPerformance promotions={mockPromotions} roi={mockROI} />);
      expect(screen.getByText('$3,600')).toBeInTheDocument();
    });

    it('calculates and displays ROI percentage accurately', () => {
      render(<PromotionPerformance promotions={mockPromotions} roi={mockROI} />);
      expect(screen.getByText('+488.9%')).toBeInTheDocument();
    });

    it('shows positive ROI in green with TrendingUp icon', () => {
      const { container } = render(
        <PromotionPerformance promotions={mockPromotions} roi={mockROI} />
      );
      const roiElement = container.querySelector('.text-green-600');
      expect(roiElement).toBeInTheDocument();
    });

    it('shows negative ROI in red when ROI is negative', () => {
      const negativeROI = { revenue: 1000, discountGiven: 2000, roi: -50 };
      render(<PromotionPerformance promotions={mockPromotions} roi={negativeROI} />);
      expect(screen.getByText('-50.0%')).toHaveClass('text-red-600');
    });
  });

  describe('Promotion Details', () => {
    it('renders promotion cards with correct information', () => {
      render(<PromotionPerformance promotions={mockPromotions} roi={mockROI} />);
      expect(screen.getByText('BOGO Pizza Special')).toBeInTheDocument();
      expect(screen.getByText('15 products')).toBeInTheDocument();
    });

    it('displays sales lift percentage', () => {
      render(<PromotionPerformance promotions={mockPromotions} roi={mockROI} />);
      expect(screen.getByText('+45%')).toBeInTheDocument();
    });

    it('shows redemption rate', () => {
      render(<PromotionPerformance promotions={mockPromotions} roi={mockROI} />);
      expect(screen.getByText('23.5%')).toBeInTheDocument();
    });

    it('displays units sold', () => {
      render(<PromotionPerformance promotions={mockPromotions} roi={mockROI} />);
      expect(screen.getByText('234')).toBeInTheDocument();
    });

    it('shows promotion status badge with correct color', () => {
      render(<PromotionPerformance promotions={mockPromotions} roi={mockROI} />);
      const activeBadge = screen.getByText('active');
      expect(activeBadge).toHaveClass('bg-green-100', 'text-green-700');
    });
  });

  describe('Digital Coupons Summary', () => {
    it('calculates total coupon uses from coupon-type promotions', () => {
      const couponPromos = [
        { ...mockPromotions[0], type: 'coupon' as const, unitsSold: 100 },
        { ...mockPromotions[1], type: 'coupon' as const, unitsSold: 50 },
      ];
      render(<PromotionPerformance promotions={couponPromos} roi={mockROI} />);
      expect(screen.getByText('🎫 Digital Coupons: 150 uses')).toBeInTheDocument();
    });

    it('calculates average redemption rate across all promotions', () => {
      render(<PromotionPerformance promotions={mockPromotions} roi={mockROI} />);
      // Average of 23.5% and 18.2% = 20.85%
      expect(screen.getByText(/Avg Redemption: \d+\.\d%/)).toBeInTheDocument();
    });
  });

  describe('Progress Bars', () => {
    it('renders progress bars for each promotion', () => {
      render(<PromotionPerformance promotions={mockPromotions} roi={mockROI} />);
      const progressBars = document.querySelectorAll('[role="progressbar"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('calculates progress percentage correctly', () => {
      render(<PromotionPerformance promotions={mockPromotions} roi={mockROI} />);
      expect(screen.getByText('47% complete')).toBeInTheDocument();
    });
  });
});

describe('PriceOptimization', () => {
  const mockCompetitorPricing = [
    {
      productId: 'prod-1',
      productName: 'Organic Milk 1 Gallon',
      ourPrice: 5.99,
      competitorAvg: 6.49,
      difference: -0.50,
    },
    {
      productId: 'prod-2',
      productName: 'Whole Wheat Bread',
      ourPrice: 3.99,
      competitorAvg: 3.79,
      difference: 0.20,
    },
  ];

  const mockPriceSuggestions = [
    {
      productId: 'prod-2',
      currentPrice: 3.99,
      recommendedPrice: 3.89,
      confidenceScore: 0.87,
      expectedLift: 15,
      marginImpact: -0.10,
      opportunitySize: 450,
    },
  ];

  describe('Rendering', () => {
    it('displays component title correctly', () => {
      render(
        <PriceOptimization 
          comparisons={mockCompetitorPricing} 
          suggestions={mockPriceSuggestions} 
        />
      );
      expect(screen.getByText(/Price Optimization/i)).toBeInTheDocument();
    });

    it('renders price comparison cards', () => {
      render(
        <PriceOptimization 
          comparisons={mockCompetitorPricing} 
          suggestions={mockPriceSuggestions} 
        />
      );
      expect(screen.getByText('Organic Milk 1 Gallon')).toBeInTheDocument();
    });
  });

  describe('Price Comparisons', () => {
    it('shows our price vs competitor average', () => {
      render(
        <PriceOptimization 
          comparisons={mockCompetitorPricing} 
          suggestions={mockPriceSuggestions} 
        />
      );
      expect(screen.getByText('$5.99')).toBeInTheDocument();
      expect(screen.getByText('$6.49')).toBeInTheDocument();
    });

    it('displays price difference percentage', () => {
      render(
        <PriceOptimization 
          comparisons={mockCompetitorPricing} 
          suggestions={mockPriceSuggestions} 
        />
      );
      // Difference of -$0.50 on $6.49 = -7.7%
      expect(screen.getByText(/-7\.7%/)).toBeInTheDocument();
    });

    it('color-codes competitive positions', () => {
      const { container } = render(
        <PriceOptimization 
          comparisons={mockCompetitorPricing} 
          suggestions={mockPriceSuggestions} 
        />
      );
      // Lower price should be green (advantageous)
      const lowerPriceElement = container.querySelector('.text-green-600');
      expect(lowerPriceElement).toBeInTheDocument();
    });
  });

  describe('Price Recommendations', () => {
    it('renders price suggestion cards', () => {
      render(
        <PriceOptimization 
          comparisons={mockCompetitorPricing} 
          suggestions={mockPriceSuggestions} 
        />
      );
      expect(screen.getByText('Whole Wheat Bread')).toBeInTheDocument();
    });

    it('shows confidence score for suggestions', () => {
      render(
        <PriceOptimization 
          comparisons={mockCompetitorPricing} 
          suggestions={mockPriceSuggestions} 
        />
      );
      expect(screen.getByText('87% confidence')).toBeInTheDocument();
    });

    it('displays expected sales lift', () => {
      render(
        <PriceOptimization 
          comparisons={mockCompetitorPricing} 
          suggestions={mockPriceSuggestions} 
        />
      );
      expect(screen.getByText('+15%')).toBeInTheDocument();
    });

    it('shows margin impact', () => {
      render(
        <PriceOptimization 
          comparisons={mockCompetitorPricing} 
          suggestions={mockPriceSuggestions} 
        />
      );
      expect(screen.getByText(/-\$0\.10/)).toBeInTheDocument();
    });

    it('displays opportunity size', () => {
      render(
        <PriceOptimization 
          comparisons={mockCompetitorPricing} 
          suggestions={mockPriceSuggestions} 
        />
      );
      expect(screen.getByText('$450')).toBeInTheDocument();
    });

    it('calls onApplyPriceChange when Apply button is clicked', () => {
      const handleApplyPriceChange = vi.fn();
      render(
        <PriceOptimization 
          comparisons={mockCompetitorPricing} 
          suggestions={mockPriceSuggestions} 
          onApplyPriceChange={handleApplyPriceChange}
        />
      );
      
      const applyButton = screen.getByRole('button', { name: /apply/i });
      fireEvent.click(applyButton);
      
      expect(handleApplyPriceChange).toHaveBeenCalledWith(mockPriceSuggestions[0]);
    });
  });

  describe('Empty States', () => {
    it('displays helpful message when no competitor data', () => {
      render(
        <PriceOptimization comparisons={[]} suggestions={[]} />
      );
      expect(screen.getByText(/no pricing data/i)).toBeInTheDocument();
    });

    it('displays message when no price suggestions available', () => {
      render(
        <PriceOptimization comparisons={mockCompetitorPricing} suggestions={[]} />
      );
      expect(screen.getByText(/no recommendations/i)).toBeInTheDocument();
    });
  });
});

// Continue with more component tests...
describe('ExpirationTracking', () => {
  const mockExpiringProducts = [
    {
      id: 'exp-1',
      productId: 'prod-1',
      productName: 'Fresh Yogurt',
      quantity: 45,
      expiryDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days
      daysUntilExpiry: 2,
      action: 'markdown' as const,
      department: 'Dairy',
    },
    {
      id: 'exp-2',
      productId: 'prod-2',
      productName: 'Orange Juice',
      quantity: 12,
      expiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days
      daysUntilExpiry: 5,
      action: 'donate' as const,
      department: 'Beverages',
    },
    {
      id: 'exp-3',
      productId: 'prod-3',
      productName: 'Ground Beef',
      quantity: 3,
      expiryDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (expired)
      daysUntilExpiry: -1,
      action: 'discard' as const,
      department: 'Meat',
    },
  ];

  describe('Rendering', () => {
    it('displays component title correctly', () => {
      render(
        <ExpirationTracking 
          expiring={mockExpiringProducts} 
          savings={0} 
        />
      );
      expect(screen.getByText(/Expiration Tracking/i)).toBeInTheDocument();
    });

    it('renders expiring product cards', () => {
      render(
        <ExpirationTracking 
          expiring={mockExpiringProducts} 
          savings={0} 
        />
      );
      expect(screen.getByText('Fresh Yogurt')).toBeInTheDocument();
      expect(screen.getByText('Orange Juice')).toBeInTheDocument();
    });
  });

  describe('Days Until Expiry', () => {
    it('counts days until expiry correctly', () => {
      render(
        <ExpirationTracking 
          expiring={mockExpiringProducts} 
          savings={0} 
        />
      );
      expect(screen.getByText('2 days left')).toBeInTheDocument();
      expect(screen.getByText('5 days left')).toBeInTheDocument();
    });

    it('handles expired products with negative days', () => {
      render(
        <ExpirationTracking 
          expiring={mockExpiringProducts} 
          savings={0} 
        />
      );
      expect(screen.getByText('Expired')).toBeInTheDocument();
    });
  });

  describe('Urgency Categorization', () => {
    it('color-codes critical items (<3 days) in red', () => {
      const { container } = render(
        <ExpirationTracking 
          expiring={mockExpiringProducts} 
          savings={0} 
        />
      );
      const criticalItem = container.querySelector('.bg-red-50');
      expect(criticalItem).toBeInTheDocument();
    });

    it('color-codes warning items (<7 days) in orange', () => {
      const { container } = render(
        <ExpirationTracking 
          expiring={mockExpiringProducts} 
          savings={0} 
        />
      );
      const warningItem = container.querySelector('.bg-orange-50');
      expect(warningItem).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('renders markdown action button for products with high quantity', () => {
      render(
        <ExpirationTracking 
          expiring={mockExpiringProducts} 
          savings={0} 
        />
      );
      const markdownBtn = screen.getByRole('button', { name: /apply markdown/i });
      expect(markdownBtn).toBeInTheDocument();
    });

    it('calls onApplyMarkdown when clicked', () => {
      const handleApplyMarkdown = vi.fn();
      render(
        <ExpirationTracking 
          expiring={mockExpiringProducts} 
          savings={0} 
          onApplyMarkdown={handleApplyMarkdown}
        />
      );
      
      const markdownBtn = screen.getByRole('button', { name: /apply markdown/i });
      fireEvent.click(markdownBtn);
      
      expect(handleApplyMarkdown).toHaveBeenCalledWith(mockExpiringProducts[0]);
    });
  });

  describe('Waste Reduction Savings', () => {
    it('calculates potential savings from waste reduction', () => {
      const mockSavings = 1250;
      render(
        <ExpirationTracking 
          expiring={mockExpiringProducts} 
          savings={mockSavings} 
        />
      );
      expect(screen.getByText('$1,250')).toBeInTheDocument();
    });

    it('displays helpful message when no savings', () => {
      render(
        <ExpirationTracking 
          expiring={[]} 
          savings={0} 
        />
      );
      expect(screen.getByText(/no expiring products/i)).toBeInTheDocument();
    });
  });

  describe('Department Breakdown', () => {
    it('shows department for each product', () => {
      render(
        <ExpirationTracking 
          expiring={mockExpiringProducts} 
          savings={0} 
        />
      );
      expect(screen.getByText('Dairy')).toBeInTheDocument();
      expect(screen.getByText('Beverages')).toBeInTheDocument();
    });
  });
});

describe('SupplierDeliveries', () => {
  const mockDeliveries = [
    {
      id: 'del-1',
      supplierId: 'sup-1',
      supplierName: 'Fresh Farms Inc',
      expectedTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours
      poNumber: 'PO-2026-001',
      dockDoor: 'Dock 3',
      status: 'on-time' as const,
      items: 45,
      value: 8500,
    },
    {
      id: 'del-2',
      supplierId: 'sup-2',
      supplierName: 'Ocean Seafood Co',
      expectedTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(), // 5 hours
      poNumber: 'PO-2026-002',
      dockDoor: 'Dock 1',
      status: 'delayed' as const,
      items: 28,
      value: 12300,
    },
  ];

  describe('Rendering', () => {
    it('displays component title correctly', () => {
      render(<SupplierDeliveries deliveries={mockDeliveries} />);
      expect(screen.getByText(/Supplier Deliveries/i)).toBeInTheDocument();
    });

    it('renders delivery cards', () => {
      render(<SupplierDeliveries deliveries={mockDeliveries} />);
      expect(screen.getByText('Fresh Farms Inc')).toBeInTheDocument();
    });
  });

  describe('Delivery Information', () => {
    it('displays expected delivery time', () => {
      render(<SupplierDeliveries deliveries={mockDeliveries} />);
      expect(screen.getByText(/in 2 hours/i)).toBeInTheDocument();
    });

    it('shows dock door assignments', () => {
      render(<SupplierDeliveries deliveries={mockDeliveries} />);
      expect(screen.getByText('Dock 3')).toBeInTheDocument();
      expect(screen.getByText('Dock 1')).toBeInTheDocument();
    });

    it('tracks delivery status correctly', () => {
      render(<SupplierDeliveries deliveries={mockDeliveries} />);
      expect(screen.getByText('On Time')).toBeInTheDocument();
      expect(screen.getByText('Delayed')).toBeInTheDocument();
    });
  });

  describe('Purchase Order Details', () => {
    it('shows PO number formatted correctly', () => {
      render(<SupplierDeliveries deliveries={mockDeliveries} />);
      expect(screen.getByText('PO-2026-001')).toBeInTheDocument();
    });

    it('displays items count per delivery', () => {
      render(<SupplierDeliveries deliveries={mockDeliveries} />);
      expect(screen.getByText('45 items')).toBeInTheDocument();
    });

    it('shows purchase order value', () => {
      render(<SupplierDeliveries deliveries={mockDeliveries} />);
      expect(screen.getByText('$8,500')).toBeInTheDocument();
    });
  });

  describe('Status Badges', () => {
    it('color-codes on-time deliveries in green', () => {
      const { container } = render(<SupplierDeliveries deliveries={mockDeliveries} />);
      const onTimeBadge = container.querySelector('.bg-green-100');
      expect(onTimeBadge).toBeInTheDocument();
    });

    it('color-codes delayed deliveries in red', () => {
      const { container } = render(<SupplierDeliveries deliveries={mockDeliveries} />);
      const delayedBadge = container.querySelector('.bg-red-100');
      expect(delayedBadge).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('displays message when no scheduled deliveries', () => {
      render(<SupplierDeliveries deliveries={[]} />);
      expect(screen.getByText(/no scheduled deliveries/i)).toBeInTheDocument();
    });
  });
});

describe('StockLevels', () => {
  const mockInventoryHealth = {
    inStock: 1250,
    lowStock: 45,
    outOfStock: 8,
    overstocked: 12,
    turnoverDays: 18,
    shrinkageRate: 0.012,
    totalValue: 285000,
  };

  describe('Rendering', () => {
    it('displays component title correctly', () => {
      render(<StockLevels inventoryHealth={mockInventoryHealth} />);
      expect(screen.getByText(/Stock Levels/i)).toBeInTheDocument();
    });
  });

  describe('Health Score', () => {
    it('calculates inventory health score (0-100)', () => {
      render(<StockLevels inventoryHealth={mockInventoryHealth} />);
      // Health score should be displayed
      expect(screen.getByText(/Health Score/i)).toBeInTheDocument();
    });

    it('shows health score trends', () => {
      render(<StockLevels inventoryHealth={mockInventoryHealth} />);
      expect(screen.getByText(/improving|stable|declining/i)).toBeInTheDocument();
    });
  });

  describe('Stock Counts', () => {
    it('shows in-stock count', () => {
      render(<StockLevels inventoryHealth={mockInventoryHealth} />);
      expect(screen.getByText('1,250')).toBeInTheDocument();
    });

    it('displays low-stock count', () => {
      render(<StockLevels inventoryHealth={mockInventoryHealth} />);
      expect(screen.getByText('45')).toBeInTheDocument();
    });

    it('shows out-of-stock count', () => {
      render(<StockLevels inventoryHealth={mockInventoryHealth} />);
      expect(screen.getByText('8')).toBeInTheDocument();
    });

    it('displays overstocked items count', () => {
      render(<StockLevels inventoryHealth={mockInventoryHealth} />);
      expect(screen.getByText('12')).toBeInTheDocument();
    });
  });

  describe('Metrics Display', () => {
    it('calculates and displays turnover days', () => {
      render(<StockLevels inventoryHealth={mockInventoryHealth} />);
      expect(screen.getByText('18 days')).toBeInTheDocument();
    });

    it('shows shrinkage rate percentage', () => {
      render(<StockLevels inventoryHealth={mockInventoryHealth} />);
      expect(screen.getByText('1.2%')).toBeInTheDocument();
    });

    it('displays total inventory value', () => {
      render(<StockLevels inventoryHealth={mockInventoryHealth} />);
      expect(screen.getByText('$285,000')).toBeInTheDocument();
    });
  });

  describe('Color-Coded Status', () => {
    it('shows color-coded stock status badges', () => {
      const { container } = render(<StockLevels inventoryHealth={mockInventoryHealth} />);
      const inStockBadge = container.querySelector('.bg-green-100');
      const lowStockBadge = container.querySelector('.bg-orange-100');
      expect(inStockBadge).toBeInTheDocument();
      expect(lowStockBadge).toBeInTheDocument();
    });
  });

  describe('Reorder Recommendations', () => {
    it('displays reorder suggestions for low-stock items', () => {
      render(<StockLevels inventoryHealth={mockInventoryHealth} />);
      expect(screen.getByText(/reorder recommended/i)).toBeInTheDocument();
    });
  });
});

describe('ActionRequired', () => {
  const mockTasks = [
    {
      id: 'task-1',
      title: 'Review expiration report',
      priority: 'high' as const,
      dueTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      completed: false,
      category: 'inventory' as const,
    },
    {
      id: 'task-2',
      title: 'Approve price changes',
      priority: 'medium' as const,
      dueTime: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
      completed: false,
      category: 'pricing' as const,
    },
    {
      id: 'task-3',
      title: 'Staff training session',
      priority: 'low' as const,
      dueTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      completed: false,
      category: 'staff' as const,
    },
  ];

  describe('Rendering', () => {
    it('displays component title correctly', () => {
      render(<ActionRequired tasks={mockTasks} />);
      expect(screen.getByText(/Action Required/i)).toBeInTheDocument();
    });

    it('renders task cards', () => {
      render(<ActionRequired tasks={mockTasks} />);
      expect(screen.getByText('Review expiration report')).toBeInTheDocument();
    });
  });

  describe('Task Prioritization', () => {
    it('categorizes tasks by priority', () => {
      render(<ActionRequired tasks={mockTasks} />);
      expect(screen.getByText('High')).toBeInTheDocument();
      expect(screen.getByText('Medium')).toBeInTheDocument();
      expect(screen.getByText('Low')).toBeInTheDocument();
    });

    it('color-codes priority levels', () => {
      const { container } = render(<ActionRequired tasks={mockTasks} />);
      const highPriorityBadge = container.querySelector('.text-red-600');
      expect(highPriorityBadge).toBeInTheDocument();
    });
  });

  describe('Due Time Display', () => {
    it('shows due time countdown', () => {
      render(<ActionRequired tasks={mockTasks} />);
      expect(screen.getByText(/due in/i)).toBeInTheDocument();
    });

    it('formats time remaining correctly', () => {
      render(<ActionRequired tasks={mockTasks} />);
      expect(screen.getByText(/2 hours/i)).toBeInTheDocument();
    });
  });

  describe('Task Completion', () => {
    it('renders mark complete button', () => {
      render(<ActionRequired tasks={mockTasks} />);
      const completeBtn = screen.getByRole('button', { name: /mark complete/i });
      expect(completeBtn).toBeInTheDocument();
    });

    it('calls onCompleteTask when clicked', () => {
      const handleCompleteTask = vi.fn();
      render(<ActionRequired tasks={mockTasks} onCompleteTask={handleCompleteTask} />);
      
      const completeBtn = screen.getAllByRole('button', { name: /mark complete/i })[0];
      fireEvent.click(completeBtn);
      
      expect(handleCompleteTask).toHaveBeenCalledWith(mockTasks[0]);
    });
  });

  describe('Task Categories', () => {
    it('shows task category icons', () => {
      render(<ActionRequired tasks={mockTasks} />);
      expect(screen.getByText('Inventory')).toBeInTheDocument();
      expect(screen.getByText('Pricing')).toBeInTheDocument();
    });
  });

  describe('Progress Tracking', () => {
    it('displays progress bar for multi-step tasks', () => {
      render(<ActionRequired tasks={mockTasks} />);
      const progressBars = document.querySelectorAll('[role="progressbar"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });
  });

  describe('Empty State', () => {
    it('displays message when no tasks', () => {
      render(<ActionRequired tasks={[]} />);
      expect(screen.getByText(/all caught up/i)).toBeInTheDocument();
    });
  });

  describe('Task Stats Summary', () => {
    it('shows completed today count', () => {
      render(<ActionRequired tasks={mockTasks} />);
      expect(screen.getByText(/completed today/i)).toBeInTheDocument();
    });

    it('displays pending tasks count', () => {
      render(<ActionRequired tasks={mockTasks} />);
      expect(screen.getByText('3 pending')).toBeInTheDocument();
    });
  });
});
