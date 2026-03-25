"use client";
import { Button } from "@vayva/ui";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Circle,
  ChevronUp,
  ChevronDown,
  X,
  Package,
  CreditCard,
  Truck,
  MessageCircle,
  Palette,
  Users,
} from "lucide-react";

interface ChecklistItem {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: "add_product",
    label: "Add your first product",
    description: "Upload a product with images and pricing",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    id: "setup_payment",
    label: "Set up Paystack payments",
    description: "Connect your Paystack account to accept payments",
    href: "/dashboard/settings/payments",
    icon: CreditCard,
  },
  {
    id: "configure_delivery",
    label: "Configure delivery zones",
    description: "Set delivery areas and shipping fees",
    href: "/dashboard/settings",
    icon: Truck,
  },
  {
    id: "connect_whatsapp",
    label: "Connect WhatsApp",
    description: "Enable AI messaging via Evolution API",
    href: "/dashboard/settings",
    icon: MessageCircle,
  },
  {
    id: "customize_branding",
    label: "Customize your store",
    description: "Add logo, colors, and store description",
    href: "/dashboard/control-center",
    icon: Palette,
  },
  {
    id: "invite_team",
    label: "Invite a team member",
    description: "Add staff to help manage your store",
    href: "/dashboard/settings",
    icon: Users,
  },
];

export function OnboardingChecklist() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    const dismissed = localStorage.getItem("vayva_checklist_dismissed");
    if (dismissed) setIsDismissed(true);

    const saved = localStorage.getItem("vayva_checklist_completed");
    if (saved) {
      try {
        setCompletedItems(new Set(JSON.parse(saved)));
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  const toggleItem = (id: string) => {
    setCompletedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      localStorage.setItem(
        "vayva_checklist_completed",
        JSON.stringify([...next])
      );
      return next;
    });
  };

  const handleDismiss = () => {
    localStorage.setItem("vayva_checklist_dismissed", "true");
    setIsDismissed(true);
  };

  if (isDismissed) return null;

  const completedCount = completedItems.size;
  const totalCount = CHECKLIST_ITEMS.length;
  const progress = (completedCount / totalCount) * 100;

  // Auto-dismiss when all complete
  if (completedCount === totalCount && !isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isExpanded ? (
        <div className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-gray-900 text-sm">
                Setup Checklist
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleDismiss}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 font-medium">
                {completedCount}/{totalCount}
              </span>
            </div>
          </div>

          {/* Items */}
          <div className="max-h-72 overflow-y-auto">
            {CHECKLIST_ITEMS.map((item) => {
              const isCompleted = completedItems.has(item.id);
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                >
                  <Button
                    onClick={() => toggleItem(item.id)}
                    className="mt-0.5 flex-shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </Button>
                  <Link href={item.href} className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                      <span
                        className={`text-sm font-medium ${
                          isCompleted
                            ? "text-gray-400 line-through"
                            : "text-gray-700"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>
                    {!isCompleted && (
                      <p className="text-xs text-gray-400 mt-0.5 ml-5.5">
                        {item.description}
                      </p>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100">
            <Button
              onClick={handleDismiss}
              className="text-xs text-gray-400 hover:text-gray-600 w-full text-center"
            >
              Dismiss forever
            </Button>
          </div>
        </div>
      ) : (
        /* Collapsed floating button */
        <Button
          onClick={() => setIsExpanded(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-lg transition-all hover:shadow-xl"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span className="text-sm font-medium">
            {completedCount}/{totalCount} complete
          </span>
          <ChevronUp className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}

