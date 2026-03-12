import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { PublicStore, PublicProduct } from "@/types/storefront";
import { EduHeader } from "./components/EduHeader";
import { CourseHero } from "./components/CourseHero";
import { CurriculumList } from "./components/CurriculumList";
import { LessonPlayer } from "./components/LessonPlayer";
import { CertificateView } from "./components/CertificateView";
import { CheckCircle } from "@phosphor-icons/react/ssr";

interface EduflowLayoutProps {
  store: PublicStore;
  products: PublicProduct[];
}

export const EduflowLayout = ({
  store,
  products,
}: EduflowLayoutProps): React.JSX.Element => {
  // Demo: Select first course
  const course = products[0];

  // Test State
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [activeLesson, setActiveLesson] = useState<{
    id: string;
    title: string;
    duration: string;
  } | null>(null);
  const [showCertificate, setShowCertificate] = useState(false);

  const lessons = course.courseDetails?.lessons || [];

  const handleEnroll = () => {
    setIsEnrolled(true);
    // Unlock first lesson logic would happen in backend
    alert("Enrolled successfully! You can now access the lessons.");
  };

  const handleLessonSelect = (id: string, isLocked: boolean) => {
    if (!isEnrolled) {
      alert("Please enroll to access content.");
      return;
    }
    if (isLocked) {
      alert("Complete previous lessons to unlock this one.");
      return;
    }
    const lesson = lessons.find((l: any) => l.id === id);
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
        if (
          newCompleted.length === lessons.length &&
          course.courseDetails?.certificate
        ) {
          setTimeout(() => setShowCertificate(true), 500);
        }
      }
      setActiveLesson(null);
    }
  };

  if (!course) return <div>No courses found.</div>;

  const progress =
    Math.round((completedLessons.length / lessons.length) * 100) || 0;

  return (
    <div className="min-h-screen bg-transparent font-sans text-gray-900">
      <EduHeader storeName={store.name} />

      <main>
        <CourseHero course={course} onEnroll={handleEnroll} />

        <section className="max-w-5xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
          {/* Curriculum */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-6">Course Content</h2>
            <CurriculumList
              lessons={lessons}
              completedLessons={completedLessons}
              onLessonSelect={handleLessonSelect}
            />
          </div>

          {/* Progress Sidebar */}
          <div className="w-full md:w-80 space-y-6">
            <div className="bg-transparent border border-gray-200 p-6 rounded-2xl shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">Your Progress</h3>

              <div className="w-full bg-background/50 backdrop-blur-sm rounded-full h-2 mb-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mb-6">
                {progress}% Completed
              </p>

              {progress === 100 ? (
                <Button
                  onClick={() => setShowCertificate(true)}
                  className="w-full bg-green-100 text-green-700 font-bold py-2 rounded-lg text-sm hover:bg-green-200 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle size={16} /> View Certificate
                </Button>
              ) : (
                <div className="text-xs text-gray-400 text-center">
                  Complete all lessons to earn your certificate.
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Modals */}
      {activeLesson && (
        <LessonPlayer
          lesson={activeLesson}
          onComplete={handleLessonComplete}
          onClose={() => setActiveLesson(null)}
        />
      )}

      {showCertificate && (
        <CertificateView
          course={course}
          studentName="Guest Student"
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
};
