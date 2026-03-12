import { LegalDocument } from "../types";

export const defaultReturnsPolicy: LegalDocument = {
  slug: "returns",
  title: "Returns Policy",
  lastUpdated: "December 17, 2025",
  summary: "Our policy on returns and refunds.",
  sections: [
    {
      heading: "Return Window",
      content: [
        "We accept returns within 7 days of delivery. Items must be unused, in their original packaging, and in the same condition that you received them.",
      ],
    },
    {
      heading: "Non-Returnable Items",
      content: [
        "Certain types of items cannot be returned, like perishable goods (such as food, flowers, or plants), custom products (such as special orders or personalized items), and personal care goods (such as beauty products).",
      ],
    },
    {
      heading: "Process",
      content: [
        "To start a return, you can contact us via our WhatsApp link or email. If your return is accepted, we will provide instructions on how and where to send your package. Items sent back to us without first requesting a return will not be accepted.",
      ],
    },
    {
      heading: "Refunds",
      content: [
        "We will notify you once we’ve received and inspected your return, and let you know if the refund was approved or not. If approved, you’ll be automatically refunded on your original payment method within 10 business days.",
      ],
    },
  ],
};

export const defaultShippingPolicy: LegalDocument = {
  slug: "shipping",
  title: "Shipping Policy",
  lastUpdated: "December 17, 2025",
  summary: "How we get your order to you.",
  sections: [
    {
      heading: "Processing Time",
      content: [
        "All orders are processed within 1 to 3 business days (excluding weekends and holidays) after receiving your order confirmation email. You will receive another notification when your order has shipped.",
      ],
    },
    {
      heading: "Domestic Shipping (Nigeria)",
      content: [
        "We ship nationwide. Shipping charges for your order will be calculated and displayed at checkout.",
        "Estimated delivery time (Lagos): 1-3 business days.",
        "Estimated delivery time (Nationwide): 3-7 business days.",
      ],
    },
    {
      heading: "Local Pickup",
      content: [
        "You can skip the shipping fees with free local pickup. After placing your order and selecting local pickup at checkout, your order will be prepared and ready for pick up within 1 to 2 business days. We will send you an email when your order is ready along with instructions.",
      ],
    },
  ],
};

export const defaultStorePrivacy: LegalDocument = {
  slug: "store-privacy",
  title: "Store Privacy Policy",
  lastUpdated: "December 17, 2025",
  summary: "How we handle your data.",
  sections: [
    {
      heading: "Data Collection",
      content: [
        "We collect your name, shipping address, and phone number solely for the purpose of fulfilling your orders. We do not sell or share your data with third parties for marketing purposes.",
      ],
    },
    {
      heading: "Payments",
      content: [
        "Our store is hosted on Vayva. Payments are processed securely via Paystack. We do not store your credit card details.",
      ],
    },
  ],
};

export const defaultStoreTerms: LegalDocument = {
  slug: "store-terms",
  title: "Terms of Service",
  lastUpdated: "December 17, 2025",
  summary: "Rules for using our store.",
  sections: [
    {
      heading: "Product Accuracy",
      content: [
        "We try to be as accurate as possible with our product descriptions and images. However, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.",
      ],
    },
    {
      heading: "Order Acceptance",
      content: [
        "We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or cancel quantities purchased per person, per household or per order.",
      ],
    },
  ],
};
