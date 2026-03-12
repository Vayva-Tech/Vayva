/**
 * Industry-Specific Optimization Engine
 * Enhanced configurations and personalized experiences for each vertical
 */

import { IndustrySlug } from '@/lib/templates/types';

// Enhanced Industry Configurations with Optimization Data
export interface EnhancedIndustryConfig {
  slug: IndustrySlug;
  name: string;
  displayName: string;
  description: string;
  optimizationProfile: 'conversion' | 'operations' | 'engagement' | 'efficiency';
  primaryMetrics: string[];
  aiFocusAreas: string[];
  recommendedWidgets: string[];
  performanceBaselines: Record<string, number>;
  seasonalPatterns: string[];
  commonPainPoints: string[];
  successIndicators: string[];
}

// Industry Optimization Profiles
export const INDUSTRY_OPTIMIZATIONS: Record<IndustrySlug, EnhancedIndustryConfig> = {
  // Commerce & Retail
  retail: {
    slug: 'retail',
    name: 'retail',
    displayName: 'Retail Store',
    description: 'Sell physical products online with full inventory management',
    optimizationProfile: 'operations',
    primaryMetrics: ['revenue', 'orders', 'inventory_turnover', 'stockout_rate'],
    aiFocusAreas: ['demand_forecasting', 'inventory_optimization', 'price_recommendations'],
    recommendedWidgets: ['inventory_health', 'sales_pipeline', 'top_products', 'low_stock_alerts'],
    performanceBaselines: {
      inventory_turnover: 8,
      stockout_rate: 2,
      order_fulfillment_time: 24,
      return_rate: 8
    },
    seasonalPatterns: ['holiday_peak', 'back_to_school', 'summer_clearance'],
    commonPainPoints: ['stockouts', 'overstock', 'slow-moving_inventory', 'delivery_delays'],
    successIndicators: ['inventory_accuracy', 'fulfillment_rate', 'customer_satisfaction']
  },

  fashion: {
    slug: 'fashion',
    name: 'fashion',
    displayName: 'Fashion & Apparel',
    description: 'Sell fashion items with size variants, lookbooks, and style guides',
    optimizationProfile: 'conversion',
    primaryMetrics: ['revenue', 'conversion_rate', 'avg_order_value', 'style_performance'],
    aiFocusAreas: ['trend_prediction', 'size_recommendations', 'visual_search', 'personalization'],
    recommendedWidgets: ['trend_analytics', 'size_performance', 'lookbook_insights', 'customer_preferences'],
    performanceBaselines: {
      conversion_rate: 3.2,
      avg_order_value: 150,
      return_rate: 15,
      style_adoption_rate: 65
    },
    seasonalPatterns: ['spring_collection', 'summer_basics', 'fall_trends', 'winter_coats'],
    commonPainPoints: ['size_returns', 'inventory_obsolescence', 'trend_mismatch', 'visual_appeal'],
    successIndicators: ['style_conversion', 'size_accuracy', 'trend_response_time', 'customer_engagement']
  },

  beauty: {
    slug: 'beauty',
    name: 'beauty',
    displayName: 'Beauty & Cosmetics',
    description: 'Sell beauty products and manage appointment bookings',
    optimizationProfile: 'engagement',
    primaryMetrics: ['revenue', 'appointments_booked', 'product_sell_through', 'customer_retention'],
    aiFocusAreas: ['skincare_recommendations', 'appointment_optimization', 'ingredient_matching', 'loyalty_programs'],
    recommendedWidgets: ['appointment_scheduler', 'skincare_routine_builder', 'product_pairings', 'loyalty_tracker'],
    performanceBaselines: {
      appointment_show_rate: 85,
      product_sell_through: 75,
      customer_retention_90d: 45,
      average_services_per_customer: 2.3
    },
    seasonalPatterns: ['summer_skincare', 'winter_moisturizers', 'holiday_gifts', 'spring_makeover'],
    commonPainPoints: ['appointment_no_shows', 'product_returns', 'seasonal_inventory', 'customer_churn'],
    successIndicators: ['appointment_efficiency', 'product_satisfaction', 'repeat_business', 'referral_rate']
  },

  grocery: {
    slug: 'grocery',
    name: 'grocery',
    displayName: 'Grocery Store',
    description: 'Sell groceries with delivery and pickup options',
    optimizationProfile: 'efficiency',
    primaryMetrics: ['revenue', 'orders_processed', 'delivery_time', 'perishable_waste'],
    aiFocusAreas: ['demand_planning', 'route_optimization', 'shelf_life_management', 'substitution_suggestions'],
    recommendedWidgets: ['delivery_optimizer', 'waste_tracker', 'peak_hour_analytics', 'substitution_engine'],
    performanceBaselines: {
      avg_delivery_time: 45,
      perishable_waste: 3,
      order_accuracy: 98,
      peak_hour_efficiency: 85
    },
    seasonalPatterns: ['holiday_feasts', 'summer_bbq', 'back_to_school', 'winter_comfort_food'],
    commonPainPoints: ['delivery_delays', 'perishable_waste', 'inventory_spoilage', 'peak_hour_congestion'],
    successIndicators: ['delivery_reliability', 'waste_reduction', 'order_accuracy', 'customer_retention']
  },

  // Food & Restaurants
  food: {
    slug: 'food',
    name: 'food',
    displayName: 'Food Service',
    description: 'Restaurant operations and food delivery management',
    optimizationProfile: 'operations',
    primaryMetrics: ['revenue', 'orders_completed', 'prep_time', 'food_cost_ratio'],
    aiFocusAreas: ['menu_optimization', 'staff_scheduling', 'ingredient_procurement', 'demand_forecasting'],
    recommendedWidgets: ['kitchen_performance', 'menu_profitability', 'staff_productivity', 'ingredient_tracker'],
    performanceBaselines: {
      avg_prep_time: 18,
      food_cost_ratio: 30,
      order_accuracy: 96,
      table_turn_time: 90
    },
    seasonalPatterns: ['holiday_feasts', 'summer_grilling', 'back_to_school', 'winter_comfort'],
    commonPainPoints: ['kitchen_bottlenecks', 'ingredient_waste', 'staff_shortages', 'delivery_delays'],
    successIndicators: ['kitchen_efficiency', 'cost_control', 'customer_satisfaction', 'repeat_orders']
  },

  restaurant: {
    slug: 'restaurant',
    name: 'restaurant',
    displayName: 'Restaurant',
    description: 'Full-service dining establishment management',
    optimizationProfile: 'engagement',
    primaryMetrics: ['revenue', 'covers_served', 'table_turn_time', 'customer_satisfaction'],
    aiFocusAreas: ['reservation_optimization', 'menu_engineering', 'staff_allocation', 'customer_experience'],
    recommendedWidgets: ['reservation_manager', 'table_performance', 'menu_analytics', 'customer_journey'],
    performanceBaselines: {
      table_turn_time: 90,
      customer_satisfaction: 4.2,
      reservation_fill_rate: 85,
      average_check_size: 45
    },
    seasonalPatterns: ['date_night_peaks', 'family_dining', 'business_lunch', 'weekend_brunch'],
    commonPainPoints: ['reservation_no_shows', 'table_utilization', 'staff_scheduling', 'customer_wait_times'],
    successIndicators: ['table_utilization', 'customer_lifetime_value', 'reservation_efficiency', 'staff_productivity']
  },

  // Professional Services
  services: {
    slug: 'services',
    name: 'services',
    displayName: 'Professional Services',
    description: 'Service-based business operations and client management',
    optimizationProfile: 'efficiency',
    primaryMetrics: ['revenue', 'projects_completed', 'client_satisfaction', 'utilization_rate'],
    aiFocusAreas: ['resource_allocation', 'project_scoping', 'client_matching', 'capacity_planning'],
    recommendedWidgets: ['project_tracker', 'resource_utilization', 'client_success_score', 'capacity_planner'],
    performanceBaselines: {
      utilization_rate: 75,
      project_completion_rate: 92,
      client_satisfaction: 4.5,
      on_time_delivery: 88
    },
    seasonalPatterns: ['tax_season', 'year_end_planning', 'budget_cycles', 'quarterly_reviews'],
    commonPainPoints: ['resource_conflicts', 'scope_creep', 'client_communication', 'billing_disputes'],
    successIndicators: ['project_profitability', 'client_retention', 'team_utilization', 'service_quality']
  },

  // Digital & Creative
  digital: {
    slug: 'digital',
    name: 'digital',
    displayName: 'Digital Products',
    description: 'Sell digital goods, courses, and online services',
    optimizationProfile: 'conversion',
    primaryMetrics: ['revenue', 'downloads', 'course_completion', 'user_engagement'],
    aiFocusAreas: ['content_recommendations', 'learning_path_optimization', 'pricing_strategies', 'user_retention'],
    recommendedWidgets: ['content_performance', 'user_engagement', 'learning_analytics', 'pricing_optimizer'],
    performanceBaselines: {
      course_completion_rate: 65,
      user_engagement: 45,
      content_velocity: 12,
      refund_rate: 5
    },
    seasonalPatterns: ['back_to_learning', 'skill_building', 'certification_season', 'new_year_resolutions'],
    commonPainPoints: ['content_piracy', 'user_churn', 'engagement_drop_off', 'support_volume'],
    successIndicators: ['user_retention', 'content_value', 'community_growth', 'revenue_growth']
  },

  // Events & Entertainment
  events: {
    slug: 'events',
    name: 'events',
    displayName: 'Events & Experiences',
    description: 'Event planning and ticketing operations',
    optimizationProfile: 'engagement',
    primaryMetrics: ['revenue', 'tickets_sold', 'attendance_rate', 'event_rating'],
    aiFocusAreas: ['demand_forecasting', 'pricing_optimization', 'audience_segmentation', 'experience_personalization'],
    recommendedWidgets: ['ticket_sales_dashboard', 'audience_analytics', 'pricing_optimizer', 'event_performance'],
    performanceBaselines: {
      attendance_rate: 90,
      ticket_sell_through: 85,
      event_rating: 4.3,
      upsell_conversion: 25
    },
    seasonalPatterns: ['conference_season', 'festival_peaks', 'corporate_events', 'holiday_parties'],
    commonPainPoints: ['ticket_scalping', 'weather_impacts', 'logistics_coordination', 'attendee_engagement'],
    successIndicators: ['event_success', 'attendee_satisfaction', 'revenue_per_event', 'brand_recognition']
  },

  nightlife: {
    slug: 'nightlife',
    name: 'nightlife',
    displayName: 'Nightlife & Entertainment',
    description: 'Nightclub and entertainment venue management',
    optimizationProfile: 'engagement',
    primaryMetrics: ['revenue', 'guests_covered', 'drink_sales', 'customer_satisfaction'],
    aiFocusAreas: ['crowd_prediction', 'drink_recommendations', 'staff_scheduling', 'music_playlist_optimization'],
    recommendedWidgets: ['crowd_analytics', 'drink_performance', 'staff_scheduler', 'music_insights'],
    performanceBaselines: {
      cover_charge_conversion: 70,
      drink_sales_per_guest: 3.2,
      customer_satisfaction: 4.0,
      peak_hour_revenue: 65
    },
    seasonalPatterns: ['weekend_party', 'holiday_celebrations', 'summer_nights', 'new_year_eve'],
    commonPainPoints: ['crowd_control', 'staff_scheduling', 'inventory_management', 'security_incidents'],
    successIndicators: ['revenue_per_guest', 'customer_retention', 'staff_efficiency', 'venue_utilization']
  },

  // Automotive & Transportation
  automotive: {
    slug: 'automotive',
    name: 'automotive',
    displayName: 'Automotive Sales & Service',
    description: 'Car dealership and auto repair shop management',
    optimizationProfile: 'conversion',
    primaryMetrics: ['revenue', 'vehicles_sold', 'service_jobs', 'customer_lifetime_value'],
    aiFocusAreas: ['vehicle_matching', 'service_scheduling', 'inventory_management', 'customer_relationships'],
    recommendedWidgets: ['inventory_tracker', 'service_scheduler', 'customer_journey', 'sales_performance'],
    performanceBaselines: {
      vehicle_turn_time: 45,
      service_job_completion: 95,
      customer_lifetime_value: 15000,
      lead_conversion_rate: 18
    },
    seasonalPatterns: ['car_show_season', 'winter_tires', 'summer_road_trips', 'trade_in_peaks'],
    commonPainPoints: ['inventory_turnover', 'service_backlog', 'customer_acquisition', 'parts_availability'],
    successIndicators: ['sales_efficiency', 'service_quality', 'customer_retention', 'inventory_velocity']
  },

  // Travel & Hospitality
  travel_hospitality: {
    slug: 'travel_hospitality',
    name: 'travel_hospitality',
    displayName: 'Travel & Hospitality',
    description: 'Hotel and travel booking operations',
    optimizationProfile: 'engagement',
    primaryMetrics: ['revenue', 'occupancy_rate', 'average_daily_rate', 'guest_satisfaction'],
    aiFocusAreas: ['dynamic_pricing', 'demand_forecasting', 'guest_personalization', 'revenue_optimization'],
    recommendedWidgets: ['occupancy_analytics', 'pricing_optimizer', 'guest_preferences', 'revenue_manager'],
    performanceBaselines: {
      occupancy_rate: 75,
      average_daily_rate: 120,
      guest_satisfaction: 4.4,
      direct_booking_rate: 60
    },
    seasonalPatterns: ['summer_vacation', 'winter_ski', 'business_travel', 'holiday_stays'],
    commonPainPoints: ['overbooking_risks', 'rate_shopping', 'guest_complaints', 'housekeeping_efficiency'],
    successIndicators: ['revenue_per_available_room', 'guest_loyalty', 'operational_efficiency', 'market_share']
  },

  // Education & Learning
  education: {
    slug: 'education',
    name: 'education',
    displayName: 'Education & Learning',
    description: 'Educational institution and course management',
    optimizationProfile: 'engagement',
    primaryMetrics: ['revenue', 'students_enrolled', 'completion_rates', 'student_satisfaction'],
    aiFocusAreas: ['learning_pathways', 'student_success_prediction', 'curriculum_optimization', 'engagement_monitoring'],
    recommendedWidgets: ['student_progress', 'course_analytics', 'engagement_tracker', 'success_predictor'],
    performanceBaselines: {
      student_completion_rate: 78,
      student_satisfaction: 4.1,
      course_utilization: 85,
      retention_rate: 72
    },
    seasonalPatterns: ['back_to_school', 'exam_periods', 'summer_programs', 'enrollment_drives'],
    commonPainPoints: ['student_dropout', 'engagement_decline', 'grading_workload', 'parent_communication'],
    successIndicators: ['student_outcomes', 'engagement_levels', 'institutional_growth', 'alumni_success']
  },

  // Healthcare & Wellness
  healthcare: {
    slug: 'healthcare',
    name: 'healthcare',
    displayName: 'Healthcare Services',
    description: 'Medical practice and healthcare facility management',
    optimizationProfile: 'efficiency',
    primaryMetrics: ['revenue', 'patients_seen', 'appointment_efficiency', 'patient_satisfaction'],
    aiFocusAreas: ['appointment_scheduling', 'patient_triage', 'treatment_recommendations', 'preventive_care'],
    recommendedWidgets: ['appointment_scheduler', 'patient_flow', 'treatment_outcomes', 'preventive_care'],
    performanceBaselines: {
      appointment_efficiency: 85,
      patient_satisfaction: 4.3,
      treatment_success_rate: 92,
      preventive_care_adherence: 65
    },
    seasonalPatterns: ['flu_season', 'wellness_checks', 'chronic_disease_management', 'emergency_peaks'],
    commonPainPoints: ['appointment_backlog', 'insurance_claims', 'patient_communication', 'staff_scheduling'],
    successIndicators: ['patient_outcomes', 'operational_efficiency', 'care_quality', 'patient_retention']
  },

  // Real Estate
  real_estate: {
    slug: 'real_estate',
    name: 'real_estate',
    displayName: 'Real Estate',
    description: 'Property management and real estate operations',
    optimizationProfile: 'conversion',
    primaryMetrics: ['revenue', 'properties_managed', 'tenant_retention', 'vacancy_rate'],
    aiFocusAreas: ['property_valuation', 'tenant_matching', 'maintenance_scheduling', 'market_analysis'],
    recommendedWidgets: ['property_performance', 'tenant_analytics', 'maintenance_tracker', 'market_insights'],
    performanceBaselines: {
      tenant_retention: 82,
      vacancy_rate: 5,
      property_appreciation: 3.5,
      maintenance_response_time: 24
    },
    seasonalPatterns: ['moving_season', 'rental_market_peaks', 'investment_opportunities', 'tax_season'],
    commonPainPoints: ['tenant_turnover', 'maintenance_costs', 'market_volatility', 'regulatory_compliance'],
    successIndicators: ['property_performance', 'tenant_satisfaction', 'portfolio_growth', 'operational_efficiency']
  }
};

// Get optimization configuration for an industry
export function getIndustryOptimization(industry: IndustrySlug): EnhancedIndustryConfig {
  return INDUSTRY_OPTIMIZATIONS[industry] || INDUSTRY_OPTIMIZATIONS.retail;
}

// Get recommended widgets for an industry
export function getRecommendedWidgets(industry: IndustrySlug): string[] {
  const config = getIndustryOptimization(industry);
  return config.recommendedWidgets;
}

// Get industry performance baselines
export function getPerformanceBaselines(industry: IndustrySlug): Record<string, number> {
  const config = getIndustryOptimization(industry);
  return config.performanceBaselines;
}

// Get optimization profile for an industry
export function getOptimizationProfile(industry: IndustrySlug): 'conversion' | 'operations' | 'engagement' | 'efficiency' {
  const config = getIndustryOptimization(industry);
  return config.optimizationProfile;
}

// Industry-specific AI focus areas
export function getAIFocusAreas(industry: IndustrySlug): string[] {
  const config = getIndustryOptimization(industry);
  return config.aiFocusAreas;
}