"use client";

import { useEffect, useState, type ComponentType } from "react";
import { useOnboarding } from "../OnboardingContext";
import { Button, cn } from "@vayva/ui";
import { toast } from "sonner";
import { apiJson } from "@/lib/api-client-shared";
import { IndustrySlug } from "@/lib/templates/types";
import {
  Palette,
  SkipForward,
  CheckCircle,
  ShoppingBag,
  ForkKnife as Utensils,
  Barbell as Dumbbell,
  GraduationCap,
  House,
  Briefcase,
  Stethoscope,
  Ticket,
  Building
} from "@phosphor-icons/react/ssr";

type IndustryIconComponent = ComponentType<{ className?: string }>;

type Template = {
  id: string;
  name: string;
  description: string;
  industry: string;
  previewUrl: string;
};

type TemplatesResponse = {
  templates?: Template[];
  error?: string;
};

const INDUSTRY_ICONS: Record<string, IndustryIconComponent> = {
  retail: ShoppingBag,
  fashion: ShoppingBag,
  food: Utensils,
  restaurant: Utensils,
  grocery: ShoppingBag,
  healthcare: Stethoscope,
  fitness: Dumbbell,
  education: GraduationCap,
  real_estate: House,
  professional_services: Briefcase,
  beauty_wellness: Stethoscope,
  events: Ticket,
  nightlife: Ticket,
  b2b: Building,
};

export default function PublishStep() {
  const { nextStep, isSaving, state } = useOnboarding();

  const [isLoading, setIsLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const industrySlug = (state.industrySlug as IndustrySlug) || "retail";
  
  const IndustryIcon = INDUSTRY_ICONS[industrySlug] || ShoppingBag;

  const loadTemplates = async () => {
    try {
      const res = await apiJson<TemplatesResponse>("/api/templates/available");
      if (res.error) throw new Error(res.error);
      setTemplates(Array.isArray(res.templates) ? res.templates : []);
      
      // Auto-select industry-matching template
      const industryTemplate = res.templates?.find(t => t.industry === industrySlug);
      if (industryTemplate) {
        setSelectedTemplate(industryTemplate.id);
      }
    } catch (e: unknown) {
      toast.error("Failed to load templates");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setIsLoading(true);
        await loadTemplates();
      } catch (e: unknown) {
        toast.error("Failed to load templates");
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    // Optional: Save selected template to onboarding state
    if (selectedTemplate) {
      toast.success("Template selected! You can customize it later.");
    }
    nextStep();
  };

  const handleSkip = () => {
    toast.info("You can select a template anytime in Control Center");
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-vayva-green/10 mb-2">
          <Palette className="w-7 h-7 text-vayva-green" />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          Choose Your Store Design
        </h2>
        <p className="text-gray-500 max-w-md mx-auto">
          Pick a professional template for your {industrySlug.replace('_', ' ')} business. 
          You can always change this later in the Control Center.
        </p>
      </div>

      {/* Info Card */}
      <div className="bg-gradient-to-br from-blue-50 to-green-50 border border-blue-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
            <SkipForward className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900">Optional Step</p>
            <p className="text-xs text-blue-700 mt-1">
              Selecting a template now gives you a head start, but you can skip this and 
              choose from 50+ templates later in your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="bg-white border border-gray-100 rounded-[32px] p-6  space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-bold text-gray-900">Recommended for You</p>
          <div className="flex items-center gap-2">
            <IndustryIcon className="w-5 h-5 text-gray-400" />
            <p className="text-xs text-gray-400 capitalize">{industrySlug.replace('_', ' ')}</p>
          </div>
        </div>

        {isLoading ? (
          <div className="text-sm text-gray-400">Loading templates…</div>
        ) : templates.length === 0 ? (
          <div className="p-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-sm text-gray-400">No templates available yet</p>
            <p className="text-xs text-gray-400 mt-1">You can select one later from Control Center</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map((template) => {
              const isSelected = selectedTemplate === template.id;
              const isRecommended = template.industry === industrySlug;
              
              return (
                <Button
                  key={template.id}
                  type="button"
                  onClick={() => handleSelectTemplate(template.id)}
                  className={cn(
                    "relative p-4 rounded-2xl border-2 transition-all hover:shadow-lg text-left",
                    isSelected
                      ? "border-vayva-green bg-vayva-green/5"
                      : "border-gray-100 bg-white/30 hover:bg-white/60",
                  )}
                >
                  {isRecommended && (
                    <div className="absolute -top-2 -right-2 bg-vayva-green text-white text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-widest">
                      Recommended
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{template.name}</p>
                      <p className="text-[11px] text-gray-400 mt-1 line-clamp-2">{template.description}</p>
                      <p className="text-[10px] text-gray-500 mt-2 capitalize">
                        For {template.industry.replace('_', ' ')} businesses
                      </p>
                    </div>
                    
                    {isSelected && (
                      <CheckCircle className="w-6 h-6 text-vayva-green flex-shrink-0" />
                    )}
                  </div>
                </Button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading || isSaving}
            className="h-12 px-6 rounded-xl font-bold"
          >
            Skip & Finish Later
          </Button>
          <Button
            onClick={handleContinue}
            disabled={isSaving}
            className="flex-1 h-12 bg-text-green-500 hover:bg-zinc-800 text-white rounded-xl font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
          >
            {selectedTemplate ? "Continue with Template" : "Continue Without Template"}
          </Button>
        </div>

        <p className="text-[11px] text-gray-400 text-center">
          ✓ No commitment • Change anytime • 50+ templates available in Control Center
        </p>
      </div>
    </div>
  );
}
