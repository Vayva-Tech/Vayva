export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, unknown>;
  userId?: string;
  storeId?: string;
}

export const AnalyticsProvider = {
  track: (event: AnalyticsEvent) => {
    if (typeof window !== "undefined") {
      // Todo: Send to backend / Mixpanel / PostHog
    }
  },

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  identify: (userId: string, traits?: any) => {},
};

export {
  BatchEventsSchema,
  CollectedEventSchema,
  EventCollector,
  collectBatchFromRequest,
  collectEvent,
  persistStampedCollectedEvents,
  type AnalyticsEventWriter,
  type CollectedEvent,
} from "./event-collector";
