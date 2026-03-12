"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from "@/components/Header";
import VideoPlayer from "@/components/VideoPlayer";
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, Clock, Play, Lock } from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl: string;
  duration: number;
  order: number;
  isPreview: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

export default function LessonViewerPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('courseId');
  const moduleId = searchParams.get('moduleId');
  const lessonId = searchParams.get('lessonId');

  const [course, setCourse] = useState<Course | null>(null);
  const [currentModule, setCurrentModule] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);

  useEffect(() => {
    if (courseId && moduleId && lessonId) {
      fetchCourseData();
    }
  }, [courseId, moduleId, lessonId]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      // In a real implementation, this would fetch from the API
      // For now, using mock data to demonstrate the functionality
      const mockCourse: Course = {
        id: courseId || "1",
        title: "Blender 3D Fundamentals",
        description: "Learn the basics of 3D modeling with Blender",
        modules: [
          {
            id: "mod-1",
            title: "Introduction to Blender",
            description: "Getting started with the Blender interface",
            order: 1,
            lessons: [
              {
                id: "lesson-1",
                title: "Interface Overview",
                description: "Learn the Blender interface and navigation",
                content: "This lesson covers the basic interface elements...",
                videoUrl: "", // Would be actual video URL
                duration: 15,
                order: 1,
                isPreview: true
              },
              {
                id: "lesson-2",
                title: "Basic Navigation",
                description: "Master camera movement and viewport controls",
                content: "Learn how to navigate the 3D viewport...",
                videoUrl: "",
                duration: 20,
                order: 2,
                isPreview: false
              }
            ]
          },
          {
            id: "mod-2",
            title: "Modeling Basics",
            description: "Fundamental modeling techniques",
            order: 2,
            lessons: [
              {
                id: "lesson-3",
                title: "Mesh Editing",
                description: "Learn basic mesh manipulation tools",
                content: "Understanding vertices, edges, and faces...",
                videoUrl: "",
                duration: 25,
                order: 1,
                isPreview: false
              }
            ]
          }
        ]
      };

      setCourse(mockCourse);
      
      // Find current module and lesson
      const module = mockCourse.modules.find(m => m.id === moduleId);
      const lesson = module?.lessons.find(l => l.id === lessonId);
      
      setCurrentModule(module || null);
      setCurrentLesson(lesson || null);
      
    } catch (error) {
      console.error('Failed to fetch course data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoTimeUpdate = (currentTime: number, duration: number) => {
    setVideoProgress(currentTime);
    setVideoDuration(duration);
  };

  const handleVideoComplete = () => {
    // Mark lesson as completed
    console.log('Lesson completed!');
    // In real implementation, this would update the progress API
  };

  const goToNextLesson = () => {
    if (!currentModule || !currentLesson || !course) return;

    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);
    const nextLesson = currentModule.lessons[currentLessonIndex + 1];
    
    if (nextLesson) {
      // Go to next lesson in same module
      router.push(`/lesson-viewer?courseId=${courseId}&moduleId=${moduleId}&lessonId=${nextLesson.id}`);
    } else {
      // Go to first lesson of next module
      const currentModuleIndex = course.modules.findIndex(m => m.id === moduleId);
      const nextModule = course.modules[currentModuleIndex + 1];
      if (nextModule && nextModule.lessons.length > 0) {
        const firstLesson = nextModule.lessons[0];
        router.push(`/lesson-viewer?courseId=${courseId}&moduleId=${nextModule.id}&lessonId=${firstLesson.id}`);
      }
    }
  };

  const goToPreviousLesson = () => {
    if (!currentModule || !currentLesson || !course) return;

    const currentLessonIndex = currentModule.lessons.findIndex(l => l.id === currentLesson.id);
    const prevLesson = currentModule.lessons[currentLessonIndex - 1];
    
    if (prevLesson) {
      // Go to previous lesson in same module
      router.push(`/lesson-viewer?courseId=${courseId}&moduleId=${moduleId}&lessonId=${prevLesson.id}`);
    } else {
      // Go to last lesson of previous module
      const currentModuleIndex = course.modules.findIndex(m => m.id === moduleId);
      const prevModule = course.modules[currentModuleIndex - 1];
      if (prevModule && prevModule.lessons.length > 0) {
        const lastLesson = prevModule.lessons[prevModule.lessons.length - 1];
        router.push(`/lesson-viewer?courseId=${courseId}&moduleId=${prevModule.id}&lessonId=${lastLesson.id}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!course || !currentModule || !currentLesson) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Lesson not found</p>
          <button 
            onClick={() => router.push('/courses')}
            className="mt-4 text-blue-600 hover:underline"
          >
            Back to Courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[
        { label: "Courses", href: "/courses" },
        { label: course.title, href: `/courses/${courseId}` },
        { label: currentModule.title },
        { label: currentLesson.title }
      ]} />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video Player Section */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Video Player */}
              <div className="p-6">
                {currentLesson.videoUrl ? (
                  <VideoPlayer
                    videoUrl={currentLesson.videoUrl}
                    title={currentLesson.title}
                    onTimeUpdate={handleVideoTimeUpdate}
                    onPlaybackComplete={handleVideoComplete}
                  />
                ) : (
                  <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <Play className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">Video content coming soon</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Lesson Info */}
              <div className="border-t p-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {currentLesson.title}
                </h1>
                <p className="text-gray-600 mb-4">
                  {currentLesson.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {currentLesson.duration} min
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    Lesson {currentLesson.order} of {currentModule.lessons.length}
                  </span>
                </div>

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <button
                    onClick={goToPreviousLesson}
                    disabled={!currentModule.lessons.find(l => l.order < currentLesson.order)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous Lesson
                  </button>
                  
                  <button
                    onClick={goToNextLesson}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next Lesson
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Course Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-6">
              <h2 className="font-semibold text-gray-900 mb-4">Course Content</h2>
              
              <div className="space-y-6">
                {course.modules.map((module) => (
                  <div key={module.id}>
                    <h3 className="font-medium text-gray-900 mb-3">
                      {module.title}
                    </h3>
                    
                    <div className="space-y-2">
                      {module.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className={`p-3 rounded-lg cursor-pointer transition-colors ${
                            lesson.id === currentLesson.id
                              ? 'bg-blue-50 border border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            if (lesson.isPreview || true) { // In real app, check enrollment
                              router.push(`/lesson-viewer?courseId=${courseId}&moduleId=${module.id}&lessonId=${lesson.id}`);
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`flex-shrink-0 mt-1 ${
                              lesson.id === currentLesson.id 
                                ? 'text-blue-600' 
                                : lesson.isPreview 
                                  ? 'text-green-600' 
                                  : 'text-gray-400'
                            }`}>
                              {lesson.id === currentLesson.id ? (
                                <Play className="h-4 w-4" />
                              ) : lesson.isPreview ? (
                                <CheckCircle className="h-4 w-4" />
                              ) : (
                                <Lock className="h-4 w-4" />
                              )}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium truncate ${
                                lesson.id === currentLesson.id
                                  ? 'text-blue-900'
                                  : 'text-gray-900'
                              }`}>
                                {lesson.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {lesson.duration} min
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}