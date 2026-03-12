"use client";

import React from "react";
import { Icon, Input, cn } from "@vayva/ui";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterBarProps {
  onSearch: (query: string) => void;
  categories: string[];
  onCategoryChange: (category: string) => void;
  onSortChange: (sort: string) => void;
  counts?: { label: string; count: number }[];
}

export function FilterBar({
  onSearch,
  categories,
  onCategoryChange,
  onSortChange,
  counts,
}: FilterBarProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-background/50 backdrop-blur-md p-4 rounded-[24px] border border-border/40 shadow-sm">
      <div className="flex flex-1 items-center gap-4 w-full">
        <div className="relative w-full max-w-sm">
          <Icon
            name="Search"
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <Input
            placeholder="Search templates..."
            className="pl-11 h-11 rounded-2xl border-border/60 bg-white/30 focus:bg-background transition-all"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearch(e.target.value)}
          />
        </div>

        <Select onValueChange={onCategoryChange} defaultValue="All">
          <SelectTrigger className="w-[180px] h-11 rounded-2xl border-border/60 bg-white/30">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border/60 shadow-elevated">
            <SelectItem value="All">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <div className="hidden lg:flex items-center gap-2">
          {counts?.map((c, i) => (
            <div
              key={i}
              className="px-3 py-1.5 rounded-full bg-white/30 border border-border/40 text-[10px] font-black uppercase tracking-widest text-text-tertiary"
            >
              {c.count} {c.label}
            </div>
          ))}
        </div>

        <Select onValueChange={onSortChange} defaultValue="recommended">
          <SelectTrigger className="w-[160px] h-11 rounded-2xl border-border/60 bg-white/30">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl border-border/60 shadow-elevated">
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="popular">Popular</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
