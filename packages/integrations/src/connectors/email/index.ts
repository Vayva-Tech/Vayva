/**
 * Email Marketing Connectors
 */
export { MailchimpConnector, default as Mailchimp } from './mailchimp';
export type { MailchimpConfig, MailchimpMember, MailchimpCampaign, MailchimpAudience } from './mailchimp';

export { SendGridConnector, default as SendGrid } from './sendgrid';
export type { SendGridConfig, SendGridEmail, SendGridStats } from './sendgrid';
