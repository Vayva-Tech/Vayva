"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
}

type BackendTemplate = {
  id: string;
  name: string;
  description?: string;
  previewImageUrl?: string;
  requiredPlan?: string;
  isLocked?: boolean;
  industrySlugs?: string[];
  isRecommended?: boolean;
};

export function TemplateGallery({ currentTemplateId }: TemplateGalleryProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [selectedTemplate, setSelectedTemplate] = useState<BackendTemplate | null>(null);
  const [templates, setTemplates] = useState<BackendTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await apiJson<BackendTemplate[]>("/api/templates");
        setTemplates(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        toast.error("Failed to load templates");
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const t of templates) set.add("Storefront");
    return Array.from(set);
  }, [templates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return templates.filter((template) => {
      const matchesCategory = selectedCategory ? selectedCategory === "Storefront" : true;
      const matchesSearch = q
        ? String(template.name || "").toLowerCase().includes(q) ||
          String(template.description || "").toLowerCase().includes(q)
        : true;
      const matchesPlan = selectedPlan
        ? String(template.requiredPlan || "").toLowerCase() === selectedPlan
        : true;
      return matchesCategory && matchesSearch && matchesPlan;
    });
  }, [templates, selectedCategory, searchQuery, selectedPlan]);

  const handleApplyTemplate = async (template: BackendTemplate) => {
    if (template.isLocked) {
      toast.error("This template is locked on your current plan.");
      return;
    }
    setIsApplying(template.id);
    try {
      // Create/update draft so Customize can load immediately
      const result = await apiJson<{ success: boolean; draft?: unknown }>(
        "/api/storefront/draft",
        {
          method: "POST",
          body: JSON.stringify({ activeTemplateId: template.id }),
        },
      );
      if (!result?.success) {
        throw new Error("Failed to apply template");
      }

      toast.success(`Template "${template.name}" selected. Redirecting…`);
      router.push("/dashboard/control-center/customize");
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
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full">
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
            {templates.length} templates available
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
            className="pl-10 pr-4 py-2 border rounded-lg w-full md:w-80 focus:ring-2 focus:ring-green-500"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => setSelectedCategory(null)}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-medium transition-colors",
            selectedCategory === null
              ? "bg-green-500 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          All Templates
        </Button>
        {categories.map((cat) => (
          <Button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-colors",
              selectedCategory === cat
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {cat}
          </Button>
        ))}
      </div>

      {/* Plan Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-400" />
        <span className="text-sm text-gray-600">Plan:</span>
        {["free", "starter", "growth", "enterprise"].map((plan) => (
          <Button
            key={plan}
            onClick={() => setSelectedPlan(selectedPlan === plan ? null : plan)}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium transition-colors capitalize",
              selectedPlan === plan
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {plan}
          </Button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <p className="text-sm text-gray-500">Loading templates…</p>
        ) : null}
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={cn(
              "group bg-white rounded-xl border-2 overflow-hidden transition-all hover:shadow-lg",
              currentTemplateId === template.id
                ? "border-green-500 ring-2 ring-green-500/20"
                : "border-gray-200 hover:border-green-500/50"
            )}
          >
            {/* Preview Image */}
            <div className="aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-50">
                {template.previewImageUrl ? "🖼️" : String(template.name || "T").charAt(0)}
              </div>
              
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  onClick={() => setSelectedTemplate(template)}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium text-sm hover:bg-gray-100"
                >
                  Preview
                </Button>
              </div>

              {/* Current Badge */}
              {currentTemplateId === template.id && (
                <div className="absolute top-3 left-3">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
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
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500">{template.description || "—"}</p>
                </div>
                {template.requiredPlan ? getPlanBadge(template.requiredPlan) : null}
              </div>

              <p className="text-sm text-gray-600 line-clamp-2">
                {template.description || ""}
              </p>

              {/* Key Modules */}
              {Array.isArray(template.industrySlugs) && template.industrySlugs.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {template.industrySlugs.slice(0, 3).map((slug) => (
                    <span
                      key={slug}
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {slug}
                    </span>
                  ))}
                </div>
              ) : null}

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
                <h3 className="text-xl font-bold">{selectedTemplate.name}</h3>
                <p className="text-gray-600">{selectedTemplate.description || "—"}</p>
              </div>
              <Button
                onClick={() => setSelectedTemplate(null)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Preview Toggle */}
              <div className="flex justify-center">
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <Button
                    onClick={() => setPreviewMode("desktop")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      previewMode === "desktop" ? "bg-white shadow-sm" : "text-gray-600"
                    )}
                  >
                    <Monitor className="w-4 h-4" />
                    Desktop
                  </Button>
                  <Button
                    onClick={() => setPreviewMode("mobile")}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                      previewMode === "mobile" ? "bg-white shadow-sm" : "text-gray-600"
                    )}
                  >
                    <Smartphone className="w-4 h-4" />
                    Mobile
                  </Button>
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
                    <p className="text-sm">{selectedTemplate.name}</p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Features</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      Theme customization and publishing supported.
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Best For</h4>
                  <div className="flex flex-wrap gap-2">
                    {(selectedTemplate.industrySlugs || []).map((item: string) => (
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
                    <span className="px-3 py-1 bg-green-500/10 text-green-500 text-sm rounded-full">
                      Storefront
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="flex items-center gap-4">
                {selectedTemplate.requiredPlan ? getPlanBadge(selectedTemplate.requiredPlan) : null}
                <span className="text-sm text-gray-500">
                  Template
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
