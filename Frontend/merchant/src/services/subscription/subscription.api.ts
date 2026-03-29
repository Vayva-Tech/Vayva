/**
 * Subscription & Billing API Client
 */

import { apiClient } from '@/lib/api-client';
import type {
  Subscription,
  SubscriptionFeatures,
  UsageMetrics,
  CheckoutSession,
  PortalSession,
  CreateCheckoutParams,
  CreatePortalParams,
  UpgradePlanParams,
  SubscriptionResponse,
  FeaturesResponse,
  UsageResponse,
  CheckoutResponse,
  PortalResponse,
} from './subscription.types';

const BASE_PATH = '/api/billing';

/**
 * Get current subscription details
 */
export async function getCurrentSubscription(): Promise<Subscription | null> {
  try {
    const response = await apiClient.get<SubscriptionResponse>(`${BASE_PATH}/current`);
    
    if (!response.success) {
      console.error('Failed to fetch subscription:', response.error);
      return null;
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return null;
  }
}

/**
 * Get available features for current subscription
 */
export async function getAvailableFeatures(): Promise<SubscriptionFeatures | null> {
  try {
    const response = await apiClient.get<FeaturesResponse>(`${BASE_PATH}/features`);
    
    if (!response.success) {
      console.error('Failed to fetch features:', response.error);
      return null;
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error fetching features:', error);
    return null;
  }
}

/**
 * Get current usage metrics
 */
export async function getUsageMetrics(): Promise<UsageMetrics | null> {
  try {
    const response = await apiClient.get<UsageResponse>(`${BASE_PATH}/usage`);
    
    if (!response.success) {
      console.error('Failed to fetch usage:', response.error);
      return null;
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error fetching usage:', error);
    return null;
  }
}

/**
 * Create Stripe checkout session
 */
export async function createCheckoutSession(
  params: CreateCheckoutParams
): Promise<CheckoutSession | null> {
  try {
    const response = await apiClient.post<CheckoutResponse>(
      `${BASE_PATH}/create-checkout`,
      params
    );
    
    if (!response.success) {
      console.error('Failed to create checkout session:', response.error);
      return null;
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return null;
  }
}

/**
 * Create Stripe billing portal session
 */
export async function createPortalSession(
  params: CreatePortalParams
): Promise<PortalSession | null> {
  try {
    const response = await apiClient.post<PortalResponse>(
      `${BASE_PATH}/create-portal`,
      params
    );
    
    if (!response.success) {
      console.error('Failed to create portal session:', response.error);
      return null;
    }
    
    return response.data || null;
  } catch (error) {
    console.error('Error creating portal session:', error);
    return null;
  }
}

/**
 * Upgrade plan immediately
 */
export async function upgradePlan(params: UpgradePlanParams): Promise<boolean> {
  try {
    const response = await apiClient.post<SubscriptionResponse>(
      `${BASE_PATH}/upgrade`,
      params
    );
    
    return response.success;
  } catch (error) {
    console.error('Error upgrading plan:', error);
    return false;
  }
}

/**
 * Cancel subscription at period end
 */
export async function cancelSubscription(params: { cancellationReason?: string }): Promise<boolean> {
  try {
    const response = await apiClient.post<SubscriptionResponse>(
      `${BASE_PATH}/cancel`,
      params
    );
    
    return response.success;
  } catch (error) {
    console.error('Error canceling subscription:', error);
    return false;
  }
}

/**
 * Check if a specific feature is available
 */
export async function checkFeatureAccess(featureKey: string): Promise<{ hasAccess: boolean }> {
  try {
    const features = await getAvailableFeatures();
    
    if (!features) {
      return { hasAccess: false };
    }
    
    const hasAccess = features.features.includes(featureKey);
    return { hasAccess };
  } catch (error) {
    console.error('Error checking feature access:', error);
    return { hasAccess: false };
  }
}
