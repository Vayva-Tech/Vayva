'use client';

/**
 * Install Add-On Dialog
 * 
 * Guides the user through installing an add-on,
 * including configuration, dependency checks, and progress tracking.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Check, 
  X, 
  AlertCircle, 
  Download, 
  Loader2, 
  ArrowRight,
  ArrowLeft,
  Package,
  Settings,
  FileCode,
  Database,
  Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { AddOnDefinition, InstalledAddOn } from '@vayva/addons/types';

interface InstallAddOnDialogProps {
  addon: AddOnDefinition;
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  storeId: string;
}

type InstallStep = 
  | 'check-dependencies'
  | 'configuration'
  | 'preview'
  | 'installing'
  | 'complete'
  | 'error';

interface InstallProgress {
  step: string;
  progress: number;
  status: 'pending' | 'in-progress' | 'complete' | 'error';
  message?: string;
}

export function InstallAddOnDialog({
  addon,
  isOpen,
  onClose,
  onComplete,
  storeId,
}: InstallAddOnDialogProps) {
  const [currentStep, setCurrentStep] = useState<InstallStep>('check-dependencies');
  const [progress, setProgress] = useState<InstallProgress[]>([]);
  const [config, setConfig] = useState<Record<string, unknown>>(addon.defaultConfig ?? {});
  const [missingDependencies, setMissingDependencies] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [installedInstance, setInstalledInstance] = useState<InstalledAddOn | null>(null);

  // Check dependencies when dialog opens
  useEffect(() => {
    if (isOpen && currentStep === 'check-dependencies') {
      checkDependencies();
    }
  }, [isOpen, currentStep]);

  const checkDependencies = async () => {
    try {
      const res = await fetch(`/api/addons/check-dependencies?storeId=${storeId}&addonId=${addon.id}`);
      const data = await res.json();
      
      if (data.missingDependencies?.length > 0) {
        setMissingDependencies(data.missingDependencies);
      } else {
        // Skip to configuration or preview
        if (addon.configRequired) {
          setCurrentStep('configuration');
        } else {
          setCurrentStep('preview');
        }
      }
    } catch (err) {
      setError('Failed to check dependencies');
      setCurrentStep('error');
    }
  };

  const installDependency = async (dependencyId: string) => {
    try {
      const res = await fetch('/api/addons/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, addonId: dependencyId }),
      });
      
      if (!res.ok) throw new Error('Installation failed');
      
      // Remove from missing list
      setMissingDependencies(prev => prev.filter(id => id !== dependencyId));
      
      // If all dependencies installed, proceed
      if (missingDependencies.length === 1) {
        if (addon.configRequired) {
          setCurrentStep('configuration');
        } else {
          setCurrentStep('preview');
        }
      }
    } catch (err) {
      toast.error(`Failed to install ${dependencyId}`);
    }
  };

  const startInstallation = async () => {
    setCurrentStep('installing');
    
    // Initialize progress steps
    const steps: InstallProgress[] = [
      { step: 'copying-files', progress: 0, status: 'pending', message: 'Copying files...' },
      { step: 'database-migration', progress: 0, status: 'pending', message: 'Running database migrations...' },
      { step: 'api-routes', progress: 0, status: 'pending', message: 'Setting up API routes...' },
      { step: 'mount-points', progress: 0, status: 'pending', message: 'Configuring mount points...' },
      { step: 'configuration', progress: 0, status: 'pending', message: 'Saving configuration...' },
      { step: 'finalizing', progress: 0, status: 'pending', message: 'Finalizing installation...' },
    ];
    setProgress(steps);

    try {
      const res = await fetch('/api/addons/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storeId, 
          addonId: addon.id,
          config,
        }),
      });

      if (!res.ok) {
        const error = await res.text();
        throw new Error(error);
      }

      const result = await res.json();
      setInstalledInstance(result.installedAddOn);
      setCurrentStep('complete');
      onComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Installation failed');
      setCurrentStep('error');
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'check-dependencies':
        return (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Checking dependencies...</p>
          </div>
        );

      case 'configuration':
        return (
          <ConfigurationStep
            addon={addon}
            config={config}
            setConfig={setConfig}
          />
        );

      case 'preview':
        return (
          <PreviewStep
            addon={addon}
            config={config}
            onBack={() => setCurrentStep(addon.configRequired ? 'configuration' : 'check-dependencies')}
            onInstall={startInstallation}
          />
        );

      case 'installing':
        return (
          <InstallingStep
            progress={progress}
            addon={addon}
          />
        );

      case 'complete':
        return (
          <CompleteStep
            addon={addon}
            onClose={onClose}
            installedInstance={installedInstance}
          />
        );

      case 'error':
        return (
          <ErrorStep
            error={error || 'Unknown error'}
            onRetry={() => setCurrentStep('preview')}
            onClose={onClose}
          />
        );
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-2xl bg-background rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold">Install {addon.name}</h2>
                  <p className="text-sm text-muted-foreground">Step {getStepNumber(currentStep)} of {getTotalSteps(addon)}</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-muted rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress bar */}
            <div className="px-6 pt-4">
              <Progress 
                value={getProgressPercentage(currentStep, addon)} 
                className="h-2"
              />
            </div>

            {/* Content */}
            <div className="p-6 min-h-[300px]">
              {renderStepContent()}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex justify-between">
              {currentStep === 'configuration' && (
                <>
                  <Button variant="outline" onClick={() => setCurrentStep('check-dependencies')}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                  <Button onClick={() => setCurrentStep('preview')}>
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function ConfigurationStep({ 
  addon, 
  config, 
  setConfig 
}: { 
  addon: AddOnDefinition; 
  config: Record<string, unknown>; 
  setConfig: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-1">Configure {addon.name}</h3>
        <p className="text-sm text-muted-foreground">
          Customize how this add-on works on your site.
        </p>
      </div>

      {addon.configSchema?.sections && Array.isArray(addon.configSchema.sections) ? (
        <>
          {addon.configSchema.sections.map((section) => (
        <div key={section.title} className="space-y-4">
          <div>
            <h4 className="font-medium">{section.title}</h4>
            {section.description && (
              <p className="text-sm text-muted-foreground">{section.description}</p>
            )}
          </div>

          <div className="space-y-4">
            {section.fields.map((fieldKey: string) => {
              const field = Array.isArray(addon.configSchema?.fields) 
                ? addon.configSchema.fields.find(f => f.key === fieldKey)
                : undefined;
              if (!field) return null;

              return (
                <ConfigField
                  key={field.key}
                  field={field}
                  value={config[field.key]}
                  onChange={(value) => setConfig(prev => ({ ...prev, [field.key]: value }))}
                />
              );
            })}
          </div>
        </div>
      ))}
        </>
      ) : null}
    </div>
  );
}

function ConfigField({ 
  field, 
  value, 
  onChange 
}: { 
  field: { key: string; label: string; type: string; description?: string; options?: { label: string; value: string }[]; validation?: { min?: number; max?: number } };
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case 'boolean':
      return (
        <div className="flex items-start space-x-3">
          <Checkbox
            id={field.key}
            checked={value as boolean}
            onCheckedChange={onChange}
          />
          <div className="space-y-1">
            <Label htmlFor={field.key}>{field.label}</Label>
            {field.description && (
              <p className="text-sm text-muted-foreground">{field.description}</p>
            )}
          </div>
        </div>
      );

    case 'select':
      return (
        <div className="space-y-2">
          <Label>{field.label}</Label>
          <RadioGroup value={value as string} onValueChange={onChange}>
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <RadioGroupItem value={option.value} id={`${field.key}-${option.value}`} />
                <Label htmlFor={`${field.key}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      );

    case 'multiselect':
      return (
        <div className="space-y-2">
          <Label>{field.label}</Label>
          <div className="space-y-2">
            {field.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${field.key}-${option.value}`}
                  checked={Array.isArray(value) && value.includes(option.value)}
                  onCheckedChange={(checked) => {
                    const current = Array.isArray(value) ? value : [];
                    if (checked) {
                      onChange([...current, option.value]);
                    } else {
                      onChange(current.filter(v => v !== option.value));
                    }
                  }}
                />
                <Label htmlFor={`${field.key}-${option.value}`}>{option.label}</Label>
              </div>
            ))}
          </div>
        </div>
      );

    case 'number':
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            type="number"
            value={value as number}
            onChange={(e) => onChange(parseInt(e.target.value))}
            min={field.validation?.min}
            max={field.validation?.max}
          />
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
        </div>
      );

    default:
      return (
        <div className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          <Input
            id={field.key}
            value={value as string}
            onChange={(e) => onChange(e.target.value)}
          />
          {field.description && (
            <p className="text-sm text-muted-foreground">{field.description}</p>
          )}
        </div>
      );
  }
}

