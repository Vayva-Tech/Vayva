import React, { useState } from "react";
import { Button } from "@vayva/ui";
import {
  X,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
} from "lucide-react";
import { PublicProduct } from "@vayva/templates/types/storefront";

import { BookingConfirmation, BookingDetails } from "./BookingConfirmation";

interface BookingWizardProps {
  service: PublicProduct;
  onClose: () => void;
  onComplete: (bookingDetails: BookingDetails) => void;
}

const DEMO_SLOTS = ["09:00", "10:00", "11:30", "14:00", "16:30"];
const DEMO_DATES = [
  { day: "Mon", date: "27" },
  { day: "Tue", date: "28" },
  { day: "Wed", date: "29" },
  { day: "Thu", date: "30" },
  { day: "Fri", date: "01" },
];

export const BookingWizard = ({
  service,
  onClose,
  onComplete,
}: BookingWizardProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const handleConfirm = () => {
    onComplete({
      serviceId: service.id,
      date: selectedDate!,
      time: selectedTime!,
      price: service.price,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-transparent rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-background/40 backdrop-blur-sm p-4 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900">Book Appointment</h3>
            <p className="text-xs text-gray-500">
              {service.name} • ₦{service.price.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full text-gray-500"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Progress Bar */}
          <div className="flex gap-2 mb-8">
            <div
              className={`h-1 flex-1 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-gray-200"}`}
            />
            <div
              className={`h-1 flex-1 rounded-full ${step >= 2 ? "bg-blue-600" : "bg-gray-200"}`}
            />
            <div
              className={`h-1 flex-1 rounded-full ${step >= 3 ? "bg-blue-600" : "bg-gray-200"}`}
            />
          </div>

          {step === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <CalendarIcon size={20} className="text-blue-600" /> Select Date
              </h4>
              <div className="grid grid-cols-5 gap-3">
                {DEMO_DATES.map((d, i) => (
                  <Button
                    key={i}
                    onClick={() => setSelectedDate(d.date)}
                    className={`flex flex-col items-center justify-center p-3 rounded-lg border ${selectedDate === d.date ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-blue-300"}`}
                  >
                    <span className="text-xs text-gray-500 uppercase">
                      {d.day}
                    </span>
                    <span className="text-xl font-bold">{d.date}</span>
                  </Button>
                ))}
              </div>
              <Button
                disabled={!selectedDate}
                onClick={() => setStep(2)}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <Clock size={20} className="text-blue-600" /> Select Time
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {DEMO_SLOTS.map((t, i) => (
                  <Button
                    key={i}
                    onClick={() => setSelectedTime(t)}
                    className={`py-3 px-4 rounded-lg border font-medium ${selectedTime === t ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-200 hover:border-blue-300 text-gray-700"}`}
                  >
                    {t}
                  </Button>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <Button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 text-gray-600 font-medium hover:bg-white/60 rounded-lg"
                >
                  Back
                </Button>
                <Button
                  disabled={!selectedTime}
                  onClick={() => setStep(3)}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-lg disabled:opacity-50"
                >
                  Continue
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center animate-in slide-in-from-right duration-300">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle size={32} />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-900">
                  Confirm Booking
                </h4>
                <p className="text-gray-500 mt-2">
                  Please review your appointment details.
                </p>
              </div>

              <div className="bg-background/40 backdrop-blur-sm rounded-xl p-4 text-left space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Service</span>
                  <span className="font-medium text-gray-900">
                    {service.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-900">
                    {selectedDate}th Dec
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time</span>
                  <span className="font-medium text-gray-900">
                    {selectedTime}
                  </span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-bold text-gray-900">Total</span>
                  <span className="font-bold text-blue-600">
                    ₦{service.price.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <Button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 text-gray-600 font-medium hover:bg-white/60 rounded-lg"
                >
                  Back
                </Button>
                <Button
                  onClick={handleConfirm}
                  className="flex-[2] bg-gray-900 text-white font-bold py-3 rounded-lg hover:bg-black transition-colors"
                >
                  Confirm & Pay
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
