"use client";
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Component } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "./Button";
export class ErrorBoundary extends Component {
    constructor() {
        super(...arguments);
        this.state = {
            hasError: false,
            error: null,
        };
        this.handleReset = () => {
            this.setState({ hasError: false, error: null });
        };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error(`ErrorBoundary caught error in [${this.props.name || "Unknown Component"}]:`, error, errorInfo);
        // Call custom error handler if provided (e.g., Sentry)
        this.props.onError?.(error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (_jsxs("div", { className: "p-8 rounded-2xl border border-red-100 bg-red-50/50 flex flex-col items-center justify-center text-center space-y-6", children: [_jsx("div", { className: "p-4 bg-red-100 rounded-full", children: _jsx(AlertTriangle, { className: "w-8 h-8 text-red-600" }) }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "text-xl font-bold text-red-900", children: "Something went wrong" }), _jsxs("p", { className: "text-sm text-red-700/70 max-w-[280px] mx-auto", children: ["We couldn't load this ", this.props.name || "section", ". Please try refreshing or resetting."] })] }), (process.env.NODE_ENV === "development" || this.props.showDetails) &&
                        this.state.error && (_jsx("div", { className: "w-full max-w-md p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-red-100 text-left overflow-hidden", children: _jsx("p", { className: "text-[10px] font-mono text-red-800 break-all whitespace-pre-wrap", children: this.state.error.toString() }) })), _jsxs("div", { className: "flex items-center gap-3", children: [_jsxs(Button, { variant: "outline", size: "sm", className: "border-red-200 text-red-700 hover:bg-red-100/50", onClick: this.handleReset, children: [_jsx(RefreshCcw, { className: "w-4 h-4 mr-2" }), "Try Again"] }), _jsx(Button, { variant: "primary", size: "sm", className: "bg-red-600 hover:bg-red-700 text-white border-none", onClick: () => window.location.reload(), children: "Reload Page" })] })] }));
        }
        return this.props.children;
    }
}
/**
 * Higher-order component to wrap a component with an ErrorBoundary
 */
export function withErrorBoundary(WrappedComponent, options = {}) {
    const componentName = WrappedComponent.displayName || WrappedComponent.name || "Component";
    const WithErrorBoundary = (props) => {
        return (_jsx(ErrorBoundary, { name: componentName, ...options, children: _jsx(WrappedComponent, { ...props }) }));
    };
    WithErrorBoundary.displayName = `WithErrorBoundary(${componentName})`;
    return WithErrorBoundary;
}
