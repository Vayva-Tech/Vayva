import { Ticket } from '@/types/kitchen';
interface TicketCardProps {
    ticket: Ticket;
    variant?: 'default' | 'compact';
    showUrgencyIndicator?: boolean;
    onBump?: (ticketId: string) => void;
    onComplete?: (ticketId: string) => void;
    onVoid?: (ticketId: string, reason: string) => void;
}
/**
 * TicketCard Component
 *
 * Displays individual kitchen ticket with timer and actions
 */
export declare function TicketCard({ ticket, variant, showUrgencyIndicator, onBump, onComplete, onVoid, }: TicketCardProps): import("react/jsx-runtime").JSX.Element;
export {};
