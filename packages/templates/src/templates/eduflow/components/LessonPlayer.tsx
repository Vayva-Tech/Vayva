import React from "react";
import { X, Play } from "lucide-react";
import { Button } from "@vayva/ui";

interface LessonPlayerProps {
  lesson: { id: string; title: string; duration: string };
  onComplete: () => void;
  onClose: () => void;
}

export const LessonPlayer = ({
  lesson,
  onComplete,
  onClose,
}: LessonPlayerProps) => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col">
      <div className="h-16 flex items-center justify-between px-6 bg-gray-900 border-b border-gray-800">
        <h3 className="text-white font-bold">{lesson.title}</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-400 hover:text-white h-auto" aria-label="Close lesson player">
          <X size={24} />
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center bg-black relative group">
        {/* Test Video Player */}
        <div className="text-center text-gray-500">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform cursor-pointer">
            <Play size={40} fill="currentColor" className="text-white ml-2" />
          </div>
          <p>Video Placeholder for "{lesson.title}"</p>
          <p className="text-sm">({lesson.duration})</p>
        </div>
      </div>

      <div className="h-20 bg-gray-900 border-t border-gray-800 flex items-center justify-end px-6 gap-4">
        <Button
          variant="ghost"
          onClick={onClose}
          className="text-gray-400 hover:text-white text-sm font-bold h-auto"
          aria-label="Close"
        >
          Close
        </Button>
        <Button
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors h-auto"
          aria-label="Mark lesson as completed"
        >
          Mark as Completed
        </Button>
      </div>
    </div>
  );
};
