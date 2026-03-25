export { TravelBookingService } from './travel-booking-service';
export type { PackageFilters, BookingFilters } from './travel-booking-service';

export { TravelPropertyService } from './property-service';
export type { CreatePropertyParams, UpdatePropertyParams, PropertyFilters } from './property-service';

export { AvailabilityService } from './availability-service';
export type { SetAvailabilityParams, PricingContext } from './availability-service';

export { AdvancedBookingService } from './advanced-booking-service';
export type { BookingResult, PaymentIntent, PaymentResult, BookingChanges } from './advanced-booking-service';

export { TravelPaymentService } from './payment-service';
export type { 
  PaystackConfig, 
  TransactionInitializeArgs, 
  TransactionInitializeResult,
  TransactionVerifyResult,
  RefundArgs,
  RefundResult,
  WebhookPayload
} from './payment-service';

export { NotificationService } from './notification-service';
export type { EmailService, SMSService, NotificationTemplate } from './notification-service';

export { TravelAnalyticsService } from './analytics-service';
export type { 
  AnalyticsQueryOptions, 
  OccupancyMetrics, 
  RevenueReport, 
  GuestDemographics, 
  BenchmarkData 
} from './analytics-service';

export { ReportingService } from './reporting-service';
export type { Report, Forecast, BookingReportData } from './reporting-service';

export { PerformanceBenchmarkingService } from './benchmarking-service';
export type { 
  BenchmarkMetric, 
  PerformanceScore, 
  IndustryBenchmark 
} from './benchmarking-service';

// Week 16 Exports
export { 
  OTASyncService 
} from './ota-sync-service';
export type { 
  OTAConfig, 
  SyncResult, 
  OTAListing, 
  OTABooking, 
  RateUpdate, 
  OTAWebhookPayload 
} from './ota-sync-service';

export { 
  ReviewService 
} from './review-service';
export type { 
  ReviewSubmission, 
  ReviewModeration, 
  ReviewResponse, 
  ReviewAnalytics, 
  ReviewFilters 
} from './review-service';

export { 
  SEOService 
} from './seo-service';
export type { 
  SEOOptimizationOptions, 
  MetaTags, 
  SEOData, 
  ImageOptimizationOptions, 
  OptimizedImage, 
  SitemapEntry 
} from './seo-service';

export { 
  ExternalAPIService 
} from './external-api-service';
export type { 
  ExternalAPIConfig, 
  WeatherData, 
  CurrencyRate, 
  TranslationResult, 
  GeocodingResult, 
  MapStaticOptions 
} from './external-api-service';
