type TicketStatus = 'fresh' | 'cooking' | 'ready' | 'urgent' | 'overdue';
interface StatusBadgeProps {
    status: TicketStatus;
    size?: 'small' | 'medium';
}
/**
 * StatusBadge Component
 *
 * Displays colored badge for ticket status with icon
 */
export declare function StatusBadge({ status, size }: StatusBadgeProps): import("react/jsx-runtime").JSX.Element;
export {};
