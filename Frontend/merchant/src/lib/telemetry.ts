import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";

export const telemetry = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    track: async (eventName: any, properties: Record<string, unknown> | null | undefined) => {
        try {
            await apiJson("/telemetry/event", {
                method: "POST",
                keepalive: true,
                body: JSON.stringify({
                    eventName,
                    properties: {
                        ...properties,
                        timestamp: new Date().toISOString(),
                        url: typeof window !== "undefined"
                            ? window.location?.pathname
                            : undefined,
                    },
                }),
            });
        }
        catch (err) {
            logger.warn("Telemetry error", { error: (err as Error).message, app: "merchant" });
        }
    },
};
