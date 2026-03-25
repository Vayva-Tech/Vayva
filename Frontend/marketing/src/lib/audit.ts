export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  targetId: string;
  createdAt: Date;
}

export async function logAudit(data: Omit<AuditLog, 'id' | 'createdAt'>) {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console -- stub audit sink; replace with persistence
    console.log("Audit log:", data);
  }
}

export const audit = {
  log: logAudit,
};