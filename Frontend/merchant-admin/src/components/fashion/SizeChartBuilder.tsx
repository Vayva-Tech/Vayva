"use client";

import { useState } from "react";
import { Button, Input } from "@vayva/ui";
import { Plus, Trash, Ruler } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";

export interface SizeChartRow {
  size: string;
  chest?: string;
  waist?: string;
  hips?: string;
  length?: string;
  shoulder?: string;
  sleeve?: string;
  [key: string]: string | undefined;
}

interface SizeChartBuilderProps {
  value: SizeChartRow[];
  onChange: (rows: SizeChartRow[]) => void;
}

const DEFAULT_MEASUREMENTS = ["chest", "waist", "hips", "length", "shoulder", "sleeve"];

export function SizeChartBuilder({ value, onChange }: SizeChartBuilderProps) {
  const [measurements, setMeasurements] = useState<string[]>(DEFAULT_MEASUREMENTS);
  const [newMeasurement, setNewMeasurement] = useState("");

  const addRow = () => {
    const newRow: SizeChartRow = { size: "" };
    measurements.forEach((m) => {
      newRow[m] = "";
    });
    onChange([...value, newRow]);
  };

  const removeRow = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  const updateRow = (index: number, field: string, value_: string) => {
    const newRows = [...value];
    newRows[index] = { ...newRows[index], [field]: value_ };
    onChange(newRows);
  };

  const addMeasurement = () => {
    if (!newMeasurement.trim()) return;
    const key = newMeasurement.toLowerCase().replace(/\s+/g, "_");
    if (measurements.includes(key)) {
      toast.error("Measurement already exists");
      return;
    }
    setMeasurements([...measurements, key]);
    // Add empty value for this measurement to all rows
    onChange(
      value.map((row: SizeChartRow) => ({ ...row, [key]: "" }) as SizeChartRow),
    );
    setNewMeasurement("");
  };

  const removeMeasurement = (measurement: string) => {
    setMeasurements(measurements.filter((m) => m !== measurement));
    onChange(
      value.map((row: SizeChartRow) => {
        const { [measurement]: _, ...rest } = row;
        return rest as SizeChartRow;
      }),
    );
  };

  const formatLabel = (key: string) => {
    return key
      .split("_")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Ruler className="h-5 w-5 text-text-secondary" />
        <h3 className="font-semibold text-text-primary">Size Chart</h3>
      </div>

      {/* Measurement Types */}
      <div className="flex flex-wrap gap-2">
        {measurements.map((m) => (
          <div
            key={m}
            className="flex items-center gap-1 px-2 py-1 bg-background/50 rounded border border-border/40 text-sm"
          >
            <span>{formatLabel(m)}</span>
            <Button
              onClick={() => removeMeasurement(m)}
              className="text-text-tertiary hover:text-red-500"
              type="button"
            >
              <Trash className="h-3 w-3" />
            </Button>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <Input
            value={newMeasurement}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMeasurement(e.target.value)}
            placeholder="Add measurement..."
            className="w-32 h-8 text-sm"
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === "Enter" && (e.preventDefault(), addMeasurement())}
          />
          <Button size="sm" variant="outline" onClick={addMeasurement} className="h-8 px-2">
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Size Chart Table */}
      {value.length > 0 ? (
        <div className="border border-border/40 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-background/50 border-b border-border/40">
              <tr>
                <th className="p-2 text-left font-medium text-text-secondary">Size</th>
                {measurements.map((m) => (
                  <th key={m} className="p-2 text-left font-medium text-text-secondary">
                    {formatLabel(m)} (in/cm)
                  </th>
                ))}
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {value.map((row, idx) => (
                <tr key={idx}>
                  <td className="p-2">
                    <Input
                      value={row.size}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateRow(idx, "size", e.target.value)
                      }
                      placeholder="S, M, L..."
                      className="h-8 text-sm"
                    />
                  </td>
                  {measurements.map((m) => (
                    <td key={m} className="p-2">
                      <Input
                        value={row[m] || ""}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updateRow(idx, m, e.target.value)
                        }
                        placeholder="-"
                        className="h-8 text-sm"
                      />
                    </td>
                  ))}
                  <td className="p-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeRow(idx)}
                      className="h-8 w-8 p-0 text-text-tertiary hover:text-red-500"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-text-tertiary italic">
          No sizes added. Click "Add Size" to start building your size chart.
        </p>
      )}

      <Button variant="outline" onClick={addRow} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add Size
      </Button>

      {/* Unit Note */}
      <p className="text-xs text-text-tertiary">
        Tip: Specify units in product description (e.g., "All measurements in inches" or "cm").
      </p>
    </div>
  );
}
