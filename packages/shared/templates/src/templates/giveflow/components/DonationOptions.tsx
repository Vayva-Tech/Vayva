import React, { useState } from "react";
import { X, Heart, RefreshCw, CheckCircle } from "lucide-react";
import { Button } from "@vayva/ui";

interface DonationOptionsProps {
  isOpen: boolean;
  onClose: () => void;
  campaignTitle: string;
  onDonate: (amount: number, isRecurring: boolean) => void;
  isRecurringAvailable?: boolean;
}

export const DonationOptions = ({
  isOpen,
  onClose,
  campaignTitle,
  onDonate,
  isRecurringAvailable = true,
}: DonationOptionsProps) => {
  const [amount, setAmount] = useState<number>(5000);
  const [isRecurring, setIsRecurring] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const presetAmounts = [2000, 5000, 10000, 25000, 50000];

  const handleSubmit = () => {
    setIsSuccess(true);
    setTimeout(() => {
      onDonate(amount, isRecurring);
      setIsSuccess(false); // Reset for next time if re-opened
    }, 2000);
  };

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-transparent rounded-2xl p-8 max-w-sm w-full text-center animate-in zoom-in-95">
          <div className="w-20 h-20 bg-green-100 text-[#16A34A] rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank you!</h3>
          <p className="text-gray-500 mb-6">
            Your donation of{" "}
            <span className="font-bold text-gray-900">
              ₦{amount.toLocaleString()}
            </span>{" "}
            has been processed securely.
          </p>
          <p className="text-xs text-gray-400">
            A receipt has been sent to your email.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md bg-transparent h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg text-gray-900">Make a Donation</h2>
            <p className="text-xs text-gray-500 truncate max-w-[200px]">
              {campaignTitle}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="p-2 hover:bg-white/60 rounded-full transition-colors h-auto"
            aria-label="Close donation options"
          >
            <X size={20} />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {/* Frequency Toggle */}
          {isRecurringAvailable && (
            <div className="flex bg-background/50 backdrop-blur-sm p-1 rounded-xl mb-8">
              <Button
                variant="ghost"
                onClick={() => setIsRecurring(false)}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all h-auto ${!isRecurring ? "bg-transparent shadow text-[#16A34A]" : "text-gray-500 hover:text-gray-700"}`}
                aria-label="Make a one-time donation"
              >
                Give Once
              </Button>
              <Button
                variant="ghost"
                onClick={() => setIsRecurring(true)}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 h-auto ${isRecurring ? "bg-transparent shadow text-[#16A34A]" : "text-gray-500 hover:text-gray-700"}`}
                aria-label="Make a recurring monthly donation"
              >
                <RefreshCw size={14} /> Monthly
              </Button>
            </div>
          )}

          <label className="block text-sm font-bold text-gray-700 mb-4">
            Choose an amount
          </label>
          <div className="grid grid-cols-3 gap-3 mb-6">
            {presetAmounts.map((val: number) => (
              <Button
                key={val}
                variant="outline"
                onClick={() => setAmount(val)}
                className={`py-3 rounded-lg border font-bold text-sm transition-all h-auto ${amount === val ? "border-[#16A34A] bg-green-50 text-[#16A34A]" : "border-gray-200 hover:border-gray-300"}`}
                aria-label={`Donate ₦${val.toLocaleString()}`}
              >
                ₦{val.toLocaleString()}
              </Button>
            ))}
          </div>

          <div className="mb-8">
            <label
              htmlFor="custom-donation-amount"
              className="block text-xs font-bold text-gray-400 uppercase mb-2"
            >
              Custom Amount
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
                ₦
              </span>
              <input
                id="custom-donation-amount"
                type="number"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setAmount(parseInt(e.target.value) || 0)
                }
                className="w-full border border-gray-300 rounded-xl py-4 pl-10 pr-4 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
              />
            </div>
          </div>

          <div className="bg-background/40 backdrop-blur-sm p-4 rounded-xl mb-6">
            <div className="flex items-start gap-3">
              <div className="mt-1 text-[#16A34A]">
                <Heart size={18} fill="currentColor" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-gray-900">Your Impact</h4>
                <p className="text-xs text-gray-500 mt-1">
                  ₦{amount.toLocaleString()} could help provide{" "}
                  {Math.floor(amount / 2500)} meals for families in need.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100">
          <Button
            onClick={handleSubmit}
            className="w-full bg-[#16A34A] hover:bg-[#15803D] text-white font-bold py-4 rounded-xl text-lg shadow-lg flex items-center justify-center gap-2 transition-all h-auto"
            aria-label={
              isRecurring
                ? `Donate ₦${amount.toLocaleString()} monthly`
                : `Donate ₦${amount.toLocaleString()}`
            }
          >
            {isRecurring
              ? `Donate ₦${amount.toLocaleString()} Monthly`
              : `Donate ₦${amount.toLocaleString()}`}
          </Button>
          <p className="text-center text-[10px] text-gray-400 mt-4">
            By donating, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};
