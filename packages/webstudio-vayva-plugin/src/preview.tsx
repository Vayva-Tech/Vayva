"use client";

import React from "react";
import { Icon, IconName } from "@vayva/ui";
import { getBlockByKey } from "./blocks";

interface BlockPlaceholderProps {
  blockKey: string;
  props: Record<string, any>;
}

/**
 * Level A Editor Preview: Placeholder cards inside Webstudio canvas.
 * This component is rendered by Webstudio inside the editor to give 
 * the merchant a visual hint of the commerce block.
 */
export function BlockPlaceholder({ blockKey, props }: BlockPlaceholderProps) {
  const block = getBlockByKey(blockKey);

  return (
    <div className="w-full p-8 border-2 border-dashed border-primary/30 bg-primary/5 rounded-[32px] flex flex-col items-center text-center gap-4 group hover:border-primary/50 transition-all">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-sm">
        <Icon name={(block?.icon as IconName) || "Box"} size={32} />
      </div>
      
      <div className="space-y-1">
        <h3 className="font-black text-lg text-text-primary tracking-tight">
          Vayva {block?.name || blockKey}
        </h3>
        <p className="text-[11px] font-bold text-text-tertiary uppercase tracking-widest">
          Commerce Block Placeholder
        </p>
      </div>

      {Object.keys(props).length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {Object.entries(props).map(([key, val]) => (
            <div 
              key={key} 
              className="px-3 py-1 rounded-full bg-white border border-border/40 text-[10px] font-bold text-text-secondary shadow-sm"
            >
              <span className="text-text-tertiary opacity-60 uppercase mr-1">{key}:</span>
              {String(val)}
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 p-3 rounded-2xl bg-white/50 border border-primary/10 flex items-center gap-2">
        <Icon name="Info" size={14} className="text-primary" />
        <p className="text-[10px] font-medium text-text-secondary leading-tight">
          This block will render real products from your Vayva store on the live site.
        </p>
      </div>
    </div>
  );
}
