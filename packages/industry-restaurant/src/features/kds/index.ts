/**
 * Kitchen Display System (KDS) exports
 */

export { KDSService, type KDSOrderUpdate } from './kds.service.js';
export { KDSRealtime, BumpBarIntegration, type KDSRealtimeConfig, type KDSChannelMessage } from './kds.realtime.js';

// Re-export config types
export type { KDSConfig } from '../../types/kds.js';
