'use client';

import React, { useState } from 'react';

export interface MedicalRecordsViewerProps {
  businessId: string;
  patientId: string;
  onLoadRecord?: (recordId: string) => Promise<void>;
  onExportRecords?: (format: 'pdf' | 'csv') => void;
}

export interface MedicalRecord {
  id: string;
  date: Date;
  type: 'encounter' | 'lab' | 'imaging' | 'prescription' | 'note' | 'vaccination';
  title: string;
  provider: string;
  department: string;
  summary: string;
  attachments?: string[];
}

export function MedicalRecordsViewer({ 
  businessId,
  patientId,
  onLoadRecord,
  onExportRecords
}: MedicalRecordsViewerProps) {
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });

  // Sample medical records data
  const medicalRecords: MedicalRecord[] = [
    {
      id: '1',
      date: new Date('2024-01-15'),
      type: 'encounter',
      title: 'Annual Physical Examination',
      provider: 'Dr. Sarah Johnson',
      department: 'Primary Care',
      summary: 'Patient presents for annual wellness exam. Vital signs stable. No acute complaints.',
    },
    {
      id: '2',
      date: new Date('2024-01-15'),
      type: 'lab',
      title: 'Comprehensive Metabolic Panel',
      provider: 'Lab Department',
      department: 'Laboratory',
      summary: 'All values within normal limits. Glucose: 95 mg/dL, HbA1c: 5.4%',
    },
    {
      id: '3',
      date: new Date('2023-11-20'),
      type: 'imaging',
      title: 'Chest X-Ray',
      provider: 'Dr. Michael Chen',
      department: 'Radiology',
      summary: 'No acute cardiopulmonary process. Heart size and pulmonary vascularity normal.',
    },
    {
      id: '4',
      date: new Date('2023-10-05'),
      type: 'prescription',
      title: 'Prescription Renewal - Lisinopril',
      provider: 'Dr. Sarah Johnson',
      department: 'Primary Care',
      summary: 'Lisinopril 10mg daily refilled for hypertension management.',
    },
    {
      id: '5',
      date: new Date('2023-09-12'),
      type: 'encounter',
      title: 'Follow-up Visit - Hypertension',
      provider: 'Dr. Sarah Johnson',
      department: 'Primary Care',
      summary: 'BP well controlled on current medication. Continue current regimen.',
    },
    {
      id: '6',
      date: new Date('2023-08-01'),
      type: 'vaccination',
      title: 'Influenza Vaccine',
      provider: 'Nurse Practitioner',
      department: 'Primary Care',
      summary: 'Seasonal influenza vaccine administered. No adverse reactions.',
    },
  ];

  const handleLoadRecord = async (recordId: string) => {
    setSelectedRecord(recordId);
    await onLoadRecord?.(recordId);
  };

  const filteredRecords = medicalRecords.filter(record => {
    if (filterType !== 'all' && record.type !== filterType) return false;
    if (searchQuery && !record.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !record.summary.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (dateRange.start && record.date < new Date(dateRange.start)) return false;
    if (dateRange.end && record.date > new Date(dateRange.end)) return false;
    return true;
  });

  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      encounter: 'bg-blue-100 text-blue-800 border-blue-300',
      lab: 'bg-purple-100 text-purple-800 border-purple-300',
      imaging: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      prescription: 'bg-green-100 text-green-800 border-green-300',
      note: 'bg-gray-100 text-gray-800 border-gray-300',
      vaccination: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    };
    return colors[type] || colors.note;
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      encounter: '🩺',
      lab: '🧪',
      imaging: '📷',
      prescription: '💊',
      note: '📝',
      vaccination: '💉',
    };
    return icons[type] || '📄';
  };

  const selectedRecordData = medicalRecords.find(r => r.id === selectedRecord);

  return (
    <div className="medical-records-viewer max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Medical Records</h2>
            <p className="text-gray-600 mt-1">Patient: {patientId}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onExportRecords?.('pdf')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Export PDF
            </button>
            <button
              onClick={() => onExportRecords?.('csv')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search records..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Record Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="encounter">Encounters</option>
              <option value="lab">Lab Results</option>
              <option value="imaging">Imaging</option>
              <option value="prescription">Prescriptions</option>
              <option value="note">Clinical Notes</option>
              <option value="vaccination">Vaccinations</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              From Date
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              To Date
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Records List */}
        <div className="lg:col-span-2 space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">No records found matching your criteria.</p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                onClick={() => handleLoadRecord(record.id)}
                className={`bg-white rounded-lg shadow p-5 border-l-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedRecord === record.id
                    ? 'border-blue-500 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-blue-400'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getTypeIcon(record.type)}</span>
                      <div>
                        <h3 className="font-semibold text-gray-900">{record.title}</h3>
                        <p className="text-sm text-gray-600">
                          {record.provider} • {record.department}
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-3">{record.summary}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{record.date.toLocaleDateString()}</span>
                      <span className={`px-2 py-1 rounded-full border ${getTypeBadgeColor(record.type)}`}>
                        {record.type}
                      </span>
                    </div>
                  </div>

                  {selectedRecord === record.id && (
                    <div className="ml-4">
                      <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Record Detail Panel */}
        <div className="lg:col-span-1">
          {selectedRecordData ? (
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Record Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Type</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getTypeBadgeColor(selectedRecordData.type)}`}>
                    {selectedRecordData.type}
                  </span>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedRecordData.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Provider</p>
                  <p className="text-sm text-gray-900">{selectedRecordData.provider}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Department</p>
                  <p className="text-sm text-gray-900">{selectedRecordData.department}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Summary</p>
                  <p className="text-sm text-gray-700">{selectedRecordData.summary}</p>
                </div>

                {selectedRecordData.attachments && selectedRecordData.attachments.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Attachments</p>
                    <ul className="space-y-2">
                      {selectedRecordData.attachments.map((attachment, idx) => (
                        <li key={idx}>
                          <a
                            href="#"
                            className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-2"
                          >
                            📎 {attachment}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                  View Full Record
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">Select a record to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Medical History Timeline</h3>
        <div className="relative">
          <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200"></div>
          {medicalRecords.slice(0, 5).map((record, index) => (
            <div key={record.id} className={`relative flex items-center mb-8 ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
              <div className={`w-5/12 ${index % 2 === 0 ? 'pr-8 text-right' : 'pl-8 text-left'}`}>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="font-medium text-gray-900">{record.title}</p>
                  <p className="text-sm text-gray-600">{record.date.toLocaleDateString()}</p>
                </div>
              </div>
              <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
