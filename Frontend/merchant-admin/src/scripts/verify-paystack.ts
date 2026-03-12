import { urls } from "@vayva/shared";
import { PaystackService } from "../lib/payment/paystack";
async function main() {
  console.log("--- Paystack Connectivity Test ---");
  try {
    // Just try to initialize a 1 NGN transaction
    const result = await PaystackService.initializeTransaction({
      email: `test-connectivity@${urls.storefrontRoot()}`,
      amount: 100, // 100 kobo = 1 NGN
      reference: `test_${Date.now()}`,
    });
    if (result.status) {
      console.log("✅ Paystack Connectivity: SUCCESS");
      console.log("Authorization URL:", result.data.authorization_url);
    } else {
      console.log("❌ Paystack Connectivity: FAILED");
      console.log("Message:", result.message);
    }
  } catch (error) {
    console.error("❌ Paystack Connectivity: ERROR");
    console.error((error as Error).message);
  }
}
main();
