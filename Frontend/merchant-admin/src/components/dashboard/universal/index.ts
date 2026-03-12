// Universal Dashboard Components Index
// Export all universal dashboard components for easy importing

export { UniversalMetricCard } from './UniversalMetricCard';
export type { UniversalMetricCardProps } from './UniversalMetricCard';

export { UniversalSectionHeader } from './UniversalSectionHeader';
export type { UniversalSectionHeaderProps } from './UniversalSectionHeader';

export { UniversalTaskItem } from './UniversalTaskItem';
export type { UniversalTaskItemProps } from './UniversalTaskItem';

export { UniversalChartContainer, useChartData, ChartEmptyStates } from './UniversalChartContainer';
export type { UniversalChartContainerProps } from './UniversalChartContainer';

// Industry-specific sections
export { 
  PrimaryObjectHealth, 
  LiveOperations, 
  AlertsList, 
  SuggestedActionsList 
} from './IndustrySections';

export type { 
  ProductHealthItem, 
  PrimaryObjectHealthProps,
  LiveOpsItem, 
  LiveOperationsProps,
  AlertsListProps,
  SuggestedActionsListProps
} from './IndustrySections';

// Re-export utility types
export type { DesignCategory } from '@/components/vayva-ui/VayvaThemeProvider';