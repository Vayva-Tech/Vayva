'use client';
import { Button } from "@vayva/ui";

import React from 'react';

export interface ClientPortalProps {
  businessId: string;
  clientId: string;
  onViewMatter?: (matterId: string) => void;
  onSendMessage?: (message: string) => void;
}

export function ClientPortal({ businessId, clientId, onViewMatter, onSendMessage }: ClientPortalProps) {
  const [message, setMessage] = React.useState('');

  const matters = [
    { id: '1', title: 'Smith v. Johnson Corp', status: 'Active', lastUpdate: '2 days ago' },
    { id: '2', title: 'Contract Review - ABC Corp', status: 'Pending Review', lastUpdate: '1 week ago' },
  ];

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage?.(message);
      setMessage('');
    }
  };

  return (
    <div className="client-portal max-w-6xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Client Portal</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">My Matters</h3>
          {matters.map((matter) => (
            <div
              key={matter.id}
              onClick={() => onViewMatter?.(matter.id)}
              className="p-4 border rounded-md mb-3 cursor-pointer hover:bg-gray-50"
            >
              <p className="font-medium">{matter.title}</p>
              <p className="text-sm text-gray-500 mt-1">Status: {matter.status} • Updated: {matter.lastUpdate}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Send Message</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
            placeholder="Type your message to your attorney..."
          />
          <Button
            onClick={handleSend}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Send Message
          </Button>
        </div>
      </div>
    </div>
  );
}

