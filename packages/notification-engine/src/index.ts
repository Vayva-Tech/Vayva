export { NotificationDispatcher } from './services/notification-dispatcher.service';
export type { NotificationMessage, ChannelProvider } from './services/notification-dispatcher.service';

// Channel exports (all channel implementations live in email.channel.ts)
export {
  EmailChannel,
  SMSChannel,
  PushChannel,
  InAppChannel,
  SlackChannel,
  WhatsAppChannel,
} from './channels/email.channel';

// Utility exports
export { NotificationQueue } from './utils/notification-queue';
export { PriorityManager } from './utils/priority-manager';