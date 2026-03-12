import React from "react";
import { Customer, CustomerStatus, formatCurrency } from "@vayva/shared";
import { Icon, cn, Button } from "@vayva/ui";

interface CustomerCardProps {
  customer: Customer;
  onSelect: (customer: Customer) => void;
}

export const CustomerCard = ({ customer, onSelect }: CustomerCardProps) => {
  const getStatusBadge = (status: CustomerStatus) => {
    switch (status) {
      case CustomerStatus.VIP:
        return (
          <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Icon name="Crown" size={10} /> VIP
          </span>
        );
      case CustomerStatus.NEW:
        return (
          <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            New
          </span>
        );
      case CustomerStatus.RETURNING:
        return (
          <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
            Returning
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div
      onClick={() => onSelect(customer)}
      className="bg-background border border-border rounded-xl p-5 hover:border-border hover:shadow-md transition-all cursor-pointer group relative"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-white/40 flex items-center justify-center text-text-tertiary font-bold text-lg">
            {customer.name.charAt(0)}
          </div>
          <div>
            <h3 className="font-bold text-text-primary group-hover:text-blue-600 transition-colors">
              {customer.name}
            </h3>
            <p className="text-xs text-text-tertiary font-mono">
              {customer.phone}
            </p>
          </div>
        </div>
        {getStatusBadge(customer.status)}
      </div>

      <div className="grid grid-cols-2 gap-4 py-3 border-t border-border/20">
        <div>
          <p className="text-[10px] uppercase text-text-tertiary font-bold tracking-wider">
            Spent
          </p>
          <p className="font-mono font-medium text-sm">
            {formatCurrency(customer.totalSpend)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase text-text-tertiary font-bold tracking-wider">
            Orders
          </p>
          <p className="font-mono font-medium text-sm">
            {customer.totalOrders}
          </p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-text-tertiary">
          Last active {new Date(customer.lastSeenAt).toLocaleDateString()}
        </p>

        {/* Secondary Action - Message WhatsApp directly */}
        <Button
          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();
            // Link logic would go here
          }}
          className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
          title="Message on WhatsApp"
        >
          <Icon name="MessageCircle" size={16} />
        </Button>
      </div>
    </div>
  );
};
