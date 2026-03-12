// eslint-disable-next-line @typescript-eslint/no-explicit-any
function hashString(input: any) {
    // Simple stable hash (deterministic, fast, no deps)
    let h = 2166136261;
    for (let i = 0; i < input.length; i++) {
        h ^= input.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pick(arr: any, idx: any) {
    return arr[idx % arr.length];
}
export type DemoStore = ReturnType<typeof getDemoStore>;
export type DemoProduct = DemoStore['products'][number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getDemoStore(templateSlug: any) {
    // SAFETY: Prevent demo data leakage in production unless explicitly enabled for Preview Deployment
    if (process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_ENABLE_DEMO_PREVIEW !== "true") {
        throw new Error("Demo data generation is disabled in production.");
    }
    const seed = hashString(templateSlug);
    const storeNames = [
        "Vayva Store",
        "Lagos Luxe",
        "Abuja Essentials",
        "Port Harcourt Picks",
        "Kaduna Co.",
    ];
    const plans = ["STARTER", "GROWTH", "PRO"];
    const categories = [
        "New In",
        "Best Sellers",
        "Accessories",
        "Essentials",
        "Gifts",
    ];
    // Use existing real assets if you have them; otherwise these can be placeholders.
    // You can later replace these with real product images under /public/images/demo/...
    const images = [
        "/images/template-previews/default-desktop.png",
        "/images/template-previews/default-mobile.png",
        "/images/template-previews/default-desktop.png",
        "/images/template-previews/default-mobile.png",
    ];
    const adjectives = [
        "Minimal",
        "Premium",
        "Classic",
        "Bold",
        "Everyday",
        "Urban",
        "Coastal",
    ];
    const nouns = [
        "Tee",
        "Sneakers",
        "Backpack",
        "Watch",
        "Hoodie",
        "Cap",
        "Sunglasses",
        "Wallet",
        "Bottle",
    ];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const products = Array.from({ length: 18 }).map((_: any, i: any) => {
        const cat = pick(categories, seed + i);
        const name = `${pick(adjectives, seed + i)} ${pick(nouns, seed + i * 3)}`;
        const price = 7500 + ((seed + i * 7919) % 45000);
        return {
            id: `demo-${seed}-${i}`,
            slug: `demo-product-${seed}-${i}`,
            name,
            price,
            image: pick(images, seed + i),
            description: "A clean, preview-safe product description. Replace with real product data when live preview supports DB-backed storefronts.",
            category: cat,
        };
    });
    return {
        storeName: pick(storeNames, seed),
        slug: `demo-store-${seed}`, // Unique slug to avoid collisions
        plan: pick(plans, seed),
        categories,
        products,
    };
}
