interface AssignmentSubmission {
    id: string;
    assignmentId: string;
    studentName: string;
    submittedAt: string;
    status: 'submitted' | 'graded' | 'late' | 'missing';
    daysLate?: number;
}
interface Assignment {
    id: string;
    title: string;
    courseTitle?: string;
    type: 'quiz' | 'assignment' | 'project' | 'exam';
    dueDate: string;
    submissionsCount: number;
    gradedCount: number;
    pendingGrading: number;
    status: 'draft' | 'published' | 'closed';
}
interface AssignmentGradingQueueProps {
    assignments: Assignment[];
    pendingSubmissions: AssignmentSubmission[];
    designCategory?: string;
}
export declare function AssignmentGradingQueue({ assignments, pendingSubmissions, _designCategory }: AssignmentGradingQueueProps): import("react/jsx-runtime").JSX.Element;
export {};
