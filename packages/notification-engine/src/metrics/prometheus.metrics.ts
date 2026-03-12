import client from 'prom-client';

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'notification-engine'
});

// Enable the collection of default metrics
client.collectDefaultMetrics({ register });

// Custom metrics
export const notificationDeliveriesTotal = new client.Counter({
  name: 'notification_deliveries_total',
  help: 'Total number of notification deliveries attempted',
  labelNames: ['channel', 'category', 'priority', 'store_id']
});

export const notificationDeliveriesSuccess = new client.Counter({
  name: 'notification_deliveries_success_total',
  help: 'Total number of successful notification deliveries',
  labelNames: ['channel', 'category', 'priority', 'store_id']
});

export const notificationDeliveriesFailed = new client.Counter({
  name: 'notification_deliveries_failed_total',
  help: 'Total number of failed notification deliveries',
  labelNames: ['channel', 'category', 'priority', 'store_id', 'error']
});

export const notificationDeliveryDuration = new client.Histogram({
  name: 'notification_delivery_duration_seconds',
  help: 'Duration of notification delivery in seconds',
  labelNames: ['channel', 'category', 'priority'],
  buckets: [0.1, 0.5, 1, 2, 5, 10]
});

export const notificationActiveRules = new client.Gauge({
  name: 'notification_active_rules',
  help: 'Number of active notification rules'
});

export const notificationRuleEvaluations = new client.Counter({
  name: 'notification_rule_evaluations_total',
  help: 'Total number of rule evaluations',
  labelNames: ['rule_id', 'trigger_type']
});

export const notificationRuleTriggers = new client.Counter({
  name: 'notification_rule_triggers_total',
  help: 'Total number of rule triggers',
  labelNames: ['rule_id', 'trigger_type']
});

export const notificationQueueSize = new client.Gauge({
  name: 'notification_queue_size',
  help: 'Current size of notification queue',
  labelNames: ['channel']
});

export const notificationRateLimitHits = new client.Counter({
  name: 'notification_rate_limit_hits_total',
  help: 'Total number of rate limit hits',
  labelNames: ['channel', 'store_id']
});

// Register all metrics
register.registerMetric(notificationDeliveriesTotal);
register.registerMetric(notificationDeliveriesSuccess);
register.registerMetric(notificationDeliveriesFailed);
register.registerMetric(notificationDeliveryDuration);
register.registerMetric(notificationActiveRules);
register.registerMetric(notificationRuleEvaluations);
register.registerMetric(notificationRuleTriggers);
register.registerMetric(notificationQueueSize);
register.registerMetric(notificationRateLimitHits);

export { register };
export default register;