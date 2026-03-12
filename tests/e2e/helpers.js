// Helper function to log API errors in tests
export async function expectApiSuccess(response, testName) {
    if (!response.ok()) {
        const body = await response.text();
        console.error(`[${testName}] API Error: ${response.status()} ${response.statusText()}`);
        console.error(`[${testName}] Response body:`, body);
        console.error(`[${testName}] Request URL:`, response.url);
    }
    expect(response.ok()).toBeTruthy();
}
