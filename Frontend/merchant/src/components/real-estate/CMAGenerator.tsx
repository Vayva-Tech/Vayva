"use client";

import React, { useState, useEffect } from "react";

interface CMAReport {
  id: string;
  property: {
    title: string;
    address: string;
    price: number;
  };
  estimatedValue: number;
  confidenceScore: number;
  generatedAt: string;
}

export const CMAGenerator: React.FC = () => {
  const [reports, setReports] = useState<CMAReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCMAReports();
  }, []);

  const fetchCMAReports = async () => {
    try {
      const response = await fetch('/api/realestate/cma/reports?limit=5');
      const data = await response.json();
      
      if (data.success) {
        setReports(data.data.reports || []);
      }
    } catch (error) {
      console.error('Failed to fetch CMA reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">CMA Generator</h3>
        <button className="btn-gradient text-sm">
          + Generate New CMA
        </button>
      </div>

      <div className="space-y-3">
        {loading ? (
          <div className="skeleton h-20 w-full" />
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-[var(--re-text-secondary)]">
            No CMA reports yet. Generate your first report!
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="glass-card p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-semibold">{report.property.title}</h4>
                  <p className="text-sm text-[var(--re-text-secondary)] mt-1">
                    {report.property.address}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-[var(--re-text-tertiary)]">
                    <span>Est. Value: {formatPrice(report.estimatedValue)}</span>
                    <span>Confidence: {report.confidenceScore}%</span>
                    <span>Generated: {formatDate(report.generatedAt)}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="glass-card px-3 py-1 text-xs hover:text-white transition-colors">
                    View
                  </button>
                  <button className="glass-card px-3 py-1 text-xs hover:text-white transition-colors">
                    Edit
                  </button>
                  <button className="glass-card px-3 py-1 text-xs hover:text-white transition-colors">
                    Export
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-semibold mb-2 text-[var(--re-text-secondary)]">CMA Templates</h4>
        <div className="flex gap-2">
          <button className="glass-card px-3 py-1 text-xs hover:border-[var(--re-accent-primary)] transition-colors">
            Standard
          </button>
          <button className="glass-card px-3 py-1 text-xs hover:border-[var(--re-accent-primary)] transition-colors">
            Luxury
          </button>
          <button className="glass-card px-3 py-1 text-xs hover:border-[var(--re-accent-primary)] transition-colors">
            Investment
          </button>
          <button className="glass-card px-3 py-1 text-xs hover:border-[var(--re-accent-primary)] transition-colors">
            New Construction
          </button>
        </div>
      </div>
    </div>
  );
};
