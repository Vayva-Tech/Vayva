export interface PolicyGeneratorInput {
  storeName: string;
  storeSlug: string;
  merchantSupportWhatsApp?: string;
  supportEmail?: string;
  pickupAddress?: string;
  deliveryCities?: string[];
  returnsWindowDays?: number;
  refundWindowDays?: number;
  dispatchMode?: "self" | "partner" | "both";
  partnerName?: string;
}

export interface GeneratedPolicy {
  type: "terms" | "privacy" | "returns" | "refunds" | "shipping_delivery";
  title: string;
  contentMd: string;
}

export function generateDefaultPolicies(
  input: PolicyGeneratorInput,
): GeneratedPolicy[] {
  const {
    storeName,
    storeSlug,
    merchantSupportWhatsApp = "Contact us via WhatsApp",
    supportEmail = `support@${storeSlug}.com`,
    pickupAddress = "Lagos, Nigeria",
    deliveryCities = ["Lagos"],
    returnsWindowDays = 7,
    refundWindowDays = 5,
    dispatchMode = "both",
    partnerName: _partnerName = "Kwik",
  } = input;

  return [
    generateTermsPolicy(input),
    generatePrivacyPolicy(input),
    generateReturnsPolicy(input),
    generateRefundsPolicy(input),
    generateShippingDeliveryPolicy(input),
  ];
}

function generateTermsPolicy(input: PolicyGeneratorInput): GeneratedPolicy {
  const { storeName, merchantSupportWhatsApp, supportEmail } = input;

  return {
    type: "terms",
    title: "Store Terms",
    contentMd: `# Store Terms

Welcome to ${storeName}. By placing an order with us, you agree to these terms.

## 1. About Us

${storeName} is an independent seller. We are responsible for the products we sell and the service we provide.

## 2. Orders and Payment

- All prices are in Nigerian Naira (NGN)
- Payment is required before we process your order
- We accept bank transfer, card payments, and cash on delivery (where available)
- Orders are confirmed once payment is verified

## 3. Product Information

- We strive to display accurate product information and images
- Actual products may vary slightly from images
- If you receive a product that doesn't match the description, contact us immediately

## 4. Delivery

- Delivery fees vary by location and are shown at checkout
- Delivery times are estimates and may vary due to traffic, weather, or other factors
- We may contact you on WhatsApp to confirm your address before dispatch

## 5. Returns and Refunds

- See our Returns Policy and Refund Policy for details
- Defective or incorrect items can be returned
- Some items may not be eligible for return (perishables, personal care items, etc.)

## 6. Contact Us

If you have questions about these terms:
- WhatsApp: ${merchantSupportWhatsApp}
- Email: ${supportEmail}

**Last updated:** This policy was generated as a template. Please review and customize it for your business.
`,
  };
}

function generatePrivacyPolicy(input: PolicyGeneratorInput): GeneratedPolicy {
  const { storeName, merchantSupportWhatsApp, supportEmail } = input;

  return {
    type: "privacy",
    title: "Store Privacy Notice",
    contentMd: `# Privacy Notice

${storeName} respects your privacy. This notice explains how we collect and use your personal information.

## Information We Collect

When you place an order, we collect:
- Your name and phone number
- Delivery address
- Payment information (processed securely by our payment provider)
- Order history

## How We Use Your Information

We use your information to:
- Process and deliver your orders
- Contact you about your order via WhatsApp or phone
- Provide customer support
- Improve our products and services

## WhatsApp Communication

- We may contact you on WhatsApp to confirm your order or address
- We will only message you about your orders unless you opt in to marketing messages
- You can ask us to stop messaging you at any time

## Sharing Your Information

We share your information only when necessary:
- With delivery partners to fulfill your order
- With payment processors to process payments
- When required by law

We do not sell your personal information.

## Your Rights

You can:
- Request a copy of your information
- Ask us to correct inaccurate information
- Request deletion of your information (subject to legal requirements)

## Contact Us

For privacy questions:
- WhatsApp: ${merchantSupportWhatsApp}
- Email: ${supportEmail}

**Last updated:** This policy was generated as a template. Please review and customize it for your business.
`,
  };
}

