import { urls } from "@vayva/shared";
import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { Prisma, prisma } from "@vayva/db";
import { ACCOUNT_ROUTES } from "@/config/routes";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getSettingsObject(settings: unknown): Record<string, unknown> {
  return isRecord(settings) ? settings : {};
}

export const GET = withVayvaAPI(
  PERMISSIONS.ACCOUNT_VIEW,
  async (req, { storeId }) => {
    try {
      // Fetch all relevant account data in parallel for performance
      const [store, bankAccount, security, domain, recentLogs, kyc] =
        await Promise.all([
          prisma.store.findUnique({
            where: { id: storeId },
            select: {
              name: true,
              slug: true,
              category: true,
              plan: true,
              isLive: true,
              onboardingCompleted: true,
              settings: true,
            },
          }),
          prisma.bankBeneficiary.findFirst({
            where: { storeId, isDefault: true },
          }),
          prisma.securitySetting.findUnique({
            where: { storeId },
          }),
          prisma.domainMapping.findFirst({
            where: { storeId },
          }),
          prisma.auditLog.findMany({
            where: { targetStoreId: storeId },
            take: 10,
            orderBy: { createdAt: "desc" },
          }),
          prisma.kycRecord.findUnique({
            where: { storeId },
          }),
        ]);
      if (!store) {
        return NextResponse.json(
          { error: "Store context not found" },
          { status: 404 },
        );
      }
      const lastAudit = recentLogs[0];
      const storeSettings = getSettingsObject(store.settings);
      const data = {
        profile: {
          name: store.name || "Unset",
          category: store.category || "General",
          plan: store.plan || "GROWTH",
          isLive: store.isLive || false,
          onboardingCompleted: store.onboardingCompleted || false,
        },
        subscription: {
          plan: store.plan || "GROWTH",
          status: "ACTIVE",
          renewalDate: null,
          canUpgrade: true,
        },
        kyc: {
          status: kyc?.status || "NOT_STARTED",
          lastAttempt: kyc?.updatedAt || null,
          rejectionReason: null,
          missingDocs: [],
          canWithdraw: kyc?.status === "VERIFIED",
        },
        payouts: {
          bankConnected: !!bankAccount,
          payoutsEnabled: !!bankAccount && kyc?.status === "VERIFIED",
          maskedAccount: bankAccount
            ? `******${bankAccount.accountNumber.slice(-4)}`
            : null,
          bankName: bankAccount?.bankName || null,
        },
        domains: {
          customDomain: domain?.domain || null,
          subdomain: `${store.slug || "store"}.${urls.storefrontRoot()}`,
          status: domain?.status || "PENDING",
          sslEnabled: domain?.status === "active",
        },
        integrations: {
          whatsapp: "DISCONNECTED",
          payments: (
            isRecord(storeSettings.paystack)
              ? storeSettings.paystack.connected
              : undefined
          )
            ? "CONNECTED"
            : "DISCONNECTED",
          delivery: (
            isRecord(storeSettings.delivery)
              ? storeSettings.delivery.connected
              : undefined
          )
            ? "CONNECTED"
            : "DISCONNECTED",
          lastWebhook: lastAudit?.createdAt
            ? new Date(lastAudit.createdAt).toISOString()
            : new Date().toISOString(),
        },
        security: {
          mfaEnabled: security?.twoFactorRequired || false,
          recentLogins: recentLogs.filter((l) =>
            String(l.action).toLowerCase().includes("login"),
          ).length,
          apiKeyStatus: (
            isRecord(storeSettings.api) ? storeSettings.api.active : undefined
          )
            ? "ACTIVE"
            : "INACTIVE",
        },
        alerts: buildAlerts(store, bankAccount, kyc),
      };
      return NextResponse.json(data, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error) {
      logger.error("[ACCOUNT_OVERVIEW_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch account overview" },
        { status: 500 },
      );
    }
  },
);

type StoreOverviewStore = Prisma.StoreGetPayload<{
  select: { onboardingCompleted: true };
}>;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type StoreOverviewBankAccount = Prisma.BankBeneficiaryGetPayload<object> | null;
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type StoreOverviewKyc = Prisma.KycRecordGetPayload<object> | null;

function buildAlerts(
  store: StoreOverviewStore,
  bankAccount: StoreOverviewBankAccount,
  kyc: StoreOverviewKyc,
) {
  const alerts = [];
  if (!store.onboardingCompleted) {
    alerts.push({
      id: "onboarding",
      severity: "warning",
      message:
        "Onboarding Incomplete. Finish setting up your store to go live.",
      action: ACCOUNT_ROUTES.ONBOARDING,
    });
  }
  if (!bankAccount) {
    alerts.push({
      id: "payouts",
      severity: "error",
      message: "Payouts Disabled. Add a bank account to receive your earnings.",
      action: "Update Payouts",
    });
  }
  if (!kyc || kyc.status !== "VERIFIED") {
    alerts.push({
      id: "kyc",
      severity: "info",
      message:
        "Identity Verification. Verify your identity to increase withdrawal limits.",
      action: "Verify Now",
    });
  }
  return alerts;
}
// End of file
