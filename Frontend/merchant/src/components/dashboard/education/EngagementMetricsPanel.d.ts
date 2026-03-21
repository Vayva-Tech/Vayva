interface EngagementMetrics {
    overallScore: number;
    videoViews: number;
    quizAttempts: number;
    forumPosts: number;
    assignmentsCompleted: number;
    loginFrequency?: {
        daily: number;
        weekly: number;
        monthly: number;
        rarely: number;
    };
    discussionForums?: {
        activeThreads: number;
        postsToday: number;
        avgResponseTime: number;
    };
}
interface EngagementMetricsPanelProps {
    metrics: EngagementMetrics;
    designCategory?: string;
}
export declare function EngagementMetricsPanel({ metrics, _designCategory }: EngagementMetricsPanelProps): import("react/jsx-runtime").JSX.Element;
export {};
