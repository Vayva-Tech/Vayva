"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, ArrowLeft, CheckCircle, Save, X } from "lucide-react";
import { Button } from "@vayva/ui";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";

interface TeamMember {
  name: string;
  role: string;
  qualifications?: string;
}

interface BudgetItem {
  category: string;
  amount: number;
  description?: string;
}

interface WizardFormData {
  projectName: string;
  projectDescription: string;
  requestedAmount: number;
  startDate: string;
  endDate: string;
  teamMembers: TeamMember[];
  budgetBreakdown: BudgetItem[];
  expectedOutcomes: string[];
  sustainabilityPlan: string;
  supportingDocuments: string[];
  notes: string;
}

interface ApplicationWizardProps {
  grantId: string;
  grantTitle: string;
  grantDeadline: string;
  onSuccess?: () => void;
}

type Step = 'basics' | 'team' | 'budget' | 'outcomes' | 'review';

const steps: { id: Step; label: string; icon: any }[] = [
  { id: 'basics', label: 'Project Basics', icon: CheckCircle },
  { id: 'team', label: 'Team Members', icon: CheckCircle },
  { id: 'budget', label: 'Budget', icon: CheckCircle },
  { id: 'outcomes', label: 'Outcomes', icon: CheckCircle },
  { id: 'review', label: 'Review', icon: CheckCircle },
];

