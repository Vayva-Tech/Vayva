'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, Wifi, Database, Server, AlertTriangle, CheckCircle, Clock, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
/**
 * RealTimeMonitoring - Live system health and performance monitoring
 * Tracks infrastructure, APIs, and business-critical services
 */
export function RealTimeMonitoring({ industry, designCategory, planTier, loading = false, className }) {
    const [statuses, setStatuses] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(new Date());
    // Mock system status data - would come from monitoring service
    useEffect(() => {
        if (!loading) {
            const mockStatuses = [
                {
                    id: '1',
                    service: 'API Gateway',
                    status: 'operational',
                    responseTime: 45,
                    uptime: 99.98,
                    lastChecked: new Date(),
                    metrics: { requests: 1247, errors: 3 }
                },
                {
                    id: '2',
                    service: 'Database Cluster',
                    status: 'operational',
                    responseTime: 12,
                    uptime: 99.99,
                    lastChecked: new Date(),
                    metrics: { cpu: 65, memory: 78 }
                },
                {
                    id: '3',
                    service: 'Payment Processing',
                    status: 'degraded',
                    responseTime: 156,
                    uptime: 98.7,
                    lastChecked: new Date(),
                    metrics: { requests: 89, errors: 12 }
                },
                {
                    id: '4',
                    service: 'Email Service',
                    status: 'operational',
                    responseTime: 23,
                    uptime: 99.95,
                    lastChecked: new Date(),
                    metrics: { requests: 456, errors: 1 }
                },
                {
                    id: '5',
                    service: 'Storage CDN',
                    status: 'operational',
                    responseTime: 8,
                    uptime: 100,
                    lastChecked: new Date(),
                    metrics: { requests: 3456, errors: 0 }
                }
            ];
            setStatuses(mockStatuses);
        }
        // Simulate real-time updates
        const interval = setInterval(() => {
            setLastUpdated(new Date());
        }, 30000); // Update every 30 seconds
        return () => clearInterval(interval);
    }, [loading, industry]);
    const getStatusConfig = (status) => {
        const configs = {
            operational: {
                icon: _jsx(CheckCircle, { className: "h-4 w-4" }),
                label: 'Operational',
                badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                textClass: 'text-emerald-600'
            },
            degraded: {
                icon: _jsx(AlertTriangle, { className: "h-4 w-4" }),
                label: 'Degraded',
                badgeClass: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                textClass: 'text-yellow-600'
            },
            down: {
                icon: _jsx(AlertTriangle, { className: "h-4 w-4" }),
                label: 'Down',
                badgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
                textClass: 'text-rose-600'
            },
            maintenance: {
                icon: _jsx(Clock, { className: "h-4 w-4" }),
                label: 'Maintenance',
                badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
                textClass: 'text-blue-600'
            }
        };
        return configs[status];
    };
    const getServiceIcon = (service) => {
        const icons = {
            'API Gateway': _jsx(Wifi, { className: "h-4 w-4" }),
            'Database Cluster': _jsx(Database, { className: "h-4 w-4" }),
            'Payment Processing': _jsx(Zap, { className: "h-4 w-4" }),
            'Email Service': _jsx(Server, { className: "h-4 w-4" }),
            'Storage CDN': _jsx(Server, { className: "h-4 w-4" })
        };
        return icons[service] || _jsx(Server, { className: "h-4 w-4" });
    };
    const formatTimeAgo = (date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60)
            return 'Just now';
        if (seconds < 3600)
            return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };
    if (loading) {
        return (_jsxs(Card, { className: cn("rounded-[28px] border border-border/60", className), children: [_jsx(CardHeader, { className: "pb-2 p-6", children: _jsx(Skeleton, { className: "h-6 w-48" }) }), _jsx(CardContent, { className: "p-6 space-y-3", children: [...Array(5)].map((_, i) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Skeleton, { className: "h-8 w-8 rounded-lg" }), _jsxs("div", { className: "space-y-1", children: [_jsx(Skeleton, { className: "h-4 w-24" }), _jsx(Skeleton, { className: "h-3 w-16" })] })] }), _jsx(Skeleton, { className: "h-6 w-20 rounded-full" })] }, i))) })] }));
    }
    return (_jsxs(Card, { className: cn("rounded-[28px] border border-border/60", className), children: [_jsx(CardHeader, { className: "pb-2 p-6", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "text-lg font-bold flex items-center gap-2", children: [_jsx(Activity, { className: "h-5 w-5 text-primary animate-pulse" }), "Real-Time Monitoring"] }), _jsx("p", { className: "text-sm text-text-secondary mt-1", children: "System health and performance metrics" })] }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-text-secondary", children: [_jsx("div", { className: "w-2 h-2 bg-emerald-500 rounded-full animate-pulse" }), _jsx("span", { children: "Live" }), _jsx("span", { children: "\u2022" }), _jsxs("span", { children: ["Updated ", formatTimeAgo(lastUpdated)] })] })] }) }), _jsxs(CardContent, { className: "p-6", children: [_jsx("div", { className: "space-y-3", children: statuses.map((status) => {
                            const statusConfig = getStatusConfig(status.status);
                            const serviceIcon = getServiceIcon(status.service);
                            return (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-xl border border-border/40 hover:border-border/60 transition-all group", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: cn("p-2 rounded-lg transition-colors group-hover:scale-105", status.status === 'operational' ? 'bg-emerald-100 text-emerald-600' :
                                                    status.status === 'degraded' ? 'bg-yellow-100 text-yellow-600' :
                                                        status.status === 'down' ? 'bg-rose-100 text-rose-600' :
                                                            'bg-blue-100 text-blue-600'), children: serviceIcon }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-text-primary group-hover:text-primary transition-colors", children: status.service }), _jsxs("div", { className: "flex items-center gap-3 text-xs text-text-secondary mt-1", children: [_jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Clock, { className: "h-3 w-3" }), status.responseTime, "ms"] }), _jsxs("span", { className: "flex items-center gap-1", children: [_jsx(Activity, { className: "h-3 w-3" }), status.uptime.toFixed(2), "% uptime"] })] }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [status.metrics.requests !== undefined && (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: [status.metrics.requests, " req/s"] })), status.metrics.errors !== undefined && status.metrics.errors > 0 && (_jsxs(Badge, { variant: "secondary", className: "text-xs bg-rose-100 text-rose-700 border-rose-200", children: [status.metrics.errors, " errors"] })), status.metrics.cpu !== undefined && (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: ["CPU: ", status.metrics.cpu, "%"] })), status.metrics.memory !== undefined && (_jsxs(Badge, { variant: "secondary", className: "text-xs", children: ["RAM: ", status.metrics.memory, "%"] }))] })] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Badge, { variant: "secondary", className: cn("text-xs font-medium", statusConfig.badgeClass), children: [statusConfig.icon, _jsx("span", { className: "ml-1", children: statusConfig.label })] }) })] }, status.id));
                        }) }), statuses.length === 0 && (_jsxs("div", { className: "text-center py-8", children: [_jsx(Server, { className: "h-12 w-12 mx-auto text-text-tertiary mb-3" }), _jsx("p", { className: "text-text-secondary", children: "No system data available" }), _jsx("p", { className: "text-xs text-text-tertiary mt-1", children: "Monitoring services will appear here when connected" })] })), _jsx("div", { className: "mt-6 pt-4 border-t border-border/40", children: _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-text-secondary", children: "Overall System Status" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-2 h-2 bg-emerald-500 rounded-full animate-pulse" }), _jsx("span", { className: "font-medium text-emerald-600", children: "All Systems Operational" })] })] }) })] })] }));
}
