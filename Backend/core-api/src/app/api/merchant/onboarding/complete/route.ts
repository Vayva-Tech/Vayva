import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { syncOnboardingData } from "@/lib/onboarding-sync";
import { INDUSTRY_PROFILES } from "@/lib/onboarding-profiles";
import { logger, ErrorCategory } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function normalizeName(name: string | null | undefined) {
  if (!name) return "";
  return name
    .replace(/[^a-zA-Z\s]/g, "")
    .toLowerCase()
    .trim();
}

function accountNameMatchesIdentity(accountName: string, fullName: string) {
  const acc = normalizeName(accountName);
  const tokens = normalizeName(fullName)
    .split(" ")
    .filter((t) => t.length >= 3);
  if (tokens.length === 0) return false;
  return tokens.every((t) => acc.includes(t));
}

export const POST = withVayvaAPI(
  PERMISSIONS.ONBOARDING_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body: Record<string, unknown> = isRecord(parsedBody)
        ? parsedBody
        : {};

      // Validate generic profile
      const industry = getString(body.industry) || "default";
      const profile =
        INDUSTRY_PROFILES[industry as keyof typeof INDUSTRY_PROFILES] ??
        INDUSTRY_PROFILES.default;
      if (!profile) {
        return NextResponse.json(
          { error: "Invalid industry" },
          { status: 400 },
        );
      }

      // ENHANCED VALIDATION: Real Bank Verification
      const state = body; // Assuming body matches full state structure partially

      const identity = isRecord(state.identity) ? state.identity : undefined;
      const finance = isRecord(state.finance)
        ? state.finance
        : (undefined as Record<string, unknown> | undefined);

      // CRITICAL: Verify payout name matches identity (simple first-token match)
      const fullName = getString(identity?.fullName);
      const accountName = finance ? getString(finance.accountName) : undefined;
      if (
        fullName &&
        accountName &&
        !accountNameMatchesIdentity(accountName, fullName)
      ) {
        // Soft warning log
        logger.warn(
          "[Onboarding] Identity mismatch",
          ErrorCategory.VALIDATION,
          { storeId, fullName, accountName },
        );
      }

      // CRITICAL: Paystack Verification before Final Sync
      // We want to ensure the name we save is the OFFICIAL verified name
      const accountNumber = finance
        ? getString(finance.accountNumber)
        : undefined;
      const bankCode = finance ? getString(finance.bankCode) : undefined;
      if (accountNumber && bankCode) {
        try {
          const { PaystackService } = await import("@/lib/payment/paystack");
          const resolved = await PaystackService.resolveAccount(
            accountNumber,
            bankCode,
          );

          // Overwrite with verified name
          if (finance) {
            finance.accountName = resolved.account_name;
          }

          // Re-check identity match against OFFICIAL name if desired (Strict Mode)
          if (
            fullName &&
            !accountNameMatchesIdentity(resolved.account_name, fullName)
          ) {
            return NextResponse.json(
              {
                error: `Bank account name (${resolved.account_name}) does not match your identity (${fullName}).`,
                code: "ACCOUNT_NAME_MISMATCH",
                step: "finance",
              },
              { status: 422 },
            );
          }
        } catch (e: unknown) {
          logger.error("[ONBOARDING_BANK_VERIFICATION_FAILED]", e, { storeId });
          return NextResponse.json(
            {
              error:
                "Could not verify bank account details. Please check and try again.",
              code: "BANK_VERIFICATION_FAILED",
              step: "finance",
            },
            { status: 422 },
          );
        }
      }

      // Sync data to core tables
      await syncOnboardingData(storeId, state);

      // Update store status
      await prisma.store.update({
        where: { id: storeId },
        data: {
          onboardingStatus: "COMPLETE",
          settings: {
            ...(isRecord(body.settings) ? body.settings : {}),
            onboardingCompletedAt: new Date().toISOString(),
          },
        },
      });

      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      logger.error("[ONBOARDING_COMPLETE_POST]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to complete onboarding" },
        { status: 500 },
      );
    }
  },
);
