import React from "react";
import { AccountOverview } from "@vayva/shared";
import { Button, Icon } from "@vayva/ui";

interface PlanCardProps {
  plan: AccountOverview["plan"];
}

export const PlanCard = ({ plan }: PlanCardProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col h-full relative overflow-hidden hover:border-gray-100 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
            <Icon name="CreditCard" size={20} />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Subscription</h3>
            <p className="text-xs text-gray-400">Plan & limits</p>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <div className="flex items-baseline gap-1 mb-2">
          <h2 className="text-3xl font-heading font-bold text-gray-900 uppercase">
            {plan}
          </h2>
          <span className="text-sm text-gray-400 font-medium">
            / month
          </span>
        </div>

        <div className="space-y-3 mt-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon name="Check" size={14} className="text-green-600" />
            <span>5.0% Transaction Fee</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon name="Check" size={14} className="text-green-600" />
            <span>Untitled Templates</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Icon name="Check" size={14} className="text-green-600" />
            <span>Basic Analytics</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Button className="w-full bg-black text-white hover:bg-text-green-500">
          Upgrade Plan
        </Button>
      </div>
    </div>
  );
};
