"use client";

import React, { useState, useEffect } from "react";
import { Button, Icon, Input, Select } from "@vayva/ui";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, DropResult, DroppableProvided, DraggableProvided } from "@hello-pangea/dnd";
import { ProductShowcaseEditor } from "./ProductShowcaseEditor";

import { Template, ThemeConfig, ThemeSection } from "@/types/templates";
import { FileUpload } from "@/components/ui/FileUpload";

interface SchemaField {
  id: string;
  label: string;
  type: "color" | "text" | "number" | "image" | "font";
  default?: string | number;
  placeholder?: string;
}

interface ThemeCustomizerProps {
  draft: {
    template: Template | null;
    themeConfig: ThemeConfig;
  };
  onUpdate: (data: ThemeConfig) => void;
  onReset: () => void;
}

/**
 * ThemeCustomizer
 * Renders a form to edit theme settings and a reorderable list of sections.
 */
export const ThemeCustomizer = ({
  draft,
  onUpdate,
  onReset,
}: ThemeCustomizerProps) => {
  const [config, setConfig] = useState<ThemeConfig>(draft.themeConfig || {});
  const [activeTab, setActiveTab] = useState<
    "settings" | "sections" | "products"
  >("settings");
  const template = draft.template;

  // Default sections if none exist
  const [sections, setSections] = useState<ThemeSection[]>(
    config.sections || [
      { id: "hero", label: "Hero Banner", enabled: true },
      { id: "featured", label: "Featured Products", enabled: true },
      { id: "categories", label: "Category Grid", enabled: true },
      { id: "newsletter", label: "Newsletters", enabled: true },
      { id: "footer", label: "Footer", enabled: true },
    ],
  );

  // Derived schema - in a real app this comes from the TemplateManifest
  const schema: SchemaField[] = (template?.configSchema
    ?.settings as SchemaField[]) || [
    {
      id: "primaryColor",
      label: "Primary Color",
      type: "color",
      default: "#000000",
    },
    {
      id: "backgroundColor",
      label: "Background",
      type: "color",
      default: "#ffffff",
    },
    { id: "fontFamily", label: "Typography", type: "font", default: "Inter" },
    { id: "logoWidth", label: "Logo Width (px)", type: "number", default: 120 },
    {
      id: "announcementText",
      label: "Announcement Bar",
      type: "text",
      default: "",
    },
  ];

  const handleChange = (id: string, value: any) => {
    const newConfig = { ...config, [id]: value };
    setConfig(newConfig);
    onUpdate(newConfig);
  };

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = Array.from(sections);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setSections(items);
    handleChange("sections", items);
  };

  return (
    <div className="w-80 border-r border-border h-full overflow-y-auto bg-background flex flex-col">
      <div className="p-4 border-b border-border/40 flex items-center justify-between">
        <div className="flex bg-white/40 p-1 rounded-lg">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("settings")}
            className={`text-[10px] uppercase font-bold px-2 ${activeTab === "settings" ? "bg-background shadow-sm" : "text-text-tertiary"}`}
          >
            Theme
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("sections")}
            className={`text-[10px] uppercase font-bold px-2 ${activeTab === "sections" ? "bg-background shadow-sm" : "text-text-tertiary"}`}
          >
            Layout
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setActiveTab("products")}
            className={`text-[10px] uppercase font-bold px-2 ${activeTab === "products" ? "bg-background shadow-sm" : "text-text-tertiary"}`}
          >
            Products
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="h-auto p-1 text-text-tertiary"
        >
          <Icon name="RefreshCcw" size={14} />
        </Button>
      </div>

      <div className="p-6 space-y-8 flex-1">
        {activeTab === "settings" ? (
          schema.map((field) => (
            <div key={field.id} className="space-y-2">
              <label className="text-xs font-bold text-text-secondary block">
                {field.label}
              </label>

              {field.type === "color" && (
                <div className="flex items-center gap-3">
                  <Input type="color"
                    value={String(config[field.id] ?? field.default ?? "")}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange(field.id, e.target.value)
                    }
                    className="w-10 h-10 rounded-lg cursor-pointer border-none p-0"
                    title={field.label}
                  />
                  <span className="text-xs font-mono text-text-tertiary uppercase">
                    {String(config[field.id] ?? field.default ?? "")}
                  </span>
                </div>
              )}

              {field.type === "text" && (
                <Input type="text"
                  value={(config[field.id] as string) || ""}
                  placeholder={field.placeholder || "Enter text..."}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(field.id, e.target.value)
                  }
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-black outline-none"
                  title={field.label}
                />
              )}

              {field.type === "number" && (
                <Input type="number"
                  value={(config[field.id] as string) || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange(field.id, e.target.value)
                  }
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-black outline-none"
                  title={field.label}
                  placeholder="0"
                />
              )}

              {field.type === "font" && (
                <Select
                  value={String(config[field.id] ?? field.default ?? "")}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleChange(field.id, e.target.value)
                  }
                  className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:ring-1 focus:ring-black outline-none bg-background"
                  title={field.label}
                >
                  <option value="Inter">Inter (Sans)</option>
                  <option value="Playfair Display">Playfair (Serif)</option>
                  <option value="Montserrat">Montserrat (Geometric)</option>
                  <option value="Roboto Mono">Roboto Mono (Mono)</option>
                </Select>
              )}

              {field.type === "image" && (
                <FileUpload
                  value={(config[field.id] as string) || ""}
                  onChange={(url: unknown) => handleChange(field.id, url)}
                  purpose={field.id === "heroImage" ? "THEME_HERO" : "THEME_BACKGROUND"}
                  accept="image/jpeg,image/png,image/webp"
                  maxSizeMB={field.id === "heroImage" ? 10 : 5}
                  label={`Upload ${field.label}`}
                />
              )}
            </div>
          ))
        ) : activeTab === "sections" ? (
          <div className="space-y-4">
            <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">
              Homepage Layout
            </p>
            <DragDropContext onDragEnd={onDragEnd}>
              <Droppable droppableId="sections">
                {(provided: DroppableProvided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-2"
                  >
                    {sections.map((section: any, index: number) => (
                      <Draggable
                        key={section.id}
                        draggableId={section.id}
                        index={index}
                      >
                        {(provided: DraggableProvided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-background border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm hover:border-black transition-colors"
                          >
                            <Icon
                              name="GripVertical"
                              size={14}
                              className="text-text-tertiary"
                            />
                            <span className="text-xs font-medium">
                              {section.label}
                            </span>
                            <Input type="checkbox"
                              checked={section.enabled}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const newSections = [...sections];
                                newSections[index].enabled = e.target.checked;
                                setSections(newSections);
                                handleChange("sections", newSections);
                              }}
                              className="ml-auto"
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
            <Button variant="outline" size="sm" className="w-full text-[10px]">
              <Icon name="Plus" size={12} className="mr-1" /> Add Section
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-[10px] text-text-tertiary uppercase font-bold tracking-widest">
              Featured Products
            </p>
            <ProductShowcaseEditor
              onConfigChange={(showcaseConfig) => {
                handleChange("showcaseConfig", showcaseConfig);
              }}
            />
          </div>
        )}
      </div>

      <div className="p-4 border-t border-border/40 bg-white/40">
        <p className="text-[10px] text-text-tertiary leading-tight">
          {activeTab === "sections"
            ? "Drag sections to reorder how they appear on your homepage."
            : activeTab === "products"
              ? "Choose which products to showcase on your storefront."
              : "Tip: Changes are saved to draft automatically and visible in the preview window."}
        </p>
      </div>
    </div>
  );
};
