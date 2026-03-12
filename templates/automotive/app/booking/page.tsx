"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, Car, User, Phone, ChevronLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SAMPLE_VEHICLES } from "@/lib/automotive-config";

export default function TestDriveBookingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [isBooking, setIsBooking] = useState(false);

  const selectedVehicle = SAMPLE_VEHICLES.find(v => v.id === selectedVehicleId);

  const handleBooking = async () => {
    if (!selectedVehicle || !customerName || !customerEmail || !customerPhone || !selectedDate || !selectedTime) return;
    setIsBooking(true);
    await new Promise(resolve => setTimeout(resolve, 1200));
    toast.success("Test drive scheduled successfully! We'll contact you shortly.");
    setIsBooking(false);
    
    // Reset form
    setStep(1);
    setSelectedVehicleId(null);
    setCustomerName("");
    setCustomerEmail("");
    setCustomerPhone("");
    setSelectedDate("");
    setSelectedTime("");
  };

  const timeSlots = [
    "9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
    "2:00 PM", "2:30 PM", "3:00 PM", "3:30 PM", "4:00 PM", "4:30 PM",
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-950/95 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="text-white">
              <Link href="/" className="flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" />
                Back
              </Link>
            </Button>
            <span className="text-xl font-bold text-white flex items-center gap-2">
              <Car className="w-5 h-5" />
              Schedule Test Drive
            </span>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Step 1: Select Vehicle */}
        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Choose Your Vehicle</h1>
              <p className="text-slate-400">Select a car to test drive</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {SAMPLE_VEHICLES.map((vehicle) => (
                <div
                  key={vehicle.id}
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                  className={`rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    selectedVehicleId === vehicle.id
                      ? "border-blue-500 ring-2 ring-blue-500/30"
                      : "border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-700 relative flex items-center justify-center">
                    <span className="text-6xl">{vehicle.image}</span>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        vehicle.condition === 'new' 
                          ? 'bg-green-500/20 text-green-400' 
                          : vehicle.condition === 'certified_pre_owned'
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-slate-500/20 text-slate-400'
                      }`}>
                        {vehicle.condition.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-5 bg-slate-900">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white">
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </h3>
                      {selectedVehicleId === vehicle.id && (
                        <CheckCircle className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                    
                    <p className="text-slate-400 text-sm mb-3">
                      {vehicle.trim} • {vehicle.color}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-white">₦{(vehicle.price / 100).toLocaleString()}</p>
                        <p className="text-xs text-slate-500">{vehicle.mileage.toLocaleString()} km</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">{vehicle.warranty} mo warranty</p>
                        <p className="text-xs text-slate-500 capitalize">{vehicle.fuelType}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              size="lg"
              className="w-full bg-blue-500 hover:bg-blue-600"
              disabled={!selectedVehicleId}
              onClick={() => setStep(2)}
            >
              Continue — Schedule Test Drive
            </Button>
          </div>
        )}

        {/* Step 2: Customer Info & Scheduling */}
        {step === 2 && selectedVehicle && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => setStep(1)} className="text-white p-0">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-white">Schedule Your Test Drive</h1>
                <p className="text-slate-400">Provide your details and select a convenient time</p>
              </div>
            </div>

            {/* Selected Vehicle Preview */}
            <div className="p-5 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex items-center gap-4">
                <div className="text-4xl">{selectedVehicle.image}</div>
                <div>
                  <h3 className="font-semibold text-white">
                    {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                  </h3>
                  <p className="text-slate-400 text-sm">{selectedVehicle.trim}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+234 801 234 5678"
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="date"
                    value={selectedDate}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {selectedDate && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Select Time</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                        selectedTime === slot
                          ? "bg-blue-500 text-white"
                          : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-blue-400"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedDate && selectedTime && (
              <div className="p-6 bg-slate-900 rounded-xl border border-slate-800">
                <h3 className="font-semibold text-white mb-4">Test Drive Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vehicle</span>
                    <span className="text-white">
                      {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date</span>
                    <span className="text-white">{selectedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time</span>
                    <span className="text-white">{selectedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Duration</span>
                    <span className="text-white">30 minutes</span>
                  </div>
                </div>
                
                <Button
                  className="w-full mt-6 bg-blue-500 hover:bg-blue-600"
                  size="lg"
                  onClick={handleBooking}
                  disabled={isBooking || !customerName || !customerEmail || !customerPhone}
                >
                  {isBooking ? "Scheduling..." : "Confirm Test Drive"}
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}