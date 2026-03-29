'use client';

import { useRouter } from 'next/navigation';
import { MonitorPlay, CashRegister, ShoppingCart } from 'lucide-react';
import { Button } from '@vayva/ui/components/ui/button';
import { useMerchant } from '@/hooks/useMerchant';

interface POSLauncherProps {
  variant?: 'button' | 'icon' | 'card';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  industrySlug?: string; // Optional override
}

const INDUSTRY_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  // Commerce
  retail: { label: 'POS Terminal', icon: CashRegister },
  fashion: { label: 'Checkout', icon: ShoppingCart },
  electronics: { label: 'POS Terminal', icon: CashRegister },
  grocery: { label: 'Checkout', icon: CashRegister },
  one_product: { label: 'Buy Now', icon: ShoppingCart },
  
  // Food
  restaurant: { label: 'Table Service', icon: CashRegister },
  food: { label: 'Quick Checkout', icon: CashRegister },
  catering: { label: 'Orders & Events', icon: ShoppingCart },
  
  // Bookings
  beauty: { label: 'Check-in', icon: MonitorPlay },
  salon: { label: 'Reception', icon: MonitorPlay },
  spa: { label: 'Guest Services', icon: MonitorPlay },
  wellness: { label: 'Check-in', icon: MonitorPlay },
  healthcare: { label: 'Patient Check-in', icon: MonitorPlay },
  fitness: { label: 'Front Desk', icon: MonitorPlay },
  
  // Default
  default: { label: 'Point of Sale', icon: MonitorPlay },
};

export function POSLauncher({ 
  variant = 'button', 
  size = 'md', 
  className = '',
  industrySlug: overrideIndustry 
}: POSLauncherProps) {
  const router = useRouter();
  const { merchant } = useMerchant();
  
  const industrySlug = overrideIndustry || merchant?.industrySlug || 'retail';
  const config = INDUSTRY_CONFIG[industrySlug] || INDUSTRY_CONFIG.default;
  const Icon = config.icon;
  
  const handleClick = () => {
    router.push(`/dashboard/pos/${industrySlug}`);
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClick}
        className={className}
        title={`Open ${config.label}`}
      >
        <Icon className="h-5 w-5" />
      </Button>
    );
  }

  if (variant === 'card') {
    return (
      <div
        onClick={handleClick}
        className={`p-6 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 cursor-pointer hover:border-primary/40 transition-all duration-300 ${className}`}
      >
        <div className="flex items-center gap-4">
          <div className="p-4 bg-primary/10 rounded-lg">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{config.label}</h3>
            <p className="text-sm text-muted-foreground">Process sales and manage orders</p>
          </div>
        </div>
      </div>
    );
  }

  // Default button variant
  return (
    <Button
      onClick={handleClick}
      size={size}
      className={className}
    >
      <Icon className="h-4 w-4 mr-2" />
      {config.label}
    </Button>
  );
}
