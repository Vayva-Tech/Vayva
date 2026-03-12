/**
 * Add-On Types & Metadata
 *
 * Defines add-on types and metadata structure.
 */
import { ExtensionPoint } from "./extension-points";
/**
 * Initial Add-On Inventory (Conservative)
 */
export const InitialAddOns = [
    // Capability Add-Ons
    {
        id: "inventory-forecasting",
        name: "Inventory Forecasting",
        type: "capability",
        version: "v1.0",
        extensionPoint: ExtensionPoint.INVENTORY_FORECASTING,
        compatibleTemplates: [
            "structured-retail",
            "food-catering",
            "online-selling",
        ],
        requiredPlan: "growth",
        description: "Predict inventory needs and get low stock alerts",
        whatItAdds: [
            "Forecast view showing predicted demand",
            "Low stock alerts based on trends",
            "Reorder recommendations",
        ],
        whatItDoesNotChange: [
            "Existing inventory records",
            "Order workflows",
            "Current stock levels",
        ],
        isActive: true,
    },
    {
        id: "advanced-analytics",
        name: "Advanced Analytics",
        type: "capability",
        version: "v1.0",
        extensionPoint: ExtensionPoint.REPORTS_ANALYTICS,
        compatibleTemplates: [
            "simple-retail",
            "solo-services",
            "structured-retail",
            "food-catering",
            "online-selling",
            "wholesale",
            "multi-branch",
            "custom-advanced",
        ],
        requiredPlan: "pro",
        description: "Custom reports and trend analysis for your business",
        whatItAdds: [
            "Custom report builder",
            "Trend analysis charts",
            "Predictive insights",
            "Export to Excel/PDF",
        ],
        whatItDoesNotChange: [
            "Existing reports",
            "Historical data",
            "Default dashboards",
        ],
        isActive: true,
    },
    // Integration Add-Ons
    {
        id: "accounting-export",
        name: "Accounting Export",
        type: "integration",
        version: "v1.0",
        extensionPoint: ExtensionPoint.PAYMENTS_EXPORT,
        compatibleTemplates: [
            "simple-retail",
            "solo-services",
            "structured-retail",
            "food-catering",
            "online-selling",
            "wholesale",
            "multi-branch",
            "custom-advanced",
        ],
        requiredPlan: "growth",
        description: "Export payment data to QuickBooks or Xero",
        whatItAdds: [
            "QuickBooks integration",
            "Xero integration",
            "Automated export scheduling",
            "Transaction mapping",
        ],
        whatItDoesNotChange: [
            "Payment records",
            "Transaction history",
            "Existing workflows",
        ],
        isActive: true,
    },
    {
        id: "supplier-sync",
        name: "Supplier Sync",
        type: "integration",
        version: "v1.0",
        extensionPoint: ExtensionPoint.INVENTORY_SUPPLIER_SYNC,
        compatibleTemplates: ["wholesale", "multi-branch"],
        requiredPlan: "pro",
        description: "Automatically sync inventory with supplier systems",
        whatItAdds: [
            "Automated supplier orders",
            "Real-time stock updates",
            "Supplier catalog sync",
            "Order tracking",
        ],
        whatItDoesNotChange: [
            "Manual ordering process",
            "Existing supplier relationships",
            "Inventory records",
        ],
        isActive: true,
    },
    // Automation Add-Ons
    {
        id: "auto-status-updates",
        name: "Auto-Status Updates",
        type: "automation",
        version: "v1.0",
        extensionPoint: ExtensionPoint.ORDERS_STATUS,
        compatibleTemplates: [
            "simple-retail",
            "solo-services",
            "structured-retail",
            "food-catering",
            "online-selling",
            "wholesale",
            "multi-branch",
            "custom-advanced",
        ],
        requiredPlan: "growth",
        description: "Automatically progress order statuses based on rules",
        whatItAdds: [
            "Automatic status progression",
            "Custom automation rules",
            "Status change notifications",
        ],
        whatItDoesNotChange: [
            "Existing order statuses",
            "Manual status updates",
            "Order history",
        ],
        isActive: true,
    },
];
/**
 * Get add-on by ID
 */
export function getAddOn(id) {
    return InitialAddOns.find((addon) => addon.id === id) || null;
}
/**
 * Get add-ons by type
 */
export function getAddOnsByType(type) {
    return InitialAddOns.filter((addon) => addon.type === type);
}
/**
 * Get add-ons by extension point
 */
export function getAddOnsByExtensionPoint(point) {
    return InitialAddOns.filter((addon) => addon.extensionPoint === point);
}
/**
 * Get add-ons compatible with template
 */
export function getCompatibleAddOns(templateId) {
    return InitialAddOns.filter((addon) => addon.compatibleTemplates.includes(templateId));
}
