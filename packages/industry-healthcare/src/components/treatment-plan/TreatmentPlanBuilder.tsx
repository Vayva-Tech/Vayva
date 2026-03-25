'use client';
import { Button } from "@vayva/ui";

import React, { useState } from 'react';

export interface TreatmentPlanBuilderProps {
  businessId: string;
  patientId?: string;
  planId?: string;
  onSave?: (plan: TreatmentPlanData) => Promise<void>;
}

export interface TreatmentGoal {
  id: string;
  description: string;
  targetDate?: string;
  status: 'not-started' | 'in-progress' | 'achieved' | 'discontinued';
  metrics: string[];
}

export interface TreatmentIntervention {
  id: string;
  type: 'medication' | 'therapy' | 'lifestyle' | 'procedure' | 'other';
  description: string;
  frequency: string;
  duration: string;
  notes?: string;
}

export interface TreatmentPlanData {
  patientId: string;
  diagnosis: string;
  problemList: string[];
  goals: TreatmentGoal[];
  interventions: TreatmentIntervention[];
  followUpSchedule: string;
  providerNotes: string;
}

export function TreatmentPlanBuilder({ 
  businessId,
  patientId,
  planId,
  onSave 
}: TreatmentPlanBuilderProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'goals' | 'interventions' | 'schedule'>('overview');
  const [saving, setSaving] = useState(false);

  const [planData, setPlanData] = useState<TreatmentPlanData>({
    patientId: patientId || '',
    diagnosis: '',
    problemList: [],
    goals: [],
    interventions: [],
    followUpSchedule: '',
    providerNotes: '',
  });

  const handleAddGoal = () => {
    const newGoal: TreatmentGoal = {
      id: `goal-${Date.now()}`,
      description: '',
      status: 'not-started',
      metrics: [],
    };
    setPlanData(prev => ({
      ...prev,
      goals: [...prev.goals, newGoal],
    }));
  };

  handleAddGoal();

  const handleAddIntervention = () => {
    const newIntervention: TreatmentIntervention = {
      id: `intervention-${Date.now()}`,
      type: 'therapy',
      description: '',
      frequency: '',
      duration: '',
    };
    setPlanData(prev => ({
      ...prev,
      interventions: [...prev.interventions, newIntervention],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave?.(planData);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'achieved':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'discontinued':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="treatment-plan-builder max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Treatment Plan Builder</h2>
            <p className="text-gray-600 mt-1">
              {patientId ? `Patient: ${patientId}` : 'Create comprehensive care plans'}
            </p>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Plan'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview & Diagnosis' },
            { id: 'goals', label: 'Goals' },
            { id: 'interventions', label: 'Interventions' },
            { id: 'schedule', label: 'Follow-up' },
          ].map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </Button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Diagnosis *
            </label>
            <input
              type="text"
              value={planData.diagnosis}
              onChange={(e) => setPlanData(prev => ({ ...prev, diagnosis: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Type 2 Diabetes Mellitus"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Problem List
            </label>
            <textarea
              value={planData.problemList.join('\n')}
              onChange={(e) => setPlanData(prev => ({ 
                ...prev, 
                problemList: e.target.value.split('\n').filter(p => p.trim()) 
              }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter each problem on a new line"
            />
            <p className="text-xs text-gray-500 mt-1">List all active medical problems and conditions</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Provider Notes
            </label>
            <textarea
              value={planData.providerNotes}
              onChange={(e) => setPlanData(prev => ({ ...prev, providerNotes: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Clinical observations, assessment, and additional notes..."
            />
          </div>
        </div>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Treatment Goals</h3>
            <Button
              onClick={handleAddGoal}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            >
              + Add Goal
            </Button>
          </div>

          {planData.goals.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500 text-sm">No goals added yet. Click "Add Goal" to create one.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {planData.goals.map((goal, index) => (
                <div key={goal.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        Goal {index + 1}
                      </span>
                      <select
                        value={goal.status}
                        onChange={(e) => {
                          const updated = [...planData.goals];
                          updated[index].status = e.target.value as any;
                          setPlanData(prev => ({ ...prev, goals: updated }));
                        }}
                        className={`text-sm px-3 py-1 rounded-full border ${getStatusColor(goal.status)}`}
                      >
                        <option value="not-started">Not Started</option>
                        <option value="in-progress">In Progress</option>
                        <option value="achieved">Achieved</option>
                        <option value="discontinued">Discontinued</option>
                      </select>
                    </div>
                    <Button className="text-red-600 hover:text-red-700 text-sm">Remove</Button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Goal Description
                      </label>
                      <input
                        type="text"
                        value={goal.description}
                        onChange={(e) => {
                          const updated = [...planData.goals];
                          updated[index].description = e.target.value;
                          setPlanData(prev => ({ ...prev, goals: updated }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Reduce HbA1c to below 7%"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Target Date
                      </label>
                      <input
                        type="date"
                        value={goal.targetDate || ''}
                        onChange={(e) => {
                          const updated = [...planData.goals];
                          updated[index].targetDate = e.target.value;
                          setPlanData(prev => ({ ...prev, goals: updated }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Success Metrics
                      </label>
                      <textarea
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="How will you measure progress toward this goal?"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'interventions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Treatment Interventions</h3>
            <Button
              onClick={handleAddIntervention}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm font-medium"
            >
              + Add Intervention
            </Button>
          </div>

          {planData.interventions.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500 text-sm">No interventions added yet.</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {planData.interventions.map((intervention, index) => (
                <div key={intervention.id} className="bg-white rounded-lg shadow p-6 border border-gray-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                        Intervention {index + 1}
                      </span>
                      <select
                        value={intervention.type}
                        onChange={(e) => {
                          const updated = [...planData.interventions];
                          updated[index].type = e.target.value as any;
                          setPlanData(prev => ({ ...prev, interventions: updated }));
                        }}
                        className="text-sm px-3 py-1 border border-gray-300 rounded-md"
                      >
                        <option value="medication">Medication</option>
                        <option value="therapy">Therapy</option>
                        <option value="lifestyle">Lifestyle</option>
                        <option value="procedure">Procedure</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <Button className="text-red-600 hover:text-red-700 text-sm">Remove</Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={intervention.description}
                        onChange={(e) => {
                          const updated = [...planData.interventions];
                          updated[index].description = e.target.value;
                          setPlanData(prev => ({ ...prev, interventions: updated }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Metformin 500mg twice daily"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Frequency
                      </label>
                      <input
                        type="text"
                        value={intervention.frequency}
                        onChange={(e) => {
                          const updated = [...planData.interventions];
                          updated[index].frequency = e.target.value;
                          setPlanData(prev => ({ ...prev, interventions: updated }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Twice daily"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={intervention.duration}
                        onChange={(e) => {
                          const updated = [...planData.interventions];
                          updated[index].duration = e.target.value;
                          setPlanData(prev => ({ ...prev, interventions: updated }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., 3 months"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                      </label>
                      <textarea
                        rows={2}
                        value={intervention.notes || ''}
                        onChange={(e) => {
                          const updated = [...planData.interventions];
                          updated[index].notes = e.target.value;
                          setPlanData(prev => ({ ...prev, interventions: updated }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Additional instructions or considerations"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'schedule' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Follow-up Schedule *
            </label>
            <textarea
              value={planData.followUpSchedule}
              onChange={(e) => setPlanData(prev => ({ ...prev, followUpSchedule: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Return in 3 months for follow-up appointment and lab work&#10;Contact office if symptoms worsen or new symptoms develop"
            />
            <p className="text-xs text-gray-500 mt-1">Specify timing and conditions for follow-up care</p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Patient Instructions</h4>
            <p className="text-sm text-blue-800">
              Make sure to provide clear, written instructions for the patient including:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-800 list-disc list-inside">
              <li>When to schedule follow-up appointments</li>
              <li>What symptoms warrant immediate medical attention</li>
              <li>How to reach the healthcare team with questions</li>
              <li>Any lifestyle modifications or home care instructions</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

