// Appointment Model
export interface Appointment {
  id: string;
  patientId: string;
  date: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}
