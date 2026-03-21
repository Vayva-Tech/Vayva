export function calculateTemplateSwitchPrice(
  storePlan: string | null,
  currentTemplateId: string | null,
  templateId: string,
  templateTier: string | null,
  date: Date | null,
) {
  return {
    amount: 0,
    requiresPayment: false,
    reason: "free",
    amountFormatted: "₦0",
  };
}

export function formatPrice(amount: number) {
  return "₦" + amount.toLocaleString();
}

export function normalizePlan(plan: string | null) {
  return (plan || "free").toLowerCase();
}
