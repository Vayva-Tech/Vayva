import { createHmac } from "node:crypto";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function dispatchSignedWebhook(
  url: string,
  secret: string,
  body: string,
): void {
  const sig = createHmac("sha256", secret).update(body).digest("hex");
  void fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Autopilot-Signature": sig,
    },
    body,
  }).catch(() => {});
}

export function fireAutopilotProposedWebhook(
  storeId: string,
  settings: unknown,
  payload: {
    runId: string;
    ruleSlug: string;
    title: string;
    category: string;
  },
): void {
  const storeSettings = isRecord(settings) ? settings : {};
  const ap = isRecord(storeSettings.autopilot) ? storeSettings.autopilot : {};
  const url =
    typeof ap.proposedWebhookUrl === "string" ? ap.proposedWebhookUrl : null;
  const secret =
    typeof ap.proposedWebhookSecret === "string"
      ? ap.proposedWebhookSecret
      : null;
  if (!url || !secret) return;

  const body = JSON.stringify({
    event: "autopilot.proposed",
    storeId,
    ...payload,
  });
  dispatchSignedWebhook(url, secret, body);
}

export type AutopilotApprovedWebhookPayload = {
  runId: string;
  ruleSlug: string;
  category: string;
  title: string;
  summary: string;
  reasoning: string | null;
  input: unknown;
};

/**
 * Fires when a merchant approves an Autopilot run. Configure in
 * `Store.settings.autopilot.approvedWebhookUrl` + `approvedWebhookSecret`
 * (or `automationWebhookUrl` / `automationWebhookSecret` as aliases).
 * Returns true if a request was sent (URL + secret were set).
 */
export function fireAutopilotApprovedWebhook(
  storeId: string,
  settings: unknown,
  payload: AutopilotApprovedWebhookPayload,
): boolean {
  const storeSettings = isRecord(settings) ? settings : {};
  const ap = isRecord(storeSettings.autopilot) ? storeSettings.autopilot : {};

  const url =
    (typeof ap.approvedWebhookUrl === "string" && ap.approvedWebhookUrl) ||
    (typeof ap.automationWebhookUrl === "string" && ap.automationWebhookUrl) ||
    null;

  const secret =
    (typeof ap.approvedWebhookSecret === "string" &&
      ap.approvedWebhookSecret) ||
    (typeof ap.automationWebhookSecret === "string" &&
      ap.automationWebhookSecret) ||
    null;

  if (!url || !secret) return false;

  const body = JSON.stringify({
    event: "autopilot.approved",
    storeId,
    ...payload,
  });
  dispatchSignedWebhook(url, secret, body);
  return true;
}
