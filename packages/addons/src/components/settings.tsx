'use client';

/**
 * Add-on Settings Management UI Components
 * 
 * Provides merchant-facing UI for:
 * - AddOnSettingsPanel: Main settings interface
 * - AddOnConfigForm: Dynamic configuration form based on schema
 * - AddOnFeatureToggles: Enable/disable add-on features
 * - AddOnMountPointManager: Configure mount point settings
 * - AddOnCustomizer: CSS/JS customization interface
 * - AddOnStatusCard: Status display and actions
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings,
  Power,
  Trash2,
  RefreshCw,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronRight,
  Code,
  Palette,
  Layers,
  MoreVertical,
  ExternalLink,
  RotateCcw,
  Save,
  X,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AddOnConfig {
  [key: string]: any;
}

interface ConfigSchema {
  type: 'object';
  properties: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'array' | 'select';
      title: string;
      description?: string;
      default?: any;
      options?: { label: string; value: string }[];
      required?: boolean;
    };
  };
  required?: string[];
}

interface MountPoint {
  id: string;
  name: string;
  description: string;
  location: string;
  enabled: boolean;
  priority?: number;
  settings?: Record<string, any>;
}

interface AddOnSettingsData {
  id: string;
  name: string;
  status: 'ACTIVE' | 'INACTIVE' | 'INSTALLING' | 'ERROR' | 'UPDATE_PENDING';
  installedVersion: string;
  latestVersion: string;
  updateAvailable: boolean;
  config: AddOnConfig;
  enabledFeatures: string[];
  customCSS?: string;
  customJS?: string;
  mountPoints: MountPoint[];
  mountPointConfig: Record<string, any>;
  configSchema?: ConfigSchema;
  availableFeatures: { id: string; name: string; description: string; default: boolean }[];
  lastError?: string;
}

// ============================================================================
// ADD-ON SETTINGS PANEL (Main Container)
// ============================================================================

interface AddOnSettingsPanelProps {
  addOn: AddOnSettingsData;
  onSave: (data: Partial<AddOnSettingsData>) => Promise<void>;
  onUninstall: () => Promise<void>;
  onUpdate: () => Promise<void>;
  onToggleStatus: () => Promise<void>;
  onReset: () => Promise<void>;
  className?: string;
}

export function AddOnSettingsPanel({
  addOn,
  onSave,
  onUninstall,
  onUpdate,
  onToggleStatus,
  onReset,
  className
}: AddOnSettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'features' | 'mount' | 'customize'>('general');
  const [isSaving, setIsSaving] = useState(false);
  const [showUninstallConfirm, setShowUninstallConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [localData, setLocalData] = useState(addOn);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        config: localData.config,
        enabledFeatures: localData.enabledFeatures,
        customCSS: localData.customCSS,
        customJS: localData.customJS,
        mountPointConfig: localData.mountPointConfig,
      });
      setHasChanges(false);
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'features', label: 'Features', icon: Layers },
    { id: 'mount', label: 'Mount Points', icon: ExternalLink },
    { id: 'customize', label: 'Customize', icon: Code },
  ];

  const isActive = addOn.status === 'ACTIVE';
  const hasError = addOn.status === 'ERROR';
  const hasUpdate = addOn.updateAvailable;

  return (
    <div className={cn('bg-card rounded-xl border', className)}>
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b">
        <div className="flex items-start gap-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            isActive ? 'bg-green-100' : 'bg-muted'
          )}>
            {isActive ? (
              <Check className="w-6 h-6 text-green-600" />
            ) : hasError ? (
              <AlertCircle className="w-6 h-6 text-destructive" />
            ) : (
              <Power className="w-6 h-6 text-muted-foreground" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{addOn.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-sm">
              <span className={cn(
                'px-2 py-0.5 rounded-full',
                isActive ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
              )}>
                {isActive ? 'Active' : hasError ? 'Error' : 'Inactive'}
              </span>
              <span className="text-muted-foreground">
                Version {addOn.installedVersion}
              </span>
              {hasUpdate && (
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  Update available
                </span>
              )}
            </div>
            {addOn.lastError && (
              <p className="text-sm text-destructive mt-2 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                {addOn.lastError}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors flex items-center gap-2"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save Changes
            </button>
          )}

          <div className="relative group">
            <button className="p-2 hover:bg-accent rounded-lg transition-colors">
              <MoreVertical className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-background rounded-xl shadow-xl border py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={onToggleStatus}
                className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
              >
                <Power className="w-4 h-4" />
                {isActive ? 'Disable' : 'Enable'}
              </button>
              {hasUpdate && (
                <button
                  onClick={onUpdate}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Update to v{addOn.latestVersion}
                </button>
              )}
              <button
                onClick={() => setShowResetConfirm(true)}
                className="w-full px-4 py-2 text-left text-sm hover:bg-accent flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to Default
              </button>
              <hr className="my-1" />
              <button
                onClick={() => setShowUninstallConfirm(true)}
                className="w-full px-4 py-2 text-left text-sm text-destructive hover:bg-destructive/10 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Uninstall
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b bg-muted/30">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {activeTab === 'general' && (
              <AddOnConfigForm
                schema={addOn.configSchema}
                data={localData.config}
                onChange={(config) => {
                  setLocalData(prev => ({ ...prev, config }));
                  setHasChanges(true);
                }}
              />
            )}

            {activeTab === 'features' && (
              <AddOnFeatureToggles
                features={addOn.availableFeatures}
                enabledFeatures={localData.enabledFeatures}
                onChange={(enabledFeatures) => {
                  setLocalData(prev => ({ ...prev, enabledFeatures }));
                  setHasChanges(true);
                }}
              />
            )}

            {activeTab === 'mount' && (
              <AddOnMountPointManager
                mountPoints={localData.mountPoints}
                config={localData.mountPointConfig}
                onChange={(mountPoints, config) => {
                  setLocalData(prev => ({ 
                    ...prev, 
                    mountPoints,
                    mountPointConfig: config 
                  }));
                  setHasChanges(true);
                }}
              />
            )}

            {activeTab === 'customize' && (
              <AddOnCustomizer
                customCSS={localData.customCSS || ''}
                customJS={localData.customJS || ''}
                onChange={(customCSS, customJS) => {
                  setLocalData(prev => ({ ...prev, customCSS, customJS }));
                  setHasChanges(true);
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Uninstall Confirmation */}
      {showUninstallConfirm && (
        <ConfirmationModal
          title="Uninstall Add-on"
          message={`Are you sure you want to uninstall ${addOn.name}? This will remove all add-on functionality from your store.`}
          confirmText="Uninstall"
          confirmVariant="destructive"
          onConfirm={() => {
            onUninstall();
            setShowUninstallConfirm(false);
          }}
          onCancel={() => setShowUninstallConfirm(false)}
        />
      )}

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <ConfirmationModal
          title="Reset to Default"
          message="This will reset all settings to their default values. Your customizations will be lost."
          confirmText="Reset"
          onConfirm={() => {
            onReset();
            setShowResetConfirm(false);
          }}
          onCancel={() => setShowResetConfirm(false)}
        />
      )}
    </div>
  );
}

