/**
 * Retail Selling Template Education Map
 *
 * Defines contextual guidance for the Retail Selling template.
 */

export const RetailSellingEducation = {
  templateId: "simple-retail",
  templateName: "Simple Retail Selling",

  workflows: {
    orders: {
      emptyState: {
        primary:
          "Orders from WhatsApp will appear here once a customer places an order.",
        secondary: "Start by confirming an order in chat.",
      },
      firstAction: {
        guidanceId: "retail_first_order",
        message:
          "Recording orders keeps your business organized and helps track what needs to be delivered.",
        trigger: "on_first_order_create",
      },
      workflowStall: {
        guidanceId: "retail_order_no_payment",
        trigger: "no_payment_after_24h",
        message: "This order hasn't been marked as paid yet.",
      },
      explanations: {
        orderStatus:
          "Order statuses help you track where each order is in your workflow.",
      },
    },

    payments: {
      emptyState: {
        primary:
          "Payment records will appear here once you start recording payments.",
        secondary: "Recording payments keeps your finances accurate.",
      },
      firstAction: {
        guidanceId: "retail_first_payment",
        message:
          "Recording payments keeps your records accurate and helps track delivery.",
        trigger: "on_first_payment_record",
      },
      explanations: {
        paymentProof:
          "Payment proof helps you verify transactions and resolve disputes.",
      },
    },

    delivery: {
      emptyState: {
        primary:
          "Delivery tracking will appear here once orders are ready for delivery.",
        secondary: "Track deliveries to keep customers informed.",
      },
      firstAction: {
        guidanceId: "retail_first_delivery",
        message:
          "Updating delivery status helps customers know when to expect their orders.",
        trigger: "on_first_delivery_update",
      },
      workflowStall: {
        guidanceId: "retail_delivery_pending",
        trigger: "delivery_pending_48h",
        message: "This delivery has been pending for a while.",
      },
      explanations: {
        deliveryStatus:
          "This delivery status is part of the Retail Selling template and helps track order completion.",
      },
    },

    records: {
      emptyState: {
        primary:
          "Your business records will appear here as you complete orders.",
        secondary: "Records help you understand your business performance.",
      },
      explanations: {
        recordsUsage:
          "Records are used for reports and insights about your business.",
      },
    },
  },
};
