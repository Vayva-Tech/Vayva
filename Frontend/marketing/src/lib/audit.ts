export interface AuditLog {
  id: string;
  action: string;
  actorId: string;
  targetId: string;
  createdAt: Date;
}

export async function logAudit(data: Omit<AuditLog, 'id' | 'createdAt'>) {
  console.log('Audit log:', data);
}

export const audit = {
  log: logAudit,
};