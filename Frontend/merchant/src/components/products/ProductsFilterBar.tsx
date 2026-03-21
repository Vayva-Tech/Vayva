"use client";

import React, { useState } from "react";
import {
  MagnifyingGlass as Search,
  Funnel as Filter,
  Tag,
  ArrowCounterClockwise as RefreshCw,
} from "@phosphor-icons/react/ssr";
import { Button, Input, Select } from "@vayva/ui";

interface ProductFilters {
  status?: string;
  category?: string;
}

interface ProductsFilterBarProps {
  search: string;
  onSearch: (value: string) => void;
  filters: ProductFilters;
  onFilterChange: (filters: ProductFilters) => void;
  onRefresh: () => void;
}

export function ProductsFilterBar({
  search,
  onSearch,
  filters,
  onFilterChange,
  onRefresh,
}: ProductsFilterBarProps) {
  const [status, setStatus] = useState(filters.status || "ALL");

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setStatus(val);
    onFilterChange({ ...filters, status: val });
  };

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8 p-1">
      <div className="flex-1 relative group">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors"
          size={18}
        />
        <Input type="text"
          placeholder="Search products by name, SKU or brand..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-100 rounded-xl focus:ring-4 focus:ring-vayva-green/10 focus:border-vayva-green transition-all font-medium text-sm placeholder:text-gray-400"
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            onSearch(e.target.value)
          }
        />
      </div>

      <div className="flex gap-2 text-sm">
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={14}
          />
          <Select
            aria-label="Filter by Status"
            className="pl-9 pr-8 py-2.5 border border-gray-100 rounded-xl bg-white focus:ring-4 focus:ring-vayva-green/10 focus:border-vayva-green appearance-none font-bold text-gray-500 cursor-pointer min-w-[120px]"
            value={status}
            onChange={handleStatusChange}
          >
            <option value="ALL">Status</option>
            <option value="ACTIVE">Active</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </Select>
        </div>

        <div className="relative">
          <Tag
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            size={14}
          />
          <Select
            aria-label="Filter by Category"
            className="pl-9 pr-8 py-2.5 border border-gray-100 rounded-xl bg-white focus:ring-4 focus:ring-vayva-green/10 focus:border-vayva-green appearance-none font-bold text-gray-500 cursor-pointer min-w-[140px]"
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              onFilterChange({ ...filters, category: e.target.value })
            }
          >
            <option value="ALL">Category</option>
            <option value="retail">Retail</option>
            <option value="food">Food</option>
            <option value="service">Service</option>
          </Select>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={onRefresh}
          className="border-gray-100 hover:bg-white/40 text-gray-400 w-11 h-11 rounded-xl shadow-sm transition-all active:scale-90"
        >
          <RefreshCw size={18} />
        </Button>
      </div>
    </div>
  );
}