function PreviewStep({ 
  addon, 
  config, 
  onBack, 
  onInstall 
}: { 
  addon: AddOnDefinition; 
  config: Record<string, unknown>;
  onBack: () => void;
  onInstall: () => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-1">Ready to Install</h3>
        <p className="text-sm text-muted-foreground">
          Review what will be added to your store.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {addon.provides?.pages && (
          <div className="p-4 bg-muted rounded-lg">
            <FileCode className="w-5 h-5 mb-2 text-primary" />
            <p className="font-medium">{addon.provides.pages.length} Pages</p>
            <p className="text-sm text-muted-foreground">
              {addon.provides.pages.map(p => p.route).join(', ')}
            </p>
          </div>
        )}

        {addon.provides?.components && (
          <div className="p-4 bg-muted rounded-lg">
            <Sparkles className="w-5 h-5 mb-2 text-primary" />
            <p className="font-medium">{addon.provides.components.length} Components</p>
            <p className="text-sm text-muted-foreground">
              Injected into your template
            </p>
          </div>
        )}

        {addon.provides?.apiRoutes && (
          <div className="p-4 bg-muted rounded-lg">
            <Database className="w-5 h-5 mb-2 text-primary" />
            <p className="font-medium">{addon.provides.apiRoutes.length} API Routes</p>
            <p className="text-sm text-muted-foreground">
              Backend endpoints
            </p>
          </div>
        )}

        {addon.provides?.databaseModels && (
          <div className="p-4 bg-muted rounded-lg">
            <Database className="w-5 h-5 mb-2 text-primary" />
            <p className="font-medium">{addon.provides.databaseModels.length} Database Tables</p>
            <p className="text-sm text-muted-foreground">
              For data storage
            </p>
          </div>
        )}
      </div>

      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          This will modify your storefront files. A backup will be created automatically.
        </AlertDescription>
      </Alert>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button onClick={onInstall}>
          <Download className="w-4 h-4 mr-2" />
          Install Now
        </Button>
      </div>
    </div>
  );
}