// ============================================================================
// ADD-ON CONFIG FORM
// ============================================================================

interface AddOnConfigFormProps {
  schema?: ConfigSchema;
  data: AddOnConfig;
  onChange: (data: AddOnConfig) => void;
  className?: string;
}

export function AddOnConfigForm({ schema, data, onChange, className }: AddOnConfigFormProps) {
  if (!schema) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No configurable options for this add-on.</p>
      </div>
    );
  }

  const handleChange = (key: string, value: any) => {
    onChange({ ...data, [key]: value });
  };

  const renderField = (key: string, field: ConfigSchema['properties'][string]) => {
    const value = data[key] ?? field.default;

    switch (field.type) {
      case 'string':
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            placeholder={field.description}
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(key, parseFloat(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
          />
        );

      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => handleChange(key, e.target.checked)}
              className="w-5 h-5 rounded border-input"
            />
            <span className="text-sm text-muted-foreground">{field.description}</span>
          </label>
        );

      case 'select':
        return (
          <select
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-background"
          >
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {Object.entries(schema.properties).map(([key, field]) => (
        <div key={key}>
          <label className="block text-sm font-medium mb-2">
            {field.title}
            {schema.required?.includes(key) && (
              <span className="text-destructive ml-1">*</span>
            )}
          </label>
          {renderField(key, field)}
          {field.description && field.type !== 'boolean' && (
            <p className="text-sm text-muted-foreground mt-1">{field.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ADD-ON FEATURE TOGGLES
// ============================================================================

interface AddOnFeatureTogglesProps {
  features: { id: string; name: string; description: string; default: boolean }[];
  enabledFeatures: string[];
  onChange: (enabled: string[]) => void;
  className?: string;
}

export function AddOnFeatureToggles({
  features,
  enabledFeatures,
  onChange,
  className
}: AddOnFeatureTogglesProps) {
  const toggleFeature = (featureId: string) => {
    const newEnabled = enabledFeatures.includes(featureId)
      ? enabledFeatures.filter(id => id !== featureId)
      : [...enabledFeatures, featureId];
    onChange(newEnabled);
  };

  if (features.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">No features to configure for this add-on.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {features.map((feature) => {
        const isEnabled = enabledFeatures.includes(feature.id);
        return (
          <div
            key={feature.id}
            className={cn(
              'flex items-start gap-4 p-4 border rounded-xl transition-colors',
              isEnabled ? 'border-primary bg-primary/5' : 'hover:bg-accent'
            )}
          >
            <label className="flex items-start gap-3 flex-1 cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={() => toggleFeature(feature.id)}
                className="mt-1 w-5 h-5 rounded border-input"
              />
              <div>
                <p className="font-medium">{feature.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {feature.description}
                </p>
              </div>
            </label>
          </div>
        );
      })}
    </div>
  );
}

// ============================================================================
// ADD-ON MOUNT POINT MANAGER
// ============================================================================

interface AddOnMountPointManagerProps {
  mountPoints: MountPoint[];
  config: Record<string, any>;
  onChange: (mountPoints: MountPoint[], config: Record<string, any>) => void;
  className?: string;
}

export function AddOnMountPointManager({
  mountPoints,
  config,
  onChange,
  className
}: AddOnMountPointManagerProps) {
  const toggleMountPoint = (id: string) => {
    const updated = mountPoints.map(mp =>
      mp.id === id ? { ...mp, enabled: !mp.enabled } : mp
    );
    onChange(updated, config);
  };

  if (mountPoints.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <ExternalLink className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">This add-on has no configurable mount points.</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {mountPoints.map((mp) => (
        <div
          key={mp.id}
          className={cn(
            'border rounded-xl overflow-hidden transition-colors',
            mp.enabled ? 'border-primary' : 'border-input'
          )}
        >
          <div
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-accent/50"
            onClick={() => toggleMountPoint(mp.id)}
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                mp.enabled ? 'bg-primary/10' : 'bg-muted'
              )}>
                <ExternalLink className={cn(
                  'w-5 h-5',
                  mp.enabled ? 'text-primary' : 'text-muted-foreground'
                )} />
              </div>
              <div>
                <p className="font-medium">{mp.name}</p>
                <p className="text-sm text-muted-foreground">{mp.location}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={cn(
                'text-sm',
                mp.enabled ? 'text-green-600' : 'text-muted-foreground'
              )}>
                {mp.enabled ? 'Enabled' : 'Disabled'}
              </span>
              <div className={cn(
                'w-11 h-6 rounded-full transition-colors relative',
                mp.enabled ? 'bg-primary' : 'bg-muted'
              )}>
                <div className={cn(
                  'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
                  mp.enabled ? 'left-6' : 'left-1'
                )} />
              </div>
            </div>
          </div>

          {mp.enabled && mp.settings && (
            <div className="px-4 pb-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium mb-3">Mount Point Settings</p>
                {/* Render mount point specific settings */}
                <div className="space-y-3">
                  {Object.entries(mp.settings).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground capitalize">
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// ADD-ON CUSTOMIZER (CSS/JS)
// ============================================================================

interface AddOnCustomizerProps {
  customCSS: string;
  customJS: string;
  onChange: (css: string, js: string) => void;
  className?: string;
}

export function AddOnCustomizer({ customCSS, customJS, onChange, className }: AddOnCustomizerProps) {
  const [activeEditor, setActiveEditor] = useState<'css' | 'js'>('css');

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
        <button
          onClick={() => setActiveEditor('css')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeEditor === 'css'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Palette className="w-4 h-4" />
          Custom CSS
        </button>
        <button
          onClick={() => setActiveEditor('js')}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors',
            activeEditor === 'js'
              ? 'bg-background shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Code className="w-4 h-4" />
          Custom JavaScript
        </button>
      </div>

      <div className="relative">
        {activeEditor === 'css' ? (
          <textarea
            value={customCSS}
            onChange={(e) => onChange(e.target.value, customJS)}
            placeholder="/* Add your custom CSS here */\n\n.my-addon {\n  color: #333;\n}"
            className="w-full h-80 font-mono text-sm p-4 border rounded-xl bg-muted/30 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            spellCheck={false}
          />
        ) : (
          <textarea
            value={customJS}
            onChange={(e) => onChange(customCSS, e.target.value)}
            placeholder="// Add your custom JavaScript here\n\nconsole.log('Add-on initialized');"
            className="w-full h-80 font-mono text-sm p-4 border rounded-xl bg-muted/30 resize-none focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
            spellCheck={false}
          />
        )}
      </div>

      <div className="flex items-start gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-amber-800">
          Custom code runs on your storefront. Test thoroughly before deploying to production.
          Invalid code may affect your store&apos;s functionality.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// CONFIRMATION MODAL
// ============================================================================

interface ConfirmationModalProps {
  title: string;
  message: string;
  confirmText: string;
  confirmVariant?: 'default' | 'destructive';
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmationModal({
  title,
  message,
  confirmText,
  confirmVariant = 'default',
  onConfirm,
  onCancel
}: ConfirmationModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-background rounded-xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-accent transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              confirmVariant === 'destructive'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// ADD-ON STATUS CARD (Compact View)
// ============================================================================

interface AddOnStatusCardProps {
  addOn: AddOnSettingsData;
  onConfigure: () => void;
  onToggle: () => void;
  className?: string;
}

export function AddOnStatusCard({ addOn, onConfigure, onToggle, className }: AddOnStatusCardProps) {
  const isActive = addOn.status === 'ACTIVE';
  const hasUpdate = addOn.updateAvailable;

  return (
    <div className={cn('flex items-center gap-4 p-4 border rounded-xl', className)}>
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center',
        isActive ? 'bg-green-100' : 'bg-muted'
      )}>
        {isActive ? (
          <Check className="w-5 h-5 text-green-600" />
        ) : (
          <Power className="w-5 h-5 text-muted-foreground" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{addOn.name}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className={cn(
            'text-muted-foreground',
            isActive ? 'text-green-600' : 'text-muted-foreground'
          )}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          {hasUpdate && (
            <span className="text-blue-600">• Update available</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onConfigure}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
        <button
          onClick={onToggle}
          className={cn(
            'w-10 h-6 rounded-full transition-colors relative',
            isActive ? 'bg-primary' : 'bg-muted'
          )}
        >
          <div className={cn(
            'absolute top-1 w-4 h-4 rounded-full bg-white transition-all',
            isActive ? 'left-5' : 'left-1'
          )} />
        </button>
      </div>
    </div>
  );
}
