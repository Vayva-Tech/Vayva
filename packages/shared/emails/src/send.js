"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMerchantInvite = sendMerchantInvite;
exports.sendPasswordReset = sendPasswordReset;
exports.sendOrderConfirmed = sendOrderConfirmed;
exports.sendPaymentReceived = sendPaymentReceived;
exports.sendWelcome = sendWelcome;
exports.sendShippingUpdate = sendShippingUpdate;
exports.sendOrderCancelled = sendOrderCancelled;
exports.sendRefundProcessed = sendRefundProcessed;
exports.sendSubscriptionActivated = sendSubscriptionActivated;
exports.sendTrialExpiring = sendTrialExpiring;
exports.sendLowStockAlert = sendLowStockAlert;
exports.sendKycStatus = sendKycStatus;
exports.sendDisputeOpened = sendDisputeOpened;
exports.sendRefundRequested = sendRefundRequested;
exports.sendEmail = sendEmail;
const resend_1 = require("resend");
const render_1 = require("@react-email/render");
const merchantInvite_1 = require("./templates/merchantInvite");
const passwordReset_1 = require("./templates/passwordReset");
const orderConfirmed_1 = require("./templates/orderConfirmed");
const paymentReceived_1 = require("./templates/paymentReceived");
const welcome_1 = require("./templates/welcome");
const shippingUpdate_1 = require("./templates/shippingUpdate");
const orderCancelled_1 = require("./templates/orderCancelled");
const refundProcessed_1 = require("./templates/refundProcessed");
const subscriptionActivated_1 = require("./templates/subscriptionActivated");
const trialExpiring_1 = require("./templates/trialExpiring");
const lowStockAlert_1 = require("./templates/lowStockAlert");
const kycStatus_1 = require("./templates/kycStatus");
const disputeOpened_1 = require("./templates/disputeOpened");
const refundRequested_1 = require("./templates/refundRequested");
let _resend = null;
function getResend() {
    if (!_resend) {
        const key = process.env.RESEND_API_KEY;
        if (!key) {
            throw new Error("RESEND_API_KEY is not configured — email sending is disabled.");
        }
        _resend = new resend_1.Resend(key);
    }
    return _resend;
}
const FROM = process.env.RESEND_FROM_EMAIL || "Vayva <no-reply@vayva.ng>"; // Must be verified in Resend
const REPLY_TO = process.env.RESEND_REPLY_TO || "support@vayva.ng";
async function sendMerchantInvite(to, args) {
    const html = await (0, render_1.render)((0, merchantInvite_1.MerchantInviteEmail)(args));
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: `You’ve been invited to ${args.storeName} on Vayva`,
        html,
    });
}
async function sendPasswordReset(to, args) {
    const html = await (0, render_1.render)((0, passwordReset_1.PasswordResetEmail)(args));
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: "Reset your Vayva password",
        html,
    });
}
async function sendOrderConfirmed(to, args) {
    const html = await (0, render_1.render)((0, orderConfirmed_1.OrderConfirmedEmail)(args));
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: `Order confirmed — ${args.refCode}`,
        html,
    });
}
async function sendPaymentReceived(to, args) {
    const html = await (0, render_1.render)((0, paymentReceived_1.PaymentReceivedEmail)(args));
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: `Payment received — ${args.refCode}`,
        html,
    });
}
async function sendWelcome(to, args) {
    const html = await (0, render_1.render)((0, welcome_1.WelcomeEmail)(args));
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: `Welcome to Vayva, ${args.merchantName}`,
        html,
    });
}
async function sendShippingUpdate(to, args) {
    const html = await (0, render_1.render)((0, shippingUpdate_1.ShippingUpdateEmail)(args));
    const label = args.status === "DELIVERED" ? "delivered" : "shipped";
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: `Order ${label} — ${args.refCode}`,
        html,
    });
}
async function sendOrderCancelled(to, args) {
    const html = await (0, render_1.render)((0, orderCancelled_1.OrderCancelledEmail)(args));
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: `Order cancelled — ${args.refCode}`,
        html,
    });
}
async function sendRefundProcessed(to, args) {
    const html = await (0, render_1.render)((0, refundProcessed_1.RefundProcessedEmail)(args));
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: `Refund processed — ${args.refCode}`,
        html,
    });
}
async function sendSubscriptionActivated(to, args) {
    const html = await (0, render_1.render)((0, subscriptionActivated_1.SubscriptionActivatedEmail)(args));
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: `You're on the ${args.planName} plan`,
        html,
    });
}
async function sendTrialExpiring(to, args) {
    const html = await (0, render_1.render)((0, trialExpiring_1.TrialExpiringEmail)(args));
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: `Your trial ends in ${args.daysLeft} day${args.daysLeft === 1 ? "" : "s"}`,
        html,
    });
}
async function sendLowStockAlert(to, args) {
    const html = await (0, render_1.render)((0, lowStockAlert_1.LowStockAlertEmail)(args));
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: `Low stock alert — ${args.products.length} product${args.products.length === 1 ? "" : "s"} running low`,
        html,
    });
}
async function sendKycStatus(to, args) {
    const html = await (0, render_1.render)((0, kycStatus_1.KycStatusEmail)(args));
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
async function sendDisputeOpened(to, args) {
    const html = await (0, render_1.render)((0, disputeOpened_1.DisputeOpenedEmail)(args));
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: `Dispute opened — ${args.refCode}`,
        html,
    });
}
async function sendRefundRequested(to, args) {
    const html = await (0, render_1.render)((0, refundRequested_1.RefundRequestedEmail)(args));
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        subject: `Refund requested — ${args.refCode}`,
        html,
    });
}
/** Generic HTML email (e.g. compliance SLA alerts). */
async function sendEmail(args) {
    const to = Array.isArray(args.to) ? args.to : [args.to];
    return getResend().emails.send({
        from: FROM,
        to,
        replyTo: REPLY_TO,
        cc: args.cc,
        subject: args.subject,
        html: args.html,
    });
}
//# sourceMappingURL=send.js.map