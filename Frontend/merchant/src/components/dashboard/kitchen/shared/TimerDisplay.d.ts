interface TimerDisplayProps {
    startTime: Date;
    targetTime: Date;
    size?: 'small' | 'medium' | 'large';
    showIcon?: boolean;
}
/**
 * TimerDisplay Component
 *
 * Shows elapsed time with color-coded urgency levels
 */
export declare function TimerDisplay({ startTime, targetTime, size, showIcon, }: TimerDisplayProps): import("react/jsx-runtime").JSX.Element;
export {};
