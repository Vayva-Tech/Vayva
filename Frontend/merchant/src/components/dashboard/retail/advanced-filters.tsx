'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { CalendarIcon, Search, X, Filter, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface DateRange {
  from: Date | undefined;
  to?: Date | undefined;
}

interface FilterOption {
  value: string;
  label: string;
  count?: number;
}

interface AdvancedFiltersProps {
  categories?: FilterOption[];
  statuses?: FilterOption[];
  channels?: FilterOption[];
  onFilterChange?: (filters: AdvancedFiltersState) => void;
  className?: string;
}

export interface AdvancedFiltersState {
  search: string;
  dateRange: DateRange;
  categories: string[];
  statuses: string[];
  channels: string[];
}

export function AdvancedFilters({
  categories = [],
  statuses = [],
  channels = [],
  onFilterChange,
  className,
}: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<AdvancedFiltersState>({
    search: '',
    dateRange: {
      from: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      to: new Date(),
    },
    categories: [],
    statuses: [],
    channels: [],
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const updateFilters = (updates: Partial<AdvancedFiltersState>) => {
    const newFilters = { ...filters, ...updates };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const toggleFilter = (type: 'categories' | 'statuses' | 'channels', value: string) => {
    const current = filters[type];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    
    updateFilters({ [type]: updated });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      dateRange: { from: undefined, to: undefined },
      categories: [],
      statuses: [],
      channels: [],
    });
    onFilterChange?.({
      search: '',
      dateRange: { from: undefined, to: undefined },
      categories: [],
      statuses: [],
      channels: [],
    });
  };

  const activeFiltersCount = [
    filters.categories.length,
    filters.statuses.length,
    filters.channels.length,
    filters.dateRange.from && filters.dateRange.to ? 1 : 0,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Search orders, products, customers..."
          value={filters.search}
          onChange={(e) => updateFilters({ search: e.target.value })}
          className="pl-10"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={() => updateFilters({ search: '' })}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Date Range Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal',
                !filters.dateRange.from && 'text-gray-500'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {filters.dateRange.from ? (
                filters.dateRange.to ? (
                  <>
                    {format(filters.dateRange.from, 'LLL dd, y')} -{' '}
                    {format(filters.dateRange.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(filters.dateRange.from, 'LLL dd, y')
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={filters.dateRange.from}
              selected={filters.dateRange}
              onSelect={(dateRange) => updateFilters({ dateRange: dateRange || { from: undefined, to: undefined } })}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>

        {/* Category Filter */}
        {categories.length > 0 && (
          <Select
            value={filters.categories[0] || ''}
            onValueChange={(value) => toggleFilter('categories', value)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                  {category.count !== undefined && (
                    <Badge variant="secondary" className="ml-2">
                      {category.count}
                    </Badge>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Status Filter */}
        {statuses.length > 0 && (
          <Select
            value={filters.statuses[0] || ''}
            onValueChange={(value) => toggleFilter('statuses', value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* More Filters Popover */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              More Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs justify-center">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="end">
            <div className="p-4 space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Channels</Label>
                <Command>
                  <CommandInput placeholder="Search channels..." />
                  <CommandEmpty>No channels found.</CommandEmpty>
                  <CommandGroup>
                    {channels.map((channel) => (
                      <CommandItem
                        key={channel.value}
                        onClick={() => toggleFilter('channels', channel.value)}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-green-500',
                            filters.channels.includes(channel.value)
                              ? 'bg-green-500 text-white'
                              : 'opacity-50 [&_svg]:invisible'
                          )}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-3 w-3"
                          >
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </div>
                        <span>{channel.label}</span>
                        {channel.count !== undefined && (
                          <Badge variant="outline" className="ml-auto">
                            {channel.count}
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </div>

              <div className="flex justify-between pt-2 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  disabled={activeFiltersCount === 0}
                >
                  Clear all
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsPopoverOpen(false)}
                >
                  Apply Filters
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-1 ml-auto">
            {filters.categories.map((cat) => (
              <Button
                type="button"
                key={cat}
                variant="secondary"
                size="sm"
                className="h-7 gap-1"
                onClick={() => toggleFilter('categories', cat)}
              >
                {categories.find(c => c.value === cat)?.label}
                <X className="h-3 w-3" />
              </Button>
            ))}
            {filters.statuses.map((status) => (
              <Button
                type="button"
                key={status}
                variant="secondary"
                size="sm"
                className="h-7 gap-1"
                onClick={() => toggleFilter('statuses', status)}
              >
                {statuses.find(s => s.value === status)?.label}
                <X className="h-3 w-3" />
              </Button>
            ))}
            {filters.channels.map((channel) => (
              <Button
                type="button"
                key={channel}
                variant="secondary"
                size="sm"
                className="h-7 gap-1"
                onClick={() => toggleFilter('channels', channel)}
              >
                {channels.find(c => c.value === channel)?.label}
                <X className="h-3 w-3" />
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
