interface AtRiskStudent {
    studentId: string;
    studentName: string;
    atRiskReasons: string[];
    overallProgress: number;
    lastActiveDate?: string;
}
interface AtRiskAlertProps {
    students: AtRiskStudent[];
    designCategory?: string;
}
export declare function AtRiskAlert({ students, _designCategory }: AtRiskAlertProps): import("react/jsx-runtime").JSX.Element | null;
export {};
