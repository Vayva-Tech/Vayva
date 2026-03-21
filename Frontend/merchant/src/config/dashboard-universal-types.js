// ============================================================================
// DASHBOARD UNIVERSAL TYPE DEFINITIONS
// ============================================================================
// Shared types for the unified dashboard system
// ============================================================================
// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const DASHBOARD_VARIANTS = ['basic', 'standard', 'advanced', 'pro'];
export const PLAN_TIER_FEATURES = {
    basic: {
        name: 'basic',
        features: {
            maxMetrics: 4,
            maxSections: 3,
            chartTypes: ['bar'],
            alertTypes: ['info'],
            exportFormats: ['csv'],
            customSections: false,
            advancedAnalytics: false,
            aiInsights: false,
            customBranding: false
        },
        limits: {
            dataRetentionDays: 30,
            apiRequestsPerHour: 100,
            teamMembers: 1
        }
    },
    standard: {
        name: 'standard',
        features: {
            maxMetrics: 8,
            maxSections: 6,
            chartTypes: ['bar', 'line', 'pie'],
            alertTypes: ['info', 'warning'],
            exportFormats: ['csv', 'pdf'],
            customSections: false,
            advancedAnalytics: false,
            aiInsights: false,
            customBranding: false
        },
        limits: {
            dataRetentionDays: 90,
            apiRequestsPerHour: 500,
            teamMembers: 3
        }
    },
    advanced: {
        name: 'advanced',
        features: {
            maxMetrics: 12,
            maxSections: 10,
            chartTypes: ['bar', 'line', 'area', 'pie', 'radar'],
            alertTypes: ['info', 'warning', 'critical'],
            exportFormats: ['csv', 'pdf', 'excel'],
            customSections: true,
            advancedAnalytics: true,
            aiInsights: false,
            customBranding: true
        },
        limits: {
            dataRetentionDays: 365,
            apiRequestsPerHour: 2000,
            teamMembers: 10
        }
    },
    pro: {
        name: 'pro',
        features: {
            maxMetrics: 20,
            maxSections: 15,
            chartTypes: ['bar', 'line', 'area', 'pie', 'radar', 'scatter', 'heatmap'],
            alertTypes: ['info', 'warning', 'critical'],
            exportFormats: ['csv', 'pdf', 'excel', 'json'],
            customSections: true,
            advancedAnalytics: true,
            aiInsights: true,
            customBranding: true
        },
        limits: {
            dataRetentionDays: 730,
            apiRequestsPerHour: 10000,
            teamMembers: 50
        }
    }
};
