# Notification Engine Documentation

## Overview

The Notification Engine is a comprehensive notification delivery system that respects user settings and provides advanced features like quiet hours, custom rules, and multi-channel delivery.

## Features

- **Multi-channel Delivery**: Email, SMS, Push, In-App, Slack, WhatsApp, Webhook
- **Settings Integration**: Respects user notification preferences and quiet hours
- **Custom Rules Engine**: Event-driven notifications with complex conditions
- **Quiet Hours Enforcement**: Automatic scheduling outside business hours
- **Rate Limiting**: Prevents spam and abuse
- **Delivery Tracking**: Comprehensive logging and analytics
- **Fallback Mechanisms**: Automatic channel fallbacks on failure

## Installation

```bash
# Install the package
pnpm add @vayva/notification-engine

# Or if developing locally
pnpm build --filter=@vayva/notification-engine
```

## Quick Start

```typescript
import { initializeNotificationEngine } from '@vayva/notification-engine';

// Initialize the engine
const engine = await initializeNotificationEngine();

// Send a simple notification
const results = await engine.send({
  subject: 'Welcome!',
  body: 'Thanks for joining our platform',
  recipient: { userId: 'user-123' },
  category: 'welcome',
  priority: 'normal',
  channels: ['in-app', 'email'],
  source: 'onboarding'
});

console.log('Notification sent:', results);
```

## Core Concepts

### Notification Payload

```typescript
interface NotificationPayload {
  subject: string;           // Notification title/subject
  body: string;             // Main content
  recipient: {              // Recipient information
    userId?: string;
    storeId?: string;
    email?: string;
    phoneNumber?: string;
    deviceId?: string;
  };
  category: string;         // Notification category (dot notation)
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  channels: NotificationChannel[];  // Delivery channels
  source: string;           // Source system/component
  data?: Record<string, unknown>;   // Additional context data
}
```

### Notification Channels

Available channels:
- `email` - Email notifications
- `sms` - SMS/text messages
- `push` - Mobile push notifications
- `in-app` - In-application notifications
- `slack` - Slack messages
- `whatsapp` - WhatsApp Business messages
- `webhook` - External webhook calls

## Usage Examples

### Direct Notification Sending

```typescript
// Simple in-app notification
await engine.send({
  subject: 'New Order Received',
  body: 'You have a new order #12345 for $299.99',
  recipient: { storeId: 'store-abc' },
  category: 'sales.newOrder',
  priority: 'high',
  channels: ['in-app'],
  source: 'order-processing'
});

// Multi-channel customer notification
await engine.send({
  subject: 'Appointment Confirmation',
  body: 'Your haircut appointment is confirmed for tomorrow at 2 PM',
  recipient: { 
    userId: 'customer-123',
    email: 'customer@example.com',
    phoneNumber: '+1234567890'
  },
  category: 'appointments.confirmation',
  priority: 'normal',
  channels: ['email', 'sms'],
  source: 'booking-system'
});
```

### Convenience Methods

```typescript
// Send order notification
await engine.sendOrderNotification({
  storeId: 'store-abc',
  orderId: 'ORD-12345',
  customerName: 'John Doe',
  amount: 299.99,
  priority: 'high'
});

// Send inventory alert
await engine.sendInventoryAlert({
  storeId: 'store-abc',
  itemName: 'Premium Shampoo',
  currentStock: 3,
  threshold: 10,
  alertType: 'low-stock',
  priority: 'urgent'
});

// Send appointment notification
await engine.sendAppointmentNotification({
  storeId: 'store-abc',
  customerName: 'Jane Smith',
  serviceName: 'Haircut',
  appointmentTime: new Date('2024-01-15T14:00:00Z'),
  reminderType: 'confirmation',
  customerEmail: 'jane@example.com',
  customerPhone: '+1234567890'
});

// Send system alert
await engine.sendSystemAlert({
  storeId: 'store-abc',
  alertType: 'payment.processor.down',
  message: 'Payment processor is currently unavailable',
  severity: 'error',
  priority: 'urgent'
});
```

### Event-Driven Notifications

```typescript
// Process business events that may trigger notifications
const results = await engine.processEvent({
  type: 'order.created',
  data: {
    orderId: 'ORD-12345',
    customerName: 'John Doe',
    amount: 299.99,
    items: ['Product A', 'Product B']
  },
  storeId: 'store-abc'
});

console.log('Direct notifications:', results.directNotifications);
console.log('Rule-triggered notifications:', results.ruleTriggeredNotifications);
```

## Custom Rules

### Creating Rules

