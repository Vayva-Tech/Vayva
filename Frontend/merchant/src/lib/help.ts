export const HELP_ARTICLES = [
    {
        id: "setup-whatsapp",
        slug: "setup-whatsapp-sync",
        title: "How to setup WhatsApp Sync",
        category: "Getting Started",
        summary: "Connect your WhatsApp account to capture orders and inquiries automatically.",
        lastUpdated: "Feb 8, 2026",
        content: `
            Vayva connects to WhatsApp via a secure cloud bridge. No phone-side installation is required.

            ### Steps to connect
            1. Open your Dashboard and click **Connect WhatsApp**.
            2. Scan the QR code with your phone (similar to WhatsApp Web).
            3. Confirm the connection and complete the short verification prompt.

            ### What the system reads
            Vayva only analyzes messages related to product inquiries, pricing, and order confirmation. Personal or unrelated chats are not used for automation.

            ### Common questions
            **Can I disconnect later?**  
            Yes. You can disconnect or reconnect from **Settings > WhatsApp**.

            **Will customers know they are talking to automation?**  
            You can choose whether messages are fully automated or flagged as assisted.
        `,
    },
    {
        id: "payment-methods",
        slug: "payment-methods-nigeria",
        title: "Supported Payment Methods in Nigeria",
        category: "Payments",
        summary: "Accept bank transfers, USSD, and card payments through Vayva.",
        lastUpdated: "Feb 8, 2026",
        content: `
            Vayva supports popular payment methods used across Nigeria.

            ### Bank Transfers
            Share your bank details with customers and verify payments using receipts or transaction references.

            ### USSD and Cards
            Vayva integrates with Paystack to enable USSD and card payments. Settlements go directly to your connected bank account.

            ### Manual Recording
            Record cash or offline payments manually to keep your books accurate.

            ### Common questions
            **Can I accept multiple payment methods at once?**  
            Yes. You can enable several methods and let customers choose.

            **Where do I view payment history?**  
            Go to **Payments** in the dashboard to see all transactions.
        `,
    },
    {
        id: "managing-orders",
        slug: "managing-orders-workflow",
        title: "Managing your Order Workflow",
        category: "Orders",
        summary: "Move orders from capture to delivery using clear, consistent statuses.",
        lastUpdated: "Feb 8, 2026",
        content: `
            Every business has a slightly different flow. Vayva supports custom order statuses.

            ### Default workflow
            1. **Pending**: New order captured.
            2. **Paid**: Payment verified.
            3. **Processing**: Order is being prepared.
            4. **In Transit**: Handed to a carrier.
            5. **Delivered**: Customer confirmed receipt.

            ### Common questions
            **Can I add custom steps?**  
            Yes. Add steps like **On Hold** or **Awaiting Stock** in **Settings > Orders**.

            **Do status changes notify customers?**  
            Notifications can be enabled per status in your notification settings.
        `,
    },
    {
        id: "logistics-integration",
        slug: "logistics-carriers-nigeria",
        title: "Integrating with Nigerian Logistics",
        category: "Logistics",
        summary: "Coordinate with major carriers or your own riders from one place.",
        lastUpdated: "Feb 8, 2026",
        content: `
            Vayva centralizes delivery data so you can coordinate quickly.

            ### Third-party carriers
            Generate shipping labels or export delivery details for carriers like GIGL or Terminal Africa.

            ### Local dispatch
            If you use your own riders, they can access the optional **Rider View** to see queues and update statuses.

            ### Common questions
            **Can I mix carrier and self-dispatch?**  
            Yes. You can choose per order.

            **Do riders need separate accounts?**  
            Optional. You can enable Rider View for limited access.
        `,
    },
    {
        id: "pricing-plans",
        slug: "understanding-vayva-plans",
        title: "Understanding Vayva Pricing Plans",
        category: "Pricing",
        summary: "Choose a plan based on your volume and operational needs.",
        lastUpdated: "Feb 8, 2026",
        content: `
            Vayva offers three main tiers:

            - **Starter (Free)**: For solo sellers getting started. Includes basic WhatsApp capture and manual records.
            - **Growth (₦5,000/mo)**: For established shops. Includes inventory, staff roles, and advanced exports.
            - **Scale (₦15,000/mo)**: For high-volume businesses or multi-branch operations. Includes audit logs and priority support.

            ### Common questions
            **Can I upgrade mid-cycle?**  
            Yes. Plan changes apply immediately and are prorated where applicable.

            **Do you offer annual billing?**  
            Check **Settings > Billing** for current billing options.
        `,
    },
    {
        id: "adding-team",
        slug: "multi-user-access",
        title: "Adding Team Members & Permissions",
        category: "Account",
        summary: "Invite staff and assign roles with clear access boundaries.",
        lastUpdated: "Feb 8, 2026",
        content: `
            Use the Team feature instead of sharing a single login.

            ### Roles
            - **Owner**: Full access, including billing.
            - **Manager**: Full access to orders and products, no billing changes.
            - **Staff**: Create and view orders, no revenue visibility.
            - **Dispatch**: Access shipping and delivery queues only.

            ### Common questions
            **Can I change a role later?**  
            Yes. Update roles anytime in **Settings > Team**.

            **How many team members can I add?**  
            Limits depend on your plan. See **Settings > Billing**.
        `,
    },
    {
        id: "product-management",
        slug: "product-management-basics",
        title: "Product Management Basics",
        category: "Products",
        summary: "Create, organize, and maintain a clean product catalog.",
        lastUpdated: "Feb 8, 2026",
        content: `
            A clear catalog reduces order mistakes and speeds up customer decisions.

            ### Create a product
            1. Go to **Products** and click **Add Product**.
            2. Add a clear title, price, and description.
            3. Upload at least two photos from different angles.
            4. Set inventory and optional variants (size, color, pack).

            ### Best practices
            - Use consistent naming and categories.
            - Keep inventory updated to avoid stockouts.
            - Highlight bestsellers on your storefront.

            ### Common questions
            **Can I bulk upload products?**  
            Yes. Use bulk upload to add many products at once.

            **Can I hide a product without deleting it?**  
            Yes. Toggle availability to temporarily hide it.
        `,
    },
    {
        id: "storefront-design",
        slug: "storefront-design",
        title: "Storefront Design and Branding",
        category: "Design",
        summary: "Customize your store for a consistent, professional look.",
        lastUpdated: "Feb 8, 2026",
        content: `
            Your storefront should look trustworthy and match your brand.

            ### Customize your look
            - Choose a template that fits your product style.
            - Set brand colors and button styles.
            - Add a banner image and featured products.

            ### Common questions
            **Can I preview changes before publishing?**  
            Yes. Use preview mode to confirm updates.

            **Will design changes affect orders?**  
            No. Visual changes do not impact payments or order status.
        `,
    },
    {
        id: "marketing-links",
        slug: "marketing-and-share-links",
        title: "Marketing and Shareable Links",
        category: "Marketing",
        summary: "Share your store and products to drive traffic and sales.",
        lastUpdated: "Feb 8, 2026",
        content: `
            Shareable links make it easy for customers to purchase quickly.

            ### What you can share
            - Storefront link for full catalog browsing
            - Individual product links for direct checkout
            - Featured product collections

            ### Common questions
            **Can I track which links perform best?**  
            Use Analytics to compare product views and conversions.

            **Can I run promotions?**  
            Yes. Promotions can be applied to new orders only.
        `,
    },
    {
        id: "analytics",
        slug: "analytics-and-reporting",
        title: "Analytics and Reporting",
        category: "Analytics",
        summary: "Use data to understand sales trends and customer behavior.",
        lastUpdated: "Feb 8, 2026",
        content: `
            Analytics helps you make informed decisions and plan inventory.

            ### Key metrics
            - Revenue and order volume over time
            - Top-performing products
            - Conversion rate and repeat customers

            ### Common questions
            **How often does data update?**  
            Metrics update throughout the day as transactions are recorded.

            **Can I export reports?**  
            Yes. Use the export option in the Analytics section.
        `,
    },
    {
        id: "account-security",
        slug: "account-security",
        title: "Account Security",
        category: "Security",
        summary: "Protect your account and limit access to sensitive data.",
        lastUpdated: "Feb 8, 2026",
        content: `
            Keep your account safe by following basic security practices.

            ### Security checklist
            - Use strong, unique passwords.
            - Avoid sharing your primary login.
            - Assign roles to staff based on job duties.

            ### Common questions
            **What if I lose access to my email?**  
            Contact support to verify ownership and recover access.

            **Can I remove a team member instantly?**  
            Yes. Deactivate their account in **Settings > Team**.
        `,
    },
    {
        id: "refunds-returns",
        slug: "refunds-returns-disputes",
        title: "Refunds, Returns, and Disputes",
        category: "Returns",
        summary: "Handle refunds and returns with clear documentation.",
        lastUpdated: "Feb 8, 2026",
        content: `
            A clear process builds trust and reduces payment disputes.

            ### Recommended flow
            1. Confirm the reason and agree on the outcome.
            2. Update the order status to reflect return or refund.
            3. Record the refund method and reference.
            4. Notify the customer once completed.

            ### Common questions
            **Should I have a written policy?**  
            Yes. A short policy helps set expectations.

            **Can I issue partial refunds?**  
            Yes. Record partial refunds in order notes.
        `,
    },
    {
        id: "customer-communication",
        slug: "customer-communication",
        title: "Customer Communication Best Practices",
        category: "Customer Care",
        summary: "Keep customers informed and reduce order friction.",
        lastUpdated: "Feb 8, 2026",
        content: `
            Clear communication reduces cancellations and support requests.

            ### Recommended messages
            - Order confirmation and expected delivery timeline
            - Payment received confirmation
            - Out-of-stock or delay notifications

            ### Common questions
            **Can I send automated updates?**  
            Yes. Enable notifications for key order statuses.

            **Should I confirm addresses before dispatch?**  
            Yes. Confirming addresses reduces failed deliveries.
        `,
    },
    {
        id: "integrations",
        slug: "integrations-and-tools",
        title: "Integrations and Tools",
        category: "Integrations",
        summary: "Connect external tools to streamline your workflow.",
        lastUpdated: "Feb 8, 2026",
        content: `
            Integrations help you move faster with fewer manual steps.

            ### Common integrations
            - Payments providers for cards and USSD
            - Logistics carriers for delivery updates
            - Analytics exports for reporting

            ### Common questions
            **Do integrations require developer setup?**  
            Most integrations are no-code and can be enabled from settings.

            **Can I disconnect an integration later?**  
            Yes. Disconnect anytime from **Settings > Integrations**.
        `,
    },
];
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getArticleBySlug(slug: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return HELP_ARTICLES.find((a) => a.slug === slug);
}
