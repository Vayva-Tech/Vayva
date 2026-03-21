// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { DndContext, DragEndEvent, closestCorners } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { GripVertical, X, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface WidgetConfig {
  id: string;
  title: string;
  visible: boolean;
  size: 'small' | 'medium' | 'large';
  component: React.ComponentType<any>;
  props?: any;
}

interface DraggableWidgetProps {
  widget: WidgetConfig;
  onRemove: (id: string) => void;
  onSettings: (id: string) => void;
}

function DraggableWidget({ widget, onRemove, onSettings }: DraggableWidgetProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: widget.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative group bg-white border rounded-lg shadow-sm hover:shadow-md transition-all"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing z-10"
      >
        <GripVertical className="h-5 w-5 text-gray-500" />
      </div>

      {/* Widget Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <h3 className="font-semibold text-sm">{widget.title}</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onSettings(widget.id)}
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => onRemove(widget.id)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Widget Content */}
      <div className="p-4">
        <widget.component {...widget.props} />
      </div>
    </div>
  );
}

interface DashboardCustomizerProps {
  availableWidgets: Omit<WidgetConfig, 'visible'>[];
  onSave?: (layout: WidgetConfig[]) => void;
  className?: string;
}

export function DashboardCustomizer({ 
  availableWidgets, 
  onSave,
  className 
}: DashboardCustomizerProps) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(
    availableWidgets.map(w => ({ ...w, visible: true }))
  );
  const [isCustomizing, setIsCustomizing] = useState(false);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setWidgets((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const toggleWidget = (id: string, visible: boolean) => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, visible } : w
    ));
  };

  const updateWidgetSize = (id: string, size: 'small' | 'medium' | 'large') => {
    setWidgets(prev => prev.map(w => 
      w.id === id ? { ...w, size } : w
    ));
  };

  const removeWidget = (id: string) => {
    setWidgets(prev => prev.filter(w => w.id !== id));
  };

  const addWidget = (widget: Omit<WidgetConfig, 'visible'>) => {
    setWidgets(prev => [...prev, { ...widget, visible: true }]);
  };

  const saveLayout = () => {
    onSave?.(widgets);
    // Save to localStorage
    localStorage.setItem('retail-dashboard-layout', JSON.stringify(widgets));
    setIsCustomizing(false);
  };

  const resetLayout = () => {
    const defaultLayout = availableWidgets.map(w => ({ ...w, visible: true }));
    setWidgets(defaultLayout);
    localStorage.removeItem('retail-dashboard-layout');
  };

  return (
    <div className={className}>
      {/* Customization Toolbar */}
      <div className="flex items-center justify-between mb-4 p-3 border rounded-lg bg-green-50">
        <div className="flex items-center gap-2">
          <Button
            variant={isCustomizing ? 'default' : 'outline'}
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isCustomizing ? 'Done' : 'Customize'}
          </Button>
          
          {isCustomizing && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={resetLayout}
              >
                Reset
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={saveLayout}
              >
                Save Layout
              </Button>
            </>
          )}
        </div>

        {isCustomizing && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Add Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {availableWidgets
                .filter(w => !widgets.find(existing => existing.id === w.id))
                .map(widget => (
                  <DropdownMenuItem
                    key={widget.id}
                    onClick={() => addWidget(widget)}
                    className="cursor-pointer"
                  >
                    {widget.title}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Widget Grid */}
      {isCustomizing ? (
        <DndContext
          collisionDetection={closestCorners}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SortableContext
              items={widgets.filter(w => w.visible).map(w => w.id)}
              strategy={verticalListSortingStrategy}
            >
              {widgets.filter(w => w.visible).map(widget => (
                <DraggableWidget
                  key={widget.id}
                  widget={widget}
                  onRemove={removeWidget}
                  onSettings={(id) => {
                    const widget = widgets.find(w => w.id === id);
                    if (widget) {
                      const newSize = widget.size === 'small' ? 'medium' : widget.size === 'medium' ? 'large' : 'small';
                      updateWidgetSize(id, newSize);
                    }
                  }}
                />
              ))}
            </SortableContext>
          </div>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {widgets.filter(w => w.visible).map(widget => (
            <div
              key={widget.id}
              className={`${
                widget.size === 'large' ? 'md:col-span-2' :
                widget.size === 'medium' ? '' : ''
              }`}
            >
              <widget.component {...widget.props} />
            </div>
          ))}
        </div>
      )}

      {/* Widget Visibility Settings Panel */}
      {isCustomizing && (
        <div className="mt-6 p-4 border rounded-lg bg-white">
          <h3 className="font-semibold mb-4">Widget Settings</h3>
          <div className="space-y-3">
            {widgets.map(widget => (
              <div key={widget.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-gray-500 cursor-grab" />
                  <Label htmlFor={`widget-${widget.id}`} className="font-medium">
                    {widget.title}
                  </Label>
                </div>
                <div className="flex items-center gap-4">
                  <Select
                    value={widget.size}
                    onValueChange={(value: 'small' | 'medium' | 'large') =>
                      updateWidgetSize(widget.id, value)
                    }
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                    </SelectContent>
                  </Select>
                  <Switch
                    id={`widget-${widget.id}`}
                    checked={widget.visible}
                    onCheckedChange={(checked) => toggleWidget(widget.id, checked)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper to load saved layout
export function loadSavedLayout(): WidgetConfig[] | null {
  if (typeof window === 'undefined') return null;
  
  const saved = localStorage.getItem('retail-dashboard-layout');
  if (!saved) return null;
  
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

// Import Select since it wasn't imported above
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