function generateReturnsPolicy(input: PolicyGeneratorInput): GeneratedPolicy {
  const {
    storeName,
    merchantSupportWhatsApp,
    supportEmail,
    returnsWindowDays = 7,
    pickupAddress,
  } = input;

  return {
    type: "returns",
    title: "Returns Policy",
    contentMd: `# Returns Policy

At ${storeName}, we want you to be satisfied with your purchase.

## Returns Window

You may return eligible items within **${returnsWindowDays} days** of receiving your order.

## Eligible Items

To be eligible for return, items must be:
- Unused and in original condition
- In original packaging with tags attached
- Accompanied by proof of purchase (order confirmation)

## Non-Returnable Items

The following items cannot be returned:
- Perishable goods (food, flowers)
- Personal care items (cosmetics, underwear)
- Custom or personalized items
- Items marked as final sale

## How to Return

To initiate a return:
1. Contact us via WhatsApp or email within ${returnsWindowDays} days
2. Provide your order number and reason for return
3. We will confirm if your return is approved
4. Return the item to: ${pickupAddress} (or we may arrange pickup)

## Condition Requirements

Returned items must be:
- Unworn, unwashed, and undamaged
- Free from odors (perfume, smoke, etc.)
- Complete with all accessories and documentation

Items that don't meet these requirements may be rejected.

## Refunds and Exchanges

- Approved returns will be refunded within ${returnsWindowDays} business days
- Exchanges are subject to availability
- Delivery fees are non-refundable unless the return is due to our error

## Contact Us

For return requests:
- WhatsApp: ${merchantSupportWhatsApp}
- Email: ${supportEmail}

**Last updated:** This policy was generated as a template. Please review and customize it for your business.
`,
  };
}

function generateRefundsPolicy(input: PolicyGeneratorInput): GeneratedPolicy {
  const {
    storeName,
    merchantSupportWhatsApp,
    supportEmail,
    refundWindowDays = 5,
  } = input;

  return {
    type: "refunds",
    title: "Refund Policy",
    contentMd: `# Refund Policy

${storeName} processes refunds for approved returns and order cancellations.

## When Refunds Apply

Refunds are issued for:
- Approved product returns (see Returns Policy)
- Cancelled orders (before dispatch)
- Defective or incorrect items
- Failed deliveries due to our error

## Refund Method

Refunds will be issued via:
- Bank transfer to your account
- Original payment method (for card payments)
- Store credit (if you prefer)

Please provide your bank account details when requesting a refund.

## Processing Time

Once your return is approved:
- We will inspect the item within 2-3 business days
- Approved refunds will be processed within **${refundWindowDays} business days**
- You will receive a confirmation email/message once the refund is issued

Please allow additional time for your bank to process the refund.

## Non-Refundable Items

The following are not refundable:
- Delivery fees (unless the return is due to our error)
- Items that don't meet return requirements
- Items returned after the returns window

## Partial Refunds

Partial refunds may be issued for:
- Items returned in less than perfect condition
- Items missing accessories or packaging

## Contact Us

For refund inquiries:
- WhatsApp: ${merchantSupportWhatsApp}
- Email: ${supportEmail}

**Last updated:** This policy was generated as a template. Please review and customize it for your business.
`,
  };
}

function generateShippingDeliveryPolicy(
  input: PolicyGeneratorInput,
): GeneratedPolicy {
  const {
    storeName,
    merchantSupportWhatsApp,
    supportEmail,
    deliveryCities = ["Lagos"],
    dispatchMode = "both",
    partnerName = "Kwik",
    pickupAddress = "Lagos, Nigeria",
  } = input;

  const showSelfDispatch = dispatchMode === "self" || dispatchMode === "both";
  const showPartner = dispatchMode === "partner" || dispatchMode === "both";

  return {
    type: "shipping_delivery",
    title: "Shipping & Delivery Policy",
    contentMd: `# Shipping & Delivery Policy

${storeName} delivers to locations across Nigeria.

## Delivery Areas

We currently deliver to: ${deliveryCities.join(", ")}

If your location is not listed, contact us to check if we can deliver to you.

## Delivery Methods

${showSelfDispatch
        ? `### Self-Dispatch
We use our own riders for deliveries. This allows us to provide personalized service and ensure your order arrives safely.
`
        : ""
      }
${showPartner
        ? `### Partner Delivery
We may use delivery partners like ${partnerName} where available. This helps us reach more locations and provide faster delivery.
`
        : ""
      }
### Customer Pickup
You can also pick up your order from: ${pickupAddress}

## Delivery Fees and Times

- **Delivery fees** vary by location and are shown at checkout
- **Delivery times** are estimates and may vary due to:
  - Traffic conditions
  - Weather
  - Customer availability
  - Location accessibility

We will provide an estimated delivery time when you place your order.

## Address Confirmation

- We may contact you on WhatsApp to confirm your address before dispatch
- Please provide clear landmarks and directions
- In Nigeria, landmarks are often more helpful than formal addresses

## Failed Delivery

Common reasons for failed delivery:
- Unreachable phone number
- Incorrect or incomplete address
- Customer unavailable
- Refused delivery

**Re-delivery:** Additional fees may apply for re-delivery attempts.

## Delivery Confirmation

- We may collect proof of delivery (photo, signature, or WhatsApp confirmation)
- Risk of loss passes to you upon successful delivery

## Shipping Labels

Shipping labels are optional and may not be used for all deliveries. Many deliveries in Nigeria are successfully completed without labels.

## Contact Us

For delivery questions:
- WhatsApp: ${merchantSupportWhatsApp}
- Email: ${supportEmail}

**Last updated:** This policy was generated as a template. Please review and customize it for your business.
`,
  };
}
