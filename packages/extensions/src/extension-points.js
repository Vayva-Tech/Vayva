/**
 * Extension Points System
 *
 * Defines canonical extension points where add-ons can attach.
 * Add-ons cannot create new primary workflows; only enhance existing ones.
 */
export var ExtensionPoint;
(function (ExtensionPoint) {
    // Orders
    ExtensionPoint["ORDERS_PRICING"] = "orders.pricing";
    ExtensionPoint["ORDERS_STATUS"] = "orders.status";
    // Payments
    ExtensionPoint["PAYMENTS_RECONCILIATION"] = "payments.reconciliation";
    ExtensionPoint["PAYMENTS_EXPORT"] = "payments.export";
    // Inventory
    ExtensionPoint["INVENTORY_FORECASTING"] = "inventory.forecasting";
    ExtensionPoint["INVENTORY_SUPPLIER_SYNC"] = "inventory.supplier_sync";
    // Deliveries
    ExtensionPoint["DELIVERIES_COORDINATION"] = "deliveries.coordination";
    ExtensionPoint["DELIVERIES_PROOF"] = "deliveries.proof";
    // Records & Reports
    ExtensionPoint["REPORTS_ANALYTICS"] = "reports.analytics";
    ExtensionPoint["REPORTS_COMPLIANCE"] = "reports.compliance";
    // Team
    ExtensionPoint["TEAM_APPROVALS"] = "team.approvals";
    ExtensionPoint["TEAM_AUDIT"] = "team.audit";
})(ExtensionPoint || (ExtensionPoint = {}));
/**
 * Extension Point Registry
 */
export const ExtensionPointRegistry = {
    [ExtensionPoint.ORDERS_PRICING]: {
        point: ExtensionPoint.ORDERS_PRICING,
        name: "Order Pricing",
        description: "Add custom pricing rules and calculations",
        category: "orders",
        capabilities: [
            "dynamic_pricing",
            "bulk_discounts",
            "customer_specific_pricing",
        ],
    },
    [ExtensionPoint.ORDERS_STATUS]: {
        point: ExtensionPoint.ORDERS_STATUS,
        name: "Order Status",
        description: "Enrich order statuses with additional information",
        category: "orders",
        capabilities: [
            "custom_statuses",
            "auto_progression",
            "status_notifications",
        ],
    },
    [ExtensionPoint.PAYMENTS_RECONCILIATION]: {
        point: ExtensionPoint.PAYMENTS_RECONCILIATION,
        name: "Payment Reconciliation",
        description: "Helper tools for payment reconciliation",
        category: "payments",
        capabilities: [
            "auto_matching",
            "dispute_tracking",
            "reconciliation_reports",
        ],
    },
    [ExtensionPoint.PAYMENTS_EXPORT]: {
        point: ExtensionPoint.PAYMENTS_EXPORT,
        name: "Payment Export",
        description: "Export payment data to external systems",
        category: "payments",
        capabilities: ["accounting_export", "bank_reconciliation", "tax_reports"],
    },
    [ExtensionPoint.INVENTORY_FORECASTING]: {
        point: ExtensionPoint.INVENTORY_FORECASTING,
        name: "Inventory Forecasting",
        description: "Predict inventory needs and stock levels",
        category: "inventory",
        capabilities: ["demand_forecasting", "reorder_alerts", "trend_analysis"],
    },
    [ExtensionPoint.INVENTORY_SUPPLIER_SYNC]: {
        point: ExtensionPoint.INVENTORY_SUPPLIER_SYNC,
        name: "Supplier Sync",
        description: "Synchronize inventory with supplier systems",
        category: "inventory",
        capabilities: ["auto_ordering", "supplier_integration", "stock_updates"],
    },
    [ExtensionPoint.DELIVERIES_COORDINATION]: {
        point: ExtensionPoint.DELIVERIES_COORDINATION,
        name: "Delivery Coordination",
        description: "Coordinate deliveries with riders and logistics",
        category: "deliveries",
        capabilities: [
            "rider_assignment",
            "route_optimization",
            "delivery_tracking",
        ],
    },
    [ExtensionPoint.DELIVERIES_PROOF]: {
        point: ExtensionPoint.DELIVERIES_PROOF,
        name: "Proof of Delivery",
        description: "Enhanced proof-of-delivery capabilities",
        category: "deliveries",
        capabilities: [
            "photo_capture",
            "signature_collection",
            "delivery_confirmation",
        ],
    },
    [ExtensionPoint.REPORTS_ANALYTICS]: {
        point: ExtensionPoint.REPORTS_ANALYTICS,
        name: "Advanced Analytics",
        description: "Advanced reporting and analytics capabilities",
        category: "reports",
        capabilities: ["custom_reports", "trend_analysis", "predictive_insights"],
    },
    [ExtensionPoint.REPORTS_COMPLIANCE]: {
        point: ExtensionPoint.REPORTS_COMPLIANCE,
        name: "Compliance Reports",
        description: "Generate compliance and regulatory reports",
        category: "reports",
        capabilities: ["tax_reports", "audit_trails", "regulatory_exports"],
    },
    [ExtensionPoint.TEAM_APPROVALS]: {
        point: ExtensionPoint.TEAM_APPROVALS,
        name: "Approval Layers",
        description: "Add approval workflows for team actions",
        category: "team",
        capabilities: [
            "multi_level_approvals",
            "approval_rules",
            "approval_tracking",
        ],
    },
    [ExtensionPoint.TEAM_AUDIT]: {
        point: ExtensionPoint.TEAM_AUDIT,
        name: "Audit Logging",
        description: "Comprehensive audit logging for team actions",
        category: "team",
        capabilities: ["action_logging", "change_tracking", "audit_reports"],
    },
};
/**
 * Get extension point definition
 */
export function getExtensionPoint(point) {
    return ExtensionPointRegistry[point];
}
/**
 * Get extension points by category
 */
export function getExtensionPointsByCategory(category) {
    return Object.values(ExtensionPointRegistry).filter((ep) => ep.category === category);
}
/**
 * Validate extension point exists
 */
export function isValidExtensionPoint(point) {
    return Object.values(ExtensionPoint).includes(point);
}
