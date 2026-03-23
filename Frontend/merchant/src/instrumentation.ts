export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Validate environment on server startup
    await import("./env");
  }
}
