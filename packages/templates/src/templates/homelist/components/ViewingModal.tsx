import React, { useState } from "react";
import { Button } from "@vayva/ui";
import { Calendar, Clock, CheckCircle, X } from "lucide-react";

interface ViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingTitle: string;
}

export const ViewingModal = ({
  isOpen,
  onClose,
  listingTitle,
}: ViewingModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  if (!isOpen) return null;

  const dates = ["Mon, 12 Oct", "Tue, 13 Oct", "Wed, 14 Oct"];
  const times = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM"];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    setTimeout(() => {
      onClose();
      setStep(1); // reset
    }, 3000);
  };

  if (step === 2) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <div className="bg-transparent rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl">
          <div className="w-20 h-20 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Request Sent!
          </h3>
          <p className="text-gray-500 mb-6">
            The agent will contact you shortly to confirm your viewing for{" "}
            <span className="font-bold text-gray-900">{selectedDate}</span> at{" "}
            <span className="font-bold text-gray-900">{selectedTime}</span>.
          </p>
          <Button
            onClick={onClose}
            className="text-sm font-bold text-gray-400 hover:text-gray-600"
          >
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-transparent rounded-xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-background/40 backdrop-blur-sm">
          <div>
            <h2 className="font-bold text-lg text-gray-900">
              Schedule Viewing
            </h2>
            <p className="text-xs text-gray-500 truncate max-w-[250px]">
              {listingTitle}
            </p>
          </div>
          <Button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
          >
            <X size={20} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
              <Calendar size={14} /> Select Date
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {dates.map((date: any) => (
                <Button
                  key={date}
                  type="button"
                  onClick={() => setSelectedDate(date)}
                  className={`px-4 py-2 rounded-lg border text-sm font-bold whitespace-nowrap transition-all ${selectedDate === date ? "border-[#2563EB] bg-blue-50 text-[#2563EB]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  {date}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
              <Clock size={14} /> Select Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {times.map((time: any) => (
                <Button
                  key={time}
                  type="button"
                  onClick={() => setSelectedTime(time)}
                  className={`px-4 py-3 rounded-lg border text-sm font-bold transition-all ${selectedTime === time ? "border-[#2563EB] bg-blue-50 text-[#2563EB]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <input
              type="text"
              placeholder="Your Name"
              required
              className="w-full bg-background/40 backdrop-blur-sm border-transparent focus:bg-transparent border focus:border-[#2563EB] rounded-lg px-4 py-3 text-sm focus:outline-none transition-all"
            />
            <input
              type="tel"
              placeholder="Phone Number"
              required
              className="w-full bg-background/40 backdrop-blur-sm border-transparent focus:bg-transparent border focus:border-[#2563EB] rounded-lg px-4 py-3 text-sm focus:outline-none transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={!selectedDate || !selectedTime}
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
          >
            Request Appointment
          </Button>
        </form>
      </div>
    </div>
  );
};
