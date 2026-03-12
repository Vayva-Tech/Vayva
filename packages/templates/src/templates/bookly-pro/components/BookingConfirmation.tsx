import React, { useEffect } from "react";
import { Button } from "@vayva/ui";
import { Check, Calendar, ArrowRight } from "lucide-react";

export interface BookingDetails {
  date: string | number;
  time: string;
}

interface BookingConfirmationProps {
  bookingDetails: BookingDetails;
  onClose: () => void;
}

export const BookingConfirmation = ({
  bookingDetails,
  onClose,
}: BookingConfirmationProps) => {
  // Auto-close test
  useEffect(() => {
    // const timer = setTimeout(onClose, 5000);
    // return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-6">
      <div className="bg-transparent rounded-2xl max-w-md w-full p-8 text-center shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check size={40} strokeWidth={3} />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Booking Confirmed!
        </h2>
        <p className="text-gray-500 mb-8">
          We've sent a confirmation email to you.
        </p>

        <div className="bg-background/40 backdrop-blur-sm rounded-xl p-5 mb-8">
          <div className="flex items-center gap-3 mb-2 text-gray-900 font-medium">
            <Calendar size={18} className="text-blue-600" />
            <span>
              {bookingDetails.date}th at {bookingDetails.time}
            </span>
          </div>
          <div className="text-left pl-8 text-sm text-gray-500">
            Please arrive 5 minutes early.
          </div>
        </div>

        <Button
          onClick={onClose}
          className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          Done <ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
};
