/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TelemedicineSession } from '../types';

export interface TelemedicineSessionParams {
  appointmentId: string;
  patientId: string;
  doctorId: string;
}

/**
 * TelemedicineService - Manages virtual consultation sessions
 * Handles room creation, session lifecycle, and recording
 */
export class TelemedicineService {
  private db: any;

  constructor(db: any) {
    this.db = db;
  }

  /**
   * Create a telemedicine room for an appointment
   */
  async createSession(params: TelemedicineSessionParams): Promise<TelemedicineSession> {
    const roomId = `room_${params.appointmentId}_${Date.now()}`;

    const session: TelemedicineSession = {
      id: `tele_${Date.now()}`,
      appointmentId: params.appointmentId,
      patientId: params.patientId,
      doctorId: params.doctorId,
      roomId,
      status: 'waiting',
      chatLog: [],
    };

    await this.db.telemedicineSession.create({ data: session });

    return session;
  }

  /**
   * Start a telemedicine session (doctor joins)
   */
  async startSession(sessionId: string): Promise<void> {
    await this.db.telemedicineSession.update({
      where: { id: sessionId },
      data: { status: 'active', startedAt: new Date() },
    });
  }

  /**
   * End a telemedicine session
   */
  async endSession(sessionId: string): Promise<void> {
    const endedAt = new Date();

    const session = await this.db.telemedicineSession.findUnique({
      where: { id: sessionId },
    });

    const startedAt = session?.startedAt as Date | undefined;
    const duration = startedAt
      ? Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)
      : 0;

    await this.db.telemedicineSession.update({
      where: { id: sessionId },
      data: { status: 'ended', endedAt, duration },
    });
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<TelemedicineSession | null> {
    const record = await this.db.telemedicineSession.findUnique({
      where: { id: sessionId },
    });

    return record as TelemedicineSession | null;
  }

  /**
   * Get active sessions for a doctor
   */
  async getActiveSessions(doctorId: string): Promise<TelemedicineSession[]> {
    const records = await this.db.telemedicineSession.findMany({
      where: { doctorId, status: { in: ['waiting', 'active'] } },
    });

    return records as TelemedicineSession[];
  }

  /**
   * Generate a join URL for a session (integration point for video provider)
   */
  generateJoinUrl(session: TelemedicineSession, role: 'patient' | 'doctor'): string {
    // In production, integrate with Twilio/Daily.co/Zoom SDK
    const baseUrl = process.env['TELEMEDICINE_BASE_URL'] ?? 'https://meet.vayva.io';
    return `${baseUrl}/room/${session.roomId}?role=${role}&token=${session.id}`;
  }
}
