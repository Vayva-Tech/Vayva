/**
 * Healthcare template industry configuration
 * Connects the template to @vayva/industry-healthcare package concepts
 */

export const HEALTHCARE_CONFIG = {
  industry: 'healthcare' as const,
  branding: {
    name: 'HEALTH+',
    primaryColor: 'teal',
    tagline: 'Your Health Is Our Priority',
  },
  features: {
    appointments: true,
    telemedicine: true,
    pharmacy: true,
    labResults: true,
    prescriptions: true,
    emergencyLine: true,
  },
  specialties: [
    { id: 'general', name: 'General Practice', icon: 'stethoscope' },
    { id: 'cardiology', name: 'Cardiology', icon: 'heart' },
    { id: 'dermatology', name: 'Dermatology', icon: 'sparkles' },
    { id: 'orthopedics', name: 'Orthopedics', icon: 'bone' },
    { id: 'pediatrics', name: 'Pediatrics', icon: 'baby' },
    { id: 'dentistry', name: 'Dentistry', icon: 'smile' },
    { id: 'ophthalmology', name: 'Ophthalmology', icon: 'eye' },
    { id: 'neurology', name: 'Neurology', icon: 'brain' },
  ],
  appointmentDurations: [15, 30, 45, 60, 90],
  workingHours: {
    weekdays: { open: '08:00', close: '18:00' },
    saturday: { open: '09:00', close: '14:00' },
    sunday: null, // closed
  },
  emergencyPhone: '+234-800-HEALTH',
} as const;

export type HealthcareSpecialty = typeof HEALTHCARE_CONFIG.specialties[number];

export const SAMPLE_DOCTORS = [
  {
    id: 'doc-001',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiology',
    subspecialties: ['Interventional Cardiology', 'Heart Failure'],
    yearsExperience: 15,
    rating: 4.9,
    reviewCount: 128,
    consultationFee: 25000,
    telemedicineFee: 15000,
    available: true,
    languages: ['English', 'Yoruba'],
    bio: 'Board-certified cardiologist with 15 years of experience treating heart conditions.',
  },
  {
    id: 'doc-002',
    name: 'Dr. Michael Chen',
    specialty: 'Orthopedics',
    subspecialties: ['Sports Medicine', 'Joint Replacement'],
    yearsExperience: 12,
    rating: 4.8,
    reviewCount: 96,
    consultationFee: 22000,
    telemedicineFee: 12000,
    available: true,
    languages: ['English'],
    bio: 'Expert orthopedic surgeon specializing in sports injuries and joint care.',
  },
  {
    id: 'doc-003',
    name: 'Dr. Amina Bello',
    specialty: 'Pediatrics',
    subspecialties: ['Neonatology'],
    yearsExperience: 10,
    rating: 5.0,
    reviewCount: 156,
    consultationFee: 18000,
    telemedicineFee: 10000,
    available: true,
    languages: ['English', 'Hausa', 'Yoruba'],
    bio: 'Dedicated pediatrician providing comprehensive care for children from birth through adolescence.',
  },
  {
    id: 'doc-004',
    name: 'Dr. James Okafor',
    specialty: 'Dermatology',
    subspecialties: ['Cosmetic Dermatology', 'Skin Cancer'],
    yearsExperience: 8,
    rating: 4.7,
    reviewCount: 74,
    consultationFee: 20000,
    telemedicineFee: 12000,
    available: true,
    languages: ['English', 'Igbo'],
    bio: 'Dermatologist specializing in skin conditions, cosmetic procedures, and skin cancer detection.',
  },
] as const;

export const SAMPLE_SERVICES = [
  {
    id: 'svc-001',
    name: 'General Consultation',
    specialty: 'general',
    duration: 30,
    fee: 15000,
    description: 'Comprehensive medical consultation with a general practitioner',
    availableFor: ['in_person', 'telemedicine'] as const,
  },
  {
    id: 'svc-002',
    name: 'Specialist Consultation',
    specialty: 'specialist',
    duration: 45,
    fee: 25000,
    description: 'In-depth consultation with a board-certified specialist',
    availableFor: ['in_person', 'telemedicine'] as const,
  },
  {
    id: 'svc-003',
    name: 'Lab Tests Package',
    specialty: 'laboratory',
    duration: 60,
    fee: 35000,
    description: 'Comprehensive blood work, urinalysis, and other diagnostics',
    availableFor: ['in_person'] as const,
  },
  {
    id: 'svc-004',
    name: 'Annual Health Checkup',
    specialty: 'general',
    duration: 90,
    fee: 50000,
    description: 'Full-body health assessment including vital signs, blood work, and physician review',
    availableFor: ['in_person'] as const,
  },
] as const;
