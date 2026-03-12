import React, { useState, useMemo } from "react";
import { Button } from "@vayva/ui";
import { Calendar, Clock, CheckCircle, X } from "@phosphor-icons/react/ssr";
import { format, addDays } from "date-fns";

interface ViewingModalProps {
  isOpen: boolean;
  onClose: () => void;
  listingTitle: string;
  listingId?: string;
  agentId?: string;
}

export const ViewingModal = ({
  isOpen,
  onClose,
  listingTitle,
  listingId,
  agentId,
}: ViewingModalProps) => {
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Generate next 7 days dynamically
  const dates = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(new Date(), i + 1);
      return {
        value: format(date, "yyyy-MM-dd"),
        label: format(date, "EEE, dd MMM"),
      };
    });
  }, []);

  const times = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch("/api/bookings/viewing-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listingId,
          agentId,
          date: selectedDate,
          time: selectedTime,
        }),
      });
      
      if (response.ok) {
        setStep(2);
        setTimeout(() => {
          onClose();
          setStep(1);
          setSelectedDate("");
          setSelectedTime("");
        }, 3000);
      } else {
        // TODO: Show error toast
        console.error("Failed to submit viewing request");
      }
    } catch (error) {
      console.error("Error submitting viewing request:", error);
    } finally {
      setIsSubmitting(false);
    }
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
              {dates.map((date) => (
                <Button
                  key={date.value}
                  type="button"
                  onClick={() => setSelectedDate(date.value)}
                  className={`px-4 py-2 rounded-lg border text-sm font-bold whitespace-nowrap transition-all ${selectedDate === date.value ? "border-[#2563EB] bg-blue-50 text-[#2563EB]" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}
                >
                  {date.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
              <Clock size={14} /> Select Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              {times.map((time) => (
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
            disabled={!selectedDate || !selectedTime || isSubmitting}
            className="w-full bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-lg"
          >
            {isSubmitting ? "Submitting..." : "Request Appointment"}
          </Button>
        </form>
      </div>
    </div>
  );
};
