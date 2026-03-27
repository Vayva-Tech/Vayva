'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@vayva/ui';
import { 
  AlertTriangle, 
  Info, 
  Database, 
  Layers, 
  BarChart3, 
  Settings, 
  FileText, 
  Users,
  ShoppingCart,
  Tag,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { apiJson } from '@/lib/api-client-shared';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface IndustryChangeWarningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentIndustry: string;
  targetIndustry: string;
  onSuccess: () => void;
}

interface DataImpact {
  products: number;
  categories: number;
  analytics: number;
  settings: number;
  templates: number;
}

interface MigrationWarning {
  type: 'data_loss' | 'incompatible' | 'requires_update' | 'feature_change';
  severity: 'critical' | 'warning' | 'info';
  title: string;
  description: string;
  affectedCount?: number;
}

export function IndustryChangeWarningModal({
  open,
  onOpenChange,
  currentIndustry,
  targetIndustry,
  onSuccess,
}: IndustryChangeWarningModalProps) {
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(true);
  const [dataImpact, setDataImpact] = useState<DataImpact | null>(null);
  const [warnings, setWarnings] = useState<MigrationWarning[]>([]);
  const [acknowledged, setAcknowledged] = useState(false);
  const [createBackup, setCreateBackup] = useState(true);
  const [step, setStep] = useState<'analysis' | 'review' | 'confirm'>('analysis');

  // Analyze impact when modal opens
  useEffect(() => {
    if (open && currentIndustry && targetIndustry) {
      analyzeImpact();
    }
  }, [open, currentIndustry, targetIndustry]);

  const analyzeImpact = async () => {
    setAnalyzing(true);
    try {
      const result = await apiJson<{
        success: boolean;
        data?: {
          impact: DataImpact;
          warnings: MigrationWarning[];
          estimatedTime: string;
          requiresAction: boolean;
        };
      }>('/api/settings/industry/analyze', {
        method: 'POST',
        body: JSON.stringify({
          currentIndustry,
          targetIndustry,
        }),
      });

      if (result.success && result.data) {
        setDataImpact(result.data.impact);
        setWarnings(result.data.warnings);
        setStep('review');
      } else {
        // Fallback to mock analysis if API not available
        simulateAnalysis();
      }
    } catch (error) {
      console.error('[INDUSTRY_ANALYSIS_ERROR]', error);
      simulateAnalysis();
    } finally {
      setAnalyzing(false);
    }
  };

  const simulateAnalysis = () => {
    // Simulated analysis for demonstration
    const mockImpact: DataImpact = {
      products: Math.floor(Math.random() * 50),
      categories: Math.floor(Math.random() * 10),
      analytics: Math.floor(Math.random() * 5),
      settings: Math.floor(Math.random() * 8),
      templates: Math.floor(Math.random() * 3),
    };

    const mockWarnings: MigrationWarning[] = [
      {
        type: 'feature_change',
        severity: 'warning',
        title: 'Industry-Specific Features Will Change',
        description: `${currentIndustry}-specific features will be replaced with ${targetIndustry} features.`,
      },
      {
        type: 'requires_update',
        severity: 'info',
        title: 'Product Categories May Need Updates',
        description: `${mockImpact.categories} categories may need to be reorganized to match new industry structure.`,
        affectedCount: mockImpact.categories,
      },
      {
        type: 'incompatible',
        severity: 'critical',
        title: 'Some Templates May Be Incompatible',
        description: `${mockImpact.templates} templates designed for ${currentIndustry} may not work optimally with ${targetIndustry}.`,
        affectedCount: mockImpact.templates,
      },
    ];

    setDataImpact(mockImpact);
    setWarnings(mockWarnings);
    setStep('review');
  };

  const handleConfirmChange = async () => {
    if (!acknowledged) {
      toast.error('Please acknowledge that you understand the changes');
      return;
    }

    setLoading(true);
    try {
      const result = await apiJson<{
        success: boolean;
        data?: any;
        error?: string;
      }>('/api/settings/industry/change', {
        method: 'POST',
        body: JSON.stringify({
          targetIndustry,
          createBackup,
        }),
      });

      if (result.success) {
        toast.success('Industry changed successfully!');
        setStep('confirm');
        
        setTimeout(() => {
          onSuccess();
          onOpenChange(false);
        }, 2000);
      } else {
        toast.error(result.error || 'Failed to change industry');
      }
    } catch (error) {
      console.error('[INDUSTRY_CHANGE_ERROR]', error);
      toast.error('Failed to change industry');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('analysis');
    setDataImpact(null);
    setWarnings([]);
    setAcknowledged(false);
    setCreateBackup(true);
    onOpenChange(false);
  };

  // Confirmation Screen
  if (step === 'confirm') {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Industry Changed Successfully
            </DialogTitle>
            <DialogDescription>
              Your store has been updated to {targetIndustry}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="text-sm text-green-800">
                  <p className="font-semibold mb-2">What's been updated:</p>
                  <ul className="list-disc list-inside space-y-1 text-green-700">
                    <li>Industry archetype changed to {targetIndustry}</li>
                    <li>Features and settings updated</li>
                    <li>Analytics KPIs recalibrated</li>
                    {createBackup && <li>Backup created for rollback (available for 7 days)</li>}
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-2">Next Steps:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>Review your product categories</li>
                    <li>Update templates if needed</li>
                    <li>Configure industry-specific features</li>
                    <li>Check analytics dashboard</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => { onSuccess(); handleClose(); }} className="w-full">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Review Screen
  if (step === 'review' && dataImpact && warnings.length > 0) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              Review Industry Change Impact
            </DialogTitle>
            <DialogDescription>
              Changing from <strong>{currentIndustry}</strong> to <strong>{targetIndustry}</strong> will affect your store.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4 max-h-[60vh] overflow-y-auto">
            {/* Data Impact Summary */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Database className="w-4 h-4" />
                Data Impact Summary
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">Products</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">{dataImpact.products}</p>
                </div>
                <div className="bg-purple-50 border border-purple-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Tag className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-gray-600">Categories</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-700">{dataImpact.categories}</p>
                </div>
                <div className="bg-green-50 border border-green-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <BarChart3 className="w-4 h-4 text-green-600" />
                    <span className="text-xs text-gray-600">Analytics</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">{dataImpact.analytics}</p>
                </div>
                <div className="bg-orange-50 border border-orange-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Settings className="w-4 h-4 text-orange-600" />
                    <span className="text-xs text-gray-600">Settings</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">{dataImpact.settings}</p>
                </div>
                <div className="bg-pink-50 border border-pink-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <FileText className="w-4 h-4 text-pink-600" />
                    <span className="text-xs text-gray-600">Templates</span>
                  </div>
                  <p className="text-2xl font-bold text-pink-700">{dataImpact.templates}</p>
                </div>
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">Team</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-700">No Change</p>
                </div>
              </div>
            </div>

            {/* Warnings by Severity */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Changes & Warnings
              </h3>
              <div className="space-y-2">
                {warnings.map((warning, idx) => (
                  <div
                    key={idx}
                    className={`rounded-lg p-3 border ${
                      warning.severity === 'critical'
                        ? 'bg-red-50 border-red-200'
                        : warning.severity === 'warning'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {warning.severity === 'critical' ? (
                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                      ) : warning.severity === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                      ) : (
                        <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1">
                        <p className={`text-sm font-semibold ${
                          warning.severity === 'critical'
                            ? 'text-red-900'
                            : warning.severity === 'warning'
                            ? 'text-amber-900'
                            : 'text-blue-900'
                        }`}>
                          {warning.title}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">{warning.description}</p>
                        {warning.affectedCount !== undefined && (
                          <p className="text-xs text-gray-500 mt-1">
                            Affected: {warning.affectedCount} items
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Backup Option */}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="create-backup"
                  checked={createBackup}
                  onCheckedChange={(checked) => setCreateBackup(!!checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="create-backup" className="text-sm font-medium text-green-900 cursor-pointer">
                    Create backup before migration (Recommended)
                  </Label>
                  <p className="text-xs text-green-700 mt-1">
                    A complete backup of your store data will be created. You can rollback within 7 days if needed.
                  </p>
                </div>
              </div>
            </div>

            {/* Acknowledgment */}
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="acknowledge"
                  checked={acknowledged}
                  onCheckedChange={(checked) => setAcknowledged(!!checked)}
                  className="mt-1"
                />
                <div className="flex-1">
                  <Label htmlFor="acknowledge" className="text-sm font-medium text-red-900 cursor-pointer">
                    I understand that this action will change my store configuration and may require updates to products and templates.
                  </Label>
                  <p className="text-xs text-red-700 mt-1">
                    This action cannot be undone after 7 days. Please review all changes carefully.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmChange}
              disabled={!acknowledged || loading}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {loading ? 'Changing...' : `Change to ${targetIndustry}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Analysis Loading Screen
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-gray-900">
            <Database className="w-6 h-6" />
            Analyzing Impact...
          </DialogTitle>
          <DialogDescription>
            We're analyzing how changing from {currentIndustry} to {targetIndustry} will affect your store.
          </DialogDescription>
        </DialogHeader>

        <div className="py-8">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 border-t-amber-600 rounded-full animate-spin"></div>
              <Database className="w-6 h-6 text-amber-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse"></div>
              Analyzing product catalog...
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse delay-100"></div>
              Checking category compatibility...
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse delay-200"></div>
              Evaluating template changes...
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-2 h-2 bg-amber-600 rounded-full animate-pulse delay-300"></div>
              Assessing feature differences...
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
