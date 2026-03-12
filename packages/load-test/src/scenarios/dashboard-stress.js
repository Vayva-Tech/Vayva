
// Scenario: Dashboard Stress
// Simulates a merchant refreshing their dashboard repeatedly.

module.exports = {
    run: async (baseUrl, workerId) => {
        // In a real test, we would need to login first to get a token.
        // For this scenario, we assume a token is passed via ENV or hardcoded for a test user.
        const token = process.env.TEST_AUTH_TOKEN || "mock-token";

        // Parallel requests to simulate dashboard loading
        const endpoints = [
            "/api/analytics/dashboard",
            "/api/account/overview",
            "/api/notifications/unread-count"
        ];

        // Pick one random endpoint to hit
        const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

        const res = await fetch(`${baseUrl}${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        return res;
    }
};
