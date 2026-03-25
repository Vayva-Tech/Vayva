"use client";
import { Button } from "@vayva/ui";

import React, { useState } from "react";
import "@/styles/real-estate-glass.css";

export default function RealEstateSettings() {
  const [activeTab, setActiveTab] = useState("general");

  const tabs = [
    { id: "general", name: "General" },
    { id: "listings", name: "Listings" },
    { id: "cma", name: "CMA" },
    { id: "showings", name: "Showings" },
    { id: "leads", name: "Leads" },
    { id: "transactions", name: "Transactions" },
  ];

  return (
    <div className="min-h-screen bg-[var(--re-bg-green-500)] text-[var(--re-text-green-600)] re-scrollbar">
      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Real Estate Settings</h1>
          <p className="text-[var(--re-text-secondary)]">
            Configure your real estate business settings and preferences
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[var(--re-accent-primary)]/20">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "text-[var(--re-accent-primary)] border-b-2 border-[var(--re-accent-primary)]"
                  : "text-[var(--re-text-secondary)] hover:text-white"
              }`}
            >
              {tab.name}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="glass-panel p-6">
          {activeTab === "general" && <GeneralSettings />}
          {activeTab === "listings" && <ListingSettings />}
          {activeTab === "cma" && <CMASettings />}
          {activeTab === "showings" && <ShowingSettings />}
          {activeTab === "leads" && <LeadSettings />}
          {activeTab === "transactions" && <TransactionSettings />}
        </div>
      </div>
    </div>
  );
}

// General Settings Component
function GeneralSettings() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-4">License & Compliance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Brokerage License Number
            </label>
            <input
              type="text"
              defaultValue="RE-2026-12345"
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              License Expiry Date
            </label>
            <input
              type="date"
              defaultValue="2026-12-31"
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              MLS Membership ID
            </label>
            <input
              type="text"
              defaultValue="MLS123456"
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Board/Association
            </label>
            <select className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]">
              <option>Metro Association of Realtors</option>
              <option>State Real Estate Commission</option>
              <option>National Association of Realtors</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <Button className="btn-gradient">Upload License</Button>
          <span className="status-badge active">✓ Verified</span>
        </div>
      </section>

      <section className="pt-6 border-t border-[var(--re-accent-primary)]/20">
        <h2 className="text-xl font-bold mb-4">Agent Requirements</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Agent licenses required for all users</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Background check required</span>
          </label>
        </div>
      </section>
    </div>
  );
}

// Listing Settings Component
function ListingSettings() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-4">Listing Types</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            "Residential",
            "Commercial",
            "Land",
            "Multi-Family",
            "Rental",
            "Auction"
          ].map((type) => (
            <label key={type} className="flex items-center gap-2 glass-card p-3 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked={type !== "Auction"}
                className="w-4 h-4"
              />
              <span className="text-sm">{type}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-[var(--re-accent-primary)]/20">
        <h2 className="text-xl font-bold mb-4">Default Listing Terms</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Default Duration (days)
            </label>
            <input
              type="number"
              defaultValue={90}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Commission Rate (%)
            </label>
            <input
              type="number"
              defaultValue={2.5}
              step={0.1}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 mt-8">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Auto-renew listings</span>
            </label>
          </div>
        </div>
      </section>

      <section className="pt-6 border-t border-[var(--re-accent-primary)]/20">
        <h2 className="text-xl font-bold mb-4">Photo Requirements</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Minimum Photos
            </label>
            <input
              type="number"
              defaultValue={20}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Max File Size (MB)
            </label>
            <input
              type="number"
              defaultValue={10}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="flex items-center gap-2 mt-8">
              <input type="checkbox" className="w-4 h-4" />
              <span className="text-sm">Virtual tour required</span>
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}

// CMA Settings Component
function CMASettings() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-4">Comparable Selection Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Search Radius (miles)
            </label>
            <input
              type="number"
              defaultValue={2}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Time Range (months)
            </label>
            <input
              type="number"
              defaultValue={6}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Minimum Comps
            </label>
            <input
              type="number"
              defaultValue={3}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Maximum Comps
            </label>
            <input
              type="number"
              defaultValue={10}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
        </div>
      </section>

      <section className="pt-6 border-t border-[var(--re-accent-primary)]/20">
        <h2 className="text-xl font-bold mb-4">Adjustment Factors</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Bedroom Adjustment ($)", value: 15000 },
            { label: "Bathroom Adjustment ($)", value: 10000 },
            { label: "Square Foot Adjustment ($/sqft)", value: 150 },
            { label: "Garage Adjustment ($)", value: 8000 },
            { label: "Pool Adjustment ($)", value: 25000 },
          ].map((item) => (
            <div key={item.label}>
              <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
                {item.label}
              </label>
              <input
                type="number"
                defaultValue={item.value}
                className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-[var(--re-accent-primary)]/20">
        <h2 className="text-xl font-bold mb-4">CMA Templates</h2>
        <div className="flex gap-2">
          {["Standard", "Luxury", "Investment", "New Construction"].map((template) => (
            <Button
              key={template}
              className="glass-card px-4 py-2 text-sm hover:border-[var(--re-accent-primary)] transition-colors"
            >
              Configure {template}
            </Button>
          ))}
        </div>
      </section>
    </div>
  );
}

// Showing Settings Component
function ShowingSettings() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-4">Showing Windows</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Min. Notice (hours)
            </label>
            <input
              type="number"
              defaultValue={2}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Max. Advance (days)
            </label>
            <input
              type="number"
              defaultValue={30}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              defaultValue={30}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
        </div>
      </section>

      <section className="pt-6 border-t border-[var(--re-accent-primary)]/20">
        <h2 className="text-xl font-bold mb-4">Confirmation Settings</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Auto-confirm showings</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Send reminders 2 hours before</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Require pre-approval for financed buyers</span>
          </label>
        </div>
      </section>

      <section className="pt-6 border-t border-[var(--re-accent-primary)]/20">
        <h2 className="text-xl font-bold mb-4">Feedback Collection</h2>
        <div className="space-y-3">
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Request feedback after showings</span>
          </label>
          <label className="flex items-center gap-3">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            <span className="text-sm">Follow-up if no response in 24h</span>
          </label>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2 mt-3">
              Rating Scale
            </label>
            <select className="glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]">
              <option>5-star</option>
              <option>10-point scale</option>
              <option>Yes/No</option>
            </select>
          </div>
        </div>
      </section>
    </div>
  );
}

// Lead Settings Component
function LeadSettings() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-4">Lead Sources</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {["Website", "Zillow", "Realtor.com", "Referrals", "Social Media", "Walk-ins"].map((source) => (
            <label key={source} className="flex items-center gap-2 glass-card p-3 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">{source}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-[var(--re-accent-primary)]/20">
        <h2 className="text-xl font-bold mb-4">Lead Assignment</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="flex items-center gap-2">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">Auto-assign (Round-robin)</span>
            </label>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Response Time Goal (minutes)
            </label>
            <input
              type="number"
              defaultValue={15}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Escalate After (hours)
            </label>
            <input
              type="number"
              defaultValue={1}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
        </div>
      </section>

      <section className="pt-6 border-t border-[var(--re-accent-primary)]/20">
        <h2 className="text-xl font-bold mb-4">Pipeline Stages</h2>
        <div className="space-y-2">
          {["New Lead", "Contacted", "Qualified", "Showing Scheduled", "Offer Made", "Under Contract", "Closed"].map((stage, index) => (
            <div key={index} className="glass-card p-3 flex items-center justify-between">
              <span className="text-sm">{stage}</span>
              <div className="flex gap-2">
                <Button className="glass-card px-2 py-1 text-xs hover:text-white">Edit</Button>
                {index > 0 && index < 6 && (
                  <Button className="glass-card px-2 py-1 text-xs text-red-400 hover:text-red-300">Remove</Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <Button className="btn-gradient mt-3 text-sm">+ Add Custom Stage</Button>
      </section>
    </div>
  );
}

// Transaction Settings Component
function TransactionSettings() {
  return (
    <div className="space-y-6">
      <section>
        <h2 className="text-xl font-bold mb-4">Document Requirements</h2>
        <div className="space-y-3">
          {[
            "Purchase Agreement",
            "Disclosure Forms",
            "Inspection Reports",
            "Appraisal",
            "Title Insurance",
            "Home Inspection",
            "Survey Documents"
          ].map((doc) => (
            <label key={doc} className="flex items-center gap-3">
              <input type="checkbox" defaultChecked className="w-4 h-4" />
              <span className="text-sm">{doc}</span>
            </label>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-[var(--re-accent-primary)]/20">
        <h2 className="text-xl font-bold mb-4">Milestone Tracking</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: "Inspection Contingency (days)", value: 10 },
            { label: "Financing Contingency (days)", value: 21 },
            { label: "Appraisal Deadline (days)", value: 14 },
            { label: "Closing Timeline (days)", value: 30 },
          ].map((item) => (
            <div key={item.label}>
              <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
                {item.label}
              </label>
              <input
                type="number"
                defaultValue={item.value}
                className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
              />
            </div>
          ))}
        </div>
      </section>

      <section className="pt-6 border-t border-[var(--re-accent-primary)]/20">
        <h2 className="text-xl font-bold mb-4">Commission Split</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Brokerage Share (%)
            </label>
            <input
              type="number"
              defaultValue={30}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Agent Share (%)
            </label>
            <input
              type="number"
              defaultValue={70}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--re-text-secondary)] mb-2">
              Transaction Fee ($)
            </label>
            <input
              type="number"
              defaultValue={495}
              className="w-full glass-card px-4 py-2 bg-[var(--re-bg-tertiary)] focus:outline-none focus:border-[var(--re-accent-primary)]"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

