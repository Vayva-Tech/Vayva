interface Course {
    id: string;
    title: string;
    instructorName?: string;
    enrolledStudents: number;
    maxStudents: number;
    progress: number;
    revenue: number;
    status: 'draft' | 'published' | 'archived';
    rating?: number;
}
interface ActiveCoursesSectionProps {
    courses: Course[];
    designCategory?: string;
}
export declare function ActiveCoursesSection({ courses, _designCategory }: ActiveCoursesSectionProps): import("react/jsx-runtime").JSX.Element;
export {};
