/**
 * New Workflow Page
 * Create a new workflow from scratch or template
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Copy,
  Sparkles,
  ShoppingBag,
  Utensils,
  Home,
  Heart,
  Building2,
} from 'lucide-react';
import type { IndustrySlug, WorkflowTemplate } from '@vayva/workflow-engine';
// import { getAllTemplates } from '@vayva/workflow-templates';
const getAllTemplates = () => []; // Placeholder

const industries: { id: IndustrySlug; name: string; icon: React.ReactNode }[] = [
  { id: 'fashion', name: 'Fashion', icon: <ShoppingBag className="w-5 h-5" /> },
  { id: 'restaurant', name: 'Restaurant', icon: <Utensils className="w-5 h-5" /> },
  { id: 'healthcare', name: 'Healthcare', icon: <Heart className="w-5 h-5" /> },
  { id: 'realestate', name: 'Real Estate', icon: <Home className="w-5 h-5" /> },
  { id: 'retail', name: 'Retail', icon: <Building2 className="w-5 h-5" /> },
];

export default function NewWorkflowPage() {
  const router = useRouter();
  const [selectedIndustry, setSelectedIndustry] = useState<IndustrySlug | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');

  // Get templates for selected industry
  const allTemplates = getAllTemplates();
  const templates = selectedIndustry 
    ? allTemplates.filter((t) => t.industry === selectedIndustry)
    : [];

  const handleCreateFromScratch = () => {
    if (!selectedIndustry || !workflowName) return;
    
    // Navigate to editor with new workflow
    router.push(`/workflows/editor?industry=${selectedIndustry}&name=${encodeURIComponent(workflowName)}`);
  };

  const handleCreateFromTemplate = () => {
    if (!selectedTemplate) return;
    
    // Navigate to editor with template
    router.push(`/workflows/editor?template=${selectedTemplate.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Workflow</h1>
          <p className="text-gray-600 mt-1">Choose how you want to create your workflow</p>
        </div>
      </div>

      {/* Step 1: Select Industry */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">1. Select Industry</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {industries.map((industry) => (
            <button
              key={industry.id}
              onClick={() => {
                setSelectedIndustry(industry.id);
                setSelectedTemplate(null);
              }}
              className={`
                flex flex-col items-center p-6 rounded-lg border-2 transition-all
                ${selectedIndustry === industry.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
              `}
            >
              <div className={`p-3 rounded-lg mb-3 ${
                selectedIndustry === industry.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
              }`}>
                {industry.icon}
              </div>
              <span className={`font-medium ${
                selectedIndustry === industry.id ? 'text-blue-900' : 'text-gray-900'
              }`}>
                {industry.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {selectedIndustry && (
        <>
          {/* Step 2: Choose Creation Method */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">2. Choose Creation Method</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* From Scratch */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Plus className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Start from Scratch</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Build a custom workflow from the ground up using our visual builder.
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Workflow Name *
                    </label>
                    <input
                      type="text"
                      value={workflowName}
                      onChange={(e) => setWorkflowName(e.target.value)}
                      placeholder="e.g., Order Confirmation Email"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={workflowDescription}
                      onChange={(e) => setWorkflowDescription(e.target.value)}
                      placeholder="What does this workflow do?"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    onClick={handleCreateFromScratch}
                    disabled={!workflowName}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Workflow
                  </button>
                </div>
              </div>

              {/* From Template */}
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Copy className="w-5 h-5 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Use Template</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Start with a pre-built template and customize it for your needs.
                </p>

                {templates.length > 0 ? (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {templates.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`
                          w-full text-left p-3 rounded-lg border transition-all
                          ${selectedTemplate?.id === template.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <Sparkles className={`w-4 h-4 mt-0.5 ${
                            selectedTemplate?.id === template.id ? 'text-purple-500' : 'text-gray-400'
                          }`} />
                          <div>
                            <h4 className={`font-medium ${
                              selectedTemplate?.id === template.id ? 'text-purple-900' : 'text-gray-900'
                            }`}>
                              {template.name}
                            </h4>
                            <p className="text-sm text-gray-500">{template.description}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    No templates available for this industry
                  </div>
                )}

                {selectedTemplate && (
                  <button
                    onClick={handleCreateFromTemplate}
                    className="w-full mt-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    Use Template
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
