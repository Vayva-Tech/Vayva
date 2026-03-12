/**
 * Healthcare Industry Training Data
 * Industry-specific scenarios and responses for healthcare providers
 */

import type { IndustryContext, TrainingScenario, IndustrySlug } from '../types';

export const healthcareContext: IndustryContext = {
  industry: 'healthcare',
  terminology: {
    'appointment': 'Scheduled patient visit',
    'consultation': 'Professional medical advice session',
    'emr': 'Electronic Medical Record - digital patient chart',
    'ehr': 'Electronic Health Record - comprehensive health history',
    'copay': 'Fixed patient payment at time of service',
    'deductible': 'Amount patient pays before insurance covers',
    'prior_authorization': 'Insurance approval before service',
    'referral': 'Transfer to specialist physician',
    'telehealth': 'Remote/virtual medical consultation',
    'triage': 'Assessment of patient urgency/priority',
    'pharmacy': 'Medication dispensing service',
    'lab': 'Diagnostic testing facility',
    'imaging': 'Radiology services (X-ray, MRI, CT)',
    'preventive_care': 'Services to prevent illness',
  },
  workflows: [
    'Appointment request -> Scheduling -> Reminder -> Check-in -> Consultation -> Follow-up -> Billing',
    'Urgent visit -> Triage -> Provider assignment -> Treatment -> Prescription -> Follow-up',
    'Lab order -> Patient visit -> Sample collection -> Results -> Provider review -> Patient notification',
  ],
  kpis: [
    'Patient wait time',
    'Appointment availability',
    'No-show rate',
    'Patient satisfaction',
    'Treatment adherence',
    'Billing accuracy',
  ],
  commonIssues: [
    'Insurance verification delays',
    'Long wait times',
    'Appointment availability',
    'Prescription refill requests',
    'Lab result inquiries',
    'Billing questions',
  ],
};

export const healthcareScenarios: TrainingScenario[] = [
  // FAQ Scenarios
  {
    id: 'health-faq-001',
    category: 'faq',
    industry: 'healthcare' as IndustrySlug,
    language: 'en',
    question: 'How do I book an appointment?',
    answer: 'You can book online through our patient portal, call our scheduling line, or use this chat. For urgent matters, please call directly. New patients should allow 30 minutes for initial paperwork. What type of appointment do you need?',
    variations: [
      'Schedule appointment',
      'Book a visit',
      'Make appointment',
      'How to see a doctor?',
    ],
  },
  {
    id: 'health-faq-002',
    category: 'faq',
    industry: 'healthcare' as IndustrySlug,
    language: 'en',
    question: 'What insurance do you accept?',
    answer: 'We accept most major insurance plans including [LIST]. We recommend verifying your specific coverage before your visit. For uninsured patients, we offer a sliding fee scale based on income. Would you like me to verify your benefits?',
    variations: [
      'Insurance accepted?',
      'Do you take my insurance?',
      'In-network providers?',
      'Coverage questions?',
    ],
  },
  {
    id: 'health-faq-003',
    category: 'faq',
    industry: 'healthcare' as IndustrySlug,
    language: 'en',
    question: 'What are your hours?',
    answer: 'Our clinic hours are Monday-Friday 8AM-6PM and Saturday 9AM-2PM. We offer extended hours on Tuesdays until 8PM. For after-hours emergencies, please call our 24/7 nurse line or go to the nearest emergency room.',
    variations: [
      'When are you open?',
      'Office hours?',
      'Opening times?',
      'Weekend availability?',
    ],
  },
  
  // Product (Services) Scenarios
  {
    id: 'health-product-001',
    category: 'product',
    industry: 'healthcare' as IndustrySlug,
    language: 'en',
    question: 'Do you offer telehealth visits?',
    answer: 'Yes, we offer secure video consultations for many conditions including follow-ups, medication management, and minor illnesses. You will need a smartphone or computer with camera. Insurance typically covers telehealth the same as in-person visits.',
    variations: [
      'Virtual appointments?',
      'Online consultations?',
      'Video visits?',
      'Remote appointments?',
    ],
  },
  {
    id: 'health-product-002',
    category: 'product',
    industry: 'healthcare' as IndustrySlug,
    language: 'en',
    question: 'What services do you provide?',
    answer: 'We offer comprehensive primary care including preventive care, chronic disease management, acute illness treatment, women\'s health, pediatric care, and mental health services. We also have on-site lab and basic imaging.',
    variations: [
      'What do you treat?',
      'Medical services?',
      'Specialties available?',
      'What care do you offer?',
    ],
  },
  
  // Order (Appointments) Scenarios
  {
    id: 'health-order-001',
    category: 'order',
    industry: 'healthcare' as IndustrySlug,
    language: 'en',
    question: 'I need to reschedule my appointment',
    answer: 'I can help you reschedule. Please provide your appointment date/time and your preferred new time. We require 24 hours notice for cancellations to avoid fees. What works better for your schedule?',
    variations: [
      'Change appointment',
      'Move my visit',
      'Reschedule please',
      'Different appointment time?',
    ],
  },
  {
    id: 'health-order-002',
    category: 'order',
    industry: 'healthcare' as IndustrySlug,
    language: 'en',
    question: 'How long is the wait for appointments?',
    answer: 'For routine visits, we typically have availability within 1-2 weeks. Urgent same-day appointments are available for acute issues. Physicals and wellness visits may have longer waits. Would you like me to check specific dates?',
    variations: [
      'Next available appointment?',
      'Appointment wait time?',
      'When can I be seen?',
      'How soon can I get in?',
    ],
  },
  
  // Support Scenarios
  {
    id: 'health-support-001',
    category: 'support',
    industry: 'healthcare' as IndustrySlug,
    language: 'en',
    question: 'I need a prescription refill',
    answer: 'For prescription refills, please use your patient portal or call our pharmacy line. Allow 48 hours for processing. If you are out of medication, we can provide an emergency supply. Which medication do you need refilled?',
    variations: [
      'Refill my medication',
      'Prescription renewal',
      'Need more medicine',
      'Out of prescription',
    ],
  },
  {
    id: 'health-support-002',
    category: 'support',
    industry: 'healthcare' as IndustrySlug,
    language: 'en',
    question: 'When will my lab results be ready?',
    answer: 'Most lab results are available within 24-48 hours. Your provider will review them and contact you, or you can check your patient portal. For urgent results, we call immediately. Would you like me to check the status of your specific test?',
    variations: [
      'Lab results status?',
      'Test results ready?',
      'When do results come back?',
      'Blood work results?',
    ],
  },
  
  // Sales Scenarios
  {
    id: 'health-sales-001',
    category: 'sales',
    industry: 'healthcare' as IndustrySlug,
    language: 'en',
    question: 'Do you have a patient portal?',
    answer: 'Yes, our secure patient portal gives you 24/7 access to schedule appointments, message your care team, view lab results, request refills, and pay bills. I can send you a registration link to get started.',
    variations: [
      'Online patient access?',
      'Portal registration?',
      'Digital health records?',
      'Access my chart?',
    ],
  },
];

