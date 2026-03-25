"use client";

import React from "react";
import { Icon, type IconName, Card, Skeleton } from "@vayva/ui";
import Link from "next/link";
import { useIndustry } from "@/hooks/useIndustry";
import type { IndustrySlug } from "@/lib/templates/types";

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  iconBg: string;
  href: string;
}

// Type guard for IndustrySlug
const isValidIndustrySlug = (slug: string): slug is IndustrySlug => {
  return [
    "analytics",
    "food",
    "meal-kit",
    "restaurant",
    "catering",
    "wholesale",
    "hotel",
    "salon",
    "spa",
    "real_estate",
    "automotive",
    "education",
    "events",
    "travel_hospitality",
    "marketplace",
    "retail",
    "fashion",
    "beauty",
    "services",
    "digital",
    "electronics",
    "grocery",
    "nonprofit",
    "b2b",
    "one_product",
    "nightlife",
    "blog_media",
    "creative_portfolio",
    "saas",
    "fitness",
    "healthcare",
    "legal",
    "jobs",
    "petcare",
    "specialized",
    "wellness",
  ].includes(slug);
};

const getIndustryActions = (industrySlug: IndustrySlug): QuickAction[] => {
  const baseActions: QuickAction[] = [
    {
      id: "view-analytics",
      title: "Analytics",
      description: "View performance metrics",
      icon: "BarChart3",
      iconBg: "bg-white-2/50 text-gray-500",
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
      iconBg: "bg-white-2/50 text-gray-500",
      href: "/dashboard/marketing",
    },
    {
      id: "settings",
      title: "Settings",
      description: "Configure your store",
      icon: "Settings",
      iconBg: "bg-white-2/50 text-gray-500",
      href: "/dashboard/settings",
    },
  ];

  // Industry-specific primary actions
  const industryPrimary: Record<IndustrySlug, QuickAction> = {
    analytics: {
      id: "analytics",
      title: "Analytics",
      description: "View dashboards and reports",
      icon: "BarChart3",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/analytics",
    },
    food: {
      id: "kitchen",
      title: "Kitchen",
      description: "Manage kitchen orders",
      icon: "ChefHat",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/kitchen",
    },
    "meal-kit": {
      id: "meal-kit",
      title: "Meal kit",
      description: "Menus, subscriptions, and delivery",
      icon: "ChefHat",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/meal-kit",
    },
    restaurant: {
      id: "kitchen",
      title: "Kitchen",
      description: "Manage kitchen orders",
      icon: "ChefHat",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/kitchen",
    },
    catering: {
      id: "orders",
      title: "Orders",
      description: "Manage catering orders",
      icon: "Truck",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/orders",
    },
    real_estate: {
      id: "properties",
      title: "Properties",
      description: "Manage property listings",
      icon: "Building",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/properties",
    },
    automotive: {
      id: "vehicles",
      title: "Vehicles",
      description: "Manage vehicle listings",
      icon: "Car",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/vehicles",
    },
    education: {
      id: "courses",
      title: "Courses",
      description: "Manage courses",
      icon: "BookOpen",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/courses",
    },
    events: {
      id: "events",
      title: "Events",
      description: "Manage events",
      icon: "Calendar",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/events",
    },
    travel_hospitality: {
      id: "stays",
      title: "Stays",
      description: "Manage accommodations",
      icon: "Hotel",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/stays",
    },
    hotel: {
      id: "stays",
      title: "Stays",
      description: "Manage accommodations",
      icon: "Hotel",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/stays",
    },
    marketplace: {
      id: "listings",
      title: "Listings",
      description: "Manage marketplace listings",
      icon: "Store",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/products",
    },
    retail: {
      id: "products",
      title: "Products",
      description: "Create a new product listing",
      icon: "Package",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/products/new",
    },
    fashion: {
      id: "products",
      title: "Products",
      description: "Create a new product listing",
      icon: "Shirt",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/products/new",
    },
    beauty: {
      id: "services",
      title: "Services",
      description: "Manage beauty services",
      icon: "Sparkles",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/services",
    },
    salon: {
      id: "bookings",
      title: "Bookings",
      description: "Manage salon appointments",
      icon: "Scissors",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/bookings",
    },
    spa: {
      id: "bookings",
      title: "Bookings",
      description: "Manage spa appointments",
      icon: "Sparkles",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/bookings",
    },
    services: {
      id: "bookings",
      title: "Bookings",
      description: "Manage appointments",
      icon: "Calendar",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/bookings",
    },
    digital: {
      id: "products",
      title: "Products",
      description: "Manage digital products",
      icon: "Download",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/products/new",
    },
    electronics: {
      id: "products",
      title: "Products",
      description: "Create a new product listing",
      icon: "Smartphone",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/products/new",
    },
    grocery: {
      id: "inventory",
      title: "Inventory",
      description: "Manage inventory",
      icon: "ShoppingCart",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/inventory",
    },
    nonprofit: {
      id: "donations",
      title: "Donations",
      description: "Manage donations",
      icon: "Heart",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/donations",
    },
    b2b: {
      id: "quotes",
      title: "Quotes",
      description: "Manage B2B quotes",
      icon: "FileText",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/quotes",
    },
    wholesale: {
      id: "quotes",
      title: "Quotes",
      description: "Manage wholesale quotes",
      icon: "Boxes",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/quotes",
    },
    one_product: {
      id: "orders",
      title: "Orders",
      description: "View orders",
      icon: "ShoppingBag",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/orders",
    },
    nightlife: {
      id: "events",
      title: "Events",
      description: "Manage events",
      icon: "Music",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/events",
    },
    blog_media: {
      id: "posts",
      title: "Posts",
      description: "Manage blog posts",
      icon: "FileText",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/posts",
    },
    creative_portfolio: {
      id: "projects",
      title: "Projects",
      description: "Manage projects",
      icon: "Briefcase",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/projects",
    },
    saas: {
      id: "products",
      title: "Products",
      description: "Manage SaaS products",
      icon: "Cloud",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/products",
    },
    fitness: {
      id: "memberships",
      title: "Memberships",
      description: "Manage memberships",
      icon: "Barbell",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/memberships",
    },
    healthcare: {
      id: "appointments",
      title: "Appointments",
      description: "Manage appointments",
      icon: "HeartPulse",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/appointments",
    },
    legal: {
      id: "cases",
      title: "Cases",
      description: "Manage legal cases",
      icon: "Scale",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/cases",
    },
    jobs: {
      id: "listings",
      title: "Listings",
      description: "Manage job listings",
      icon: "Briefcase",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/listings",
    },
    petcare: {
      id: "appointments",
      title: "Appointments",
      description: "Manage pet care appointments",
      icon: "HeartPulse",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/appointments",
    },
    specialized: {
      id: "catalog",
      title: "Catalog",
      description: "Manage your offerings",
      icon: "Layers",
      iconBg: "bg-status-info/10 text-status-info",
      href: "/dashboard/catalog",
    },
    wellness: {
      id: "bookings",
      title: "Bookings",
      description: "Manage wellness appointments",
      icon: "Sparkles",
      iconBg: "bg-status-success/10 text-status-success",
      href: "/dashboard/bookings",
    },
  };

  const primary = industryPrimary[industrySlug] || industryPrimary.retail;

  return [primary, ...baseActions];
};

