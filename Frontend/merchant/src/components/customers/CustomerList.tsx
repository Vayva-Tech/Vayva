import React from "react";
import {
  Customer,
  CustomerStatus,
  formatDate,
  formatCurrency,
} from "@vayva/shared";
import { Button, Icon, cn } from "@vayva/ui";
import { WhatsAppAction } from "./WhatsAppAction";
import { ResponsiveTable, Column } from "@/components/ui/ResponsiveTable";

type CustomerWithDetails = Customer & {
  status?: CustomerStatus;
  name?: string;
  phone?: string;
  totalOrders?: number;
  totalSpend?: number;
  lastSeenAt?: string;
  id: string;
};

interface CustomerListProps {
  customers: CustomerWithDetails[];
  isLoading: boolean;
  onSelectCustomer: (customer: CustomerWithDetails) => void;
}

export const CustomerList = ({
  customers,
  isLoading,
  onSelectCustomer,
}: CustomerListProps) => {
  const columns: Column<CustomerWithDetails>[] = [
    {
      key: "name",
      label: "Customer",
      mobileLabel: "Name",
      priority: "high",
      render: (customer: CustomerWithDetails) => (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              (customer as any).status === "vip"
                ? "bg-orange-100 text-orange-700"
                : "bg-white/40 text-gray-500",
            )}
          >
            {customer.name?.charAt(0) || "?"}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm md:text-base">
              {customer.name}
            </div>
            <div className="text-xs text-gray-400 font-mono">
              {customer.phone}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      priority: "high",
      render: (customer: CustomerWithDetails) => (
        <span
          className={cn(
            "px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1",
            (customer as any).status === CustomerStatus.VIP
              ? "bg-orange-100 text-orange-700"
              : (customer as any).status === CustomerStatus.NEW
                ? "bg-blue-100 text-blue-700"
                : "bg-white/40 text-gray-500",
          )}
        >
          {customer.status === CustomerStatus.VIP && (
            <Icon name="Crown" size={10} />
          )}
          {customer.status}
        </span>
      ),
    },
    {
      key: "totalOrders",
      label: "Orders",
      priority: "medium",
      render: (customer: CustomerWithDetails) => (
        <span className="text-sm text-gray-500">
          {customer.totalOrders} orders
        </span>
      ),
    },
    {
      key: "totalSpend",
      label: "Total Spent",
      mobileLabel: "Spent",
      priority: "high",
      render: (customer: CustomerWithDetails) => (
        <span className="font-mono font-bold text-gray-900">
          {formatCurrency(customer.totalSpend)}
        </span>
      ),
    },
    {
      key: "lastSeenAt",
      label: "Last Active",
      priority: "low",
      render: (customer: CustomerWithDetails) => (
        <span className="text-xs text-gray-400">
          {formatDate(customer.lastSeenAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      priority: "high",
      render: (customer: CustomerWithDetails) => (
        <div
          className="flex items-center justify-end gap-2"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <WhatsAppAction
            phone={customer.phone}
            name={customer.name}
            variant="icon"
          />
          <Button
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-gray-900 touch-target-sm"
            onClick={() => onSelectCustomer(customer)}
            aria-label={`View details for ${customer.name}`}
          >
            <Icon name="ChevronRight" size={16} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
      <ResponsiveTable
        data={customers}
        columns={columns}
        keyExtractor={(customer: CustomerWithDetails) => customer.id}
        onRowClick={onSelectCustomer}
        loading={isLoading}
        emptyMessage="No customers found. Try adjusting your filters or search."
      />
    </div>
  );
};
