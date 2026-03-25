"use client";
import { Button } from "@vayva/ui";

import React from "react";

interface DashboardHeaderProps {
  onThemeChange: (theme: string) => void;
  currentTheme: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onThemeChange,
  currentTheme,
}) => {
  const themes = [
    { id: "professional-blue", name: "Professional Blue", color: "#4A90E2" },
    { id: "luxury-gold", name: "Luxury Gold", color: "#D4AF37" },
    { id: "emerald-elite", name: "Emerald Elite", color: "#10B981" },
    { id: "slate-professional", name: "Slate", color: "#64748B" },
    { id: "burgundy-prestige", name: "Burgundy", color: "#991B1B" },
  ];

  return (
    <header className="glass-panel sticky top-0 z-50 mx-6 mt-6">
      <div className="flex justify-between items-center p-4">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="text-2xl font-bold bg-gradient-to-r from-[var(--re-accent-primary)] to-[var(--re-accent-secondary)] bg-clip-text text-transparent">
            VAYVA Real Estate
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-[var(--re-text-secondary)] hover:text-white transition-colors">
              Dashboard
            </a>
            <a href="/dashboard/properties" className="text-[var(--re-text-secondary)] hover:text-white transition-colors">
              Properties
            </a>
            <a href="#" className="text-[var(--re-text-secondary)] hover:text-white transition-colors">
              Listings
            </a>
            <a href="#" className="text-[var(--re-text-secondary)] hover:text-white transition-colors">
              CMAs
            </a>
            <a href="/dashboard/viewings" className="text-[var(--re-text-secondary)] hover:text-white transition-colors">
              Showings
            </a>
            <a href="#" className="text-[var(--re-text-secondary)] hover:text-white transition-colors">
              Leads
            </a>
            <a href="#" className="text-[var(--re-text-secondary)] hover:text-white transition-colors">
              Analytics
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Selector */}
          <select
            value={currentTheme}
            onChange={(e) => onThemeChange(e.target.value)}
            className="glass-card px-3 py-2 text-sm bg-transparent border-[var(--re-accent-primary)] focus:outline-none"
          >
            {themes.map((theme) => (
              <option key={theme.id} value={theme.id} className="bg-[var(--re-bg-gray-100)]">
                {theme.name}
              </option>
            ))}
          </select>

          {/* Notifications */}
          <Button className="relative p-2 glass-card hover:bg-[var(--re-bg-tertiary)] transition-colors">
            🔔
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-[var(--re-accent-primary)]/20">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--re-accent-primary)] to-[var(--re-accent-secondary)] flex items-center justify-center font-semibold text-sm">
              JD
            </div>
            <span className="text-sm font-medium hidden lg:block">Pro</span>
          </div>
        </div>
      </div>
    </header>
  );
};

