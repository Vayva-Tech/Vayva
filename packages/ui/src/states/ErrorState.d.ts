import React from "react";
interface ErrorStateProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}
export declare const ErrorState: React.FC<ErrorStateProps>;
export {};
