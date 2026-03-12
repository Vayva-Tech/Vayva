import { prisma } from "@vayva/db";
const PROHIBITED_KEYWORDS = [
    "scam", "fraud", "illegal", "drug", "weapon", "explicit", "counterfeit"
];
export async function validateStoreCompliance(storeId) {
    const [store, products, policies] = await Promise.all([
        prisma.store.findUnique({
            where: { id: storeId },
            select: { logoUrl: true, socialImage: true, name: true, seoDescription: true } // Updated fields
        }),
        prisma.product.count({
            where: { storeId, status: "ACTIVE" }
        }),
        prisma.merchantPolicy.findMany({
            where: { storeId }
        })
    ]);
    if (!store) {
        throw new Error("Store not found");
    }
    // 1. Legal Policies
    const policyTypes = policies.map((p) => p.type);
    const requiredPolicies = ["PRIVACY_POLICY", "TERMS_OF_SERVICE", "REFUND_POLICY"];
    const missingPolicies = requiredPolicies.filter(type => !policyTypes.includes(type));
    const legalPolicies = missingPolicies.length === 0;
    // 2. Product Readiness
    const productReadiness = products > 0;
    // 3. Branding Readiness
    // Note: Schema uses 'socialImage' as closest proxy for banner currently? Or it's missing. Using socialImage for now.
    const brandingReadiness = !!(store.logoUrl && store.socialImage);
    // 4. Content Moderation
    const textToScan = `${store.name} ${store.seoDescription || ""}`.toLowerCase();
    const prohibitedWordsFound = PROHIBITED_KEYWORDS.filter(word => textToScan.includes(word));
    const contentModeration = prohibitedWordsFound.length === 0;
    const isValid = legalPolicies && productReadiness && contentModeration;
    return {
        storeId,
        isValid,
        checks: {
            legalPolicies,
            productReadiness,
            brandingReadiness,
            contentModeration,
        },
        details: {
            missingPolicies,
            issueCount: missingPolicies.length + prohibitedWordsFound.length + (productReadiness ? 0 : 1),
            prohibitedWordsFound,
            productCount: products,
        }
    };
}
