"use client";

import Header from "@/components/Header";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Video, FileText, Award, Plus } from "lucide-react";
import { useState } from "react";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const events = [
  {
    id: 1,
    title: "Blender Live Session: Modeling Basics",
    type: "live",
    date: "2024-03-05",
    time: "10:00 AM",
    duration: "2 hours",
    instructor: "Ethan Brantley",
    color: "blue",
  },
  {
    id: 2,
    title: "Assignment Due: 3D Character Project",
    type: "deadline",
    date: "2024-03-07",
    time: "11:59 PM",
    course: "Character Animation in Maya",
    color: "red",
  },
  {
    id: 3,
    title: "Workshop: Advanced Texturing Techniques",
    type: "workshop",
    date: "2024-03-08",
    time: "2:00 PM",
    duration: "3 hours",
    instructor: "Sarah Chen",
    color: "purple",
  },
  {
    id: 4,
    title: "Q&A Session: VFX Career Paths",
    type: "live",
    date: "2024-03-12",
    time: "4:00 PM",
    duration: "1 hour",
    instructor: "Marcus Johnson",
    color: "blue",
  },
  {
    id: 5,
    title: "Challenge Deadline: Particle Effects",
    type: "deadline",
    date: "2024-03-15",
    time: "11:59 PM",
    challenge: "Monthly VFX Challenge",
    color: "orange",
  },
  {
    id: 6,
    title: "New Course Released: Unreal Engine 5",
    type: "release",
    date: "2024-03-18",
    course: "Unreal Engine 5 Masterclass",
    color: "green",
  },
];

const upcomingEvents = events.slice(0, 4);

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<"month" | "week" | "day">("month");

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const getEventsForDate = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header breadcrumbs={[{ label: "Calendar" }]} />

      <div className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Calendar */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
                <p className="text-gray-500">Stay on track with your learning schedule</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {["month", "week", "day"].map((v) => (
                    <button
                      key={v}
                      onClick={() => setView(v as any)}
                      className={`px-3 py-2 text-sm font-medium capitalize ${
                        view === v ? "bg-gray-100 text-gray-900" : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
                <button className="btn-primary flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Event
                </button>
              </div>
            </div>

            {/* Calendar Navigation */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <h2 className="text-xl font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Today
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="card overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 border-b border-gray-200">
                {days.map((day) => (
                  <div key={day} className="py-3 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {/* Empty cells for days before month starts */}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="min-h-32 border-b border-r border-gray-100 bg-gray-50/50" />
                ))}

                {/* Days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateEvents = getEventsForDate(day);
                  const isToday = 
                    today.getDate() === day && 
                    today.getMonth() === currentDate.getMonth() &&
                    today.getFullYear() === currentDate.getFullYear();

                  return (
                    <div
                      key={day}
                      onClick={() => setSelectedDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), day))}
                      className={`min-h-32 border-b border-r border-gray-100 p-2 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isToday ? "bg-blue-50/50" : ""
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? "text-blue-600" : "text-gray-700"}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dateEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={`text-xs px-2 py-1 rounded-md truncate ${
                              event.color === "blue" ? "bg-blue-100 text-blue-700" :
                              event.color === "red" ? "bg-red-100 text-red-700" :
                              event.color === "purple" ? "bg-purple-100 text-purple-700" :
                              event.color === "orange" ? "bg-orange-100 text-orange-700" :
                              "bg-green-100 text-green-700"
                            }`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dateEvents.length > 3 && (
                          <div className="text-xs text-gray-400 px-2">
                            +{dateEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-sm text-gray-600">Live Sessions</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span className="text-sm text-gray-600">Deadlines</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-sm text-gray-600">Workshops</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="text-sm text-gray-600">New Releases</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 space-y-6">
            {/* Upcoming Events */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Upcoming</h3>
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex gap-3">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                      event.type === "live" ? "bg-blue-100" :
                      event.type === "deadline" ? "bg-red-100" :
                      event.type === "workshop" ? "bg-purple-100" :
                      "bg-green-100"
                    }`}>
                      {event.type === "live" && <Video className="w-5 h-5 text-blue-600" />}
                      {event.type === "deadline" && <FileText className="w-5 h-5 text-red-600" />}
                      {event.type === "workshop" && <Award className="w-5 h-5 text-purple-600" />}
                      {event.type === "release" && <CalendarIcon className="w-5 h-5 text-green-600" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {event.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.date} • {event.time}
                      </p>
                      {event.instructor && (
                        <p className="text-xs text-gray-400">with {event.instructor}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Video className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Join Live Session</div>
                    <div className="text-xs text-gray-500">Next: Blender Basics</div>
                  </div>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 text-left transition-colors">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">Set Reminder</div>
                    <div className="text-xs text-gray-500">Get notified before events</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
