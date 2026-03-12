"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getTemplateScreenshotPaths } from "@/lib/preview/demo-data-v2";
import { cn } from "@/lib/utils";
import { Check, ChevronRight, Eye, Smartphone } from "lucide-react";

export interface TemplateCardProps {
    id: string;
    slug: string;
    displayName: string;
    category: string;
    industry: string;
    layoutKey: string;
    status: "active" | "draft" | "deprecated";
    requiredPlan: string;
    defaultTheme: "light" | "dark";
    compare: {
        headline: string;
        bullets: string[];
        bestFor: string[];
        keyModules: string[];
    };
    isSelected?: boolean;
    onSelect?: (template: TemplateCardProps) => void;
    onPreview?: (template: TemplateCardProps) => void;
    className?: string;
}

export function TemplateCard({
    id,
    slug,
    displayName,
    category,
    industry,
    layoutKey,
    status,
    requiredPlan,
    defaultTheme,
    compare,
    isSelected,
    onSelect,
    onPreview,
    className,
}: TemplateCardProps) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    // Get proper screenshot paths
    const screenshotPaths = getTemplateScreenshotPaths(slug);
    const thumbnailUrl = imageError ? screenshotPaths.fallback.thumbnail : screenshotPaths.thumbnail;

    // Determine if this is a premium template
    const isPremium = requiredPlan !== "free";
    const isActive = status === "active";

    // Industry icon/color mapping
    const industryStyles: Record<string, { bg: string; text: string; border: string }> = {
        food: { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
        electronics: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
        fashion: { bg: "bg-pink-50", text: "text-pink-700", border: "border-pink-200" },
        beauty: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
        realestate: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
        services: { bg: "bg-cyan-50", text: "text-cyan-700", border: "border-cyan-200" },
        events: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
        education: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
        automotive: { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200" },
        nonprofit: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
        marketplace: { bg: "bg-teal-50", text: "text-teal-700", border: "border-teal-200" },
        b2b: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
        nightlife: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
        digital: { bg: "bg-sky-50", text: "text-sky-700", border: "border-sky-200" },
        default: { bg: "bg-gray-50", text: "text-gray-700", border: "border-gray-200" },
    };

    const style = industryStyles[industry] || industryStyles.default;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className={cn("group relative", className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <Card
                className={cn(
                    "overflow-hidden border-2 transition-all duration-300 cursor-pointer",
                    isSelected
                        ? "border-primary shadow-lg ring-2 ring-primary/20"
                        : "border-transparent hover:border-gray-200 hover:shadow-xl",
                    !isActive && "opacity-60 grayscale"
                )}
                onClick={() => onSelect?.({ id, slug, displayName, category, industry, layoutKey, status, requiredPlan, defaultTheme, compare, isSelected, onSelect, onPreview, className })}
            >
                {/* Image Container */}
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                    <Image
                        src={thumbnailUrl}
                        alt={`${displayName} template preview`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        onError={() => setImageError(true)}
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />

                    {/* Hover Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        className="absolute inset-0 bg-black/60 flex items-center justify-center gap-3"
                    >
                        <Button
                            variant="secondary"
                            size="sm"
                            className="gap-2"
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onPreview?.({ id, slug, displayName, category, industry, layoutKey, status, requiredPlan, defaultTheme, compare, isSelected, onSelect, onPreview, className });
                            }}
                        >
                            <Eye className="h-4 w-4" />
                            Preview
                        </Button>
                        <Button
                            variant="default"
                            size="sm"
                            className="gap-2"
                            onClick={(e: React.MouseEvent) => {
                                e.stopPropagation();
                                onSelect?.({ id, slug, displayName, category, industry, layoutKey, status, requiredPlan, defaultTheme, compare, isSelected, onSelect, onPreview, className });
                            }}
                        >
                            {isSelected ? (
                                <>
                                    <Check className="h-4 w-4" />
                                    Selected
                                </>
                            ) : (
                                <>
                                    <ChevronRight className="h-4 w-4" />
                                    Select
                                </>
                            )}
                        </Button>
                    </motion.div>

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <Badge className={cn("text-xs font-medium", style.bg, style.text, style.border)}>
                            {category}
                        </Badge>
                        {isPremium && (
                            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                {requiredPlan}
                            </Badge>
                        )}
                        {isSelected && (
                            <Badge className="bg-primary text-primary-foreground">
                                <Check className="h-3 w-3 mr-1" />
                                Active
                            </Badge>
                        )}
                    </div>

                    {/* Mobile Indicator */}
                    <div className="absolute top-3 right-3">
                        <Badge variant="secondary" className="bg-white/90 text-gray-700 gap-1">
                            <Smartphone className="h-3 w-3" />
                            Mobile Ready
                        </Badge>
                    </div>
                </div>

                {/* Content */}
                <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                                {displayName}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                                {compare.headline}
                            </p>
                        </div>
                    </div>

                    {/* Best For Tags */}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                        {(compare.bestFor as string[]).slice(0, 2).map((item: string) => (
                            <span
                                key={item}
                                className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                            >
                                {item}
                            </span>
                        ))}
                        {(compare.bestFor as string[]).length > 2 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                                +{(compare.bestFor as string[]).length - 2} more
                            </span>
                        )}
                    </div>

                    {/* Key Modules */}
                    <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-400 mb-2">Includes:</p>
                        <div className="flex flex-wrap gap-1">
                            {compare.keyModules.slice(0, 3).map((module) => (
                                <Badge
                                    key={module}
                                    variant="outline"
                                    className="text-xs font-normal text-gray-600"
                                >
                                    {module}
                                </Badge>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Selection Indicator */}
            {isSelected && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg"
                >
                    <Check className="h-4 w-4 text-primary-foreground" />
                </motion.div>
            )}
        </motion.div>
    );
}

// Template Grid Component
export interface TemplateGridProps {
    templates: Array<Omit<TemplateCardProps, "onSelect" | "onPreview" | "isSelected">>;
    selectedId?: string;
    onSelect: (template: TemplateCardProps) => void;
    onPreview: (template: TemplateCardProps) => void;
    className?: string;
}

export function TemplateGrid({
    templates,
    selectedId,
    onSelect,
    onPreview,
    className,
}: TemplateGridProps) {
    return (
        <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
            {templates.map((template) => (
                <TemplateCard
                    key={template.id}
                    {...template}
                    isSelected={template.id === selectedId}
                    onSelect={onSelect}
                    onPreview={onPreview}
                />
            ))}
        </div>
    );
}

// Template Preview Modal Component
export interface TemplatePreviewModalProps {
    template: TemplateCardProps | null;
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: TemplateCardProps) => void;
}

export function TemplatePreviewModal({
    template,
    isOpen,
    onClose,
    onSelect,
}: TemplatePreviewModalProps) {
    if (!template || !isOpen) return null;

    const screenshotPaths = getTemplateScreenshotPaths(template.slug);

    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold">{template.displayName}</h2>
                        <p className="text-gray-500 mt-1">{template.compare.headline}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <span className="sr-only">Close</span>
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </Button>
                </div>

                {/* Preview Images */}
                <div className="flex-1 overflow-auto p-6 space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Desktop View</p>
                            <div className="relative aspect-[16/10] rounded-lg overflow-hidden border">
                                <Image
                                    src={screenshotPaths.desktop}
                                    alt={`${template.displayName} desktop preview`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-gray-700">Mobile View</p>
                            <div className="relative aspect-[9/16] max-w-[200px] mx-auto rounded-lg overflow-hidden border">
                                <Image
                                    src={screenshotPaths.mobile}
                                    alt={`${template.displayName} mobile preview`}
                                    fill
                                    className="object-cover"
                                    sizes="200px"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 className="font-semibold mb-3">Best For</h4>
                            <ul className="space-y-2">
                                {(template.compare.bestFor as string[]).map((item: string) => (
                                    <li key={item} className="flex items-center gap-2 text-gray-600">
                                        <Check className="h-4 w-4 text-green-500" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-3">Key Features</h4>
                            <ul className="space-y-2">
                                {template.compare.bullets.map((bullet: string) => (
                                    <li key={bullet} className="flex items-center gap-2 text-gray-600">
                                        <Check className="h-4 w-4 text-green-500" />
                                        {bullet}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t flex justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        onClick={() => {
                            onSelect(template);
                            onClose();
                        }}
                    >
                        Use This Template
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
