"use client";

import { useState, useRef } from "react";
import { Button, Input, Label, Select } from "@vayva/ui";
import { Plus, Trash, ArrowsOutCardinal as Move, Circle, Square, Rectangle as RectangleHorizontal } from "@phosphor-icons/react/ssr";
import { toast } from "sonner";

export interface TableItem {
  id: string;
  name: string;
  type: "round" | "square" | "rectangle" | "booth" | "bar";
  capacity: number;
  x: number;
  y: number;
  width: number;
  height: number;
  minSpend?: number;
  isVip?: boolean;
  status: "available" | "occupied" | "reserved" | "maintenance";
}

export interface FloorPlan {
  id: string;
  name: string;
  width: number;
  height: number;
  tables: TableItem[];
}

interface FloorPlanBuilderProps {
  value: FloorPlan;
  onChange: (plan: FloorPlan) => void;
}

const TABLE_TYPES = [
  { value: "round", label: "Round", icon: Circle },
  { value: "square", label: "Square", icon: Square },
  { value: "rectangle", label: "Rectangle", icon: RectangleHorizontal },
  { value: "booth", label: "Booth", icon: RectangleHorizontal },
  { value: "bar", label: "Bar Seat", icon: RectangleHorizontal },
] as const;

export function FloorPlanBuilder({ value, onChange }: FloorPlanBuilderProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const selectedTable = value.tables.find((t) => t.id === selectedTableId);

  const addTable = () => {
    const newTable: TableItem = {
      id: crypto.randomUUID(),
      name: `Table ${value.tables.length + 1}`,
      type: "round",
      capacity: 4,
      x: 50,
      y: 50,
      width: 60,
      height: 60,
      status: "available",
    };
    onChange({ ...value, tables: [...value.tables, newTable] });
    setSelectedTableId(newTable.id);
  };

  const removeTable = (id: string) => {
    onChange({
      ...value,
      tables: value.tables.filter((t) => t.id !== id),
    });
    if (selectedTableId === id) setSelectedTableId(null);
  };

  const updateTable = (id: string, updates: Partial<TableItem>) => {
    onChange({
      ...value,
      tables: value.tables.map((t) =>
        t.id === id ? { ...t, ...updates } : t,
      ),
    });
  };

  const handleMouseDown = (
    e: React.MouseEvent,
    tableId: string,
  ) => {
    e.stopPropagation();
    setSelectedTableId(tableId);
    const table = value.tables.find((t) => t.id === tableId);
    if (!table) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left - table.x,
      y: e.clientY - rect.top - table.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedTableId) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left - dragOffset.x;
    const y = e.clientY - rect.top - dragOffset.y;

    updateTable(selectedTableId, {
      x: Math.max(0, Math.min(x, value.width - (selectedTable?.width || 0))),
      y: Math.max(0, Math.min(y, value.height - (selectedTable?.height || 0))),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getStatusColor = (status: TableItem["status"]) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "occupied":
        return "bg-red-500";
      case "reserved":
        return "bg-yellow-500";
      case "maintenance":
        return "bg-gray-400";
      default:
        return "bg-green-500";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Move className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Floor Plan</h3>
        </div>
        <div className="flex items-center gap-2">
          <Input
            value={value.name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onChange({ ...value, name: e.target.value })
            }
            placeholder="Floor plan name"
            className="w-40 h-8 text-sm"
          />
          <Button size="sm" variant="outline" onClick={addTable}>
            <Plus className="h-4 w-4 mr-1" />
            Add Table
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="relative bg-gray-100 rounded-lg border-2 border-gray-100 overflow-hidden"
          style={{ width: value.width, height: value.height, minWidth: 400, minHeight: 300 }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelectedTableId(null)}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />

          {/* Tables */}
          {value.tables.map((table) => (
            <div
              key={table.id}
              className={`absolute cursor-move select-none transition-shadow ${
                selectedTableId === table.id
                  ? "ring-2 ring-green-500 ring-offset-2 z-10"
                  : "hover:ring-1 hover:ring-green-500/50"
              }`}
              style={{
                left: table.x,
                top: table.y,
                width: table.width,
                height: table.height,
              }}
              onMouseDown={(e) => handleMouseDown(e, table.id)}
            >
              <div
                className={`w-full h-full ${getStatusColor(table.status)} ${
                  table.type === "round" ? "rounded-full" : "rounded-lg"
                } ${table.isVip ? "border-2 border-yellow-400" : ""} flex flex-col items-center justify-center text-white shadow-md`}
              >
                <span className="text-xs font-medium truncate max-w-full px-1">
                  {table.name}
                </span>
                <span className="text-[10px] opacity-90">{table.capacity} seats</span>
              </div>
            </div>
          ))}
        </div>

        {/* Properties Panel */}
        <div className="w-64 space-y-4">
          {selectedTable ? (
            <>
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm">Table Properties</h4>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeTable(selectedTable.id)}
                  className="h-8 w-8 p-0 text-red-500"
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={selectedTable.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateTable(selectedTable.id, { name: e.target.value })
                    }
                    className="h-8 text-sm mt-1"
                  />
                </div>

                <div>
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={selectedTable.type}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateTable(selectedTable.id, {
                        type: e.target.value as TableItem["type"],
                      })
                    }
                    className="w-full h-8 mt-1 px-2 border border-gray-100 rounded text-sm bg-white"
                  >
                    {TABLE_TYPES.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Capacity</Label>
                    <Input
                      type="number"
                      value={selectedTable.capacity}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateTable(selectedTable.id, {
                          capacity: parseInt(e.target.value) || 1,
                        })
                      }
                      className="h-8 text-sm mt-1"
                      min={1}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Min. Spend (₦)</Label>
                    <Input
                      type="number"
                      value={selectedTable.minSpend || ""}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        updateTable(selectedTable.id, {
                          minSpend: parseInt(e.target.value) || undefined,
                        })
                      }
                      className="h-8 text-sm mt-1"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Status</Label>
                  <Select
                    value={selectedTable.status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      updateTable(selectedTable.id, {
                        status: e.target.value as TableItem["status"],
                      })
                    }
                    className="w-full h-8 mt-1 px-2 border border-gray-100 rounded text-sm bg-white"
                  >
                    <option value="available">Available</option>
                    <option value="occupied">Occupied</option>
                    <option value="reserved">Reserved</option>
                    <option value="maintenance">Maintenance</option>
                  </Select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <Input type="checkbox"
                    id="isVip"
                    checked={selectedTable.isVip || false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      updateTable(selectedTable.id, { isVip: e.target.checked })
                    }
                    className="rounded border-gray-100"
                  />
                  <Label htmlFor="isVip" className="text-sm cursor-pointer">
                    VIP Table
                  </Label>
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-400">
              Select a table on the floor plan to edit its properties.
            </p>
          )}

          {/* Legend */}
          <div className="pt-4 border-t border-gray-100 space-y-2">
            <h4 className="text-xs font-medium text-gray-500">Status Legend</h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <span>Reserved</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span>Maintenance</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
