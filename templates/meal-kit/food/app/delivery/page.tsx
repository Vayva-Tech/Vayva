"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button, Input, Label } from "@vayva/ui";
import { Calendar, MapPin, Clock, CreditCard } from "lucide-react";

interface DeliverySlot {
  date: string;
  timeWindow: string;
  available: boolean;
}

const UPCOMING_SLOTS: DeliverySlot[] = [
  { date: "2026-03-20", timeWindow: "8AM - 12PM", available: true },
  { date: "2026-03-20", timeWindow: "12PM - 4PM", available: true },
  { date: "2026-03-21", timeWindow: "8AM - 12PM", available: true },
  { date: "2026-03-21", timeWindow: "12PM - 4PM", available: false },
  { date: "2026-03-22", timeWindow: "8AM - 12PM", available: true },
  { date: "2026-03-22", timeWindow: "12PM - 4PM", available: true },
];

export default function DeliveryPage() {
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState("");

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-black text-gray-900 mb-2">Delivery Schedule</h1>
          <p className="text-lg text-gray-600">Choose when you want your fresh ingredients delivered</p>
        </motion.div>

        {/* Current Delivery Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border-2 border-emerald-200 p-8 mb-8"
        >
          <div className="flex items-start gap-4 mb-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Next Delivery: March 20, 2026</h2>
              <p className="text-gray-600">Your weekly box with 3 meals for 2 servings</p>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700">Scheduled</Badge>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600">Delivering to</p>
                <p className="font-bold text-gray-900">123 Main St, Lagos</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600">Time window</p>
                <p className="font-bold text-gray-900">8AM - 12PM</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CreditCard className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-600">Payment</p>
                <p className="font-bold text-gray-900">**** 4242</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Select New Slot */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Delivery Slots</h2>
          
          <div className="space-y-4 mb-8">
            {UPCOMING_SLOTS.map((slot, i) => {
              const isSelected = selectedSlot === `${slot.date}-${slot.timeWindow}`;
              
              return (
                <div
                  key={i}
                  onClick={() => slot.available && setSelectedSlot(`${slot.date}-${slot.timeWindow}`)}
                  className={`flex items-center justify-between p-6 rounded-2xl border-2 cursor-pointer transition-all ${
                    !slot.available
                      ? "opacity-50 cursor-not-allowed border-gray-200 bg-gray-50"
                      : isSelected
                      ? "border-emerald-600 bg-emerald-50"
                      : "border-gray-200 hover:border-emerald-300"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected ? "border-emerald-600 bg-emerald-600" : "border-gray-300"
                    }`}>
                      {isSelected && <span className="text-white text-xs font-bold">✓</span>}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">
                        {new Date(slot.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                      <p className="text-gray-600">{slot.timeWindow}</p>
                    </div>
                  </div>
                  
                  {!slot.available && (
                    <Badge variant="secondary" className="bg-gray-200 text-gray-700">
                      Unavailable
                    </Badge>
                  )}
                  {slot.available && isSelected && (
                    <Badge className="bg-emerald-100 text-emerald-700">Selected</Badge>
                  )}
                </div>
              );
            })}
          </div>

          {/* Delivery Notes */}
          <div className="mb-8">
            <Label className="text-base font-bold mb-2 block">Delivery Instructions (Optional)</Label>
            <Input
              value={deliveryNotes}
              onChange={(e) => setDeliveryNotes(e.target.value)}
              placeholder="Gate code, leave at door, etc."
              className="h-12 rounded-xl"
            />
          </div>

          <Button className="w-full h-14 text-lg font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700">
            Update Delivery Schedule
          </Button>
        </motion.div>

        {/* Delivery Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-blue-50 rounded-3xl p-8"
        >
          <h3 className="text-xl font-bold text-blue-900 mb-4">Delivery Information</h3>
          <ul className="space-y-3 text-blue-800">
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>Free delivery on all orders over $50</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>Change delivery time up to 24 hours before your scheduled slot</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>We deliver Monday-Saturday, 8AM-4PM</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-blue-600 font-bold">•</span>
              <span>Ingredients kept cold in insulated packaging</span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}

function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${className}`}>
      {children}
    </span>
  );
}
