import { OnboardingStatus } from "@vayva/shared/types";

export const COOKIE_NAME =
  process.env.NODE_ENV === "production"
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

/**
 * Determines the correct redirect path based on user and merchant state.
 * This is a shared utility safe for both client and server components.
 */
export const getAuthRedirect = (
  user: { email: string; emailVerified?: boolean; isEmailVerified?: boolean },
  merchant?: {
    onboardingStatus?: string;
    onboardingCompleted?: boolean;
  } | null,
) => {
  // 1. Email Verification
  const emailVerified = user?.isEmailVerified ?? user?.emailVerified ?? false;
  if (!emailVerified) {
    return `/verify?email=${encodeURIComponent(user.email)}`;
  }

  // 2. Onboarding Status
  if (!merchant) {
    return "/onboarding";
  }

  const { onboardingStatus, onboardingCompleted } = merchant;

  // 3. Complete -> Dashboard (check both status and completed flag)
  if (
    onboardingStatus === OnboardingStatus.COMPLETE ||
    onboardingCompleted === true
  ) {
    return "/dashboard";
  }

  // 4. Incomplete -> Onboarding
  return "/onboarding";
};
