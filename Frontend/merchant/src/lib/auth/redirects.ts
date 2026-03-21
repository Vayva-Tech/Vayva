import { OnboardingStatus } from "@vayva/shared/types";
/**
 * Determines the correct redirect path based on user and merchant state.
 *
 * Priority:
 * 1. Email Verification (User.isEmailVerified)
 * 2. Onboarding Completion (Merchant.onboardingStatus)
 * 3. Dashboard
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getAuthRedirect = (user: any, merchant: { onboardingStatus?: string; onboardingCompleted?: boolean } | null | undefined) => {
    // 1. Email Verification
    const emailVerified = user?.isEmailVerified ?? user?.emailVerified ?? false;
    if (!emailVerified) {
        return `/verify?email=${encodeURIComponent(user.email)}`;
    }
    // 2. Onboarding Status
    // If no merchant context exists, they likely haven't created a store or are in a bad state.
    // We send them to onboarding start.
    if (!merchant) {
        return "/onboarding";
    }
    const { onboardingStatus, onboardingCompleted } = merchant;
    // 3. Complete -> Dashboard (check both status and completed flag)
    if (onboardingStatus === OnboardingStatus.COMPLETE || onboardingCompleted === true) {
        return "/dashboard";
    }
    // 4. Incomplete -> Onboarding
    return "/onboarding";
};
