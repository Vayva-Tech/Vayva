#!/bin/bash
# Migration Script - Update existing pages to use engine architecture

echo "🚀 Starting migration to engine architecture..."

# Backup original files
echo "📋 Creating backups..."
cp -r /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/products /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/products.backup
cp -r /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/orders /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/orders.backup
cp -r /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/customers /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/customers.backup
cp -r /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/marketing /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/marketing.backup
cp -r /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/wa-agent /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/wa-agent.backup
cp -r /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/control-center /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/control-center.backup

echo "✅ Backups created successfully"

# Update product page to use engine
echo "🔧 Updating products page..."
cat > /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/products/page.tsx << 'EOF'
"use client";

import { useProducts } from "@/hooks/use-engines";
import { ProductList } from "@/components/products/ProductList";
import { ProductFilters } from "@/components/products/ProductFilters";

export default function ProductsPage() {
  const { products, loading, error } = useProducts();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading products</h3>
          <p className="text-red-600 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <p className="text-gray-600 mt-1">Manage your product catalog</p>
      </div>
      
      <ProductFilters />
      
      <div className="mt-6">
        <ProductList 
          products={products} 
          loading={loading}
          onRefresh={() => window.location.reload()}
        />
      </div>
    </div>
  );
}
EOF

# Update orders page to use engine
echo "🔧 Updating orders page..."
cat > /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/orders/page.tsx << 'EOF'
"use client";

import { useOrders } from "@/hooks/use-engines";
import { OrderList } from "@/components/orders/OrderList";
import { OrderFilters } from "@/components/orders/OrderFilters";

export default function OrdersPage() {
  const { orders, loading, error } = useOrders();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading orders</h3>
          <p className="text-red-600 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600 mt-1">Manage customer orders</p>
      </div>
      
      <OrderFilters />
      
      <div className="mt-6">
        <OrderList 
          orders={orders} 
          loading={loading}
          onRefresh={() => window.location.reload()}
        />
      </div>
    </div>
  );
}
EOF

# Update customers page to use engine
echo "🔧 Updating customers page..."
cat > /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/customers/page.tsx << 'EOF'
"use client";

import { useCustomers } from "@/hooks/use-engines";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerFilters } from "@/components/customers/CustomerFilters";

export default function CustomersPage() {
  const { customers, loading, error } = useCustomers();

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading customers</h3>
          <p className="text-red-600 mt-1">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <p className="text-gray-600 mt-1">Manage your customer database</p>
      </div>
      
      <CustomerFilters />
      
      <div className="mt-6">
        <CustomerList 
          customers={customers} 
          loading={loading}
          onRefresh={() => window.location.reload()}
        />
      </div>
    </div>
  );
}
EOF

# Update marketing page to use engine
echo "🔧 Updating marketing page..."
cat > /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/marketing/page.tsx << 'EOF'
"use client";

import { useCampaigns, usePromotions } from "@/hooks/use-engines";
import { CampaignList } from "@/components/marketing/CampaignList";
import { PromotionList } from "@/components/marketing/PromotionList";

export default function MarketingPage() {
  const { campaigns, loading: campaignsLoading, error: campaignsError } = useCampaigns();
  const { promotions, loading: promotionsLoading, error: promotionsError } = usePromotions();

  if (campaignsError || promotionsError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading marketing data</h3>
          <p className="text-red-600 mt-1">{(campaignsError || promotionsError)?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketing</h1>
        <p className="text-gray-600 mt-1">Manage campaigns and promotions</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Campaigns</h2>
          <CampaignList 
            campaigns={campaigns} 
            loading={campaignsLoading}
            onRefresh={() => window.location.reload()}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Promotions</h2>
          <PromotionList 
            promotions={promotions} 
            loading={promotionsLoading}
            onRefresh={() => window.location.reload()}
          />
        </div>
      </div>
    </div>
  );
}
EOF

# Update WhatsApp agent page to use engine
echo "🔧 Updating WhatsApp agent page..."
cat > /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/wa-agent/page.tsx << 'EOF'
"use client";

import { useWhatsAppAgent, useWhatsAppConversations } from "@/hooks/use-engines";
import { WhatsAppAgentConfig } from "@/components/whatsapp/WhatsAppAgentConfig";
import { WhatsAppConversationList } from "@/components/whatsapp/WhatsAppConversationList";

export default function WhatsAppAgentPage() {
  const { agent, loading: agentLoading, error: agentError } = useWhatsAppAgent();
  const { conversations, loading: convLoading, error: convError } = useWhatsAppConversations();

  if (agentError || convError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading WhatsApp data</h3>
          <p className="text-red-600 mt-1">{(agentError || convError)?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">WhatsApp AI Agent</h1>
        <p className="text-gray-600 mt-1">Configure your AI-powered WhatsApp assistant</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <WhatsAppAgentConfig 
            agent={agent} 
            loading={agentLoading}
            onSave={() => window.location.reload()}
          />
        </div>
        
        <div className="lg:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Recent Conversations</h2>
          <WhatsAppConversationList 
            conversations={conversations} 
            loading={convLoading}
            onRefresh={() => window.location.reload()}
          />
        </div>
      </div>
    </div>
  );
}
EOF

# Update control center page to use engine
echo "🔧 Updating control center page..."
cat > /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/\(dashboard\)/dashboard/control-center/page.tsx << 'EOF'
"use client";

import { useStoreSettings, useThemeSettings } from "@/hooks/use-engines";
import { StoreSettingsForm } from "@/components/control-center/StoreSettingsForm";
import { ThemeCustomizer } from "@/components/control-center/ThemeCustomizer";

export default function ControlCenterPage() {
  const { settings, loading: settingsLoading, error: settingsError } = useStoreSettings();
  const { theme, loading: themeLoading, error: themeError } = useThemeSettings();

  if (settingsError || themeError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading control center data</h3>
          <p className="text-red-600 mt-1">{(settingsError || themeError)?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Control Center</h1>
        <p className="text-gray-600 mt-1">Manage your store settings and appearance</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Store Settings</h2>
          <StoreSettingsForm 
            settings={settings} 
            loading={settingsLoading}
            onSave={() => window.location.reload()}
          />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-4">Theme Customization</h2>
          <ThemeCustomizer 
            theme={theme} 
            loading={themeLoading}
            onSave={() => window.location.reload()}
          />
        </div>
      </div>
    </div>
  );
}
EOF

echo "✅ Migration completed successfully!"
echo ""
echo "📝 Summary of changes:"
echo "- Created engine-based architecture in /lib/engines/"
echo "- Created integration hooks in /hooks/use-engines.ts"
echo "- Updated all core business pages to use new architecture"
echo "- Backups saved in .backup directories"
echo ""
echo "🚀 Next steps:"
echo "1. Verify all pages load correctly"
echo "2. Test core functionality"
echo "3. Run optimization phase"