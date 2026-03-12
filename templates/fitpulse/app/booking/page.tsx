"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, User, ChevronLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const classes = [
  { id: 1, name: "HIIT Training", time: "6:00 AM", duration: "45 min", trainer: "Alex Rivera", spots: 5 },
  { id: 2, name: "Yoga Flow", time: "7:00 AM", duration: "60 min", trainer: "Sarah Chen", spots: 8 },
  { id: 3, name: "Strength", time: "9:00 AM", duration: "50 min", trainer: "Mike Johnson", spots: 6 },
  { id: 4, name: "Spin Class", time: "5:00 PM", duration: "45 min", trainer: "Emma Davis", spots: 10 },
  { id: 5, name: "Boxing", time: "6:00 PM", duration: "60 min", trainer: "Alex Rivera", spots: 4 },
  { id: 6, name: "Pilates", time: "7:00 PM", duration: "50 min", trainer: "Sarah Chen", spots: 7 },
];

export default function BookingPage() {
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const handleBooking = async () => {
    if (!selectedClass) return;
    setIsBooking(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast.success("Class booked successfully!");
    setIsBooking(false);
    setSelectedClass(null);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2 text-gray-400 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
                Back
              </Link>
            </Button>
            <span className="text-xl font-bold">Book a Class</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book Your Workout</h1>
          <p className="text-gray-400">Select a class to reserve your spot</p>
        </div>

        <div className="grid gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              onClick={() => setSelectedClass(cls.id)}
              className={`p-6 rounded-xl border cursor-pointer transition-all ${
                selectedClass === cls.id
                  ? "border-primary-500 bg-primary-500/10"
                  : "border-gray-800 bg-gray-800/50 hover:border-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-500/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{cls.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {cls.time} ({cls.duration})
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {cls.trainer}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-400">{cls.spots} spots left</span>
                  {selectedClass === cls.id && (
                    <CheckCircle className="w-6 h-6 text-primary-500 ml-auto mt-2" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedClass && (
          <div className="mt-8 p-6 bg-gray-800 rounded-xl">
            <h3 className="font-semibold mb-4">Booking Summary</h3>
            <p className="text-gray-400 mb-4">
              {classes.find(c => c.id === selectedClass)?.name} at {" "}
              {classes.find(c => c.id === selectedClass)?.time}
            </p>
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleBooking}
              disabled={isBooking}
            >
              {isBooking ? "Booking..." : "Confirm Booking"}
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