function InstallingStep({ 
  progress, 
  addon 
}: { 
  progress: InstallProgress[]; 
  addon: AddOnDefinition;
}) {
  const completedSteps = progress.filter(p => p.status === 'complete').length;
  const totalSteps = progress.length;
  const percent = Math.round((completedSteps / totalSteps) * 100);

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
      
      <h3 className="font-semibold mb-2">Installing {addon.name}...</h3>
      <p className="text-muted-foreground mb-6">
        This may take a few minutes. Please don&apos;t close this window.
      </p>

      <Progress value={percent} className="h-2 mb-6" />

      <div className="space-y-2 text-left max-w-md mx-auto">
        {progress.map((step) => (
          <div 
            key={step.step} 
            className={cn(
              "flex items-center gap-2 text-sm",
              step.status === 'complete' && "text-green-600",
              step.status === 'in-progress' && "text-primary",
              step.status === 'pending' && "text-muted-foreground"
            )}
          >
            {step.status === 'complete' ? (
              <Check className="w-4 h-4" />
            ) : step.status === 'in-progress' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <div className="w-4 h-4 rounded-full border-2 border-muted" />
            )}
            {step.message}
          </div>
        ))}
      </div>
    </div>
  );
}

function CompleteStep({ 
  addon, 
  onClose, 
  installedInstance 
}: { 
  addon: AddOnDefinition; 
  onClose: () => void;
  installedInstance: InstalledAddOn | null;
}) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
        <Check className="w-8 h-8 text-green-600" />
      </div>
      
      <h3 className="font-semibold text-xl mb-2">Installation Complete!</h3>
      <p className="text-muted-foreground mb-6">
        {addon.name} has been successfully installed on your store.
      </p>

      <div className="flex flex-col gap-2 max-w-xs mx-auto">
        <Button onClick={onClose}>
          <Sparkles className="w-4 h-4 mr-2" />
          Start Using {addon.name}
        </Button>
        <Button variant="outline" onClick={onClose}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

function ErrorStep({ 
  error, 
  onRetry, 
  onClose 
}: { 
  error: string; 
  onRetry: () => void;
  onClose: () => void;
}) {
  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      
      <h3 className="font-semibold text-xl mb-2">Installation Failed</h3>
      <p className="text-muted-foreground mb-4">
        {error}
      </p>

      <Alert variant="destructive" className="mb-6 max-w-md mx-auto">
        <AlertDescription>
          If this persists, contact support with the error message above.
        </AlertDescription>
      </Alert>

      <div className="flex gap-2 justify-center">
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={onRetry}>
          Try Again
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// HELPERS
// ============================================================================

function getStepNumber(step: InstallStep): number {
  const steps: InstallStep[] = ['check-dependencies', 'configuration', 'preview', 'installing', 'complete'];
  return steps.indexOf(step) + 1;
}

function getTotalSteps(addon: AddOnDefinition): number {
  return addon.configRequired ? 4 : 3;
}

function getProgressPercentage(step: InstallStep, addon: AddOnDefinition): number {
  const steps = addon.configRequired 
    ? ['check-dependencies', 'configuration', 'preview', 'installing', 'complete']
    : ['check-dependencies', 'preview', 'installing', 'complete'];
  
  const index = steps.indexOf(step);
  if (index === -1) return 0;
  return ((index + 1) / steps.length) * 100;
}
