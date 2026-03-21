import { Ticket, KitchenStation } from '@/types/kitchen';
interface UseRealTimeKDSResult {
    tickets: Ticket[];
    stations: KitchenStation[];
    isLoading: boolean;
    error: Error | null;
    updateTicketStatus: (ticketId: string, status: string) => Promise<void>;
    bumpTicket: (ticketId: string) => Promise<void>;
    markItemComplete: (ticketId: string, itemId: string) => Promise<void>;
    voidTicket: (ticketId: string, reason: string) => Promise<void>;
}
/**
 * useRealTimeKDS Hook
 *
 * Provides real-time KDS data and actions
 * Integrates with WebSocket for live updates
 */
export declare function useRealTimeKDS(): UseRealTimeKDSResult;
export {};
