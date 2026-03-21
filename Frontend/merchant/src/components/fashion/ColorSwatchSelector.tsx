"use client";

import { useState } from "react";
import { Button, Input, Label } from "@vayva/ui";
import { Plus, Trash, Check, Palette, X } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";

export interface ColorSwatch {
  id: string;
  name: string;
  hex: string;
  imageUrl?: string;
}

interface ColorSwatchSelectorProps {
  value: ColorSwatch[];
  onChange: (swatches: ColorSwatch[]) => void;
  allowImages?: boolean;
}

const PRESET_COLORS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Navy", hex: "#1e3a5f" },
  { name: "Red", hex: "#dc2626" },
  { name: "Green", hex: "#16a34a" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Yellow", hex: "#facc15" },
  { name: "Purple", hex: "#9333ea" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Orange", hex: "#f97316" },
  { name: "Gray", hex: "#6b7280" },
  { name: "Beige", hex: "#d4c4b0" },
];

export function ColorSwatchSelector({
  value,
  onChange,
}: ColorSwatchSelectorProps) {
  const [newColorName, setNewColorName] = useState("");
  const [newColorHex, setNewColorHex] = useState("#000000");

  const addSwatch = (swatch?: Partial<ColorSwatch>) => {
    const name = swatch?.name || newColorName;
    const hex = swatch?.hex || newColorHex;

    if (!name.trim()) {
      toast.error("Color name is required");
      return;
    }

    const newSwatch: ColorSwatch = {
      id: crypto.randomUUID(),
      name: name.trim(),
      hex: hex,
      imageUrl: swatch?.imageUrl,
    };

    onChange([...value, newSwatch]);
    setNewColorName("");
    setNewColorHex("#000000");
  };

  const removeSwatch = (id: string) => {
    onChange(value.filter((s) => s.id !== id));
  };

  const updateSwatch = (id: string, updates: Partial<ColorSwatch>) => {
    onChange(
      value.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-gray-500" />
        <h3 className="font-semibold text-gray-900">Color Options</h3>
      </div>

      {/* Selected Colors */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((swatch) => (
            <div
              key={swatch.id}
              className="group flex items-center gap-2 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-100"
            >
              {swatch.imageUrl ? (
                <img
                  src={swatch.imageUrl}
                  alt={swatch.name}
                  className="w-6 h-6 rounded object-cover border border-gray-100"
                />
              ) : (
                <div
                  className="w-6 h-6 rounded border border-gray-100 shadow-sm"
                  style={{ backgroundColor: swatch.hex }}
                />
              )}
              <Input
                value={swatch.name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  updateSwatch(swatch.id, { name: e.target.value })
                }
                className="w-24 h-6 text-sm border-0 bg-transparent p-0 focus-visible:ring-0"
              />
              <Input type="color"
                value={swatch.hex}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSwatch(swatch.id, { hex: e.target.value })}
                className="w-6 h-6 p-0 border-0 rounded cursor-pointer"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeSwatch(swatch.id)}
                className="h-5 w-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Presets */}
      <div className="space-y-2">
        <Label className="text-xs text-gray-400">Quick Add Presets</Label>
        <div className="flex flex-wrap gap-2">
          {PRESET_COLORS.map((color) => (
            <Button
              key={color.name}
              onClick={() => addSwatch(color)}
              disabled={value.some(
                (s) => s.name.toLowerCase() === color.name.toLowerCase(),
              )}
              className="flex items-center gap-1.5 px-2 py-1 rounded border border-gray-100 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={color.name}
            >
              <div
                className="w-4 h-4 rounded border border-gray-100"
                style={{ backgroundColor: color.hex }}
              />
              <span className="text-xs text-gray-500">{color.name}</span>
              {value.some(
                (s) => s.name.toLowerCase() === color.name.toLowerCase(),
              ) && <Check className="h-3 w-3 text-green-500" />}
            </Button>
          ))}
        </div>
      </div>

      {/* Custom Color */}
      <div className="flex items-center gap-2">
        <Input
          value={newColorName}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewColorName(e.target.value)}
          placeholder="Custom color name..."
          className="flex-1 h-9 text-sm"
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && (e.preventDefault(), addSwatch())}
        />
        <Input type="color"
          value={newColorHex}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewColorHex(e.target.value)}
          className="w-9 h-9 p-0 border rounded cursor-pointer"
        />
        <Button size="sm" variant="outline" onClick={() => addSwatch()} className="h-9 px-3">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Tip */}
      <p className="text-xs text-gray-400">
        Tip: Click on the color swatch to change the hex value. Customers will see these colors when selecting variants.
      </p>
    </div>
  );
}