```typescript
// Add a rule for large orders
const rule = await engine.addRule({
  name: 'Large Order Alert',
  description: 'Notify for orders over $500',
  trigger: {
    type: 'event',
    event: 'order.created'
  },
  conditions: [{
    field: 'amount',
    operator: 'greater-than',
    value: 500
  }],
  actions: [{
    type: 'in-app',
    template: 'large-order',
    variables: {
      orderId: '{{orderId}}',
      customerName: '{{customerName}}',
      amount: '{{amount}}'
    }
  }],
  deliveryOptions: {
    immediate: true,
    retryOnFailure: true,
    maxRetries: 3
  },
  respectQuietHours: true,
  enabled: true
});
```

### Rule Triggers

```typescript
// Event-based trigger
trigger: {
  type: 'event',
  event: 'order.created'  // Specific event type
}

// Threshold-based trigger
trigger: {
  type: 'threshold',
  threshold: {
    metric: 'inventory.level',
    operator: 'less-than',
    value: 10
  }
}

// Scheduled trigger
trigger: {
  type: 'schedule',
  schedule: {
    frequency: 'daily',
    time: '09:00'
  }
}

// AI insight trigger
trigger: {
  type: 'ai-insight',
  // Triggered by AI-generated insights
}
```

### Rule Management

```typescript
// Get all rules
const rules = engine.getRules();

// Get specific rule
const rule = engine.getRule('rule-123');

// Update rule
await engine.updateRule('rule-123', {
  enabled: false
});

// Delete rule
await engine.deleteRule('rule-123');
```

## Quiet Hours

### Configuration

```typescript
// Check quiet hours status
const quietHoursStatus = await engine.checkQuietHours('store-abc', 'normal');
console.log('Allow immediate:', quietHoursStatus.allowImmediate);
console.log('Scheduled time:', quietHoursStatus.scheduledTime);

// Get quiet hours configuration
const config = engine.getQuietHoursConfig('store-abc');
console.log('Start time:', config.startTime);  // e.g., "22:00"
console.log('End time:', config.endTime);      // e.g., "08:00"

// Check if currently active
const isActive = await engine.isQuietHoursActive('store-abc');

// Get next quiet hours period
const nextPeriod = engine.getNextQuietHoursPeriod('store-abc');
```

### Priority Overrides

- `critical` - Always bypasses quiet hours
- `urgent` - May bypass based on settings
- `high/normal/low` - Respects quiet hours

## Settings Integration

The engine automatically respects settings from `@vayva/settings`:

```typescript
// Channel preferences are automatically respected
// Categories can be enabled/disabled
// Quiet hours are enforced
// Do Not Disturb periods are honored
```

## Error Handling

```typescript
try {
  const results = await engine.send(payload);
  
  // Check individual channel results
  results.forEach(result => {
    if (result.success) {
      console.log(`✓ ${result.channel}: ${result.messageId}`);
    } else {
      console.error(`✗ ${result.channel}: ${result.error}`);
    }
  });
} catch (error) {
  console.error('Notification sending failed:', error);
}
```

## Testing

```bash
# Run all tests
pnpm test --filter=@vayva/notification-engine

# Run tests in watch mode
pnpm test:watch --filter=@vayva/notification-engine

# Run specific test file
pnpm test --filter=@vayva/notification-engine src/__tests__/notification-engine.test.ts
```

## Monitoring and Analytics

The engine provides comprehensive logging and tracking:

```typescript
// All delivery attempts are logged
// Success/failure rates are tracked
// Engagement metrics are captured
// Retry attempts are recorded
```

## Best Practices

1. **Use appropriate priorities** - Don't mark everything as critical
2. **Enable quiet hours** - Respect user preferred communication times
3. **Test rules thoroughly** - Complex rules can have unexpected behavior
4. **Monitor delivery rates** - Watch for failures and adjust accordingly
5. **Use templates** - Maintain consistency in notification content
6. **Handle errors gracefully** - Always wrap sends in try/catch blocks

## Troubleshooting

### Common Issues

1. **Notifications not sending**
   - Check channel configurations
   - Verify recipient information
   - Review category permissions

2. **Quiet hours not working**
   - Verify quiet hours are enabled
   - Check time zone settings
   - Confirm priority levels

3. **Rules not triggering**
   - Validate rule conditions
   - Check rule enabled status
   - Review event data structure

### Debugging

```typescript
// Enable debug logging
process.env.DEBUG_NOTIFICATIONS = 'true';

// Check engine status
console.log('Engine ready:', engine.isReady());

// Inspect configuration
console.log('Available channels:', engine.getChannelManager().getAvailableChannels());
```

## API Reference

See individual service documentation for detailed API references:

- [`NotificationEngine`](./engine.ts)
- [`NotificationDispatcher`](./services/notification-dispatcher.service.ts)
- [`RuleEngine`](./services/rule-engine.service.ts)
- [`QuietHoursEnforcer`](./services/quiet-hours-enforcer.service.ts)
- [`ChannelManager`](./services/channel-manager.service.ts)