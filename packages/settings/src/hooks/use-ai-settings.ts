import { useSettings } from './use-settings';
import type { AISettings, AIPersonality, AutomationLevel } from '../index.simplified';

/**
 * React Hook: useAISettings
 * 
 * Specialized hook for AI-specific settings.
 */

export function useAISettings() {
  const { ai, updateAISettings, saveAllSettings } = useSettings();

  // Personality management
  const updatePersonality = async (updates: Partial<AIPersonality>) => {
    await updateAISettings({ personality: { ...ai.personality, ...updates } });
  };

  const setAITone = async (tone: AIPersonality['tone']) => {
    await updatePersonality({ tone });
  };

  const setProactivity = async (proactivity: AIPersonality['proactivity']) => {
    await updatePersonality({ proactivity });
  };

  // Automation management
  const updateAutomation = async (updates: Partial<AutomationLevel>) => {
    await updateAISettings({ automation: { ...ai.automation, ...updates } });
  };

  const setAutomationMode = async (mode: AISettings['automation']['mode']) => {
    await updateAutomation({ mode });
  };

  const toggleTaskAutomation = async (task: keyof typeof ai.automation.tasks) => {
    await updateAutomation({
      tasks: { ...ai.automation.tasks, [task]: !ai.automation.tasks[task] },
    });
  };

  // Alert sensitivity
  const setAlertLevel = async (level: AISettings['alerts']['level']) => {
    await updateAISettings({ alerts: { ...ai.alerts, level } });
  };

  const toggleAlertCategory = async (category: string) => {
    const categoryPath = category.split('.') as any;
    const currentValue = (ai.alerts.categories as any)[categoryPath[0]];
    
    if (typeof currentValue === 'boolean') {
      (ai.alerts.categories as any)[categoryPath[0]] = !currentValue;
    } else if (currentValue && typeof currentValue === 'object') {
      (ai.alerts.categories as any)[categoryPath[0]] = {
        ...currentValue,
        [categoryPath[1]]: !(currentValue as any)[categoryPath[1]],
      };
    }

    await updateAISettings({ alerts: { ...ai.alerts } });
  };

  // Data sharing
  const toggleBenchmarking = async () => {
    await updateAISettings({
      dataSharing: {
        ...ai.dataSharing,
        enableBenchmarking: !ai.dataSharing.enableBenchmarking,
      },
    });
  };

  const setDataSharingLevel = async (allowForTraining: boolean) => {
    await updateAISettings({
      dataSharing: {
        ...ai.dataSharing,
        allowDataForModelImprovement: allowForTraining,
      },
    });
  };

  // Action permissions
  const grantPermission = async (action: string) => {
    const currentAction = action as any;
    const autoExecute = ai.actionPermissions.autoExecute.includes(currentAction)
      ? ai.actionPermissions.autoExecute
      : [...ai.actionPermissions.autoExecute, currentAction];

    const requiresApproval = ai.actionPermissions.requiresApproval.filter((a: any) => a !== action);
    const prohibited = ai.actionPermissions.prohibited.filter((a: any) => a !== action);

    await updateAISettings({
      actionPermissions: { ...ai.actionPermissions, autoExecute, requiresApproval, prohibited },
    });
  };

  const revokePermission = async (action: string, moveTo: 'requires_approval' | 'prohibited') => {
    const currentAction = action as any;
    const autoExecute = ai.actionPermissions.autoExecute.filter((a: any) => a !== currentAction);
    
    const requiresApproval = [...ai.actionPermissions.requiresApproval];
    const prohibited = [...ai.actionPermissions.prohibited];

    if (moveTo === 'requires_approval') {
      requiresApproval.push(currentAction);
    } else {
      prohibited.push(currentAction);
    }

    await updateAISettings({
      actionPermissions: { ...ai.actionPermissions, autoExecute, requiresApproval, prohibited },
    });
  };

  // Forecasting
  const setForecastAggressiveness = async (aggressiveness: AISettings['forecasting']['aggressiveness']) => {
    await updateAISettings({
      forecasting: { ...ai.forecasting, aggressiveness },
    });
  };

  // Industry-specific AI
  const updateIndustryAI = async (industry: string, settings: any) => {
    await updateAISettings({
      industry: { ...ai.industry, [industry]: settings },
    });
  };

  // Advanced settings
  const setModelTemperature = async (temperature: number) => {
    await updateAISettings({
      advanced: { ...ai.advanced, temperature: Math.max(0, Math.min(2, temperature)) },
    });
  };

  return {
    // AI settings
    ai,
    
    // Personality
    personality: ai.personality,
    updatePersonality,
    setAITone,
    setProactivity,
    
    // Automation
    automation: ai.automation,
    updateAutomation,
    setAutomationMode,
    toggleTaskAutomation,
    
    // Alerts
    alertLevel: ai.alerts.level,
    alertCategories: ai.alerts.categories,
    setAlertLevel,
    toggleAlertCategory,
    
    // Data Sharing
    dataSharing: ai.dataSharing,
    toggleBenchmarking,
    setDataSharingLevel,
    
    // Permissions
    actionPermissions: ai.actionPermissions,
    grantPermission,
    revokePermission,
    
    // Forecasting
    forecasting: ai.forecasting,
    setForecastAggressiveness,
    
    // Industry AI
    industryAI: ai.industry,
    updateIndustryAI,
    
    // Advanced
    modelTemperature: ai.advanced.temperature,
    setModelTemperature,
    
    // Save
    saveAISettings: saveAllSettings,
  };
}
