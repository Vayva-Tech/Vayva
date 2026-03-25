'use client';
import { Button } from "@vayva/ui";

import React, { useState } from 'react';

export interface ClientProofingInterfaceProps {
  businessId: string;
  projectId: string;
  onSubmitProof?: (proof: ProofFeedback) => Promise<void>;
}

interface ProofFeedback {
  annotation: string;
  x: number;
  y: number;
  status: 'approved' | 'changes-requested' | 'comment';
}

export function ClientProofingInterface({ businessId, projectId, onSubmitProof }: ClientProofingInterfaceProps) {
  const [selectedArea, setSelectedArea] = useState<{ x: number; y: number } | null>(null);
  const [feedback, setFeedback] = useState('');

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSelectedArea({ x, y });
  };

  const handleSubmit = () => {
    if (selectedArea && feedback) {
      onSubmitProof?.({
        annotation: feedback,
        x: selectedArea.x,
        y: selectedArea.y,
        status: 'changes-requested',
      });
      setFeedback('');
      setSelectedArea(null);
    }
  };

  return (
    <div className="client-proofing-interface max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Proofing</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div
            onClick={handleImageClick}
            className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center cursor-crosshair relative"
          >
            <span className="text-gray-400">Design Preview</span>
            {selectedArea && (
              <div
                className="absolute w-4 h-4 bg-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${selectedArea.x}%`, top: `${selectedArea.y}%` }}
              />
            )}
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Add Annotation</h3>
            
            {selectedArea ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Feedback
                  </label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the changes needed..."
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleSubmit}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Submit Feedback
                  </Button>
                  <Button
                    onClick={() => setSelectedArea(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                Click anywhere on the design to add an annotation
              </p>
            )}
          </div>

          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Button className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                ✓ Approve Design
              </Button>
              <Button className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                Request Changes
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

