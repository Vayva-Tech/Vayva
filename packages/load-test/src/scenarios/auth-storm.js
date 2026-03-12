
// Scenario: Auth Storm
// Simulates login requests to generate tokens

if (process.env.NODE_ENV === "production") {
    console.error("❌ FATAL: Load test scripts must NEVER run against production. Aborting.");
    process.exit(1);
}

module.exports = {
    run: async (baseUrl, workerId) => {
        // Use a test user based on workerId or random
        const payload = {
            email: "demo@vayva.ng", // In real test, use dynamic users
            password: "password123"
        };

        const res = await fetch(`${baseUrl}/api/auth/signin`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        return res;
    }
};
