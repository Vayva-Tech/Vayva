"use client";

import { Button } from "@vayva/ui";
import React, { useRef, useState } from 'react';
import { GlassPanel } from '@vayva/ui/fashion';

export interface SectionConfig {
  id: string;
  type: 'hero' | 'featured-products' | 'collection-grid' | 'lookbook' | 'newsletter' | 'testimonials';
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  products?: string[];
  collectionId?: string;
  enabled: boolean;
  order: number;
}

export interface HomepageBuilderProps {
  sections?: SectionConfig[];
  onSectionsChange?: (sections: SectionConfig[]) => void;
}

export const HomepageBuilder: React.FC<HomepageBuilderProps> = ({
  sections = [],
  onSectionsChange,
}) => {
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const sectionIdSeqRef = useRef(0);

  const availableSections = [
    { type: 'hero', label: 'Hero Banner', icon: '🎯' },
    { type: 'featured-products', label: 'Featured Products', icon: '⭐' },
    { type: 'collection-grid', label: 'Collection Grid', icon: '📦' },
    { type: 'lookbook', label: 'Lookbook', icon: '📸' },
    { type: 'newsletter', label: 'Newsletter', icon: '📧' },
    { type: 'testimonials', label: 'Testimonials', icon: '💬' },
  ];

  const getSectionIcon = (type: string) => {
    return availableSections.find((s) => s.type === type)?.icon || '📄';
  };

  const handleAddSection = (type: SectionConfig['type']) => {
    sectionIdSeqRef.current += 1;
    const newSection: SectionConfig = {
      id: `section-${sectionIdSeqRef.current}`,
      type,
      title: availableSections.find((s) => s.type === type)?.label,
      enabled: true,
      order: sections.length,
    };
    onSectionsChange?.([...sections, newSection]);
  };

  const handleRemoveSection = (id: string) => {
    onSectionsChange?.(sections.filter((s) => s.id !== id));
  };

  const handleToggleSection = (id: string) => {
    onSectionsChange?.(
      sections.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleDragStart = (id: string) => {
    setDraggedSection(id);
  };

  const handleDrop = (targetId: string) => {
    if (!draggedSection || draggedSection === targetId) return;

    const newSections = [...sections];
    const draggedIndex = newSections.findIndex((s) => s.id === draggedSection);
    const targetIndex = newSections.findIndex((s) => s.id === targetId);

    const [removed] = newSections.splice(draggedIndex, 1);
    newSections.splice(targetIndex, 0, removed);

    // Update order
    newSections.forEach((section, index) => {
      section.order = index;
    });

    onSectionsChange?.(newSections);
    setDraggedSection(null);
  };

  return (
    <GlassPanel variant="elevated" className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white">Homepage Builder</h2>
        <Button className="px-4 py-2 bg-emerald-400 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition-colors">
          👁️ Preview
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Sections */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-medium text-white/80 mb-4">Available Sections</h3>
          <div className="space-y-2">
            {availableSections.map((section) => (
              <Button
                key={section.type}
                onClick={() => handleAddSection(section.type as SectionConfig['type'])}
                className="w-full flex items-center gap-3 p-3 bg-white/3 border border-white/8 hover:border-emerald-400/50 rounded-lg transition-all group"
              >
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  {section.icon}
                </span>
                <span className="text-sm text-white/80">{section.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Current Layout */}
        <div className="lg:col-span-2">
          <h3 className="text-sm font-medium text-white/80 mb-4">Current Layout</h3>
          <div className="space-y-3">
            {sections.length === 0 ? (
              <div className="p-8 bg-white/3 border border-dashed border-white/20 rounded-lg text-center">
                <p className="text-sm text-white/60">No sections added yet</p>
                <p className="text-xs text-white/40 mt-1">Click on available sections to add them</p>
              </div>
            ) : (
              sections
                .sort((a, b) => a.order - b.order)
                .map((section) => (
                  <div
                    key={section.id}
                    draggable
                    onDragStart={() => handleDragStart(section.id)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(section.id)}
                    className={`flex items-center gap-4 p-4 bg-white/3 border rounded-lg transition-all ${
                      section.enabled
                        ? 'border-white/8 hover:border-emerald-400/50'
                        : 'border-white/5 opacity-60'
                    }`}
                  >
                    <div className="cursor-move text-white/40 hover:text-white/80">
                      ⋮⋮
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                      <span className="text-2xl">{getSectionIcon(section.type)}</span>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-white">
                          {section.title || section.type}
                        </h4>
                        <p className="text-xs text-white/50 capitalize">{section.type.replace('-', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleToggleSection(section.id)}
                        className={`px-3 py-1.5 text-xs rounded transition-colors ${
                          section.enabled
                            ? 'bg-emerald-400/20 text-emerald-400'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {section.enabled ? 'Active' : 'Hidden'}
                      </Button>
                      <Button
                        onClick={() => handleRemoveSection(section.id)}
                        className="px-3 py-1.5 bg-rose-400/20 hover:bg-rose-400/30 text-rose-400 text-xs rounded transition-colors"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Tips */}
          {sections.length > 0 && (
            <div className="mt-6 p-4 bg-blue-400/10 border border-blue-400/20 rounded-lg">
              <p className="text-sm text-blue-400">
                💡 Tip: Drag and drop sections to reorder them. Toggle sections on/off to control visibility.
              </p>
            </div>
          )}
        </div>
      </div>
    </GlassPanel>
  );
};

export default HomepageBuilder;
