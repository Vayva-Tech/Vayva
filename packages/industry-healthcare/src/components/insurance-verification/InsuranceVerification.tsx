'use client';

import React, { useState } from 'react';

export interface InsuranceVerificationProps {
  businessId: string;
  patientId?: string;
  onVerifyEligibility?: (data: EligibilityRequest) => Promise<EligibilityResponse>;
}

export interface EligibilityRequest {
  insuranceProvider: string;
  policyNumber: string;
  groupNumber?: string;
  patientDOB: string;
  serviceDate: string;
}

export interface EligibilityResponse {
  status: 'active' | 'inactive' | 'pending' | 'unknown';
  coverageType: string;
  deductibleRemaining?: number;
  copayAmount?: number;
  coinsurancePercent?: number;
  outOfPocketMax?: number;
  effectiveDate: string;
  terminationDate?: string;
  notes?: string;
}

export function InsuranceVerification({ 
  businessId,
  patientId,
  onVerifyEligibility
}: InsuranceVerificationProps) {
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResponse | null>(null);

  const [formData, setFormData] = useState<EligibilityRequest>({
    insuranceProvider: '',
    policyNumber: '',
    groupNumber: '',
    patientDOB: '',
    serviceDate: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (field: keyof EligibilityRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVerify = async () => {
    setLoading(true);
    try {
      const response = await onVerifyEligibility?.(formData);
      if (response) {
        setEligibilityResult(response);
        setVerified(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setVerified(false);
    setEligibilityResult(null);
    setFormData({
      insuranceProvider: '',
      policyNumber: '',
      groupNumber: '',
      patientDOB: '',
      serviceDate: new Date().toISOString().split('T')[0],
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="insurance-verification max-w-5xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Insurance Eligibility Verification</h2>
        <p className="text-gray-600 mt-1">
          {patientId ? `Patient: ${patientId}` : 'Verify patient insurance coverage in real-time'}
        </p>
      </div>

      {!verified ? (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Insurance Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Provider *
              </label>
              <select
                value={formData.insuranceProvider}
                onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select provider...</option>
                <option value="blue-cross-blue-shield">Blue Cross Blue Shield</option>
                <option value="aetna">Aetna</option>
                <option value="united-healthcare">UnitedHealthcare</option>
                <option value="cigna">Cigna</option>
                <option value="humana">Humana</option>
                <option value="medicare">Medicare</option>
                <option value="medicaid">Medicaid</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Policy Number *
              </label>
              <input
                type="text"
                value={formData.policyNumber}
                onChange={(e) => handleInputChange('policyNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., ABC123456789"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Group Number
              </label>
              <input
                type="text"
                value={formData.groupNumber}
                onChange={(e) => handleInputChange('groupNumber', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Patient Date of Birth *
              </label>
              <input
                type="date"
                value={formData.patientDOB}
                onChange={(e) => handleInputChange('patientDOB', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date of Service *
              </label>
              <input
                type="date"
                value={formData.serviceDate}
                onChange={(e) => handleInputChange('serviceDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={handleVerify}
              disabled={loading || !formData.insuranceProvider || !formData.policyNumber || !formData.patientDOB}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Verifying...
                </span>
              ) : (
                'Verify Eligibility'
              )}
            </button>
            <button
              onClick={() => setFormData({
                insuranceProvider: '',
                policyNumber: '',
                groupNumber: '',
                patientDOB: '',
                serviceDate: new Date().toISOString().split('T')[0],
              })}
              className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      ) : eligibilityResult ? (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className={`rounded-lg p-6 border-2 ${getStatusBadgeColor(eligibilityResult.status)}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  {eligibilityResult.status === 'active' && '✓ Coverage Active'}
                  {eligibilityResult.status === 'inactive' && '✗ Coverage Inactive'}
                  {eligibilityResult.status === 'pending' && '⚠ Coverage Pending'}
                  {eligibilityResult.status === 'unknown' && '? Coverage Unknown'}
                </h3>
                <p className="text-sm opacity-90">
                  Coverage Type: <strong>{eligibilityResult.coverageType}</strong>
                </p>
              </div>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-md text-sm font-medium transition-colors"
              >
                Verify Another
              </button>
            </div>
          </div>

          {/* Coverage Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Deductible Remaining</p>
              <p className="text-2xl font-bold text-gray-900">
                {eligibilityResult.deductibleRemaining !== undefined 
                  ? `$${eligibilityResult.deductibleRemaining.toLocaleString()}`
                  : 'N/A'}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Copay Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                {eligibilityResult.copayAmount !== undefined 
                  ? `$${eligibilityResult.copayAmount}`
                  : 'N/A'}
              </p>
            </div>

            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Coinsurance</p>
              <p className="text-2xl font-bold text-gray-900">
                {eligibilityResult.coinsurancePercent !== undefined 
                  ? `${eligibilityResult.coinsurancePercent}%`
                  : 'N/A'}
              </p>
            </div>
          </div>

          {/* Coverage Period */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4">Coverage Period</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Effective Date</p>
                <p className="text-lg font-medium text-gray-900">
                  {new Date(eligibilityResult.effectiveDate).toLocaleDateString()}
                </p>
              </div>
              {eligibilityResult.terminationDate && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Termination Date</p>
                  <p className="text-lg font-medium text-gray-900">
                    {new Date(eligibilityResult.terminationDate).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Additional Notes */}
          {eligibilityResult.notes && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">Important Notes</h4>
              <p className="text-sm text-yellow-800">{eligibilityResult.notes}</p>
            </div>
          )}

          {/* Out of Pocket Max */}
          {eligibilityResult.outOfPocketMax && (
            <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2">Out-of-Pocket Maximum</h4>
              <p className="text-2xl font-bold text-blue-600">
                ${eligibilityResult.outOfPocketMax.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Maximum patient responsibility for the coverage period</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="flex-1 px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Verify Another Patient
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Print Verification
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
