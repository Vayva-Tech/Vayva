"use client";

import React from "react";
import { Button, Icon, cn } from "@vayva/ui";
import { StatusPill } from "./StatusPill";
import { motion } from "framer-motion";

interface SiteCardProps {
  name: string;
  domain: string;
  thumbnailUrl?: string;
  templateName?: string;
  status: "DRAFT" | "PUBLISHED" | "MODIFIED";
  lastPublishedAt?: string;
  onEdit: () => void;
  onPreview: () => void;
  onPublish: () => void;
  onMoreActions: () => void;
}

export function SiteCard({
  name,
  domain,
  thumbnailUrl,
  templateName,
  status,
  lastPublishedAt,
  onEdit,
  onPreview,
  onPublish,
  onMoreActions,
}: SiteCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="group relative rounded-[32px] border border-border/40 bg-background/50 backdrop-blur-xl shadow-card overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_-12px_rgba(34,197,94,0.15)] hover:border-primary/20"
    >
      {/* Vayva Green Glow Accent */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/10 transition-colors duration-500" />

      <div className="flex flex-col lg:flex-row">
        {/* Thumbnail / Hero */}
        <div className="relative w-full lg:w-[320px] aspect-[16/10] lg:aspect-auto bg-gradient-to-br from-primary/5 via-background-light/30 to-background flex items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-border/40">
          <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          </div>

          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={name}
              className="h-24 w-24 rounded-[28px] object-cover shadow-2xl transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-24 w-24 rounded-[28px] bg-background dark:bg-zinc-900 shadow-xl flex items-center justify-center transition-transform duration-500 group-hover:scale-105 border border-border/50">
              <Icon name="Globe" size={40} className="text-primary/80" />
            </div>
          )}
        </div>

        {/* Info & Actions */}
        <div className="flex-1 p-8 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-6">
              <div className="space-y-1.5 min-w-0">
                <h2 className="text-2xl font-black text-text-primary tracking-tight truncate">
                  {name}
                </h2>
                <a
                  href={`https://${domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-text-secondary flex items-center gap-2 hover:text-primary transition-colors cursor-pointer group/link w-fit"
                >
                  <Icon
                    name="Globe"
                    size={16}
                    className="text-text-tertiary group-hover/link:text-primary transition-colors"
                  />
                  <span className="underline underline-offset-4 decoration-border group-hover/link:decoration-primary/50 truncate">
                    {domain}
                  </span>
                  <Icon
                    name="ExternalLink"
                    size={12}
                    className="opacity-0 group-hover/link:opacity-100 transition-opacity"
                  />
                </a>
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                <StatusPill status={status} />
                {templateName && (
                  <span className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                    Template:{" "}
                    <span className="text-text-secondary">{templateName}</span>
                  </span>
                )}
              </div>
            </div>

            {lastPublishedAt && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-text-tertiary uppercase tracking-widest">
                <Icon name="Clock" size={12} />
                Last published {lastPublishedAt}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Button
              onClick={onEdit}
              className="rounded-2xl h-12 px-8 gap-3 bg-text-primary text-text-inverse hover:bg-zinc-800 transition-all shadow-xl hover:shadow-primary/10 active:scale-95"
            >
              <Icon name="Pencil" size={18} />
              <span className="font-bold">Edit Site</span>
            </Button>

            <Button
              variant="outline"
              onClick={onPreview}
              className="rounded-2xl h-12 px-6 gap-2 border-border/60 hover:bg-white/40 hover:border-border transition-all active:scale-95"
            >
              <Icon name="Eye" size={18} />
              <span className="font-bold">Preview</span>
            </Button>

            <Button
              variant="outline"
              onClick={onPublish}
              className={cn(
                "rounded-2xl h-12 px-6 gap-2 transition-all active:scale-95",
                status === "MODIFIED"
                  ? "border-primary/40 text-primary hover:bg-primary/5 hover:border-primary/60 shadow-lg shadow-primary/5"
                  : "border-border/60 hover:bg-white/40",
              )}
            >
              <Icon name="Upload" size={18} />
              <span className="font-bold">Publish</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={onMoreActions}
              className="rounded-2xl h-12 w-12 hover:bg-white/40 transition-all active:scale-90 ml-auto lg:ml-0"
            >
              <Icon name="MoreHorizontal" size={20} />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
