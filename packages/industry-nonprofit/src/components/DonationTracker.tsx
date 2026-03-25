import { Button } from "@vayva/ui";
/**
 * Donation Tracker Component
 */

import React from 'react';

interface Donation {
  id: string;
  donorName: string;
  amount: number;
  date: Date;
  campaign?: string;
}

export interface DonationTrackerProps {
  donations?: Donation[];
  goal?: number;
  onRecordDonation?: (donation: any) => void;
}

export const DonationTracker: React.FC<DonationTrackerProps> = ({
  donations,
  goal = 50000,
  onRecordDonation,
}) => {
  const displayDonations = donations || [
    { id: '1', donorName: 'John D.', amount: 500, date: new Date('2024-06-01'), campaign: 'Annual Fund' },
    { id: '2', donorName: 'Sarah M.', amount: 1000, date: new Date('2024-05-28'), campaign: 'Capital Campaign' },
    { id: '3', donorName: 'Mike R.', amount: 250, date: new Date('2024-05-20'), campaign: 'Annual Fund' },
  ];

  const totalRaised = displayDonations.reduce((sum, d) => sum + d.amount, 0);
  const progress = Math.round((totalRaised / goal) * 100);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Donation Tracker</h3>
        {onRecordDonation && (
          <Button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            + Record Donation
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Goal Progress</span>
          <span className="text-gray-600">${totalRaised.toLocaleString()} of ${goal.toLocaleString()}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div 
            className="bg-green-600 h-4 rounded-full transition-all"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="text-right text-sm text-green-600 font-semibold mt-1">{progress}% Complete</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">${totalRaised.toLocaleString()}</p>
          <p className="text-xs text-gray-600">Total Raised</p>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">{displayDonations.length}</p>
          <p className="text-xs text-gray-600">Donations</p>
        </div>
        <div className="text-center p-3 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">${Math.round(totalRaised / displayDonations.length).toLocaleString()}</p>
          <p className="text-xs text-gray-600">Average</p>
        </div>
      </div>

      {/* Recent Donations */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-700">Recent Donations</h4>
        {displayDonations.map(donation => (
          <div key={donation.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">{donation.donorName}</p>
              <p className="text-sm text-gray-500">{donation.campaign}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-green-600">${donation.amount.toLocaleString()}</p>
              <p className="text-xs text-gray-500">{new Date(donation.date).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
