import React from "react";
import { X, CheckCircle, Download, Calendar } from "lucide-react";
import { Button } from "@vayva/ui";
import { PublicProduct } from "@vayva/templates/types/storefront";

interface BankDetails {
  bankName: string;
  accountNumber: string;
  accountName: string;
}

interface TicketSuccessProps {
  event: PublicProduct;
  attendee: { name: string; email: string };
  bankDetails?: BankDetails;
  storeName?: string;
  orderNumber?: string;
  onClose: () => void;
}

export const TicketSuccess = ({
  event,
  attendee,
  bankDetails,
  storeName,
  orderNumber,
  onClose,
}: TicketSuccessProps) => {
  const [ticketId] = React.useState(() =>
    Math.random().toString(36).substr(2, 9).toUpperCase(),
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-purple-900/90 backdrop-blur-sm p-4">
      <div className="bg-transparent rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500 relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-black/10 p-2 rounded-full hover:bg-black/20 text-white h-auto"
          aria-label="Close success modal"
        >
          <X size={20} />
        </Button>

        {/* Header Pattern */}
        <div className="h-32 bg-purple-600 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="w-16 h-16 bg-transparent rounded-full flex items-center justify-center text-purple-600 shadow-lg">
            <CheckCircle size={32} strokeWidth={3} />
          </div>
        </div>

        <div className="px-8 pt-12 pb-8 text-center -mt-6">
          <h2 className="text-2xl font-black text-gray-900 mb-1">
            You're going!
          </h2>
          {orderNumber && (
            <p className="text-xs text-gray-400 mb-1">Ref: {orderNumber}</p>
          )}
          <p className="text-gray-500 text-sm mb-6">
            Order sent to {attendee.email}
          </p>

          {bankDetails && (
            <div className="bg-purple-50 p-4 rounded-xl text-left border border-purple-100 mb-6">
              <p className="text-xs font-bold uppercase text-purple-600 mb-2">
                Payment Required
              </p>
              <div className="text-sm space-y-1 text-gray-800">
                <div className="flex justify-between">
                  <span>Bank:</span>{" "}
                  <span className="font-semibold">{bankDetails.bankName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Account:</span>{" "}
                  <span className="font-semibold text-lg">
                    {bankDetails.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Name:</span>{" "}
                  <span className="font-semibold">
                    {bankDetails.accountName}
                  </span>
                </div>
              </div>
              <div className="mt-3 text-xs text-center text-purple-400">
                Paying to <b>{storeName}</b>
              </div>
            </div>
          )}

          {/* Ticket Pending Test */}
          <div className="bg-background/40 backdrop-blur-sm border-2 border-dashed border-gray-200 rounded-xl p-4 relative mb-6">
            {/* Cutout Circles */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-transparent rounded-full border-r-2 border-dashed border-gray-200 text-white">
              .
            </div>
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-transparent rounded-full border-l-2 border-dashed border-gray-200 text-white">
              .
            </div>

            <h3 className="font-bold text-gray-900 text-lg leading-tight mb-2">
              {event.name}
            </h3>
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 font-bold uppercase tracking-wide mb-4">
              <Calendar size={12} /> {event.eventDetails?.venue || "Venue TBA"}
            </div>

            {/* QR Code */}
            <div className="bg-transparent p-2 rounded-lg inline-block shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${event.id}-${attendee.email}`}
                alt="Ticket QR"
                className="w-32 h-32"
              />
            </div>
            <p className="text-[10px] font-mono text-gray-400 mt-2">
              ID: {ticketId}
            </p>
          </div>

          <Button
            className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors h-auto"
            aria-label="Save ticket"
          >
            <Download size={18} /> Save Ticket
          </Button>
        </div>
      </div>
    </div>
  );
};
