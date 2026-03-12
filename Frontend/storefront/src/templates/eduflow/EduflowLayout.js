import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Button } from "@vayva/ui";
import { EduHeader } from "./components/EduHeader";
import { CourseHero } from "./components/CourseHero";
import { CurriculumList } from "./components/CurriculumList";
import { LessonPlayer } from "./components/LessonPlayer";
import { CertificateView } from "./components/CertificateView";
import { CheckCircle } from "lucide-react";
export const EduflowLayout = ({ store, products }) => {
    // Demo: Select first course
    const course = products[0];
    // Test State
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [completedLessons, setCompletedLessons] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [showCertificate, setShowCertificate] = useState(false);
    const lessons = course.courseDetails?.lessons || [];
    const handleEnroll = () => {
        setIsEnrolled(true);
        // Unlock first lesson logic would happen in backend
        alert("Enrolled successfully! You can now access the lessons.");
    };
    const handleLessonSelect = (id, isLocked) => {
        if (!isEnrolled) {
            alert("Please enroll to access content.");
            return;
        }
        if (isLocked) {
            alert("Complete previous lessons to unlock this one.");
            return;
        }
        const lesson = lessons.find((l) => l.id === id);
        if (lesson)
            setActiveLesson({
                id: lesson.id,
                title: lesson.title,
                duration: lesson.duration,
            });
    };
    const handleLessonComplete = () => {
        if (activeLesson) {
            if (!completedLessons.includes(activeLesson.id)) {
                const newCompleted = [...completedLessons, activeLesson.id];
                setCompletedLessons(newCompleted);
                // Check for certificate
                if (newCompleted.length === lessons.length &&
                    course.courseDetails?.certificate) {
                    setTimeout(() => setShowCertificate(true), 500);
                }
            }
            setActiveLesson(null);
        }
    };
    if (!course)
        return _jsx("div", { children: "No courses found." });
    const progress = Math.round((completedLessons.length / lessons.length) * 100) || 0;
    return (_jsxs("div", { className: "min-h-screen bg-background/70 backdrop-blur-xl font-sans text-gray-900", children: [_jsx(EduHeader, { storeName: store.name }), _jsxs("main", { children: [_jsx(CourseHero, { course: course, onEnroll: handleEnroll }), _jsxs("section", { className: "max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-2xl font-bold mb-6", children: "Course Content" }), _jsx(CurriculumList, { lessons: lessons, completedLessons: completedLessons, onLessonSelect: handleLessonSelect })] }), _jsx("div", { className: "w-full md:w-80 space-y-6", children: _jsxs("div", { className: "bg-background/70 backdrop-blur-xl border border-gray-200 p-6 rounded-2xl shadow-sm", children: [_jsx("h3", { className: "font-bold text-gray-900 mb-4", children: "Your Progress" }), _jsx("div", { className: "w-full bg-background/50 backdrop-blur-sm rounded-full h-2 mb-2", children: _jsx("div", { className: "bg-green-500 h-2 rounded-full transition-all duration-500", style: { width: `${progress}%` } }) }), _jsxs("p", { className: "text-sm text-gray-500 mb-6", children: [progress, "% Completed"] }), progress === 100 ? (_jsxs(Button, { onClick: () => setShowCertificate(true), className: "w-full bg-green-100 text-green-700 font-bold py-2 rounded-lg text-sm hover:bg-green-200 transition-colors flex items-center justify-center gap-2", children: [_jsx(CheckCircle, { size: 16 }), " View Certificate"] })) : (_jsx("div", { className: "text-xs text-gray-400 text-center", children: "Complete all lessons to earn your certificate." }))] }) })] })] }), activeLesson && (_jsx(LessonPlayer, { lesson: activeLesson, onComplete: handleLessonComplete, onClose: () => setActiveLesson(null) })), showCertificate && (_jsx(CertificateView, { course: course, studentName: "Guest Student", onClose: () => setShowCertificate(false) }))] }));
};
