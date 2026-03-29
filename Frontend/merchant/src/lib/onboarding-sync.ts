import { logger } from '@vayva/shared';

const BACKEND_URL = process.env.BACKEND_API_URL || '';

interface OnboardingState {
  schemaVersion?: number;
  industrySlug?: string;
  kycStatus?: string;
  business?: {
    slug?: string;
    name?: string;
    storeName?: string;
    category?: string;
    state?: string;
    city?: string;
    legalName?: string;
    email?: string;
    registeredAddress?: {
      addressLine1?: string;
      addressLine2?: string;
      city?: string;
      state?: string;
      landmark?: string;
    };
  };
  storeDetails?: {
    slug?: string;
    domainPreference?: string;
    publishStatus?: string;
  };
  finance?: {
    currency?: string;
    payoutScheduleAcknowledged?: boolean;
    bankName?: string;
    accountNumber?: string;
    accountName?: string;
    bankCode?: string;
  };
  whatsapp?: { number?: string };
  identity?: { phone?: string };
  logistics?: {
    deliveryMode?: string;
    pickupAddress?: string;
  };
}

interface OnboardingProgress {
  completedSteps: string[];
  pendingSteps: string[];
  percentComplete: number;
}

interface SlugAvailabilityResult {
  available: boolean;
}

/**
 * Sync onboarding data by calling backend API
 */
export async function syncOnboardingData(storeId: string, state: OnboardingState): Promise<void> {
  if (!storeId || !state) {
    return;
  }

  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/onboarding/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(state),
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({ error: { message: 'Failed to sync onboarding data' } }));
      logger.error('[OnboardingSync] Failed to sync data', error);
      throw new Error(error.error?.message || 'Failed to sync onboarding data');
    }

    const data = await res.json();
    logger.info('[OnboardingSync] Data synced successfully', { success: data.success });
  } catch (error) {
    logger.error('[OnboardingSync] Error syncing data', error);
    throw error;
  }
}

/**
 * Get current onboarding status
 */
export async function getOnboardingStatus(storeId: string): Promise<{
  store: Record<string, unknown> | null;
  profile: Record<string, unknown> | null;
  kyc: Record<string, unknown> | null;
}> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/onboarding/status`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch onboarding status');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    logger.error('[OnboardingSync] Error fetching status', error);
    throw error;
  }
}

/**
 * Get onboarding progress percentage
 */
export async function getOnboardingProgress(storeId: string): Promise<OnboardingProgress> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/onboarding/progress`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch onboarding progress');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    logger.error('[OnboardingSync] Error fetching progress', error);
    throw error;
  }
}

/**
 * Check if a store slug is available
 */
export async function checkSlugAvailability(slug: string): Promise<SlugAvailabilityResult> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/onboarding/check-slug`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ slug }),
    });

    if (!res.ok) {
      throw new Error('Failed to check slug availability');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    logger.error('[OnboardingSync] Error checking slug availability', error);
    throw error;
  }
}

/**
 * Update onboarding step completion
 */
export async function updateOnboardingStep(
  storeId: string,
  step: string,
  completed: boolean,
  data?: Record<string, unknown>
): Promise<boolean> {
  try {
    const token = await getAuthToken();
    const res = await fetch(`${BACKEND_URL}/api/v1/onboarding/step`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ step, completed, data }),
    });

    if (!res.ok) {
      throw new Error('Failed to update onboarding step');
    }

    const result = await res.json();
    return result.success;
  } catch (error) {
    logger.error('[OnboardingSync] Error updating step', error);
    return false;
  }
}

/**
 * Get auth token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
  } catch {
    return null;
  }
}
