import { LegalDocument } from "../types";

export const refundPolicy: LegalDocument = {
  slug: "refund-policy",
  title: "Vayva Subscription Refund Policy",
  lastUpdated: "March 18, 2026",
  version: "1.0",
  summary: "Details regarding refunds for Vayva platform subscription fees, including consumer rights in different jurisdictions.",
  sections: [
    {
      heading: "1. Scope",
      content: [
        "This policy applies to subscription fees paid to Vayva for use of the platform. It does not cover refunds for goods purchased from merchants on Vayva storefronts (those are governed by each merchant's refund policy).",
      ],
    },
    {
      heading: "2. Free Trials",
      content: [
        "If you start a plan with a free trial you will not be charged if you cancel before the trial period ends. We will send you a reminder email 24 hours before your trial ends.",
      ],
    },
    {
      heading: "3. Subscription Refunds - General Rule",
      content: [
        "Vayva does not offer refunds for partial months of service. If you cancel your subscription you will continue to have access to paid features until the end of your current billing cycle.",
        "• **Monthly Plans**: No prorated refunds for partial months",
        "• **Annual Plans**: Prorated refund available if cancelled within first 30 days; after 30 days, no refund but you retain access for the full year",
        "• **Technical Errors**: Full refund within 7 days for documented technical errors such as double billing or unauthorized charges",
      ],
    },
    {
      heading: "4. EU/UK Consumer Rights - 14-Day Cooling-Off Period",
      content: [
        "If you are a consumer located in the European Economic Area (EEA) or United Kingdom, you have additional legal rights under the EU Consumer Rights Directive (2011/83/EU) and UK Consumer Contracts Regulations:",
        "• **Right to Withdraw**: You have 14 calendar days from the date of subscription purchase to cancel and receive a full refund, no questions asked",
        "• **How to Exercise**: Email support@vayva.ng with subject line 'EU Refund Request' and include your order number",
        "• **Refund Timeline**: We will process your refund within 14 days of receiving your request",
        "• **Exception**: If you explicitly request immediate access to paid features during the 14-day period and acknowledge that you lose your right to withdraw, refunds may not be available (this applies only to business customers who waive withdrawal rights)",
      ],
      type: "callout-important",
    },
    {
      heading: "5. Service Outages & Credits",
      content: [
        "If Vayva experiences unplanned downtime exceeding 24 consecutive hours, affected customers will receive a pro-rated credit for the downtime period. Credits are applied to your next billing cycle.",
        "Scheduled maintenance announced at least 72 hours in advance does not qualify for credits.",
      ],
    },
    {
      heading: "6. Charge Disputes",
      content: [
        "If you believe a charge was made in error please contact us immediately at support@vayva.ng with subject line 'Billing Error'. We will investigate within 5 business days.",
        "Filing a chargeback with your bank without first contacting us to resolve the issue may result in immediate account suspension until the dispute is resolved.",
      ],
    },
    {
      heading: "7. How to Request a Refund",
      content: [
        "To request a refund:",
        "1. Email support@vayva.ng with subject line 'Refund Request'",
        "2. Include your account email, subscription plan, and reason for refund request",
        "3. For EU/UK consumers: Mention '14-day cooling-off period' if within eligibility window",
        "4. We will respond within 3 business days with our decision",
        "5. Approved refunds are processed to your original payment method within 5-10 business days",
      ],
      type: "text",
    },
  ],
};
