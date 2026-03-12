
// Scenario: Market Storm
// Simulates public traffic to storefronts.

module.exports = {
    run: async (baseUrl, workerId) => {
        // Randomly browse different storefront pages
        const pages = [
            "/store/aa-fashion-demo",
            "/store/aa-fashion-demo/cart"
        ];

        const page = pages[Math.floor(Math.random() * pages.length)];

        const res = await fetch(`${baseUrl}${page}`, {
            method: 'GET'
        });

        return res;
    }
};