// Multi-language scenarios
export const healthcareScenariosYO: TrainingScenario[] = [
  {
    id: 'health-yo-001',
    category: 'faq',
    industry: 'healthcare' as IndustrySlug,
    language: 'yo',
    question: 'Báwo ni mo ṣe lè gbà áyẹ̀wò?',
    answer: 'O lè bóòkù lórí ayélujára nípasẹ̀ ibi àwọn àrọ́wòtó wa, pè láìlí àmì ìpínlẹ̀ wa, tàbí lò àpò ìròyìn yìí.',
    variations: [],
  },
];

export const healthcareScenariosHA: TrainingScenario[] = [
  {
    id: 'health-ha-001',
    category: 'faq',
    industry: 'healthcare' as IndustrySlug,
    language: 'ha',
    question: 'Yaya zan iya yin alƙawari?',
    answer: 'Zaku iya yin lissafi ta yanar gizo ta hanyar shafin mara lafiya mu, kira layin tsarawa mu, ko amfani da wannan hirar.',
    variations: [],
  },
];

export const healthcareScenariosIG: TrainingScenario[] = [
  {
    id: 'health-ig-001',
    category: 'faq',
    industry: 'healthcare' as IndustrySlug,
    language: 'ig',
    question: 'Kedu ka m nwere ike ịbụ nke nhazi?',
    answer: 'Ị nwere ike ịbụ nke nhazi nke ọma site na portal onye ọrịa anyị, kpọ akara nhazi anyị, ma ọ bụ jiri mkpakọrịtaụka a.',
    variations: [],
  },
];

export const healthcareScenariosPCM: TrainingScenario[] = [
  {
    id: 'health-pcm-001',
    category: 'faq',
    industry: 'healthcare' as IndustrySlug,
    language: 'pcm',
    question: 'How I fit book appointment?',
    answer: 'You fit book online through our patient portal, call our scheduling line, or use this chat. For urgent matter, abeg call directly.',
    variations: [],
  },
];

export const getHealthcareScenarios = (language?: string): TrainingScenario[] => {
  const allScenarios = [
    ...healthcareScenarios,
    ...healthcareScenariosYO,
    ...healthcareScenariosHA,
    ...healthcareScenariosIG,
    ...healthcareScenariosPCM,
  ];
  
  if (language) {
    return allScenarios.filter(s => s.language === language);
  }
  return allScenarios;
};

export default {
  context: healthcareContext,
  scenarios: healthcareScenarios,
  getScenarios: getHealthcareScenarios,
};
