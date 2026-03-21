import * as React from "react";
import { Component, ErrorInfo, ReactNode } from "react";
interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    name?: string;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
    showDetails?: boolean;
}
interface State {
    hasError: boolean;
    error: Error | null;
}
export declare class ErrorBoundary extends Component<Props, State> {
    state: State;
    static getDerivedStateFromError(error: Error): State;
    componentDidCatch(error: Error, errorInfo: ErrorInfo): void;
    handleReset: () => void;
    render(): string | number | bigint | boolean | import("react/jsx-runtime").JSX.Element | Iterable<React.ReactNode> | Promise<string | number | bigint | boolean | React.ReactPortal | React.ReactElement<unknown, string | React.JSXElementConstructor<any>> | Iterable<React.ReactNode> | null | undefined> | null | undefined;
}
/**
 * Higher-order component to wrap a component with an ErrorBoundary
 */
export declare function withErrorBoundary<P extends object>(WrappedComponent: React.ComponentType<P>, options?: Omit<Props, "children">): {
    (props: P): React.JSX.Element;
    displayName: string;
};
export {};
