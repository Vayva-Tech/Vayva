import React, { useState } from "react";
import {
  MagnifyingGlass as Search,
  Funnel as Filter,
  CreditCard,
  ArrowCounterClockwise as RefreshCw,
  Calendar,
} from "@phosphor-icons/react/ssr";
import { Button } from "@vayva/ui";

interface FilterBarProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onFilterChange: (filters: any) => void;
  onSearch: (query: string) => void;
  onRefresh: () => void;
}

export const FilterBar = ({
  onFilterChange,
  onSearch,
  onRefresh,
}: FilterBarProps) => {
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 p-1">
      <div className="flex-1 relative group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-focus-within:text-primary transition-colors"
          size={18}
        />
        <input
          type="text"
          placeholder="Search by order ID, customer or ref..."
          aria-label="Search orders"
          className="w-full pl-10 pr-4 py-2.5 border border-border/60 rounded-2xl bg-background/70 backdrop-blur-xl shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all font-medium text-sm placeholder:text-text-tertiary"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearch(e.target.value);
            onSearch(e.target.value);
          }}
        />
      </div>

      <div className="flex gap-2 text-sm">
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            size={14}
          />
          <select
            aria-label="Filter by Status"
            className="pl-9 pr-8 py-2.5 border border-border/60 rounded-2xl bg-background/70 backdrop-blur-xl shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 appearance-none font-bold text-text-secondary cursor-pointer min-w-[120px]"
            value={status}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              setStatus(e.target.value);
              onFilterChange({ status: e.target.value });
            }}
          >
            <option value="ALL">Status</option>
            <option value="NEW">New</option>
            <option value="PROCESSING">Processing</option>
            <option value="READY">Ready</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <div className="relative">
          <Calendar
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            size={14}
          />
          <select
            aria-label="Filter by Time"
            className="pl-9 pr-8 py-2.5 border border-border/60 rounded-2xl bg-background/70 backdrop-blur-xl shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 appearance-none font-bold text-text-secondary cursor-pointer min-w-[120px]"
          >
            <option value="ALL">Any Time</option>
            <option value="today">Today</option>
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
          </select>
        </div>

        <div className="relative">
          <CreditCard
            className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none"
            size={14}
          />
          <select
            aria-label="Filter by Payment"
            className="pl-9 pr-8 py-2.5 border border-border/60 rounded-2xl bg-background/70 backdrop-blur-xl shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 appearance-none font-bold text-text-secondary cursor-pointer min-w-[120px]"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onFilterChange({ paymentStatus: e.target.value })
            }
          >
            <option value="ALL">Payment</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          className="border-border/60 bg-background/70 backdrop-blur-xl hover:bg-white/40 text-text-secondary w-11 h-11 rounded-2xl shadow-card transition-all active:scale-90"
          aria-label="Refresh orders"
          title="Refresh orders"
        >
          <RefreshCw size={18} />
        </Button>
      </div>
    </div>
  );
};
