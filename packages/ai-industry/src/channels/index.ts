/**
 * Channel Integrations Module
 * Exports all channel integrations for Vayva AI
 */

export { default as WhatsAppChannel } from './whatsapp';
export { default as WebChatChannel } from './web-chat';
export { default as VoiceChannel } from './voice';

export * from './whatsapp';
export * from './web-chat';
export * from './voice';

import WhatsAppChannel from './whatsapp';
import WebChatChannel from './web-chat';
import VoiceChannel from './voice';

export const channelImplementations = {
  whatsapp: WhatsAppChannel,
  web: WebChatChannel,
  voice: VoiceChannel,
};

export type ChannelImplementation = 
  | WhatsAppChannel 
  | WebChatChannel 
  | VoiceChannel;
