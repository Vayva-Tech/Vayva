import React from "react";
import { LockKey as Lock, PlayCircle, CheckCircle } from "@phosphor-icons/react/ssr";

interface CurriculumListProps {
  lessons: { id: string; title: string; duration: string; isLocked: boolean }[];
  completedLessons: string[];
  onLessonSelect: (id: string, isLocked: boolean) => void;
}

export const CurriculumList = ({
  lessons,
  completedLessons,
  onLessonSelect,
}: CurriculumListProps) => {
  return (
    <div className="bg-transparent rounded-2xl border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <h3 className="text-xl font-bold text-gray-900">Course Content</h3>
        <p className="text-sm text-gray-500">
          {lessons.length} lessons • Total duration ~
          {(lessons.length * 20) / 60}h
        </p>
      </div>

      <div className="divide-y divide-gray-100">
        {lessons.map((lesson, idx) => {
          const isCompleted = completedLessons.includes(lesson.id);
          const isLocked = lesson.isLocked && !isCompleted;
          // In real app, lock logic is more complex (based on previous complete)
          // Here we assume if test says locked, it is locked unless we forcefully unlocked it via enrollment test.

          return (
            <div
              key={lesson.id}
              onClick={() => onLessonSelect(lesson.id, isLocked)}
              className={`p-4 flex items-center gap-4 transition-colors ${
                isLocked
                  ? "opacity-50 cursor-not-allowed bg-background/40 backdrop-blur-sm"
                  : "hover:bg-blue-50 cursor-pointer"
              }`}
            >
              <div className="text-gray-400 font-mono text-xs w-6 text-center">
                {idx + 1}
              </div>

              <div className="flex-1">
                <h4
                  className={`font-medium text-sm ${isCompleted ? "text-gray-500 line-through" : "text-gray-900"}`}
                >
                  {lesson.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <PlayCircle size={10} /> {lesson.duration}
                </div>
              </div>

              <div>
                {isCompleted ? (
                  <CheckCircle size={20} className="text-green-500" />
                ) : isLocked ? (
                  <Lock size={18} className="text-gray-400" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200"></div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
