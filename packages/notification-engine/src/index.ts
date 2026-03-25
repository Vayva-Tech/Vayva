export { NotificationDispatcher } from './services/notification-dispatcher.service';
export type { NotificationMessage, ChannelProvider } from './services/notification-dispatcher.service';

// Channel exports
export { EmailChannel } from './channels/email.channel';
export { SMSChannel } from './channels/sms.channel';
export { PushChannel } from './channels/push.channel';
export { InAppChannel } from './channels/in-app.channel';
export { SlackChannel } from './channels/slack.channel';
export { WhatsAppChannel } from './channels/whatsapp.channel';

// Utility exports
export { NotificationQueue } from './utils/notification-queue';
export { PriorityManager } from './utils/priority-manager';