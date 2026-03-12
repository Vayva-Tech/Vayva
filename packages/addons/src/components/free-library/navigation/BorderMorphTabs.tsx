'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface BorderMorphTabsProps {
  tabs: Tab[];
  className?: string;
}

/**
 * Border Morph Tabs - Tabs with morphing border animation
 * From Framer University Library
 */
export function BorderMorphTabs({ tabs, className = '' }: BorderMorphTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={`${className}`}>
      {/* Tab Buttons */}
      <div className="relative flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
            
            {/* Active indicator with morph */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="active-tab-border"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                initial={false}
                transition={{
                  type: prefersReducedMotion ? 'tween' : 'spring',
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
          </button>
        ))}
        
        {/* Background pill that morphs */}
        <motion.div
          className="absolute inset-0 bg-blue-50/50 -z-10 rounded-t-lg"
          initial={false}
          animate={{
            x: tabs.findIndex(t => t.id === activeTab) * (100 / tabs.length) + '%',
            width: `${100 / tabs.length}%`,
          }}
          transition={{
            type: prefersReducedMotion ? 'tween' : 'spring',
            stiffness: 400,
            damping: 30,
          }}
        />
      </div>

      {/* Tab Content */}
      <div className="pt-4">
        {tabs.map((tab) => (
          <motion.div
            key={tab.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ 
              opacity: activeTab === tab.id ? 1 : 0,
              y: activeTab === tab.id ? 0 : 10,
              display: activeTab === tab.id ? 'block' : 'none',
            }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
          >
            {tab.content}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
