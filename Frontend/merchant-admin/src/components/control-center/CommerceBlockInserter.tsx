/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useMemo } from "react";
import { Button, Icon, IconName, Input, Select, cn } from "@vayva/ui";
import {
  COMMERCE_BLOCKS,
  CommerceBlockDef,
  CommerceBlockPropDef,
} from "@vayva/shared";
import { toast } from "sonner";

export function CommerceBlockInserter() {
  const [selectedBlockKey, setSelectedBlockKey] = useState<string | null>(null);
  const [propValues, setPropValues] = useState<Record<string, any>>({});

  const selectedBlock = useMemo(
    () => COMMERCE_BLOCKS.find((b) => b.key === selectedBlockKey),
    [selectedBlockKey],
  );

  const handleSelectBlock = (block: CommerceBlockDef) => {
    setSelectedBlockKey(block.key);
    // Initialize default values
    const defaults: Record<string, any> = {};
    block.props.forEach((p) => {
      if (p.defaultValue !== undefined) defaults[p.key] = p.defaultValue;
    });
    setPropValues(defaults);
  };

    const handlePropChange = (key: string, value: any) => {
    setPropValues((prev) => ({ ...prev, [key]: value }));
  };

  const generatedSnippet = useMemo(() => {
    if (!selectedBlock) return "";
    let snippet = `<div data-vayva-block="${selectedBlock.key}"`;

    Object.entries(propValues).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        snippet += ` data-${key}="${val}"`;
      }
    });

    snippet += `></div>`;
    return snippet;
  }, [selectedBlock, propValues]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedSnippet);
    toast.success("Snippet copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {COMMERCE_BLOCKS.map((block) => (
          <Button
            key={block.key}
            variant="ghost"
            onClick={() => handleSelectBlock(block)}
            className={cn(
              "flex flex-col items-start p-5 rounded-[24px] border transition-all text-left group h-auto",
              selectedBlockKey === block.key
                ? "bg-primary/5 border-primary shadow-sm"
                : "bg-background/50 border-border/40 hover:border-primary/20 hover:bg-background dark:hover:bg-zinc-900",
            )}
          >
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors",
                selectedBlockKey === block.key
                  ? "bg-primary text-white"
                  : "bg-primary/10 text-primary group-hover:bg-primary/20",
              )}
            >
              <Icon name={(block.icon as IconName) || "Box"} size={20} />
            </div>
            <p className="text-sm font-bold text-text-primary mb-1">
              {block.name}
            </p>
            <p className="text-[11px] text-text-tertiary leading-tight">
              {block.description}
            </p>
          </Button>
        ))}
      </div>

      {selectedBlock && (
        <div className="p-8 rounded-[32px] border border-border/40 bg-background/50 backdrop-blur-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-text-primary">
                Configure {selectedBlock.name}
              </h3>
              <p className="text-xs text-text-secondary">
                Adjust settings and copy the snippet below into Webstudio.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedBlockKey(null)}
              className="rounded-xl"
            >
              <Icon name="X" size={16} />
            </Button>
          </div>

          {selectedBlock.props.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {selectedBlock.props.map((prop) => (
                <div key={prop.key} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary px-1">
                    {prop.name}
                  </label>

                  {prop.type === "select" ? (
                    <Select
                      value={propValues[prop.key] || ""}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handlePropChange(prop.key, e.target.value)
                      }
                      className="w-full bg-white/30 border border-border/40 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      {prop.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </Select>
                  ) : prop.type === "number" ? (
                    <Input type="number"
                      value={propValues[prop.key] || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handlePropChange(prop.key, parseInt(e.target.value))
                      }
                      placeholder={prop.description}
                      className="w-full bg-white/30 border border-border/40 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  ) : (
                    <Input type="text"
                      value={propValues[prop.key] || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        handlePropChange(prop.key, e.target.value)
                      }
                      placeholder={prop.description}
                      className="w-full bg-white/30 border border-border/40 rounded-xl px-4 h-11 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary italic">
              No configuration needed for this block.
            </p>
          )}

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                Embed Snippet
              </label>
              <Button
                variant="link"
                onClick={copyToClipboard}
                className="text-[10px] font-bold text-primary flex items-center gap-1 h-auto p-0"
              >
                <Icon name="Copy" size={12} />
                Copy Snippet
              </Button>
            </div>

            <div className="relative group">
              <pre className="p-6 bg-zinc-900 text-zinc-100 rounded-2xl overflow-x-auto text-xs font-mono border border-white/5 shadow-inner">
                <code>{generatedSnippet}</code>
              </pre>
              <Button
                size="sm"
                onClick={copyToClipboard}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl bg-background/10 hover:bg-background/20 text-white border-none backdrop-blur-md"
              >
                <Icon name="Copy" size={14} className="mr-2" />
                Copy
              </Button>
            </div>

            <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3">
              <Icon
                name="Info"
                size={16}
                className="text-blue-500 shrink-0 mt-0.5"
              />
              <p className="text-[11px] leading-relaxed text-blue-700/80 font-medium">
                Paste this snippet into a <strong>Custom HTML</strong> or{" "}
                <strong>Embed</strong> element in Webstudio. Vayva will
                automatically replace it with the real commerce component on
                your live site.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
