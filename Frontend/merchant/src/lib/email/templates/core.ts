import { urls } from "@vayva/shared";
import { wrapEmail, Hero, Button, Text, KeyValue, Badge } from "../components";
// --- TCP-01: OTP Verification ---
export function authOtpVerification(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("lock")}
        ${Text(data.first_name ? `Hi ${data.first_name},` : "Hello,", "h1")}
        ${Text("Use the verification code below to complete your secure sign in. This code is valid for 10 minutes.")}
        
        <div style="background:#f4f4f5; border-radius:8px; padding:24px; text-align:center; margin:32px 0; letter-spacing: 8px; font-size: 32px; font-weight: 700; font-family: monospace;">
            ${data.otp}
        </div>

        ${Text("If you didn't request this code, you can safely ignore this email.", "small")}
        `,
    "Verify your account",
  );
}
// --- TCP-10: Welcome Email ---
export function onboardingWelcome(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("welcome")}
        ${Text("Welcome to Vayva! 🎉", "h1")}
        ${Text(`Hi <strong>${data.first_name}</strong>, we're thrilled to have you. Your store <strong>${data.store_name}</strong> is created and ready for business.`)}
        
        <div style="margin: 24px 0; background: #DCFCE7; padding: 24px; border-radius: 8px; border: 1px solid #22C55E;">
           ${Text("Get Started in 3 Steps", "h3")}
           <ul style="margin:0; padding-left:20px; color:#374151; font-size:15px; line-height:1.6;">
              <li style="margin-bottom:8px;">Complete your business profile</li>
              <li style="margin-bottom:8px;">Add your first product</li>
              <li>Connect your bank account</li>
           </ul>
        </div>

        ${Button(urls.merchantDashboard(), "Go to Dashboard")}
        ${Text("Need help? Reply to this email or visit our Help Center.", "small", "center")}
        `,
    "Welcome to Vayva",
  );
}
// --- TCP-04: Password Reset ---
export function authPasswordReset(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("lock")}
        ${Text("Reset your password", "h1")}
        ${Text("We received a request to reset your Vayva account password. No changes have been made yet.")}
        ${Text("Click the button below to set a new password. This link will expire in 15 minutes.")}
        
        ${Button(data.reset_link, "Reset Password")}
        
        ${Text("If you didn’t request this, you can safely ignore this email. Your password will remain unchanged.", "small")}
        `,
    "Reset Password",
  );
}
// --- TCP-21: Payment Receipt ---
export function billingReceipt(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("receipt")}
        ${Text("Payment Receipt", "h1", "center")}
        ${Text(`For ${data.store_name}`, "body", "center")}

        <div style="text-align: center; margin-bottom: 32px;">
            <div style="font-size:12px; text-transform:uppercase; color:#6B7280; font-weight:600; letter-spacing:0.5px; margin-bottom:4px;">Amount Paid</div>
            <div style="font-size:36px; font-weight:700; color:#111827;">${data.currency} ${data.amount}</div>
            <div style="margin-top:8px;">${Badge("Paid", "success")}</div>
        </div>

        <div style="background:#F9FAFB; border-radius:8px; padding:20px; border: 1px solid #E5E7EB;">
            ${KeyValue("Invoice Number", data.invoice_number)}
            ${KeyValue("Date Paid", data.date)}
            ${KeyValue("Payment Method", "Card •••• 4242")} 
        </div>

        ${data.billing_url ? Button(data.billing_url, "View Billing History") : ""}
        `,
    `Receipt ${data.invoice_number}`,
  );
}
// --- TCP-14: Team Invitation ---
export function teamInvite(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("invite")}
        ${Text("You've been invited!", "h1")}
        ${Text(`<strong>${data.inviter_name}</strong> has invited you to join the team at <strong>${data.store_name}</strong> on Vayva.`)}
        
        <div style="background:#F8FAFC; border:1px solid #E2E8F0; border-radius:8px; padding:24px; margin:24px 0;">
            <div style="margin-bottom:8px; font-size:12px; font-weight:700; color:#6B7280; text-transform:uppercase; letter-spacing:1px;">Role</div>
            <div style="font-size:18px; font-weight:600; color:#111827; margin-bottom:4px;">${data.role}</div>
            ${data.role_description ? `<div style="font-size:14px; color:#4B5563;">${data.role_description}</div>` : ""}
        </div>

        ${Button(data.invite_url, "Join Team")}
        ${Text("This invitation will expire in 7 days.", "small", "center")}
        `,
    "Team Invitation",
  );
}
// --- TCP-05: Account Locked ---
export function authAccountLocked(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_alert")}
        ${Text("Account Locked", "h1", "center")}
        ${Text("We detected suspicious activity on your account. For your security, we have temporarily locked access.")}
        ${data.reason ? Text(`Reason: ${data.reason}`, "small") : ""}
        
        ${Button(data.unlock_link, "Unlock Account")}
        ${Text("If you need immediate assistance, please contact support.", "small", "center")}
        `,
    "Account Locked",
  );
}
// --- TCP-02: New Login ---
export function authNewLogin(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_lock")}
        ${Text("New Login Detected", "h1")}
        ${Text(`We noticed a new login to your Vayva account on <strong>${data.date}</strong>.`)}
        
        <div style="background:#F9FAFB; border-radius:8px; padding:20px; border: 1px solid #E5E7EB;">
            ${KeyValue("Device", data.device)}
            ${KeyValue("Location", data.location)}
            ${KeyValue("IP Address", data.ip)}
        </div>

        ${data.lock_account_url ? Button(data.lock_account_url, "This wasn't me") : ""}
        `,
    "New Login Alert",
  );
}
// --- TCP-03: Verify Email Link ---
export function authVerifyEmailLink(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_lock")}
        ${Text("Verify your email", "h1")}
        ${Text("Click the button below to verify your email address and complete your signup.")}
        ${Button(data.verify_link, "Verify Email")}
        `,
    "Verify your email",
  );
}
// --- TCP-06: Password Changed ---
export function authPasswordChanged(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_lock")}
        ${Text("Password Changed", "h1")}
        ${Text(`Your password was changed on ${data.date}.`)}
        ${Text("If you did not make this change, please contact support immediately.")}
        ${data.support_url ? Button(data.support_url, "Contact Support") : ""}
        `,
    "Security Alert",
  );
}
// --- TCP-11: Onboarding Incomplete ---
export function onboardingIncomplete(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_welcome")}
        ${Text("Complete your setup", "h1")}
        ${Text(`Hi ${data.first_name}, you're almost there!`)}
        ${Text(`Don't forget to <strong>${data.next_step}</strong> to start selling.`)}
        ${data.dashboard_url ? Button(urls.merchantDashboard(), "Continue Setup") : ""}
        `,
    "Complete your setup",
  );
}
// --- TCP-22: Invoice Available ---
export function billingInvoiceAvailable(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_billing_invoice")}
        ${Text("New Invoice", "h1")}
        ${Text(`Invoice <strong>${data.invoice_number}</strong> for ${data.amount} is now available.`)}
        <div style="background:#F9FAFB; border-radius:8px; padding:20px; border: 1px solid #E5E7EB;">
            ${KeyValue("Amount", data.amount)}
            ${KeyValue("Due Date", data.due_date)}
        </div>
        ${data.download_url ? Button(data.download_url, "Download Invoice") : ""}
        `,
    `Invoice ${data.invoice_number}`,
  );
}
// --- TCP-23: Payment Failed ---
export function billingPaymentFailed(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_billing_failed")}
        ${Text("Payment Failed", "h1")}
        ${Text(`We were unable to process the payment for invoice <strong>${data.invoice_number}</strong>.`)}
        ${data.reason ? Text(`Reason: ${data.reason}`, "small") : ""}
        ${Button(data.retry_link, "Update Payment Method")}
        `,
    "Payment Failed",
  );
}
// --- TCP-24: Subscription Started ---
export function billingSubscriptionStarted(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_subscription")}
        ${Text("Subscription Active", "h1")}
        ${Text(`You are now subscribed to the <strong>${data.plan_name}</strong> plan.`)}
        <div style="background:#F9FAFB; border-radius:8px; padding:20px; border: 1px solid #E5E7EB;">
             ${KeyValue("Plan", data.plan_name)}
             ${KeyValue("Amount", data.amount)}
             ${KeyValue("Renewal", data.renewal_date)}
        </div>
        `,
    "Subscription Activated",
  );
}
// --- TCP-25: Subscription Cancelled ---
export function billingSubscriptionCancelled(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_subscription")} 
        ${Text("Subscription Cancelled", "h1")}
        ${Text(`Your ${data.plan_name} subscription has been cancelled. You will have access until ${data.end_date}.`)}
        ${data.reactivate_link ? Button(data.reactivate_link, "Reactivate Subscription") : ""}
        `,
    "Subscription Cancelled",
  );
}
// --- TCP-30: Order Confirmation (Customer) ---
export function orderConfirmationCustomer(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_order_confirm")}
        ${Text("Order Confirmed", "h1", "center")}
        ${Text(`Thanks for your order, ${data.customer_name}!`, "body", "center")}
        
        <div style="background:#F9FAFB; border-radius:8px; padding:20px; border: 1px solid #E5E7EB;">
             ${KeyValue("Order ID", data.order_id)}
             ${KeyValue("Total", data.total)}
        </div>
        
        ${data.tracking_link ? Button(data.tracking_link, "Track Order") : ""}
        `,
    `Order #${data.order_id}`,
  );
}
// --- TCP-31: Order Shipped (Customer) ---
export function orderShippedCustomer(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_shipping")}
        ${Text("Your order has shipped!", "h1")}
        ${Text(`Order #${data.order_id} is on its way.`)}
        
        <div style="background:#F9FAFB; border-radius:8px; padding:20px; border: 1px solid #E5E7EB;">
             ${KeyValue("Carrier", data.carrier)}
             ${KeyValue("Tracking #", data.tracking_number)}
        </div>

        ${data.tracking_link ? Button(data.tracking_link, "Track Package") : ""}
        `,
    `Order #${data.order_id} Shipped`,
  );
}
// --- TCP-32: Order Delivered (Customer) ---
export function orderDeliveredCustomer(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_shipping")}
        ${Text("Delivered", "h1")}
        ${Text(`Your order #${data.order_id} has been delivered.`)}
        ${data.support_link ? Button(data.support_link, "Get Support") : ""}
        `,
    `Order #${data.order_id} Delivered`,
  );
}
// --- TCP-33: New Order (Merchant) ---
export function merchantNewOrder(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_receipt")}
        ${Text("New Order Received", "h1")}
        ${Text(`You have a new order from <strong>${data.customer_name}</strong>.`)}
         <div style="background:#F9FAFB; border-radius:8px; padding:20px; border: 1px solid #E5E7EB;">
             ${KeyValue("Order ID", data.order_id)}
             ${KeyValue("Total", data.total)}
        </div>
        ${data.dashboard_link ? Button(data.dashboard_link, "View Order") : ""}
        `,
    `New Order #${data.order_id}`,
  );
}
// --- TCP-26: Payout Processed ---
export function merchantPayoutProcessed(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_receipt")}
        ${Text("Payout Processed", "h1")}
        ${Text(`A payout of <strong>${data.currency} ${data.amount}</strong> is on its way to your ${data.bank_name} account ending in ${data.account_last4}.`)}
        ${data.arrival_date ? Text(`Estimated arrival: ${data.arrival_date}`, "small") : ""}
        `,
    "Payout Processed",
  );
}
// --- TCP-27: Subscription Expiry Reminder (3 Days) ---
export function billingSubscriptionExpiryReminder(
  data: Record<string, string>,
) {
  return wrapEmail(
    `
        ${Hero("hero_billing_invoice")}
        ${Text("Your subscription expires in 3 days!", "h1")}
        ${Text(`Hi there, your <strong>${data.plan_name}</strong> subscription for <strong>${data.store_name}</strong> will expire on ${data.expiry_date}.`)}
        ${Text("To avoid any interruption to your store, please ensure your payment method is up to date or manually renew your plan.")}
        
        <div style="background:#FFFBEB; border:1px solid #FCD34D; border-radius:8px; padding:20px; margin:24px 0;">
             ${KeyValue("Store", data.store_name)}
             ${KeyValue("Expires", data.expiry_date)}
        </div>

        ${Button(urls.merchantDashboard(), "Manage Subscription")}
        `,
    "Action Required: Subscription Expiry",
  );
}
// --- TCP-40: System Maintenance ---
export function systemMaintenance(data: Record<string, string>) {
  return wrapEmail(
    `
        ${Hero("hero_maintenance")}
        ${Text("Scheduled Maintenance", "h1")}
        ${Text(`We will be performing maintenance on <strong>${data.date}</strong>.`)}
        ${Text(`Estimated duration: ${data.duration_estimate}.`)}
        ${data.impact_description ? Text(data.impact_description) : ""}
        `,
    "System Maintenance",
  );
}
// Export a registry map for dynamic loading
export const Templates = {
  auth_otp_verification: authOtpVerification,
  auth_welcome: onboardingWelcome,
  auth_password_reset: authPasswordReset,
  auth_account_locked: authAccountLocked,
  auth_new_login: authNewLogin,
  auth_verify_email_link: authVerifyEmailLink,
  auth_password_changed: authPasswordChanged,
  onboarding_incomplete: onboardingIncomplete,
  billing_receipt: billingReceipt,
  billing_invoice_available: billingInvoiceAvailable,
  billing_payment_failed: billingPaymentFailed,
  billing_subscription_started: billingSubscriptionStarted,
  billing_subscription_cancelled: billingSubscriptionCancelled,
  billing_subscription_expiry_3d: billingSubscriptionExpiryReminder,
  merchant_payout_processed: merchantPayoutProcessed,
  team_invite: teamInvite,
  order_confirmation_customer: orderConfirmationCustomer,
  order_shipped_customer: orderShippedCustomer,
  order_delivered_customer: orderDeliveredCustomer,
  merchant_new_order: merchantNewOrder,
  system_maintenance: systemMaintenance,
};