export default function ApplicationWizard({ 
  grantId, 
  grantTitle, 
  grantDeadline,
  onSuccess 
}: ApplicationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>('basics');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState<WizardFormData>({
    projectName: '',
    projectDescription: '',
    requestedAmount: 0,
    startDate: '',
    endDate: '',
    teamMembers: [{ name: '', role: '', qualifications: '' }],
    budgetBreakdown: [{ category: '', amount: 0, description: '' }],
    expectedOutcomes: [''],
    sustainabilityPlan: '',
    supportingDocuments: [],
    notes: '',
  });

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNext = () => {
    if (!validateCurrentStep()) return;
    
    const nextStep = steps[currentStepIndex + 1];
    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1].id);
    }
  };

  const validateCurrentStep = (): boolean => {
    switch (currentStep) {
      case 'basics':
        if (!formData.projectName.trim()) {
          toast.error('Project name is required');
          return false;
        }
        if (!formData.projectDescription.trim()) {
          toast.error('Project description is required');
          return false;
        }
        if (formData.requestedAmount <= 0) {
          toast.error('Requested amount must be greater than 0');
          return false;
        }
        if (!formData.startDate || !formData.endDate) {
          toast.error('Start and end dates are required');
          return false;
        }
        if (new Date(formData.startDate) >= new Date(formData.endDate)) {
          toast.error('End date must be after start date');
          return false;
        }
        break;
        
      case 'team':
        const hasEmptyTeam = formData.teamMembers.some(tm => !tm.name || !tm.role);
        if (hasEmptyTeam) {
          toast.error('All team members must have name and role');
          return false;
        }
        break;
        
      case 'budget':
        const totalBudget = formData.budgetBreakdown.reduce((sum, item) => sum + item.amount, 0);
        if (totalBudget !== formData.requestedAmount) {
          toast.error(`Budget breakdown must equal requested amount (${formData.requestedAmount})`);
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    try {
      await apiJson('/api/nonprofit/grants/applications', {
        method: 'POST',
        body: JSON.stringify({
          grantId,
          ...formData,
        }),
      });
      
      toast.success('Application created successfully!');
      onSuccess?.();
      router.push('/dashboard/nonprofit/grants');
    } catch (error: unknown) {
      const _errMsg = error instanceof Error ? error.message : String(error);
      logger.error('[APPLICATION_WIZARD_ERROR]', { error: _errMsg });
      toast.error(_errMsg || 'Failed to create application');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      // Save as draft without validation
      await apiJson('/api/nonprofit/grants/applications', {
        method: 'POST',
        body: JSON.stringify({
          grantId,
          ...formData,
        }),
      });
      toast.success('Draft saved successfully');
    } catch (error: unknown) {
      logger.error('[SAVE_DRAFT_ERROR]', { error });
      toast.error('Failed to save draft');
    } finally {
      setIsSaving(false);
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 'basics':
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900">Grant: {grantTitle}</h3>
              <p className="text-sm text-blue-700 mt-1">
                Deadline: {new Date(grantDeadline).toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="e.g., STEM Education Initiative"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="projectDescription">Project Description *</Label>
              <Textarea
                id="projectDescription"
                value={formData.projectDescription}
                onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                placeholder="Describe your project, its goals, and intended impact..."
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requestedAmount">Requested Amount (USD) *</Label>
              <Input
                id="requestedAmount"
                type="number"
                value={formData.requestedAmount}
                onChange={(e) => setFormData({ ...formData, requestedAmount: Number(e.target.value) })}
                placeholder="50000"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Project Team Members</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({
                  ...formData,
                  teamMembers: [...formData.teamMembers, { name: '', role: '', qualifications: '' }]
                })}
              >
                Add Member
              </Button>
            </div>

            {formData.teamMembers.map((member, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Team Member {index + 1}</h4>
                  {formData.teamMembers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        teamMembers: formData.teamMembers.filter((_, i) => i !== index)
                      })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input
                    value={member.name}
                    onChange={(e) => {
                      const updated = [...formData.teamMembers];
                      updated[index].name = e.target.value;
                      setFormData({ ...formData, teamMembers: updated });
                    }}
                    placeholder="Dr. Jane Smith"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Input
                    value={member.role}
                    onChange={(e) => {
                      const updated = [...formData.teamMembers];
                      updated[index].role = e.target.value;
                      setFormData({ ...formData, teamMembers: updated });
                    }}
                    placeholder="Project Director"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Qualifications</Label>
                  <Textarea
                    value={member.qualifications || ''}
                    onChange={(e) => {
                      const updated = [...formData.teamMembers];
                      updated[index].qualifications = e.target.value;
                      setFormData({ ...formData, teamMembers: updated });
                    }}
                    placeholder="PhD in Education, 10 years experience..."
                    rows={2}
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'budget':
        const totalBudget = formData.budgetBreakdown.reduce((sum, item) => sum + item.amount, 0);
        const difference = formData.requestedAmount - totalBudget;

        return (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 ${difference === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">
                    Requested: ${formData.requestedAmount.toLocaleString()}
                  </p>
                  <p className="text-sm font-medium">
                    Allocated: ${totalBudget.toLocaleString()}
                  </p>
                </div>
                <div className={`text-lg font-bold ${difference === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {difference === 0 ? '✓ Balanced' : difference > 0 ? `+ $${difference.toLocaleString()}` : `$${Math.abs(difference).toLocaleString()} over`}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Budget Breakdown</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({
                  ...formData,
                  budgetBreakdown: [...formData.budgetBreakdown, { category: '', amount: 0, description: '' }]
                })}
              >
                Add Category
              </Button>
            </div>

            {formData.budgetBreakdown.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Category {index + 1}</h4>
                  {formData.budgetBreakdown.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setFormData({
                        ...formData,
                        budgetBreakdown: formData.budgetBreakdown.filter((_, i) => i !== index)
                      })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 space-y-2">
                    <Label>Category</Label>
                    <Input
                      value={item.category}
                      onChange={(e) => {
                        const updated = [...formData.budgetBreakdown];
                        updated[index].category = e.target.value;
                        setFormData({ ...formData, budgetBreakdown: updated });
                      }}
                      placeholder="Personnel"
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={item.amount}
                      onChange={(e) => {
                        const updated = [...formData.budgetBreakdown];
                        updated[index].amount = Number(e.target.value);
                        setFormData({ ...formData, budgetBreakdown: updated });
                      }}
                      placeholder="30000"
                    />
                  </div>
                  <div className="col-span-1 space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={item.description || ''}
                      onChange={(e) => {
                        const updated = [...formData.budgetBreakdown];
                        updated[index].description = e.target.value;
                        setFormData({ ...formData, budgetBreakdown: updated });
                      }}
                      placeholder="2 project managers"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 'outcomes':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Expected Outcomes</Label>
              <div className="space-y-2">
                {formData.expectedOutcomes.map((outcome, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={outcome}
                      onChange={(e) => {
                        const updated = [...formData.expectedOutcomes];
                        updated[index] = e.target.value;
                        setFormData({ ...formData, expectedOutcomes: updated });
                      }}
                      placeholder="e.g., Serve 500 students in underserved communities"
                    />
                    {formData.expectedOutcomes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => setFormData({
                          ...formData,
                          expectedOutcomes: formData.expectedOutcomes.filter((_, i) => i !== index)
                        })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setFormData({
                  ...formData,
                  expectedOutcomes: [...formData.expectedOutcomes, '']
                })}
              >
                Add Outcome
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sustainabilityPlan">Sustainability Plan</Label>
              <Textarea
                id="sustainabilityPlan"
                value={formData.sustainabilityPlan}
                onChange={(e) => setFormData({ ...formData, sustainabilityPlan: e.target.value })}
                placeholder="How will this project continue after grant funding ends?..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes (Internal)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional information for internal review..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'review':
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="font-semibold text-yellow-900">Review Your Application</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Please review all information before submitting. You can save as draft to come back later.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-gray-500">Project Information</h4>
                <p className="font-medium">{formData.projectName}</p>
                <p className="text-sm text-gray-600 mt-1">{formData.projectDescription}</p>
                <p className="text-sm mt-2">
                  <span className="font-medium">Amount:</span> ${formData.requestedAmount.toLocaleString()}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Duration:</span> {new Date(formData.startDate).toLocaleDateString()} - {new Date(formData.endDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-500">Team Members ({formData.teamMembers.length})</h4>
                <ul className="text-sm space-y-1 mt-2">
                  {formData.teamMembers.map((tm, i) => (
                    <li key={i}>• {tm.name} - {tm.role}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-500">Budget Breakdown</h4>
                <ul className="text-sm space-y-1 mt-2">
                  {formData.budgetBreakdown.map((item, i) => (
                    <li key={i}>• {item.category}: ${item.amount.toLocaleString()}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-gray-500">Expected Outcomes ({formData.expectedOutcomes.length})</h4>
                <ul className="text-sm space-y-1 mt-2">
                  {formData.expectedOutcomes.map((outcome, i) => (
                    <li key={i}>• {outcome}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;

            return (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors ${
                    isCompleted
                      ? 'bg-green-500 border-green-500 text-white'
                      : isActive
                      ? 'border-blue-500 text-blue-500'
                      : 'border-gray-300 text-gray-300'
                  }`}
                >
                  {isCompleted ? <Icon className="h-4 w-4" /> : index + 1}
                </div>
                <span
                  className={`ml-2 text-xs font-medium hidden sm:inline ${
                    isActive ? 'text-blue-600' : 'text-gray-500'
                  }`}
                >
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className="w-8 sm:w-16 h-0.5 mx-2 bg-gray-200" />
                )}
              </div>
            );
          })}
        </div>
        <div className="relative pt-2">
          <div className="overflow-hidden h-2 text-xs flex rounded bg-blue-100">
            <div
              style={{ width: `${progress}%` }}
              className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-300"
            />
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        {renderStepContent()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          disabled={currentStepIndex === 0}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={isSaving}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>

          {currentStep === 'review' ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Application'}
              <CheckCircle className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={isSaving}>
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
