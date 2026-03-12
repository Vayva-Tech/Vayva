import React from "react";
import { Button } from "@vayva/ui";
import { CheckCircle, FileText, ArrowRight, X } from "lucide-react";

interface QuoteSuccessProps {
  onClose: () => void;
}

export const QuoteSuccess = ({ onClose }: QuoteSuccessProps): React.JSX.Element => {
  // eslint-disable-next-line react-hooks/purity
  const rfqNumber = React.useMemo(() => Math.floor(Math.random() * 10000), []);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-transparent rounded-2xl w-full max-w-md p-8 text-center animate-in zoom-in-95 duration-300 relative">
        <Button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-900"
        >
          <X size={24} />
        </Button>

        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} />
        </div>

        <h2 className="text-2xl font-black text-[#0F172A] mb-2">
          Quote Submitted!
        </h2>
        <p className="text-gray-500 mb-8 leading-relaxed">
          Your RFQ{" "}
          <span className="font-mono font-bold text-gray-900">
            #RFQ-{rfqNumber}
          </span>{" "}
          has been sent to our sales team. We typically respond with a formal
          invoice within 2 hours.
        </p>

        <div className="bg-background/40 backdrop-blur-sm rounded-xl p-4 mb-8 text-left border border-gray-100">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            What happens next?
          </h3>
          <ul className="space-y-3 text-sm text-gray-700">
            <li className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                1
              </div>
              Seller reviews your volume and requirements.
            </li>
            <li className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                2
              </div>
              You receive a formal Quote with shipping fees.
            </li>
            <li className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                3
              </div>
              Approve quote to generate Invoice for payment.
            </li>
          </ul>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onClose}
            className="flex-1 bg-background/50 backdrop-blur-sm hover:bg-gray-200 text-gray-900 font-bold py-3 rounded-lg transition-colors"
          >
            Close
          </Button>
          <Button className="flex-1 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold py-3 rounded-lg transition-colors">
            View RFQ Status
          </Button>
        </div>
      </div>
    </div>
  );
};
