// @ts-nocheck
/**
 * Kitchen Display System (KDS) exports
 */

export { KDSService, type KDSOrderUpdate } from './kds.service';
export { KDSRealtime, BumpBarIntegration, type KDSRealtimeConfig, type KDSChannelMessage } from './kds.realtime';

// Re-export config types
export type { KDSConfig } from '../../types/kds.js';
