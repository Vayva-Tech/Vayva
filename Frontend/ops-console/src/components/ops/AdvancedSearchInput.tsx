"use client";

import React, { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { MagnifyingGlass as Search, X, Command, Question } from "@phosphor-icons/react/ssr";
import { cn, Button } from "@vayva/ui";
import { parseSearchQuery, type SearchQuery } from "@/lib/search/queryParser";

// Helper function for search suggestions
function getSearchSuggestions(prefix: string): string[] {
  const suggestions = [
    "plan:free", "plan:starter", "plan:growth", "plan:pro", "plan:enterprise",
    "kyc:pending", "kyc:approved", "kyc:rejected",
    "risk:low", "risk:medium", "risk:high", "risk:flagged",
    "status:active", "status:inactive", "status:suspended",
    "gmv>", "orders>", "created>", "lastActive>",
  ];
  return suggestions.filter(s => s.toLowerCase().startsWith(prefix.toLowerCase()));
}

interface AdvancedSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: SearchQuery) => void;
  placeholder?: string;
  className?: string;
  showHelp?: boolean;
}

export function AdvancedSearchInput({
  value,
  onChange,
  onSearch,
  placeholder = "Search... (try: plan:pro kyc:pending gmv>100000)",
  className,
  showHelp = true
}: AdvancedSearchInputProps): React.JSX.Element {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [showHelpPanel, setShowHelpPanel] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse query on change — derived value, no effect needed
  const parsedQuery = useMemo(() => parseSearchQuery(value), [value]);

  // Update suggestions based on cursor position
  const updateSuggestions = useCallback(() => {
    if (!inputRef.current) return;
    
    const cursorPosition = inputRef.current.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const lastWord = textBeforeCursor.split(/\s+/).pop() || "";
    
    if (lastWord.length >= 1) {
      const newSuggestions = getSearchSuggestions(lastWord);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0 && isFocused);
      setSelectedSuggestion(0);
    } else {
      setShowSuggestions(false);
    }
  }, [value, isFocused]);

  useEffect(() => {
    queueMicrotask(() => updateSuggestions());
  }, [updateSuggestions]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedSuggestion((prev) => (prev + 1) % suggestions.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedSuggestion((prev) => (prev - 1 + suggestions.length) % suggestions.length);
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        const suggestion = suggestions[selectedSuggestion];
        if (suggestion) {
          applySuggestion(suggestion);
        }
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (parsedQuery) {
        onSearch(parsedQuery);
      }
    } else if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  const applySuggestion = (suggestion: string) => {
    const cursorPosition = inputRef.current?.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    const words = textBeforeCursor.split(/\s+/);
    words.pop();
    words.push(suggestion);
    const newValue = words.join(" ") + (textAfterCursor ? " " + textAfterCursor : "");
    onChange(newValue);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const clearSearch = () => {
    onChange("");
    inputRef.current?.focus();
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
        setShowHelpPanel(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Render highlighted query tokens
  const renderHighlightedValue = () => {
    if (!value) return null;
    
    const tokens = value.split(/(\s+)/);
    return tokens.map((token: string, i: number) => {
      // Field:value pattern
      if (/^\w+[:=]/.test(token)) {
        const [field, ...rest] = token.split(/[:=]/);
        const operator = token.includes(":") ? ":" : "=";
        return (
          <span key={i}>
            <span className="text-indigo-600 font-semibold">{field}</span>
            <span className="text-gray-400">{operator}</span>
            <span className="text-emerald-600">{rest.join(operator)}</span>
          </span>
        );
      }
      // Comparison operators
      if (/^\w+[<>]=?/.test(token)) {
        const match = token.match(/^(\w+)([<>]=?)(.+)$/);
        if (match) {
          return (
            <span key={i}>
              <span className="text-indigo-600 font-semibold">{match[1]}</span>
              <span className="text-purple-600">{match[2]}</span>
              <span className="text-emerald-600">{match[3]}</span>
            </span>
          );
        }
      }
      // Negation
      if (/^-\w+/.test(token)) {
        return (
          <span key={i}>
            <span className="text-red-500">-</span>
            <span className="text-indigo-600 font-semibold">{token.slice(1)}</span>
          </span>
        );
      }
      // Boolean operators
      if (/^(AND|OR|NOT)$/i.test(token)) {
        return <span key={i} className="text-purple-600 font-semibold">{token}</span>;
      }
      // Regular text
      return <span key={i} className="text-gray-700">{token}</span>;
    });
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Search Input Container */}
      <div
        className={cn(
          "relative flex items-center gap-2 bg-white",
          "border border-gray-200 rounded-xl px-3 py-2.5",
          "transition-all duration-200",
          isFocused && "border-indigo-500 ring-2 ring-indigo-500/20"
        )}
      >
        <Search className="h-5 w-5 text-gray-400 shrink-0" />
        
        {/* Highlighted text display layer */}
        <div className="relative flex-1 min-w-0">
          {/* Actual input */}
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            onFocus={() => {
              setIsFocused(true);
              updateSuggestions();
            }}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1 shrink-0">
          {value && (
            <Button
              onClick={clearSearch}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {showHelp && (
            <Button
              onClick={() => setShowHelpPanel(!showHelpPanel)}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                showHelpPanel 
                  ? "text-indigo-600 bg-indigo-50" 
                  : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              )}
              title="Search syntax help"
            >
              <Question className="h-4 w-4" />
            </Button>
          )}

          {/* Keyboard shortcut hint */}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 rounded-md">
            <Command className="h-3 w-3" />
            <span>K</span>
          </kbd>
        </div>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
          <ul className="py-2">
            {suggestions.map((suggestion: string, index: number) => (
              <li
                key={suggestion}
                onClick={() => applySuggestion(suggestion)}
                className={cn(
                  "px-4 py-2 text-sm cursor-pointer transition-colors",
                  index === selectedSuggestion
                    ? "bg-indigo-50 text-indigo-700"
                    : "text-gray-700 hover:bg-gray-50"
                )}
              >
                {suggestion.includes(":") ? (
                  <span>
                    <span className="font-semibold">{suggestion.split(":")[0]}</span>
                    <span className="text-gray-400">:</span>
                    <span className="text-emerald-600">{suggestion.split(":")[1]}</span>
                  </span>
                ) : (
                  suggestion
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Help panel */}
      {showHelpPanel && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg p-4 z-50">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Search Syntax</h4>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Field Filters</h5>
              <ul className="space-y-1 text-xs text-gray-600">
                <li><code className="text-indigo-600 bg-indigo-50 px-1 rounded">plan:pro</code> - Filter by plan</li>
                <li><code className="text-indigo-600 bg-indigo-50 px-1 rounded">kyc:pending</code> - Filter by KYC status</li>
                <li><code className="text-indigo-600 bg-indigo-50 px-1 rounded">risk:flagged</code> - Risk flags</li>
                <li><code className="text-indigo-600 bg-indigo-50 px-1 rounded">-plan:free</code> - Exclude free plan</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium text-gray-700 mb-2">Comparisons</h5>
              <ul className="space-y-1 text-xs text-gray-600">
                <li><code className="text-purple-600 bg-purple-50 px-1 rounded">gmv&gt;100000</code> - Greater than</li>
                <li><code className="text-purple-600 bg-purple-50 px-1 rounded">orders&gt;=50</code> - Greater or equal</li>
                <li><code className="text-purple-600 bg-purple-50 px-1 rounded">created&lt;2024-01-01</code> - Before date</li>
                <li><code className="text-emerald-600 bg-emerald-50 px-1 rounded">gmv:1000..5000</code> - Range</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100">
            <h5 className="font-medium text-gray-700 mb-2 text-sm">Examples</h5>
            <ul className="space-y-1 text-xs text-gray-600">
              <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">plan:pro kyc:approved gmv&gt;500000</code> - Pro merchants with approved KYC and GMV over 500k</li>
              <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">risk:flagged created&gt;2024-01-01</code> - Recently flagged merchants</li>
              <li><code className="bg-gray-100 px-1.5 py-0.5 rounded">-plan:free orders&gt;100</code> - Non-free merchants with 100+ orders</li>
            </ul>
          </div>

          <div className="mt-3 text-xs text-gray-500">
            Available fields: <span className="text-gray-700">name, slug, plan, kyc, risk, gmv, orders, created, lastActive, location, industry, status</span>
          </div>
        </div>
      )}

      {/* Active filters display */}
      {parsedQuery && parsedQuery.filters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {parsedQuery.filters.map((filter, index: number) => (
            <span
              key={index}
              className={cn(
                "inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md",
                filter.negate
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-indigo-50 text-indigo-700 border border-indigo-200"
              )}
            >
              {filter.negate && <span className="text-red-500">¬</span>}
              <span className="font-medium">{filter.field}</span>
              <span className="text-gray-500">
                {filter.operator === 'eq' ? '=' :
                 filter.operator === 'gt' ? '>' :
                 filter.operator === 'gte' ? '≥' :
                 filter.operator === 'lt' ? '<' :
                 filter.operator === 'lte' ? '≤' :
                 filter.operator === 'contains' ? '~' :
                 filter.operator === 'range' ? '..' : ':'}
              </span>
              <span>{Array.isArray(filter.value) ? `${filter.value[0]}-${filter.value[1]}` : String(filter.value)}</span>
            </span>
          ))}
          {parsedQuery.textQuery && (
            <span className="inline-flex items-center px-2 py-1 text-xs rounded-md bg-gray-100 text-gray-700">
              text: &quot;{parsedQuery.textQuery}&quot;
            </span>
          )}
        </div>
      )}
    </div>
  );
}
