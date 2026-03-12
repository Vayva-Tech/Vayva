export interface HelpArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  icon: string;
  summary: string;
  content: string;
  lastUpdated?: string;
}

export const HELP_CATEGORIES: {
  name: string;
  icon: string;
  description: string;
}[] = [
  {
    name: "Onboarding",
    icon: "upload-cloud",
    description: "Get started with your store",
  },
  {
    name: "Logistics",
    icon: "truck",
    description: "Shipping and delivery setup",
  },
  {
    name: "Billing",
    icon: "credit-card",
    description: "Plans, payments, and invoices",
  },
  { name: "Design", icon: "paint-brush", description: "Storefront customization" },
  { name: "Products", icon: "package", description: "Catalog and inventory" },
  { name: "AI Agent", icon: "sparkle", description: "WhatsApp automation" },
  {
    name: "Orders",
    icon: "shopping-bag",
    description: "Order management and statuses",
  },
  {
    name: "Payments",
    icon: "wallet",
    description: "Payment methods and reconciliation",
  },
  {
    name: "Marketing",
    icon: "speaker",
    description: "Promotions, links, and campaigns",
  },
  {
    name: "Analytics",
    icon: "bar-chart",
    description: "Performance and reporting",
  },
  {
    name: "Security",
    icon: "shield",
    description: "Account security and access",
  },
  {
    name: "Account",
    icon: "user",
    description: "Profiles, roles, and settings",
  },
  {
    name: "Returns",
    icon: "receipt",
    description: "Refunds, returns, and disputes",
  },
];

