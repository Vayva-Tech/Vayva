// @ts-nocheck
'use client';

import React, { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const patientIntakeSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    zipCode: z.string().min(5, 'ZIP code must be at least 5 digits'),
  }),
  insuranceProvider: z.string().min(1, 'Insurance provider is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  groupNumber: z.string().optional(),
  emergencyContact: z.object({
    name: z.string().min(1, 'Emergency contact name is required'),
    relationship: z.string().min(1, 'Relationship is required'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  }),
  medicalHistory: z.array(z.string()).optional(),
  currentMedications: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  reasonForVisit: z.string().min(1, 'Reason for visit is required'),
  consentToTreatment: z.boolean().refine((val) => val === true, 'You must consent to treatment'),
  hipaaAcknowledgment: z.boolean().refine((val) => val === true, 'You must acknowledge HIPAA'),
});

export type PatientIntakeFormData = z.infer<typeof patientIntakeSchema>;

export interface PatientIntakeFormsProps {
  businessId: string;
  patientId?: string;
  onSubmit?: (data: PatientIntakeFormData) => Promise<void>;
}

export function PatientIntakeForms({ 
  businessId, 
  patientId,
  onSubmit 
}: PatientIntakeFormsProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods: UseFormReturn<PatientIntakeFormData> = useForm<PatientIntakeFormData>({
    resolver: zodResolver(patientIntakeSchema),
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const onSubmitForm = async (data: PatientIntakeFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit?.(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { id: 1, label: 'Personal Info' },
    { id: 2, label: 'Insurance' },
    { id: 3, label: 'Medical History' },
    { id: 4, label: 'Consent' },
  ];

  return (
    <div className="patient-intake-forms max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Patient Intake Forms</h2>
        <p className="text-gray-600 mt-1">Please complete all sections below</p>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((s) => (
            <div
              key={s.id}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                s.id <= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}
            >
              {s.id}
            </div>
          ))}
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          {steps.map((s) => (
            <span key={s.id}>{s.label}</span>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmitForm)}>
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input
                  {...register('firstName')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                <input
                  {...register('lastName')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth *</label>
              <input
                {...register('dateOfBirth')}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="john.doe@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                <input
                  {...register('phone')}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="(555) 123-4567"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">Address</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    {...register('address.street')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 Main St"
                  />
                  {errors.address?.street && (
                    <p className="text-red-500 text-xs mt-1">{errors.address.street.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      {...register('address.city')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="New York"
                    />
                    {errors.address?.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.address.city.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      {...register('address.state')}
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="NY"
                    />
                    {errors.address?.state && (
                      <p className="text-red-500 text-xs mt-1">{errors.address.state.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                  <input
                    {...register('address.zipCode')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10001"
                  />
                  {errors.address?.zipCode && (
                    <p className="text-red-500 text-xs mt-1">{errors.address.zipCode.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Insurance Information */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Insurance Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Insurance Provider *</label>
              <input
                {...register('insuranceProvider')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Blue Cross Blue Shield"
              />
              {errors.insuranceProvider && (
                <p className="text-red-500 text-xs mt-1">{errors.insuranceProvider.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number *</label>
                <input
                  {...register('policyNumber')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ABC123456789"
                />
                {errors.policyNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.policyNumber.message}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Number</label>
                <input
                  {...register('groupNumber')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="border-t pt-4 mt-4">
              <h4 className="text-md font-medium text-gray-800 mb-3">Emergency Contact</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
                  <input
                    {...register('emergencyContact.name')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Jane Doe"
                  />
                  {errors.emergencyContact?.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContact.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Relationship *</label>
                  <input
                    {...register('emergencyContact.relationship')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Spouse"
                  />
                  {errors.emergencyContact?.relationship && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContact.relationship.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                  <input
                    {...register('emergencyContact.phone')}
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="(555) 987-6543"
                  />
                  {errors.emergencyContact?.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.emergencyContact.phone.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Medical History */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Medical History</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications</label>
              <textarea
                {...register('currentMedications')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List all current medications and dosages (one per line)"
              />
              <p className="text-xs text-gray-500 mt-1">Include prescription and over-the-counter medications</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Allergies</label>
              <textarea
                {...register('allergies')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List any known allergies (medications, foods, environmental)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical History</label>
              <textarea
                {...register('medicalHistory')}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List any significant medical history, surgeries, or chronic conditions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Visit *</label>
              <textarea
                {...register('reasonForVisit')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Please describe why you are visiting today"
              />
              {errors.reasonForVisit && (
                <p className="text-red-500 text-xs mt-1">{errors.reasonForVisit.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Consent Forms */}
        {step === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Consent & Acknowledgments</h3>
            
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex items-start">
                <input
                  id="consentToTreatment"
                  {...register('consentToTreatment')}
                  type="checkbox"
                  className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="consentToTreatment" className="ml-3 block text-sm text-gray-900 cursor-pointer">
                  <strong>Consent to Treatment:</strong> I hereby consent to receive medical treatment as deemed necessary by the healthcare provider. I understand that all medical procedures carry some risk and I have been given the opportunity to ask questions.
                </label>
              </div>
              {errors.consentToTreatment && (
                <p className="text-red-500 text-xs mt-2 ml-8">{errors.consentToTreatment.message}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <div className="flex items-start">
                <input
                  id="hipaaAcknowledgment"
                  {...register('hipaaAcknowledgment')}
                  type="checkbox"
                  className="mt-1 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="hipaaAcknowledgment" className="ml-3 block text-sm text-gray-900 cursor-pointer">
                  <strong>HIPAA Privacy Practices:</strong> I acknowledge receipt of the HIPAA Privacy Practices notice. I understand that my protected health information may be used and disclosed for treatment, payment, and healthcare operations purposes.
                </label>
              </div>
              {errors.hipaaAcknowledgment && (
                <p className="text-red-500 text-xs mt-2 ml-8">{errors.hipaaAcknowledgment.message}</p>
              )}
            </div>

            <div className="bg-yellow-50 p-4 rounded-md border border-yellow-200">
              <p className="text-sm text-gray-700">
                <strong>Important Notice:</strong> By signing below, you confirm that all information provided in this form is accurate and complete to the best of your knowledge. Please inform us of any changes to your information.
              </p>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-8 flex justify-between border-t pt-6">
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              ← Back
            </button>
          )}
          
          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="ml-auto px-6 py-2.5 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Next →
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto px-6 py-2.5 bg-green-600 text-white rounded-md font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Forms'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
