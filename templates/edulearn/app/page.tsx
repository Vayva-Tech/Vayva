"use client";

import Header from "@/components/Header";
import { Play, Pause, Volume2, Maximize, CheckCircle, Lock, Download, FileText, Clock } from "lucide-react";
import { useState } from "react";

const lessons = [
  { id: 1, title: "Watch lesson", duration: "15:00", completed: true },
  { id: 2, title: "Try it in Blender", duration: "1h 25m", completed: true },
  { id: 3, title: "Practice in Blender", duration: "45:00", completed: true },
  { id: 4, title: "Render practice scene", duration: "2h 00m", completed: false, current: true },
  { id: 5, title: "Submit homework", duration: "30:00", completed: false },
  { id: 6, title: "Improve your project", duration: "1h 15m", completed: false },
];

const resources = [
  { name: "cinematic_scene_setup.blend", size: "2.4 MB", type: "blend" },
  { name: "render_pass_template.psd", size: "156 MB", type: "psd" },
  { name: "lighting_reference_sheet.pdf", size: "4.2 MB", type: "pdf" },
];

const comments = [
  {
    id: 1,
    user: "@creativedriver",
    avatar: "CD",
    time: "1 hour ago",
    content: "This is absolutely the best car motion blur I've ever seen! The way the highlights streak across the car is stunning. The body roll still keeping the car realistic is amazing. Great work!",
    likes: 24,
  },
  {
    id: 2,
    user: "@FX_HQ",
    avatar: "FX",
    time: "3 hours ago",
    content: "This car is so cool! Looking forward to seeing more from you.",
    likes: 12,
  },
];

const relatedLessons = [
  { title: "3D lighting fundamentals", duration: "45 min", level: "Beginner" },
  { title: "Creating realistic materials in...", duration: "1h 20m", level: "Intermediate" },
];

export default function CoursePlayer() {
  const [activeTab, setActiveTab] = useState("discussion");
  const [isPlaying, setIsPlaying] = useState(false);

  const completedCount = lessons.filter(l => l.completed).length;
  const progress = (completedCount / lessons.length) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Header
                breadcrumbs={[
                  { label: "Home", href: "/" },
                  { label: "Courses", href: "/courses" },
                  { label: "Starter Foundation", href: "/courses/starter" },
                  { label: "Creating a high-speed automotive cinematic render" },
                ]}
              />
            </div>
            <div className="flex items-center gap-4">
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Search className="w-5 h-5" />
              </button>
              <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Bell className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium">
                JD
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Left Content */}
        <div className="flex-1 p-6">
          {/* Video Player */}
          <div className="relative aspect-video bg-muted rounded-xl overflow-hidden mb-6">
            <div className="absolute inset-0 flex items-center justify-center">
              {!isPlaying ? (
                <button 
                  onClick={() => setIsPlaying(true)}
                  className="w-20 h-20 bg-primary/90 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
                </button>
              ) : null}
            </div>
            
            {/* Video Controls Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-foreground/50 font-medium">Video Player</div>
            </div>
            
            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted-foreground/20">
              <div className="h-full w-1/3 bg-primary" />
            </div>
          </div>

          {/* Course Info */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Creating a high-speed automotive cinematic render
            </h1>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                12h 45m total
              </span>
              <span>•</span>
              <span>1.2K students</span>
              <span>•</span>
              <span>27 reviews</span>
            </div>
            
            {/* Instructor */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-medium">
                EB
              </div>
              <div>
                <p className="font-medium text-foreground">Ethan Brantley</p>
                <p className="text-sm text-muted-foreground">Senior 3D Artist at Pixar</p>
              </div>
              <button className="ml-auto px-4 py-2 border rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" />
                View profile
              </button>
            </div>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              In this lesson, you&apos;ll learn how to create high-impact automotive cinematics in Blender using motion blur, HDR lighting techniques, and camera animation. We&apos;ll cover the complete workflow from setup, camera animation, realistic reflections, and strategies for achieving stunning results.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3 mb-6">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" />
                Watch now
              </button>
              <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b mb-6">
            <div className="flex gap-6">
              {["Overview", "Notes", "Transcript", "Q&A", "Discussion"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.toLowerCase() 
                      ? "border-primary text-primary" 
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                  {tab === "Discussion" && (
                    <span className="ml-2 px-2 py-0.5 bg-destructive/10 text-destructive text-xs rounded-full">
                      12
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Discussion Content */}
          {activeTab === "discussion" && (
            <div className="space-y-6">
              {/* Comment Input */}
              <div className="bg-card border rounded-xl p-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-medium shrink-0">
                    ME
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Share your thoughts or ask a question..."
                      className="w-full p-3 bg-muted rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                      rows={3}
                    />
                    <div className="flex justify-end mt-2">
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-colors">Post comment</button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments */}
              {comments.map((comment) => (
                <div key={comment.id} className="bg-card border rounded-xl p-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white font-medium shrink-0">
                      {comment.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-foreground">{comment.user}</span>
                        <span className="text-muted-foreground text-sm">{comment.time}</span>
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {comment.content}
                      </p>
                      <div className="flex items-center gap-4">
                        <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm">
                          <span className="text-lg">👍</span>
                          {comment.likes}
                        </button>
                        <button className="text-muted-foreground hover:text-foreground text-sm">
                          Reply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div className="w-80 p-6 border-l bg-card">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">
                {completedCount} of {lessons.length} lessons completed
              </span>
              <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Lessons List */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Course content</h3>
            <div className="space-y-1">
              {lessons.map((lesson) => (
                <div
                  key={lesson.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    lesson.current 
                      ? "bg-primary/10 border border-primary/20" 
                      : "hover:bg-muted"
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    lesson.completed 
                      ? "bg-green-500 text-white" 
                      : lesson.current 
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                  }`}>
                    {lesson.completed ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : lesson.current ? (
                      <Play className="w-3 h-3" />
                    ) : (
                      <Lock className="w-3 h-3" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${
                      lesson.current ? "text-primary" : "text-foreground"
                    }`}>
                      {lesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground">{lesson.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resources */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-foreground mb-3">Lesson resources</h3>
            <div className="space-y-2">
              {resources.map((resource, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                >
                  <div className="w-10 h-10 bg-card rounded-lg flex items-center justify-center shadow-sm">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {resource.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{resource.size}</p>
                  </div>
                  <Download className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          {/* Related Content */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Up next</h3>
            <div className="space-y-3">
              {relatedLessons.map((lesson, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-muted rounded-lg hover:bg-muted/80 cursor-pointer transition-colors"
                >
                  <div className="w-full h-24 bg-gradient-to-br from-muted to-muted-foreground/20 rounded-lg mb-2 flex items-center justify-center">
                    <Play className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">{lesson.title}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{lesson.duration}</span>
                    <span>•</span>
                    <span>{lesson.level}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