export function QuickActions() {
  const { industrySlug } = useIndustry();
  // Derive loading state directly instead of using an effect
  const isLoading = industrySlug === undefined;
  
  const validIndustrySlug = industrySlug && isValidIndustrySlug(industrySlug) 
    ? industrySlug 
    : "retail";
  const actions = getIndustryActions(validIndustrySlug);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-white-2 rounded animate-pulse" />
          <div className="h-5 w-5 bg-white-2 rounded animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-white-2/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Quick Actions
        </h3>
        <Icon name="Zap" className="h-5 w-5 text-gray-400" />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {actions.length === 0 ? (
          <div className="col-span-full text-center py-8">
            <Icon
              name="ZapOff"
              className="h-12 w-12 text-gray-400 mx-auto mb-2"
            />
            <p className="text-sm text-gray-500">
              No quick actions available for your industry.
            </p>
          </div>
        ) : (
          actions.map((action) => (
            <Link key={action.id} href={action.href || "#"} className="group">
              <div className="p-4 border border-gray-100 rounded-xl hover:bg-white-2/50 hover:shadow-lg transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2">
                <div
                  className={`w-12 h-12 rounded-xl ${action.iconBg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}
                >
                  <Icon name={action.icon} className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  {action.title}
                </h4>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {action.description}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </Card>
  );
}
