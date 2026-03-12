/* eslint-disable no-console */
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    console.log("🚀 Starting Vayva Platform (Marketing)...");
    await import("./env");
    console.log("✅ Environment Validated");
  }
}
