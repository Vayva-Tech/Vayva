"use client";

import { Card, Icon, IconName } from "@vayva/ui";
import Link from "next/link";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  iconBg: string;
  href?: string;
  onClick?: () => void;
}

export function QuickActions() {
  const actions: QuickAction[] = [
    {
      id: "create-product",
      title: "Add Product",
      description: "Create a new product listing",
      icon: "Package",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/products/new",
    },
    {
      id: "new-order",
      title: "Orders",
      description: "View and manage orders",
      icon: "ShoppingBag",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/orders",
    },
    {
      id: "view-analytics",
      title: "Analytics",
      description: "View performance metrics",
      icon: "BarChart3",
      iconBg: "bg-white/40 text-text-secondary",
      href: "/dashboard/analytics",
    },
    {
      id: "manage-customers",
      title: "Customers",
      description: "Manage customer relationships",
      icon: "Users",
      iconBg: "bg-status-warning/10 text-status-warning",
      href: "/dashboard/customers",
    },
    {
      id: "marketing",
      title: "Marketing",
      description: "Create campaigns & promotions",
      icon: "Megaphone",
      iconBg: "bg-white/40 text-text-secondary",
      href: "/dashboard/marketing",
    },
    {
      id: "settings",
      title: "Settings",
      description: "Configure your store",
      icon: "Settings",
      iconBg: "bg-white/40 text-text-secondary",
      href: "/dashboard/settings",
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          Quick Actions
        </h3>
        <Icon name="Zap" className="h-5 w-5 text-text-tertiary" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.map((action) => (
          <Link key={action.id} href={action.href || "#"} className="group">
            <div className="p-4 border border-border rounded-xl hover:bg-white/40 hover:shadow-elevated transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <div
                className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
              >
                <Icon name={action.icon} className="h-6 w-6" />
              </div>
              <h4 className="text-sm font-semibold text-text-primary mb-1">
                {action.title}
              </h4>
              <p className="text-xs text-text-tertiary line-clamp-2">
                {action.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
