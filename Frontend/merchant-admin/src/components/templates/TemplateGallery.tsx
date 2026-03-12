"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ALL_TEMPLATES, 
  TEMPLATE_CATEGORIES,
  type TemplateGalleryItem,
} from "@/template-gallery";
import { Button } from "@vayva/ui";
import { apiJson } from "@/lib/api-client-shared";
import { toast } from "sonner";
import { 
  CheckCircle, 
  Star, 
  ArrowRight,
  Monitor,
  Smartphone,
  Search,
  Filter,
  Sparkles,
  Crown,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateGalleryProps {
  currentTemplateId?: string;
  onSelect?: (template: TemplateGalleryItem) => void;
}

export function TemplateGallery({ currentTemplateId, onSelect }: TemplateGalleryProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateGalleryItem | null>(null);

  // Filter templates
  const filteredTemplates = ALL_TEMPLATES.filter((template: TemplateGalleryItem) => {
    const matchesCategory = selectedCategory ? 
      template.category.toLowerCase() === selectedCategory.toLowerCase() ||
      template.industry === selectedCategory
      : true;
    const matchesSearch = searchQuery ?
      template.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.compare.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.primaryUseCase.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesPlan = selectedPlan ? template.requiredPlan === selectedPlan : true;
    return matchesCategory && matchesSearch && matchesPlan && template.status === "active";
  });

  const handleApplyTemplate = async (template: TemplateGalleryItem) => {
    setIsApplying(template.id);
    try {
      const result = await apiJson<{ success: boolean }>("/api/storefront/template", {
        method: "POST",
        body: JSON.stringify({ templateId: template.id }),
      });
      
      if (result.success) {
        toast.success(`Template "${template.displayName}" applied successfully!`);
        if (onSelect) {
          onSelect(template);
        } else {
          router.push("/dashboard/control-center/customize");
        }
      }
    } catch (error) {
      toast.error("Failed to apply template. Please try again.");
    } finally {
      setIsApplying(null);
    }
  };

  const getPlanBadge = (plan: string) => {
    switch (plan) {
      case "free":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
            <Zap className="w-3 h-3" />
            Free
          </span>
        );
      case "starter":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">
            <Sparkles className="w-3 h-3" />
            Starter
          </span>
        );
      case "growth":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
            <Star className="w-3 h-3" />
            Growth
          </span>
        );
      case "enterprise":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
            <Crown className="w-3 h-3" />
            Enterprise
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Template Gallery</h2>
          <p className="text-gray-600">
            {ALL_TEMPLATES.length} professional templates available
          </p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-80 focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selectedCategory === null
              ? "bg-primary text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          All Templates
        </button>
        {TEMPLATE_CATEGORIES.map((cat: { slug: string; displayName: string }) => (
          <button
            key={cat.slug}
            onClick={() => setSelectedCategory(cat.slug)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              selectedCategory === cat.slug
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {cat.displayName}
          </button>
        ))}
      </div>

      {/* Plan Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">Plan:</span>
        {["free", "starter", "growth", "enterprise"].map((plan) => (
          <button
            key={plan}
            onClick={() => setSelectedPlan(selectedPlan === plan ? null : plan)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize",
              selectedPlan === plan
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {plan}
          </button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTemplates.map((template: TemplateGalleryItem) => (
          <div
            key={template.id}
            className={cn(
              "group bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg",
              currentTemplateId === template.id
                ? "border-primary ring-2 ring-primary/20"
                : "border-gray-200 hover:border-primary/50"
            )}
          >
            {/* Preview Image */}
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-50">
                {template.preview.thumbnailUrl.includes("/") ? "🖼️" : template.displayName.charAt(0)}
              </div>
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100"
                >
                  Preview
                </button>
                <a
                  href={template.source.demoUrl || `#demo-${template.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-primary text-white rounded-lg font-medium text-sm hover:bg-primary/90"
                >
                  Live Demo
                </a>
              </div>

              {/* Current Badge */}
              {currentTemplateId === template.id && (
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Current
                  </span>
                </div>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{template.displayName}</h3>
                  <p className="text-sm text-gray-500">{template.primaryUseCase}</p>
                </div>
                {getPlanBadge(template.requiredPlan)}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {template.compare.headline}
              </p>

              {/* Key Modules */}
              <div className="flex flex-wrap gap-1">
                {template.compare.keyModules.slice(0, 3).map((module: string) => (
                  <span
                    key={module}
                    className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                  >
                    {module}
                  </span>
                ))}
              </div>

              {/* Actions */}
              <div className="pt-3 border-t">
                {currentTemplateId === template.id ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => router.push("/dashboard/control-center/customize")}
                  >
                    Customize
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleApplyTemplate(template)}
                    disabled={isApplying === template.id}
                  >
                    {isApplying === template.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        Applying...
                      </>
                    ) : (
                      <>
                        Use Template
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600">Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h3 className="text-xl font-bold">{selectedTemplate.displayName}</h3>
                <p className="text-gray-600">{selectedTemplate.compare.headline}</p>
              </div>
              <button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Preview Toggle */}
              <div className="flex justify-center">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => setPreviewMode("desktop")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      previewMode === "desktop" ? "bg-white shadow-sm" : "text-gray-600"
                    )}
                  >
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </button>
                  <button
                    onClick={() => setPreviewMode("mobile")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      previewMode === "mobile" ? "bg-white shadow-sm" : "text-gray-600"
                    )}
                  >
                    <Smartphone className="w-4 h-4" />
                    Mobile
                  </button>
                </div>
              </div>

              {/* Preview Frame */}
              <div className={cn(
                "mx-auto bg-gray-100 rounded-lg overflow-hidden transition-all",
                previewMode === "desktop" ? "w-full h-96" : "w-[375px] h-[667px]"
              )}>
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <div className="text-6xl mb-4">🖼️</div>
                    <p>Template Preview</p>
                    <p className="text-sm">{selectedTemplate.displayName}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Features</h4>
                  <ul className="space-y-2">
                    {selectedTemplate.compare.bullets.map((bullet: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Best For</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.compare.bestFor.map((item: string) => (
                      <span
                        key={item}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  
                  <h4 className="font-semibold mb-3 mt-6">Key Modules</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.compare.keyModules.map((module: string) => (
                      <span
                        key={module}
                        className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                      >
                        {module}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="flex items-center gap-4">
                {getPlanBadge(selectedTemplate.requiredPlan)}
                <span className="text-sm text-gray-500">
                  {selectedTemplate.routes.length} pages
                </span>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setSelectedTemplate(null);
                    handleApplyTemplate(selectedTemplate);
                  }}
                  disabled={isApplying === selectedTemplate.id}
                >
                  {isApplying === selectedTemplate.id ? "Applying..." : "Use This Template"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
