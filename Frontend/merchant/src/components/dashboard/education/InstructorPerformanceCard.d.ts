interface Instructor {
    id: string;
    name: string;
    coursesCount: number;
    totalStudents: number;
    averageRating: number;
    reviewCount: number;
    completionRate: number;
    totalRevenue: number;
}
interface InstructorPerformanceCardProps {
    instructors: Instructor[];
    designCategory?: string;
}
export declare function InstructorPerformanceCard({ instructors, _designCategory }: InstructorPerformanceCardProps): import("react/jsx-runtime").JSX.Element;
export {};
