// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatCurrency(amount: any, currency = "NGN") {
    if (amount === null || amount === undefined || isNaN(Number(amount))) return "₦0.00";
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency,
    }).format(Number(amount));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function formatDate(date: string | number | Date | null | undefined) {
    if (!date) return "—";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "—";
        return new Intl.DateTimeFormat("en-NG", {
            dateStyle: "medium",
            timeStyle: "short",
        }).format(d);
    } catch (e) {
        return "—";
    }
}
