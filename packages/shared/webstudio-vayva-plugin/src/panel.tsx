"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  COMMERCE_BLOCKS,
  CommerceBlockDef,
  CommerceBlockPropDef,
} from "@vayva/shared";
import { VayvaPluginApi, EditorProduct, EditorCollection } from "./api";
import { generateBlockHtml } from "./blocks";
import {
  Button,
  Icon,
  IconName,
  cn,
  Label,
  Input,
  Select,
  Switch,
} from "@vayva/ui";

interface VayvaPanelProps {
  onInsert: (html: string) => void;
}

export function VayvaPanel({ onInsert }: VayvaPanelProps) {
  const [selectedBlockKey, setSelectedBlockKey] = useState<string | null>(null);
  const [propValues, setPropValues] = useState<Record<string, any>>({});
  const [products, setProducts] = useState<EditorProduct[]>([]);
  const [collections, setCollections] = useState<EditorCollection[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const selectedBlock = useMemo(
    () => COMMERCE_BLOCKS.find((b) => b.key === selectedBlockKey),
    [selectedBlockKey],
  );

  useEffect(() => {
    if (selectedBlockKey) {
      loadEditorData();
    }
  }, [selectedBlockKey]);

  async function loadEditorData() {
    setLoadingData(true);
    try {
      const [p, c] = await Promise.all([
        VayvaPluginApi.getProducts(),
        VayvaPluginApi.getCollections(),
      ]);
      setProducts(p);
      setCollections(c);
    } catch (err) {
      console.error("Failed to load editor data", err);
    } finally {
      setLoadingData(false);
    }
  }

  const handleSelectBlock = (block: CommerceBlockDef) => {
    setSelectedBlockKey(block.key);
    const defaults: Record<string, any> = {};
    block.props.forEach((p) => {
      if (p.defaultValue !== undefined) defaults[p.key] = p.defaultValue;
    });
    setPropValues(defaults);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handlePropChange = (key: string, value: any) => {
    setPropValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleInsert = () => {
    if (!selectedBlockKey) return;
    const html = generateBlockHtml(selectedBlockKey, propValues);
    onInsert(html);
    setSelectedBlockKey(null);
  };

  return (
    <div className="flex flex-col h-full bg-background text-text-primary overflow-hidden">
      <div className="p-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Icon name="Zap" size={18} className="text-white" />
        </div>
        <h2 className="font-bold text-sm tracking-tight">Vayva Commerce</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {!selectedBlockKey ? (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-tertiary px-1">
                Blocks
              </p>
              <div className="grid grid-cols-1 gap-2">
                {COMMERCE_BLOCKS.map((block) => (
                  <Button
                    key={block.key}
                    onClick={() => handleSelectBlock(block)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-border/40 bg-white/30 hover:bg-primary/5 hover:border-primary/20 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <Icon
                        name={(block.icon as IconName) || "Box"}
                        size={16}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{block.name}</p>
                      <p className="text-[10px] text-text-tertiary truncate">
                        {block.description}
                      </p>
                    </div>
                    <Icon
                      name="ChevronRight"
                      size={14}
                      className="text-text-tertiary opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            <Button
              onClick={() => setSelectedBlockKey(null)}
              className="flex items-center gap-2 text-[10px] font-bold text-text-tertiary hover:text-primary transition-colors uppercase tracking-widest"
            >
              <Icon name="ArrowLeft" size={12} />
              Back to blocks
            </Button>

            <div className="space-y-1">
              <h3 className="text-sm font-black tracking-tight">
                {selectedBlock?.name}
              </h3>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                {selectedBlock?.description}
              </p>
            </div>

            <div className="space-y-5 py-2">
              {selectedBlock?.props.map((prop) => (
                <div key={prop.key} className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-text-tertiary">
                    {prop.name}
                  </Label>

                  {prop.key === "collection" ? (
                    <select
                      value={propValues[prop.key] || ""}
                      onChange={(e) =>
                        handlePropChange(prop.key, e.target.value)
                      }
                      className="w-full bg-white/40 border border-border/40 rounded-lg px-3 h-10 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="">Select a collection...</option>
                      {collections.map((c) => (
                        <option key={c.id} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  ) : prop.key === "productId" ? (
                    <select
                      value={propValues[prop.key] || ""}
                      onChange={(e) =>
                        handlePropChange(prop.key, e.target.value)
                      }
                      className="w-full bg-white/40 border border-border/40 rounded-lg px-3 h-10 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      <option value="">Select a product...</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  ) : prop.type === "select" ? (
                    <select
                      value={propValues[prop.key] || ""}
                      onChange={(e) =>
                        handlePropChange(prop.key, e.target.value)
                      }
                      className="w-full bg-white/40 border border-border/40 rounded-lg px-3 h-10 text-xs font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    >
                      {prop.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : prop.type === "number" ? (
                    <Input
                      type="number"
                      value={propValues[prop.key] || ""}
                      onChange={(e) =>
                        handlePropChange(prop.key, parseInt(e.target.value))
                      }
                      className="h-10 text-xs"
                    />
                  ) : prop.type === "boolean" ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white/30 border border-border/40">
                      <span className="text-xs font-medium">{prop.name}</span>
                      <Switch
                        checked={propValues[prop.key] || false}
                        onCheckedChange={(checked) =>
                          handlePropChange(prop.key, checked)
                        }
                      />
                    </div>
                  ) : (
                    <Input
                      type="text"
                      value={propValues[prop.key] || ""}
                      onChange={(e) =>
                        handlePropChange(prop.key, e.target.value)
                      }
                      className="h-10 text-xs"
                    />
                  )}
                </div>
              ))}
            </div>

            <Button
              onClick={handleInsert}
              className="w-full h-12 bg-primary text-white rounded-xl font-bold text-xs shadow-lg shadow-primary/20 hover:bg-primary-hover active:scale-95 transition-all gap-2"
            >
              <Icon name="Plus" size={16} />
              Insert into Canvas
            </Button>
          </div>
        )}
      </div>

      <div className="p-4 bg-white/20 border-t border-border mt-auto">
        <p className="text-[9px] text-text-tertiary text-center leading-relaxed">
          Commerce blocks use real-time data from your Vayva store. Preview or
          Publish to see them in action.
        </p>
      </div>
    </div>
  );
}
