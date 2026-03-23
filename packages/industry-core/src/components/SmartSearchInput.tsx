// @ts-nocheck
'use client';

import React, { useState, useRef, useEffect } from 'react';

export interface SmartSearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
  suggestions?: string[];
  debounceMs?: number;
  className?: string;
}

export function SmartSearchInput({
  placeholder = 'Search...',
  value,
  onChange,
  onSearch,
  suggestions = [],
  debounceMs = 300,
  className = '',
}: SmartSearchInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions based on input
  useEffect(() => {
    if (value.trim() === '') {
      setFilteredSuggestions([]);
      return;
    }

    const filtered = suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(value.toLowerCase())
    );
    setFilteredSuggestions(filtered);
  }, [value, suggestions]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (value.trim()) {
        onSearch(value);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [value, debounceMs, onSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch(value);
      setShowSuggestions(false);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md overflow-hidden">
          <ul className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
            {filteredSuggestions.map((suggestion, index) => (
              <li
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-gray-100"
              >
                <div className="flex items-center">
                  <span className="font-normal truncate">{suggestion}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}