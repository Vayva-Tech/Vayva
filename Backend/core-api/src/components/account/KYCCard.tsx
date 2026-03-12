import React from "react";
import { KYCDetails, KYCStatus, formatDate } from "@vayva/shared";
import { Button, Icon, cn } from "@vayva/ui";

interface KYCCardProps {
  kyc: KYCDetails;
}

export const KYCCard = ({ kyc }: KYCCardProps) => {
  const isComplete = kyc.status === KYCStatus.VERIFIED;
  const isReview = kyc.status === KYCStatus.PENDING;
  const _isAction = kyc.status === KYCStatus.REJECTED;

  return (
    <div className="bg-background rounded-2xl border border-border p-6 flex flex-col h-full relative overflow-hidden group hover:border-border transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center",
              isComplete
                ? "bg-green-50 text-green-600"
                : isReview
                  ? "bg-blue-50 text-blue-600"
                  : "bg-amber-50 text-amber-600",
            )}
          >
            <Icon name="ShieldCheck" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-text-primary">
              Identity & Compliance
            </h3>
            <p className="text-xs text-text-tertiary">
              Required for withdrawals
            </p>
          </div>
        </div>
        {isComplete && (
          <div className="p-1 bg-green-100 rounded-full">
            <Icon name="Check" size={14} className="text-green-700" />
          </div>
        )}
      </div>

      <div className="flex-1">
        {isComplete ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm py-2 border-b border-border/20">
              <span className="text-text-tertiary">Status</span>
              <span className="font-bold text-green-700 flex items-center gap-1">
                Verified <Icon name="Check" size={14} />
              </span>
            </div>
            <div className="flex items-center justify-between text-sm py-2 border-b border-border/20">
              <span className="text-text-tertiary">Verified On</span>
              <span className="font-mono text-text-primary">
                {kyc.verifiedAt ? formatDate(kyc.verifiedAt) : "N/A"}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-white/40 rounded-xl p-4 text-sm mb-4">
            <p className="font-bold text-text-primary mb-1">
              {isReview ? "Verification in Progress" : "Verification Required"}
            </p>
            <p className="text-text-secondary leading-relaxed">
              {isReview
                ? "We are reviewing your documents. This usually takes 24 hours."
                : "Submit your BVN or NIN to unlock withdrawals and higher limits."}
            </p>
          </div>
        )}
      </div>

      <div className="mt-6">
        {isComplete ? (
          <Button
            variant="outline"
            className="w-full text-text-tertiary"
            disabled
          >
            Verification Complete
          </Button>
        ) : isReview ? (
          <Button variant="outline" className="w-full" disabled>
            In Review...
          </Button>
        ) : (
          <Button className="w-full gap-2">
            Start Verification <Icon name="ArrowRight" size={16} />
          </Button>
        )}
      </div>
    </div>
  );
};
