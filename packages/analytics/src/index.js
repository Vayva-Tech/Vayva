export const AnalyticsProvider = {
    track: (event) => {
        if (typeof window !== 'undefined') {
            console.log(`[Analytics] ${event.eventName}`, event);
            // Todo: Send to backend / Mixpanel / PostHog
        }
    },
    identify: (userId, traits) => {
        console.log(`[Analytics] Identify ${userId}`, traits);
    }
};
