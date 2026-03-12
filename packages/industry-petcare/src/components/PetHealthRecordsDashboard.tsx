/**
 * Pet Health Records Dashboard Component
 */

import React from 'react';
import { PetRecord, Vaccination } from '../services/pet-health-records.service';

export interface PetHealthRecordsDashboardProps {
  records: PetRecord[];
  upcomingVaccinations: Vaccination[];
  onCreateRecord?: (record: Partial<PetRecord>) => void;
  onAddVaccination?: (vaccination: Partial<Vaccination>) => void;
}

export const PetHealthRecordsDashboard: React.FC<PetHealthRecordsDashboardProps> = ({
  records,
  upcomingVaccinations,
  onCreateRecord,
  onAddVaccination,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🐾 Pet Health Records</h2>
        <p className="text-gray-600">Manage pet medical records and vaccinations</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Total Pets</div>
          <div className="text-2xl font-bold text-blue-600">{records.length}</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Upcoming Vax</div>
          <div className="text-2xl font-bold text-green-600">{upcomingVaccinations.length}</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">Avg Age</div>
          <div className="text-2xl font-bold text-purple-600">
            {records.length > 0 ? Math.round(records.reduce((sum, r) => sum + r.age, 0) / records.length) : 0} yrs
          </div>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="text-sm text-gray-600">With Conditions</div>
          <div className="text-2xl font-bold text-orange-600">
            {records.filter(r => r.medicalConditions && r.medicalConditions.length > 0).length}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent Records */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 mb-3">Recent Pet Records</h3>
          {records.slice(0, 5).map(record => (
            <div key={record.id} className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors bg-gray-50">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-medium text-gray-900">{record.name}</div>
                  <div className="text-xs text-gray-500">
                    {record.species.charAt(0).toUpperCase() + record.species.slice(1)}
                    {record.breed && ` • ${record.breed}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">{record.age} years</div>
                  <div className="text-xs text-gray-500">{record.weight} kg</div>
                </div>
              </div>
              
              {record.medicalConditions && record.medicalConditions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {record.medicalConditions.map((condition, idx) => (
                    <span key={idx} className="inline-block bg-red-100 text-red-700 text-xs px-2 py-1 rounded">
                      {condition}
                    </span>
                  ))}
                </div>
              )}

              {record.medications && record.medications.length > 0 && (
                <div className="mt-2">
                  <div className="text-xs text-gray-500 mb-1">Medications:</div>
                  {record.medications.filter(m => m.active).map((med, idx) => (
                    <div key={idx} className="text-xs text-gray-600">
                      💊 {med.name} - {med.dosage} ({med.frequency})
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Upcoming Vaccinations */}
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-700 mb-3">Upcoming Vaccinations</h3>
          {upcomingVaccinations.length === 0 ? (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              ✓ All vaccinations up to date!
            </div>
          ) : (
            upcomingVaccinations.map(vaccination => (
              <div key={vaccination.id} className="border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-colors bg-gray-50">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-medium text-gray-900">{vaccination.vaccineName}</div>
                    <div className="text-xs text-gray-500">Administered by: {vaccination.administeredBy}</div>
                  </div>
                  {vaccination.nextDueDate && (
                    <div className={`text-xs font-medium px-2 py-1 rounded ${
                      new Date(vaccination.nextDueDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      Due: {new Date(vaccination.nextDueDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500">
                  Given: {new Date(vaccination.dateAdministered).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
