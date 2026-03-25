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
  private readonly db: any;
  private readonly memory = new Map<string, TelemedicineSession>();

  constructor(db?: any) {
    this.db = db;
  }

  async initialize(): Promise<void> {}

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

    if (this.db?.telemedicineSession?.create) {
      await this.db.telemedicineSession.create({ data: session });
    } else {
      this.memory.set(session.id, session);
    }

    return session;
  }

  /**
   * Start a telemedicine session (doctor joins)
   */
  async startSession(sessionId: string): Promise<void> {
    if (this.db?.telemedicineSession?.update) {
      await this.db.telemedicineSession.update({
        where: { id: sessionId },
        data: { status: 'active', startedAt: new Date() },
      });
      return;
    }
    const s = this.memory.get(sessionId);
    if (s) {
      this.memory.set(sessionId, {
        ...s,
        status: 'active',
        startedAt: new Date(),
      } as TelemedicineSession);
    }
  }

  /**
   * End a telemedicine session
   */
  async endSession(sessionId: string): Promise<void> {
    const endedAt = new Date();

    if (this.db?.telemedicineSession?.findUnique) {
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
      return;
    }

    const s = this.memory.get(sessionId);
    if (s) {
      const startedAt = (s as TelemedicineSession & { startedAt?: Date }).startedAt;
      const duration = startedAt
        ? Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000)
        : 0;
      this.memory.set(sessionId, {
        ...s,
        status: 'ended',
        endedAt,
        duration,
      } as TelemedicineSession);
    }
  }

  /**
   * Get a session by ID
   */
  async getSession(sessionId: string): Promise<TelemedicineSession | null> {
    if (this.db?.telemedicineSession?.findUnique) {
      const record = await this.db.telemedicineSession.findUnique({
        where: { id: sessionId },
      });
      return record as TelemedicineSession | null;
    }
    return this.memory.get(sessionId) ?? null;
  }

  /**
   * Get active sessions for a doctor
   */
  async getActiveSessions(doctorId: string): Promise<TelemedicineSession[]> {
    if (this.db?.telemedicineSession?.findMany) {
      const records = await this.db.telemedicineSession.findMany({
        where: { doctorId, status: { in: ['waiting', 'active'] } },
      });
      return records as TelemedicineSession[];
    }
    return Array.from(this.memory.values()).filter(
      (s) => s.doctorId === doctorId && (s.status === 'waiting' || s.status === 'active'),
    );
  }

  /**
   * Generate a join URL for a session (integration point for video provider)
   */
  generateJoinUrl(session: TelemedicineSession, role: 'patient' | 'doctor'): string {
    const baseUrl = process.env['TELEMEDICINE_BASE_URL'] ?? 'https://meet.vayva.io';
    return `${baseUrl}/room/${session.roomId}?role=${role}&token=${session.id}`;
  }
}
