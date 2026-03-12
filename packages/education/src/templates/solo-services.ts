/**
 * Solo Services Template Education Map
 *
 * Defines contextual guidance for the Solo Services template.
 */

export const SoloServicesEducation = {
  templateId: "solo-services",
  templateName: "Solo Services",

  workflows: {
    bookings: {
      emptyState: {
        primary:
          "Bookings from WhatsApp will appear here once customers request your services.",
        secondary: "Start by confirming a booking in chat.",
      },
      firstAction: {
        guidanceId: "services_first_booking",
        message:
          "Recording bookings helps you stay organized and avoid double-booking.",
        trigger: "on_first_booking_create",
      },
      workflowStall: {
        guidanceId: "services_booking_no_confirmation",
        trigger: "no_confirmation_after_12h",
        message: "This booking hasn't been confirmed yet.",
      },
      explanations: {
        bookingStatus:
          "Booking statuses help you track which services are scheduled, in progress, or completed.",
      },
    },

    payments: {
      emptyState: {
        primary:
          "Payment confirmations will appear here once you start recording payments.",
        secondary: "Track payments to know which services have been paid for.",
      },
      firstAction: {
        guidanceId: "services_first_payment",
        message:
          "Recording payment confirmations helps you track which bookings are paid.",
        trigger: "on_first_payment_record",
      },
      explanations: {
        paymentConfirmation:
          "Payment confirmation helps you verify which services have been paid for.",
      },
    },

    customers: {
      emptyState: {
        primary: "Customer records will appear here as you serve customers.",
        secondary: "Customer records help you provide better service.",
      },
      explanations: {
        customerHistory:
          "Customer history helps you remember preferences and provide personalized service.",
      },
    },

    records: {
      emptyState: {
        primary:
          "Your service records will appear here as you complete bookings.",
        secondary: "Records help you track your business activity.",
      },
      explanations: {
        recordsUsage:
          "Records show your completed services and help you understand your business.",
      },
    },
  },
};
