interface KitchenChatProps {
    storeId: string;
    stationId?: string;
    userId: string;
    userName: string;
}
/**
 * KitchenChat Component
 *
 * Real-time chat for kitchen staff with:
 * - Station-specific channels
 * - Quick message templates
 * - Typing indicators
 * - Audio alerts integration
 */
export declare function KitchenChat({ storeId, stationId, userId, userName }: KitchenChatProps): import("react/jsx-runtime").JSX.Element;
export {};
