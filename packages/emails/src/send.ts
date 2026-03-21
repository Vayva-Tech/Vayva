import { Resend } from "resend";
import { render } from "@react-email/render";
import { MerchantInviteEmail } from "./templates/merchantInvite";
import { PasswordResetEmail } from "./templates/passwordReset";
import { OrderConfirmedEmail } from "./templates/orderConfirmed";
import { PaymentReceivedEmail } from "./templates/paymentReceived";
import { WelcomeEmail } from "./templates/welcome";
import { ShippingUpdateEmail } from "./templates/shippingUpdate";
import { OrderCancelledEmail } from "./templates/orderCancelled";
import { RefundProcessedEmail } from "./templates/refundProcessed";
import { SubscriptionActivatedEmail } from "./templates/subscriptionActivated";
import { TrialExpiringEmail } from "./templates/trialExpiring";
import { LowStockAlertEmail } from "./templates/lowStockAlert";
import { KycStatusEmail } from "./templates/kycStatus";
import { DisputeOpenedEmail } from "./templates/disputeOpened";
import { RefundRequestedEmail } from "./templates/refundRequested";
import { AccountDeletionScheduledEmail, AccountDeletionCompletedEmail } from "./templates/accountDeletion";
import { PaymentFailedEmail } from "./templates/paymentFailed";
import { PaymentRecoveredEmail } from "./templates/paymentRecovered";
import { SubscriptionEndedEmail } from "./templates/subscriptionEnded";

let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error("RESEND_API_KEY is not configured — email sending is disabled.");
    }
    _resend = new Resend(key);
  }
  return _resend;
}

const FROM = process.env.RESEND_FROM_EMAIL || "Vayva <no-reply@vayva.ng>"; // Must be verified in Resend
const REPLY_TO = process.env.RESEND_REPLY_TO || "support@vayva.ng";

export async function sendMerchantInvite(
  to: string,
  args: { storeName: string; inviterName: string; acceptUrl: string }
) {
  const html = await render(MerchantInviteEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `You’ve been invited to ${args.storeName} on Vayva`,
    html,
  });
}

export async function sendPasswordReset(
  to: string,
  args: { resetUrl: string; minutes: number }
) {
  const html = await render(PasswordResetEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: "Reset your Vayva password",
    html,
  });
}

export async function sendOrderConfirmed(
  to: string,
  args: { refCode: string; orderUrl: string }
) {
  const html = await render(OrderConfirmedEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Order confirmed — ${args.refCode}`,
    html,
  });
}

export async function sendPaymentReceived(
  to: string,
  args: { refCode: string; paymentReference: string; receiptUrl: string }
) {
  const html = await render(PaymentReceivedEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Payment received — ${args.refCode}`,
    html,
  });
}

export async function sendWelcome(
  to: string,
  args: { merchantName: string; storeName: string; dashboardUrl: string }
) {
  const html = await render(WelcomeEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Welcome to Vayva, ${args.merchantName}`,
    html,
  });
}

export async function sendShippingUpdate(
  to: string,
  args: { refCode: string; status: string; trackingUrl?: string; orderUrl: string }
) {
  const html = await render(ShippingUpdateEmail(args));
  const label = args.status === "DELIVERED" ? "delivered" : "shipped";
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Order ${label} — ${args.refCode}`,
    html,
  });
}

export async function sendOrderCancelled(
  to: string,
  args: { refCode: string; reason?: string; orderUrl: string }
) {
  const html = await render(OrderCancelledEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Order cancelled — ${args.refCode}`,
    html,
  });
}

export async function sendRefundProcessed(
  to: string,
  args: { refCode: string; amount: string; currency: string; orderUrl: string }
) {
  const html = await render(RefundProcessedEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Refund processed — ${args.refCode}`,
    html,
  });
}

export async function sendSubscriptionActivated(
  to: string,
  args: { planName: string; storeName: string; billingUrl: string }
) {
  const html = await render(SubscriptionActivatedEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `You're on the ${args.planName} plan`,
    html,
  });
}

export async function sendTrialExpiring(
  to: string,
  args: { storeName: string; daysLeft: number; billingUrl: string }
) {
  const html = await render(TrialExpiringEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Your trial ends in ${args.daysLeft} day${args.daysLeft === 1 ? "" : "s"}`,
    html,
  });
}

export async function sendLowStockAlert(
  to: string,
  args: { storeName: string; products: Array<{ name: string; remaining: number }>; inventoryUrl: string }
) {
  const html = await render(LowStockAlertEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Low stock alert — ${args.products.length} product${args.products.length === 1 ? "" : "s"} running low`,
    html,
  });
}

export async function sendKycStatus(
  to: string,
  args: { storeName: string; status: "VERIFIED" | "REJECTED"; reason?: string; dashboardUrl: string }
) {
  const html = await render(KycStatusEmail(args));
  const subject = args.status === "VERIFIED"
    ? "Your identity has been verified"
    : "KYC verification — action required";
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject,
    html,
  });
}

export async function sendDisputeOpened(
  to: string,
  args: { refCode: string; reason: string; responseDeadline: string; disputeUrl: string }
) {
  const html = await render(DisputeOpenedEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Dispute opened — ${args.refCode}`,
    html,
  });
}

export async function sendRefundRequested(
  to: string,
  args: { refCode: string; customerName: string; amount: string; currency: string; reason?: string; orderUrl: string }
) {
  const html = await render(RefundRequestedEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Refund requested — ${args.refCode}`,
    html,
  });
}

export async function sendAccountDeletionScheduled(
  to: string,
  args: { storeName: string; scheduledDate: string; cancelUrl: string }
) {
  const html = await render(AccountDeletionScheduledEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Account deletion scheduled — ${args.storeName}`,
    html,
  });
}

export async function sendAccountDeletionCompleted(
  to: string,
  args: { storeName: string }
) {
  const html = await render(AccountDeletionCompletedEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Account deleted — ${args.storeName}`,
    html,
  });
}

export async function sendPaymentFailed(
  to: string,
  args: { storeName: string; amount: string; currency: string; retryDate: string; billingUrl: string }
) {
  const html = await render(PaymentFailedEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Payment failed — ${args.storeName}`,
    html,
  });
}

export async function sendPaymentRecovered(
  to: string,
  args: { storeName: string; amount: string; currency: string }
) {
  const html = await render(PaymentRecoveredEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Payment successful — ${args.storeName}`,
    html,
  });
}

export async function sendSubscriptionEnded(
  to: string,
  args: { storeName: string; planName: string; reactivationUrl: string }
) {
  const html = await render(SubscriptionEndedEmail(args));
  return getResend().emails.send({
    from: FROM,
    to,
    replyTo: REPLY_TO,
    subject: `Subscription ended — ${args.storeName}`,
    html,
  });
}
