import React from "react";
import { AccountOverview } from "@vayva/shared";
import { Icon, cn } from "@vayva/ui";

interface AccountHeaderProps {
  data: AccountOverview;
}

export const AccountHeader = ({ data }: AccountHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "restricted":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Fully active";
      case "restricted":
        return "Restricted";
      default:
        return "Action required";
    }
  };

  return (
    <div className="bg-background rounded-2xl border border-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 shadow-sm">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center text-2xl font-bold shadow-lg">
          {data.businessName.charAt(0)}
        </div>
        <div>
          <h1 className="text-2xl font-heading font-bold text-text-primary">
            {data.businessName}
          </h1>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-text-tertiary font-medium flex items-center gap-1">
              <Icon name="Store" size={14} /> {data.businessType}
            </span>
            <div className="h-4 w-px bg-border"></div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {data.plan} Plan
            </span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "px-4 py-2 rounded-xl flex items-center gap-3 self-start md:self-center",
          getStatusColor(data.overallStatus),
        )}
      >
        <div className="w-2 h-2 rounded-full bg-current animate-pulse"></div>
        <div className="text-left">
          <p className="text-[10px] uppercase font-bold tracking-wider opacity-70">
            Account Status
          </p>
          <p className="text-sm font-bold leading-none">
            {getStatusLabel(data.overallStatus)}
          </p>
        </div>
      </div>
    </div>
  );
};
