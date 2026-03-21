interface AudioAlertManagerProps {
    storeId: string;
    enabled?: boolean;
}
type AlertType = 'urgent' | 'overdue' | 'bump' | 'chat' | '86-item';
/**
 * AudioAlertManager Component
 *
 * Manages audio alerts for kitchen operations
 * Uses Web Audio API for precise control
 */
export declare function AudioAlertManager({ storeId, enabled }: AudioAlertManagerProps): import("react/jsx-runtime").JSX.Element;
/**
 * Hook to trigger audio alerts from components
 */
export declare function useAudioAlert(): {
    triggerAlert: (alertType: AlertType, force?: boolean) => void;
};
export {};
