import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Lock, PlayCircle, CheckCircle } from "lucide-react";
export const CurriculumList = ({ lessons, completedLessons, onLessonSelect, }) => {
    return (_jsxs("div", { className: "bg-background/70 backdrop-blur-xl rounded-2xl border border-gray-200 overflow-hidden", children: [_jsxs("div", { className: "p-6 border-b border-gray-100", children: [_jsx("h3", { className: "text-xl font-bold text-gray-900", children: "Course Content" }), _jsxs("p", { className: "text-sm text-gray-500", children: [lessons.length, " lessons \u2022 Total duration ~", (lessons.length * 20) / 60, "h"] })] }), _jsx("div", { className: "divide-y divide-gray-100", children: lessons.map((lesson, idx) => {
                    const isCompleted = completedLessons.includes(lesson.id);
                    const isLocked = lesson.isLocked && !isCompleted;
                    // In real app, lock logic is more complex (based on previous complete)
                    // Here we assume if test says locked, it is locked unless we forcefully unlocked it via enrollment test.
                    return (_jsxs("div", { onClick: () => onLessonSelect(lesson.id, isLocked), className: `p-4 flex items-center gap-4 transition-colors ${isLocked
                            ? "opacity-50 cursor-not-allowed bg-background/40 backdrop-blur-sm"
                            : "hover:bg-blue-50 cursor-pointer"}`, children: [_jsx("div", { className: "text-gray-400 font-mono text-xs w-6 text-center", children: idx + 1 }), _jsxs("div", { className: "flex-1", children: [_jsx("h4", { className: `font-medium text-sm ${isCompleted ? "text-gray-500 line-through" : "text-gray-900"}`, children: lesson.title }), _jsxs("div", { className: "flex items-center gap-2 text-xs text-gray-400 mt-1", children: [_jsx(PlayCircle, { size: 10 }), " ", lesson.duration] })] }), _jsx("div", { children: isCompleted ? (_jsx(CheckCircle, { size: 20, className: "text-green-500" })) : isLocked ? (_jsx(Lock, { size: 18, className: "text-gray-400" })) : (_jsx("div", { className: "w-5 h-5 rounded-full border-2 border-gray-200" })) })] }, lesson.id));
                }) })] }));
};
