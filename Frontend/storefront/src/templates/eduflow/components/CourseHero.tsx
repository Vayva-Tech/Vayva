import React from "react";
import { PlayCircle, Target } from "@phosphor-icons/react/ssr";
import { PublicProduct } from "@/types/storefront";
import { Button } from "@vayva/ui";

interface CourseHeroProps {
  course: PublicProduct;
  onEnroll: () => void;
}

export const CourseHero = ({
  course,
  onEnroll,
}: CourseHeroProps): React.JSX.Element => {
  return (
    <section className="bg-[#F8FAFC] py-12 px-6 border-b border-gray-200">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center">
        {/* Text Content */}
        <div className="flex-1 space-y-6">
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded uppercase">
              {course.courseDetails?.level}
            </span>
            {course.courseDetails?.certificate && (
              <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1">
                <Target size={12} /> Certificate Included
              </span>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
            {course.name}
          </h1>

          <p className="text-lg text-gray-600 leading-relaxed">
            {course.description}
          </p>

          <div className="flex items-center gap-3 py-2 border-t border-b border-gray-200">
            <img
              src={course.courseDetails?.instructor?.avatar || "/placeholder-avatar.png"}
              alt={course.courseDetails?.instructor?.name || "Instructor"}
              className="w-10 h-10 rounded-full object-cover bg-gray-200"
            />
            <div>
              <p className="text-sm font-bold text-gray-900">
                {course.courseDetails?.instructor?.name || "Instructor"}
              </p>
              <p className="text-xs text-gray-500">
                {course.courseDetails?.instructor?.title || ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 pt-2">
            <Button
              onClick={onEnroll}
              className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-blue-200 transition-all text-lg h-auto"
              aria-label={
                course.price === 0
                  ? "Start learning for free"
                  : `Enroll for ₦${(course.price || 0).toLocaleString()}`
              }
            >
              {course.price === 0
                ? "Start Learning for Free"
                : `Enroll for ₦${(course.price || 0).toLocaleString()}`}
            </Button>
          </div>
        </div>

        {/* Video Preview Card */}
        <div className="w-full md:w-[400px] bg-transparent rounded-2xl shadow-xl overflow-hidden border border-gray-100 group cursor-pointer relative">
          <img
            src={course.images?.[0] || "/placeholder.png"}
            alt={course.name || "Course"}
            className="w-full aspect-video object-cover"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
            <div className="w-16 h-16 bg-transparent/90 rounded-full flex items-center justify-center text-blue-600 backdrop-blur-sm shadow-lg group-hover:scale-110 transition-transform">
              <PlayCircle
                size={32}
                fill="currentColor"
                className="text-blue-600"
              />
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-bold text-gray-900 mb-1">
              Preview this course
            </h3>
            <p className="text-xs text-gray-500">
              Watch the first lesson for free.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
