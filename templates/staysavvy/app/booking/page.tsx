"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, User, ChevronLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const services = [
  { id: 1, name: "Service 1", time: "9:00 AM", duration: "60 min", provider: "Provider Name", spots: 5 },
  { id: 2, name: "Service 2", time: "11:00 AM", duration: "45 min", provider: "Provider Name", spots: 3 },
  { id: 3, name: "Service 3", time: "2:00 PM", duration: "90 min", provider: "Provider Name", spots: 4 },
  { id: 4, name: "Service 4", time: "4:00 PM", duration: "30 min", provider: "Provider Name", spots: 6 },
];

export default function BookingPage() {
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  const handleBooking = async () => {
    if (!selectedService) return;
    setIsBooking(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Service booked successfully!");
    setIsBooking(false);
    setSelectedService(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/" className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                Back
              </Link>
            </Button>
            <span className="text-xl font-bold">Book a Service</span>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Book Your Appointment</h1>
          <p className="text-gray-600">Select a service to reserve your spot</p>
        </div>

        <div className="grid gap-4">
          {services.map((svc) => (
            <div
              key={svc.id}
              onClick={() => setSelectedService(svc.id)}
              className={`p-6 rounded-xl border cursor-pointer transition-all ${
                selectedService === svc.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{svc.name}</h3>
                    <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {svc.time} ({svc.duration})
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        {svc.provider}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm text-gray-500">{svc.spots} spots left</span>
                  {selectedService === svc.id && (
                    <CheckCircle className="w-6 h-6 text-primary-600 ml-auto mt-2" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedService && (
          <div className="mt-8 p-6 bg-white rounded-xl border">
            <h3 className="font-semibold mb-4">Booking Summary</h3>
            <p className="text-gray-600 mb-4">
              {services.find(s => s.id === selectedService)?.name} at {" "}
              {services.find(s => s.id === selectedService)?.time}
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