export const HELP_ARTICLES: HelpArticle[] = [
  {
    id: "1",
    slug: "getting-started",
    category: "Onboarding",
    icon: "rocket-launch",
    title: "How to get started with Vayva",
    summary:
      "Set up your store, publish your catalog, and accept your first order with confidence.",
    content: `Vayva helps you launch quickly while keeping your setup professional and consistent.

### Quick Start Checklist
1. Create your account and verify your email.
2. Add your store name, logo, and primary contact details.
3. Choose a storefront template that matches your brand.
4. Add at least one product with price, photos, and inventory.
5. Enable a payment method and delivery option.
6. Publish your storefront and share your link.

### Common Questions
**How long does setup take?**  
Most merchants complete the basic setup in 20-30 minutes.

**Do I need a website?**  
No. Vayva provides a hosted storefront and shareable product links.

**Can I edit my store after publishing?**  
Yes. Changes to products, pricing, and design are reflected instantly.

**What information is required to start?**  
Store name, contact details, and at least one product listing.`,
    lastUpdated: "2026-02-08",
  },
  {
    id: "2",
    slug: "delivery-options",
    category: "Logistics",
    icon: "truck",
    title: "Delivery Options: Partner vs Own Rider",
    summary:
      "Decide between Vayva's integrated delivery partner or managing your own riders.",
    content: `Vayva supports two delivery models so you can choose what fits your operation.

### Options
**Vayva Delivery Partner (Kwik)**  
Automatic dispatching, tracking, and status updates. Ideal for fast local delivery in supported areas.

**Own Dispatch Riders**  
Use your in-house riders or local dispatch services. You control routing and timelines.

### How to Configure
Go to **Settings > Delivery** in the Merchant Dashboard and select your preferred option.

### Common Questions
**Can I switch between options later?**  
Yes. You can change your delivery model at any time in settings.

**Do customers see tracking updates?**  
Yes, when using the integrated partner. For self-dispatch, you can manually update statuses.

**Is delivery available outside Lagos?**  
Coverage depends on the delivery partner's service area. Self-dispatch is available everywhere.`,
    lastUpdated: "2026-02-08",
  },
  {
    id: "3",
    slug: "pricing-plans",
    category: "Billing",
    icon: "credit-card",
    title: "Pricing and Limits",
    summary:
      "Compare plans, understand fees, and choose the right tier for your growth stage.",
    content: `Vayva plans are designed to scale with your business.

### Plan Overview
**Free**  
Explore the platform and launch a basic storefront.

**Starter**  
Unlock full commerce features and standard support.

**Pro**  
Includes AI automation, advanced analytics, and priority support.

### Common Questions
**Are there transaction fees?**  
Fees may apply depending on your payment provider and plan.

**Can I change plans later?**  
Yes. You can upgrade or downgrade at any time from Billing settings.

**Where can I see my invoices?**  
Go to **Settings > Billing** to download invoices and view payment history.`,
    lastUpdated: "2026-02-08",
  },
  {
    id: "4",
    slug: "storefront-customization",
    category: "Design",
    icon: "paint-brush",
    title: "Customizing your Storefront",
    summary: "Use the visual builder to tailor your storefront to your brand.",
    content: `The visual builder gives you professional control without code.

### What You Can Customize
- Templates and layout sections
- Colors, typography, and button styles
- Banner images and featured products
- Page order and navigation

### Common Questions
**Do I need design experience?**  
No. Templates provide a strong starting point, and you can edit safely.

**Can I preview changes before publishing?**  
Yes. Use the preview mode to review updates before they go live.

**Will changes affect existing orders?**  
No. Design changes do not impact active orders or payments.`,
    lastUpdated: "2026-02-08",
  },
  {
    id: "5",
    slug: "adding-products",
    category: "Products",
    icon: "package",
    title: "Adding and Managing Products",
    summary:
      "Create products, manage inventory, and keep your catalog accurate.",
    content: `A complete product listing helps customers decide quickly.

### Add a Product
1. Go to **Products** in the dashboard.
2. Click **Add Product**.
3. Enter the title, description, price, and inventory.
4. Upload clear images and choose a category.
5. Add variants such as size or color (optional).

### Common Questions
**Can I import products in bulk?**  
Yes. Use the bulk upload option in the Products section.

**How do I mark items as out of stock?**  
Set inventory to zero or toggle availability.

**Can I add multiple images per product?**  
Yes. Multiple images are supported and recommended.`,
    lastUpdated: "2026-02-08",
  },
  {
    id: "6",
    slug: "whatsapp-ai-agent",
    category: "AI Agent",
    icon: "sparkle",
    title: "Setting up your WhatsApp AI Agent",
    summary:
      "Configure a 24/7 automated assistant to answer customer questions on WhatsApp.",
    content: `The AI Agent helps you respond faster and capture more orders.

### Setup Steps
1. Go to **Settings > AI Agent**.
2. Choose your agent name and tone.
3. Connect your WhatsApp Business number.
4. Add FAQs and product details to the knowledge base.
5. Test the agent with a sample conversation.

### Common Questions
**Will the AI send messages without approval?**  
You control the level of automation and can require approval for specific scenarios.

**Can I update the knowledge base later?**  
Yes. Updates take effect immediately.

**Does it support multiple languages?**  
Language support depends on your configured settings and content.`,
    lastUpdated: "2026-02-08",
  },
  {
    id: "7",
    slug: "managing-orders",
    category: "Orders",
    icon: "shopping-bag",
    title: "Managing Orders from Capture to Delivery",
    summary:
      "Track orders clearly with consistent statuses and internal notes.",
    content: `Vayva helps you keep order processing structured from the first message to final delivery.

### Recommended Order Flow
1. **Pending**: Order captured and awaiting confirmation.
2. **Confirmed**: Order details verified with the customer.
3. **Paid**: Payment received and verified.
4. **Processing**: Item is being packed or prepared.
5. **In Transit**: Handed off to a courier.
6. **Delivered**: Customer confirms receipt.

### Best Practices
- Confirm quantity, color, size, and delivery address before marking as Confirmed.
- Add internal notes for edge cases like customizations or delivery windows.
- Use consistent status updates so staff and customers stay aligned.

### Common Questions
**Can I customize statuses?**  
Yes. You can add or rename statuses to match your workflow.

**Will customers see status updates?**  
You can enable customer notifications for key status changes.

**How do I handle partial payments?**  
Record the paid amount and keep the order in Pending or Confirmed until fully paid.`,
    lastUpdated: "2026-02-08",
  },
  {
    id: "8",
    slug: "payments-and-reconciliation",
    category: "Payments",
    icon: "wallet",
    title: "Payments and Reconciliation",
    summary:
      "Accept multiple payment methods and reconcile transactions accurately.",
    content: `Vayva supports flexible payments while keeping your records clean.

### Supported Payment Methods
- Bank transfer
- Card payments
- USSD (via supported providers)
- Cash or offline payments (manual recording)

### Reconciliation Tips
- Match each order to a payment reference when possible.
- Use notes for manual or split payments.
- Review the Payments dashboard weekly to catch anomalies.

### Common Questions
**Can I accept more than one method at a time?**  
Yes. You can enable multiple methods and let customers choose.

**How do I handle failed payments?**  
Mark the payment attempt as failed and keep the order in Pending until resolved.

**Where do I see payment history?**  
Go to the Payments section in your dashboard for a full ledger.`,
    lastUpdated: "2026-02-08",
  },
  {
    id: "9",
    slug: "promotions-and-discounts",
    category: "Marketing",
    icon: "speaker",
    title: "Promotions, Discounts, and Shareable Links",
    summary: "Run promotions and share product links to increase conversions.",
    content: `Make it easy for customers to buy quickly by using clear offers and direct links.

### Ways to Promote
- Share your storefront link on WhatsApp, Instagram, and TikTok.
- Use product-specific links for fast checkout.
- Offer time-bound discounts on featured items.

### Best Practices
- Keep discounts simple and clearly stated.
- Highlight bestsellers first to build trust.
- Use consistent product photos and titles across channels.

### Common Questions
**Can I promote a single product without sharing my full store?**  
Yes. Each product has a shareable link.

**Will discounts affect existing orders?**  
Discounts apply only to orders created after the promotion starts.

**How do I measure campaign performance?**  
Use the Analytics dashboard to track visits and conversions.`,
    lastUpdated: "2026-02-08",
  },
  {
    id: "10",
    slug: "analytics-overview",
    category: "Analytics",
    icon: "bar-chart",
    title: "Analytics Overview",
    summary: "Understand sales trends, top products, and customer activity.",
    content: `Analytics helps you make confident business decisions based on real data.

### Key Metrics to Track
- Sales volume and revenue trends
- Conversion rate from visits to orders
- Top-performing products
- Repeat customer rate

### How to Use Analytics
- Identify bestsellers and keep them in stock.
- Compare weekly performance to spot growth patterns.
- Review refund and cancellation rates to improve operations.

### Common Questions
**How often does data update?**  
Metrics update throughout the day as orders and payments are recorded.

**Can I export reports?**  
Yes. You can export reports from the Analytics section.

**Does Analytics include WhatsApp conversations?**  
It tracks order-related outcomes, not private chat content.`,
    lastUpdated: "2026-02-08",
  },
  {
    id: "11",
    slug: "account-security",
    category: "Security",
    icon: "shield",
    title: "Account Security and Access",
    summary:
      "Protect your account with secure access and role-based permissions.",
    content: `Keep your business safe by controlling who can access what.

### Security Best Practices
- Use a strong, unique password.
- Avoid sharing your main login.
- Assign roles to staff with the least access required.

### Common Questions
**Can I see who did what?**  
Activity logs may be available depending on your plan.

**What if I lose access to my email?**  
Contact support to complete account recovery.

**How do I remove a team member?**  
Go to Settings > Team and deactivate their access immediately.`,
    lastUpdated: "2026-02-08",
  },
  {
    id: "12",
    slug: "team-roles-and-permissions",
    category: "Account",
    icon: "user",
    title: "Team Roles and Permissions",
    summary: "Invite staff and assign roles that match their responsibilities.",
    content: `Use role-based access to keep operations efficient and secure.

### Typical Roles
- **Owner**: Full access, including billing and settings.
- **Manager**: Manages orders and products, no billing changes.
- **Staff**: Creates and updates orders, limited reporting.
- **Dispatch**: Focused access to delivery queues.

### Common Questions
**Can I change a role later?**  
Yes. Role changes take effect immediately.

**Is there a limit on team members?**  
Limits depend on your plan and can be adjusted by upgrading.

**Can two people be Owners?**  
Yes, if your plan allows multiple full-access users.`,
    lastUpdated: "2026-02-08",
  },
  {
    id: "13",
    slug: "refunds-and-returns",
    category: "Returns",
    icon: "receipt",
    title: "Refunds, Returns, and Disputes",
    summary: "Handle refunds and returns professionally with clear records.",
    content: `A clean refund process builds trust and reduces disputes.

### Recommended Refund Flow
1. Confirm the reason for the refund or return.
2. Update the order status to indicate return or refund in progress.
3. Record the refund method and reference.
4. Notify the customer once completed.

### Common Questions
**Do I need a formal policy?**  
Yes. A short written policy improves customer clarity and reduces conflicts.

**Can I issue partial refunds?**  
Yes. Record partial refunds in the order notes for accuracy.

**How should I handle disputes?**  
Document conversations and keep payment references in one place.`,
    lastUpdated: "2026-02-08",
  },
];

export function getArticleBySlug(slug: string): HelpArticle | undefined {
  return HELP_ARTICLES.find((article) => article.slug === slug);
}
