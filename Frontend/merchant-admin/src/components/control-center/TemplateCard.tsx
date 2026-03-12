import React from "react";
import { Icon, cn, Button } from "@vayva/ui";
import { Recommendation } from "@/types/designer";
import { TemplateMiniPreview } from "./TemplateMiniPreview";

interface TemplateData {
  id: string;
  name: string;
  tagline?: string;
  description?: string;
  tier: "free" | "growth" | "pro";
  isActive?: boolean;
  isPurchased?: boolean;
  isLocked?: boolean;
  price: number;
  setupTime?: string;
  demand?: "popular" | "high_demand";
  tags: string[];
  checkoutMode?: "whatsapp" | "website" | "hybrid";
  previewImageDesktop?: string;
  previewImages?: { cover?: string };
  layoutComponent?: React.ComponentType<unknown>;
  componentProps?: Record<string, unknown>;
}

interface TemplateCardProps {
  template: TemplateData;
  onPreview: (template: TemplateData) => void;
  onUse: (template: TemplateData) => void;
  onUnlock?: (template: TemplateData) => void;
  userPlan: "free" | "growth" | "pro";
  recommendation?: Recommendation;
  compact?: boolean;
}

export const TemplateCard = ({
  template,
  onPreview,
  onUse,
  onUnlock,
  userPlan: _userPlan,
  recommendation,
  compact,
}: TemplateCardProps) => {
  const isLocked = false;

  return (
    <div
      className={cn(
        "group bg-background border rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full",
        recommendation
          ? "border-purple-200 ring-2 ring-purple-100"
          : "border-border",
      )}
    >
      {recommendation && (
        <div className="bg-purple-50 px-4 py-2 flex items-center gap-2 border-b border-purple-100">
          <Icon name="Sparkles" size={14} className="text-purple-600" />
          <span className="text-xs font-bold text-purple-900 line-clamp-1">
            {recommendation.reason}
          </span>
          <span className="ml-auto text-[10px] font-bold bg-background text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
            {recommendation.expectedImpact}
          </span>
        </div>
      )}

      <div
        className="relative aspect-[4/3] bg-white/40 overflow-hidden cursor-pointer"
        onClick={() => onPreview(template)}
      >
        {template.layoutComponent ? (
          <div className="w-full h-full group-hover:scale-105 transition-transform duration-700">
            <TemplateMiniPreview
              layoutComponent={template.layoutComponent as any}
              templateName={template.name}
              componentProps={template.componentProps}
            />
          </div>
        ) : (
          <img
            src={
              template.previewImageDesktop ||
              template.previewImages?.cover ||
              "/images/template-previews/default-desktop.png"
            }
            alt={template.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "/images/template-previews/default-desktop.png";
            }}
          />
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {template.isActive && (
            <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm">
              Active
            </span>
          )}
          {isLocked && (
            <span className="bg-text-primary/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wide shadow-sm flex items-center gap-1">
              <Icon name="Lock" size={10} /> {template.tier} Plan
            </span>
          )}
        </div>

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[2px]">
          <Button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              onPreview(template);
            }}
            variant="ghost"
            className="bg-background text-black px-4 py-2 rounded-xl text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300 hover:bg-white/40 flex items-center gap-2"
          >
            <Icon name="Eye" size={14} /> Preview
          </Button>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {template.demand === "popular" && (
                <span className="text-[9px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-100 flex items-center gap-1">
                  <Icon name="Flame" size={8} /> Popular
                </span>
              )}
              {template.demand === "high_demand" && (
                <span className="text-[9px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">
                  High Demand
                </span>
              )}
              <span className="text-[9px] font-medium text-text-tertiary flex items-center gap-1">
                <Icon name="Clock" size={8} /> {template.setupTime}
              </span>
            </div>
            <h3 className="font-heading font-bold text-lg text-text-primary leading-tight">
              {template.name}
            </h3>
            {template.tagline && (
              <p className="text-xs font-medium text-purple-600 mt-0.5">
                {template.tagline}
              </p>
            )}
            <p className="text-xs text-text-tertiary mt-1 line-clamp-2">
              {template.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          {template.tags.slice(0, 3).map((tag: string) => (
            <span
              key={tag}
              className="text-[10px] bg-white/40 text-text-tertiary px-2 py-1 rounded-md border border-border/40 font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        <div className="mt-auto pt-4 border-t border-border/40 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border",
                  template.tier === "free"
                    ? "bg-white/40 text-text-secondary border-border"
                    : template.tier === "growth"
                      ? "bg-blue-50 text-blue-600 border-blue-200"
                      : "bg-purple-50 text-purple-600 border-purple-200",
                )}
              >
                {template.tier}
              </span>
              <span className="text-text-tertiary">|</span>
              <span className="text-text-tertiary font-medium capitalize flex items-center gap-1">
                {template.checkoutMode === "whatsapp" && (
                  <Icon name="MessageCircle" size={10} />
                )}
                {template.checkoutMode === "website" && (
                  <Icon name="Globe" size={10} />
                )}
                {template.checkoutMode === "hybrid" && (
                  <Icon name="Shuffle" size={10} />
                )}
                {template.checkoutMode}
              </span>
            </div>

            {template.price > 0 &&
            !template.isPurchased &&
            !template.isActive ? (
              <span className="font-bold text-text-primary">
                ₦{template.price.toLocaleString()}
              </span>
            ) : null}
          </div>

          {template.isActive ? (
            <Button
              className="w-full py-2.5 bg-white/40 text-text-tertiary rounded-xl text-sm font-bold cursor-default flex items-center justify-center gap-2"
              variant="ghost"
            >
              <Icon name="Check" size={16} /> Active on Store
            </Button>
          ) : isLocked ? (
            <Button
              onClick={() => onUnlock?.(template)}
              variant="primary"
              className="w-full py-2.5 bg-text-primary text-white rounded-xl text-sm font-bold hover:bg-text-primary transition-colors flex items-center justify-center gap-2"
            >
              <Icon name="Lock" size={14} /> Unlock with {template.tier}
            </Button>
          ) : template.price > 0 && !template.isPurchased ? (
            <Button
              onClick={() => onUse(template)}
              variant="primary"
              className="w-full py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-text-primary transition-colors shadow-sm group-hover:shadow-md flex items-center justify-center gap-2"
            >
              <Icon name="CreditCard" size={14} /> Buy Template
            </Button>
          ) : (
            <Button
              onClick={() => onUse(template)}
              variant="primary"
              className="w-full py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-text-primary transition-colors shadow-sm group-hover:shadow-md"
            >
              Use Template
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
