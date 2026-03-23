// @ts-nocheck
/**
 * Advanced Personalization Engine
 * AI-driven adaptive experiences for individual merchants
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain,
  Target,
  TrendUp,
  UserFocus,
  Sparkle,
  Lightbulb,
  Rocket,
  ChartLine,
  Users,
  ShoppingCart,
  Clock,
  MagicWand
} from '@phosphor-icons/react';
import useSWR from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { IndustrySlug } from '@/lib/templates/types';
import { getIndustryOptimization } from '@/lib/industry-optimizations';

// Types
interface UserBehavior {
  userId: string;
  industry: IndustrySlug;
  planTier: string;
  usagePatterns: {
    peakHours: number[];
    favoriteFeatures: string[];
    interactionFrequency: 'high' | 'medium' | 'low';
    preferredTimeframe: 'realtime' | 'daily' | 'weekly';
  };
  performanceMetrics: {
    avgSessionDuration: number;
    featureAdoption: number;
    goalCompletion: number;
  };
  learningStyle: 'visual' | 'analytical' | 'hands-on' | 'collaborative';
}

interface PersonalizationProfile {
  userId: string;
  persona: 'operator' | 'analyst' | 'strategist' | 'entrepreneur';
  preferences: {
    dashboardLayout: 'compact' | 'expanded' | 'focused';
    dataDensity: 'minimal' | 'standard' | 'detailed';
    notificationStyle: 'essential' | 'comprehensive' | 'realtime';
    insightDepth: 'surface' | 'moderate' | 'deep';
  };
  adaptiveFeatures: {
    autoRefresh: boolean;
    predictiveWidgets: boolean;
    smartDefaults: boolean;
    contextualHelp: boolean;
  };
  aiAssistance: {
    recommendationIntensity: 'conservative' | 'balanced' | 'aggressive';
    automationLevel: 'manual' | 'assisted' | 'automatic';
    insightTiming: 'reactive' | 'proactive' | 'predictive';
  };
}

interface AdaptiveRecommendation {
  id: string;
  type: 'feature' | 'workflow' | 'insight' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  confidence: number;
  estimatedImpact: number;
  cta: string;
  relatedFeatures: string[];
  timing: 'now' | 'soon' | 'later';
}

interface PersonalizationEngine {
  userProfile: UserBehavior;
  personalizationProfile: PersonalizationProfile;
  recommendations: AdaptiveRecommendation[];
  adaptationScore: number; // 0-100
}

// Main Personalization Engine Hook
export function usePersonalizationEngine(industry: IndustrySlug) {
  const { store } = useStore();
  const [engine, setEngine] = useState<PersonalizationEngine | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user behavior data
  const { data: behaviorData } = useSWR<UserBehavior>(
    `/api/personalization/user-behavior/${store?.id}`,
    async (url: string) => {
      try {
        const response = await apiJson<UserBehavior>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch user behavior:', error);
        return null;
      }
    }
  );

  // Fetch personalization profile
  const { data: profileData } = useSWR<PersonalizationProfile>(
    `/api/personalization/profile/${store?.id}`,
    async (url: string) => {
      try {
        const response = await apiJson<PersonalizationProfile>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch personalization profile:', error);
        return null;
      }
    }
  );

  // Fetch adaptive recommendations
  const { data: recommendationsData } = useSWR<AdaptiveRecommendation[]>(
    `/api/personalization/recommendations/${store?.id}?industry=${industry}`,
    async (url: string) => {
      try {
        const response = await apiJson<{ recommendations: AdaptiveRecommendation[] }>(url);
        return response.recommendations || [];
      } catch (error) {
        console.error('Failed to fetch recommendations:', error);
        return [];
      }
    }
  );

  // Initialize personalization engine
  useEffect(() => {
    if (behaviorData && profileData) {
      const adaptationScore = calculateAdaptationScore(behaviorData, profileData);
      setEngine({
        userProfile: behaviorData,
        personalizationProfile: profileData,
        recommendations: recommendationsData || [],
        adaptationScore
      });
      setIsLoading(false);
    }
  }, [behaviorData, profileData, recommendationsData]);

  // Calculate how well the system adapts to the user
  const calculateAdaptationScore = useCallback((
    behavior: UserBehavior, 
    profile: PersonalizationProfile
  ): number => {
    let score = 50; // Base score
    
    // Usage pattern alignment (+20 points)
    if (behavior.usagePatterns.interactionFrequency === 'high') {
      score += profile.preferences.dashboardLayout === 'expanded' ? 10 : 5;
    } else if (behavior.usagePatterns.interactionFrequency === 'low') {
      score += profile.preferences.dashboardLayout === 'compact' ? 10 : 5;
    }
    
    // Learning style match (+15 points)
    if (behavior.learningStyle === 'visual' && profile.preferences.dataDensity === 'standard') {
      score += 15;
    } else if (behavior.learningStyle === 'analytical' && profile.preferences.dataDensity === 'detailed') {
      score += 15;
    }
    
    // Feature adoption correlation (+15 points)
    const adoptedFeatures = behavior.usagePatterns.favoriteFeatures.length;
    score += Math.min(15, adoptedFeatures * 3);
    
    return Math.min(100, score);
  }, []);

  return {
    engine,
    isLoading,
    adaptationScore: engine?.adaptationScore || 0,
    refreshRecommendations: () => {} // Trigger refetch
  };
}

// Personalization Dashboard Component
export default function PersonalizationDashboard({ industry }: { industry: IndustrySlug }) {
  const { store } = useStore();
  const colors = getThemeColors(industry);
  const { engine, isLoading, adaptationScore } = usePersonalizationEngine(industry);

  if (isLoading || !engine) {
    return (
      <div className="space-y-6">
        <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const personaIcons = {
    operator: <UserFocus className="h-6 w-6" />,
    analyst: <ChartLine className="h-6 w-6" />,
    strategist: <Target className="h-6 w-6" />,
    entrepreneur: <Rocket className="h-6 w-6" />
  };

  const getPersonaColor = (persona: string) => {
    switch (persona) {
      case 'operator': return 'bg-blue-100 text-blue-800';
      case 'analyst': return 'bg-green-100 text-green-800';
      case 'strategist': return 'bg-purple-100 text-purple-800';
      case 'entrepreneur': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Personalization Header */}
      <ThemedCard industry={industry}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
              <Brain className="h-8 w-8" style={{ color: colors.primary }} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Personalized Experience</h2>
              <p className="text-gray-500">
                AI-adapted dashboard for your {getIndustryOptimization(industry).displayName} business
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <Sparkle className="h-5 w-5 text-yellow-500" />
              <span className="text-2xl font-bold">{adaptationScore}%</span>
            </div>
            <p className="text-sm text-gray-500">Adaptation Score</p>
          </div>
        </div>
      </ThemedCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Persona Card */}
        <ThemedCard industry={industry}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            {personaIcons[engine.personalizationProfile.persona]}
            Your Persona
          </h3>
          <div className="text-center">
            <span className={`px-3 py-2 rounded-full text-sm font-medium ${getPersonaColor(engine.personalizationProfile.persona)}`}>
              {engine.personalizationProfile.persona.charAt(0).toUpperCase() + engine.personalizationProfile.persona.slice(1)}
            </span>
            <p className="mt-3 text-sm text-gray-500">
              {getPersonaDescription(engine.personalizationProfile.persona)}
            </p>
          </div>
        </ThemedCard>

        {/* Adaptation Insights */}
        <ThemedCard industry={industry}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendUp className="h-5 w-5" />
            Adaptation Insights
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm">Layout Preference</span>
              <span className="text-sm font-medium capitalize">
                {engine.personalizationProfile.preferences.dashboardLayout}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Data Density</span>
              <span className="text-sm font-medium capitalize">
                {engine.personalizationProfile.preferences.dataDensity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">AI Assistance</span>
              <span className="text-sm font-medium capitalize">
                {engine.personalizationProfile.aiAssistance.automationLevel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Learning Style</span>
              <span className="text-sm font-medium capitalize">
                {engine.userProfile.learningStyle}
              </span>
            </div>
          </div>
        </ThemedCard>

        {/* Quick Actions */}
        <ThemedCard industry={industry}>
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <MagicWand className="h-5 w-5" />
            Smart Suggestions
          </h3>
          <div className="space-y-3">
            <button className="w-full text-left p-3 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">Optimize Layout</span>
                <span className="text-xs text-gray-500">Recommended</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Based on your usage patterns
              </p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">Enable Predictive Widgets</span>
                <span className="text-xs text-gray-500">Try Now</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Get ahead with AI predictions
              </p>
            </button>
            <button className="w-full text-left p-3 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between">
                <span className="font-medium">Adjust Notification Settings</span>
                <span className="text-xs text-gray-500">Customize</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Match your preferred timing
              </p>
            </button>
          </div>
        </ThemedCard>
      </div>

      {/* Adaptive Recommendations */}
      <ThemedCard industry={industry}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Personalized Recommendations
          </h3>
          <span className="text-sm text-gray-500">
            {engine.recommendations.length} suggestions
          </span>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {engine.recommendations.map((rec: AdaptiveRecommendation, index: number) => (
            <motion.div
              key={rec.id}
              className="p-4 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-medium">{rec.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">{rec.description}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                  rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {rec.priority}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <span className="flex items-center gap-1">
                    <Sparkle className="h-4 w-4 text-yellow-500" />
                    {rec.confidence}% confidence
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendUp className="h-4 w-4 text-green-500" />
                    +{rec.estimatedImpact}% impact
                  </span>
                </div>
                <button className="px-3 py-1 text-sm bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity">
                  {rec.cta}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </ThemedCard>
    </div>
  );
}

// Helper function for persona descriptions
function getPersonaDescription(persona: string): string {
  switch (persona) {
    case 'operator':
      return 'Focused on daily operations and execution. Prefers streamlined workflows and clear action items.';
    case 'analyst':
      return 'Data-driven decision maker who values detailed metrics and comprehensive reporting.';
    case 'strategist':
      return 'Big-picture thinker focused on growth opportunities and long-term planning.';
    case 'entrepreneur':
      return 'Visionary leader who wants quick insights and scalable solutions for rapid growth.';
    default:
      return 'General business user with balanced needs across all areas.';
  }
}