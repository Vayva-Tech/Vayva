type StatusType = "success" | "warning" | "error" | "neutral" | "info";
interface StatusChipProps {
    status: string;
    type?: StatusType;
    className?: string;
}
export declare function StatusChip({ status, type, className, }: StatusChipProps): import("react/jsx-runtime").JSX.Element;
export {};
