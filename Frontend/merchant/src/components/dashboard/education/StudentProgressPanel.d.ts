interface StudentProgress {
    studentId: string;
    studentName: string;
    overallProgress: number;
    courses: Array<{
        courseId: string;
        courseTitle: string;
        progress: number;
        status: 'active' | 'completed' | 'at-risk';
        lastActivity: string;
    }>;
    atRiskReasons?: string[];
}
interface StudentProgressPanelProps {
    students: StudentProgress[];
    designCategory?: string;
}
export declare function StudentProgressPanel({ students, _designCategory }: StudentProgressPanelProps): import("react/jsx-runtime").JSX.Element;
export {};
