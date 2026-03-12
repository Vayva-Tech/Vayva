"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Button, Icon, type IconName, cn } from "@vayva/ui";
import { StatusPill } from "./StatusPill";
import { motion, AnimatePresence } from "framer-motion";

interface TemplateCardProps {
  name: string;
  category: string;
  description?: string;
  thumbnailUrl?: string;
  isActive?: boolean;
  isApplied?: boolean;
  onPreview: () => void;
  onApply: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  isMyTemplate?: boolean;
  status?: "DRAFT" | "PUBLISHED";
  hasUnpublishedChanges?: boolean;
}

export function TemplateCard({
  name,
  category,
  description,
  thumbnailUrl,
  isActive,
  isApplied,
  onPreview,
  onApply,
  onEdit,
  onDuplicate,
  onDelete,
  isMyTemplate,
  status,
  hasUnpublishedChanges,
}: TemplateCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Determine status display
  const getStatusDisplay = () => {
    if (isActive) return { label: "LIVE", variant: "success" as const };
    if (isApplied && status === "DRAFT") return { label: "DRAFT", variant: "warning" as const };
    if (isApplied) return { label: "APPLIED", variant: "neutral" as const };
    if (status === "PUBLISHED") return { label: "PUBLISHED", variant: "info" as const };
    return null;
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="group relative rounded-[32px] border border-border/40 bg-background/50 backdrop-blur-xl overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-12px_rgba(34,197,94,0.12)] hover:border-primary/20 hover:-translate-y-1">
      {/* Vayva Green Glow Accent */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-[60px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />

      {/* Thumbnail */}
      <div className="relative aspect-[16/10] bg-gradient-to-br from-primary/5 via-background-light/30 to-background flex items-center justify-center overflow-hidden border-b border-border/40">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-20 h-20 rounded-[24px] bg-background dark:bg-zinc-900 shadow-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-110 border border-border/50">
            <Icon name="LayoutTemplate" size={32} className="text-primary/80" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-primary/[0.02] transition-colors" />

        <div className="absolute top-4 right-4 flex gap-2">
          {statusDisplay && <StatusPill status={statusDisplay.label} variant={statusDisplay.variant} />}
          {hasUnpublishedChanges && (
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-600">
              Unpublished
            </span>
          )}
          <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-background/80 backdrop-blur-md border-border/60 text-text-secondary">
            {category}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-6 space-y-4">
        <div className="space-y-1.5">
          <h3 className="font-bold text-lg text-text-primary tracking-tight truncate">
            {name}
          </h3>
          {description && (
            <p className="text-xs leading-relaxed text-text-secondary line-clamp-1 min-h-[16px]">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <Button
            size="lg"
            variant="outline"
            onClick={onPreview}
            className="rounded-2xl h-11 px-6 border-border/60 hover:bg-white/40 hover:border-border flex-1 gap-2 active:scale-95 transition-all"
          >
            <Icon name="Eye" size={16} />
            <span className="font-bold">Preview</span>
          </Button>

          <Button
            size="lg"
            onClick={onApply}
            disabled={isActive || isApplied}
            className={cn(
              "rounded-2xl h-11 px-6 flex-1 gap-2 shadow-lg active:scale-95 transition-all",
              isActive || isApplied
                ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                : "bg-text-primary text-text-inverse hover:bg-zinc-800",
            )}
          >
            <Icon name={isActive || isApplied ? "Check" : "Layers"} size={16} />
            <span className="font-bold">
              {isActive ? "Live" : isApplied ? "Applied" : "Apply"}
            </span>
          </Button>

          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setShowMenu(!showMenu)}
              className="rounded-2xl h-11 w-11 hover:bg-white/40 transition-all active:scale-90"
            >
              <Icon name="MoreVertical" size={18} />
            </Button>

            <AnimatePresence>
              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute right-0 bottom-full mb-2 w-48 bg-background border border-border/60 rounded-[20px] shadow-2xl overflow-hidden z-40 p-1.5 backdrop-blur-xl"
                  >
                    {isMyTemplate && onEdit && (
                      <>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            onEdit();
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-primary hover:bg-primary/5 hover:text-primary h-auto justify-start"
                        >
                          <Icon name="ExternalLink" size={16} />
                          Open in WebStudio
                        </Button>
                        <div className="h-px bg-border/40 mx-2 my-1" />
                      </>
                    )}
                    {onEdit && !isMyTemplate && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onEdit();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-text-secondary hover:bg-white/40 hover:text-text-primary h-auto justify-start"
                      >
                        <Icon name="Pencil" size={16} />
                        Customize
                      </Button>
                    )}
                    {onDuplicate && (
                      <Button
                        variant="ghost"
                        onClick={() => {
                          onDuplicate();
                          setShowMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-text-secondary hover:bg-white/40 hover:text-text-primary h-auto justify-start"
                      >
                        <Icon name="Copy" size={16} />
                        Duplicate
                      </Button>
                    )}
                    {isMyTemplate && onDelete && (
                      <>
                        <div className="h-px bg-border/40 mx-2 my-1" />
                        <Button
                          variant="ghost"
                          onClick={() => {
                            onDelete();
                            setShowMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-bold text-xs text-red-500 hover:text-red-600 hover:bg-red-50 h-auto justify-start"
                        >
                          <Icon name="Trash2" size={16} />
                          Delete
                        </Button>
                      </>
                    )}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
