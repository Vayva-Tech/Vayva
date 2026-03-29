import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class RescueService {
  constructor(private readonly db = prisma) {}

  async getIncident(incidentId: string, storeId: string) {
    const incident = await this.db.rescueIncident.findFirst({
      where: { id: incidentId, storeId },
      include: {
        reporter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        assignedTeam: {
          select: {
            id: true,
            name: true,
          },
        },
        updates: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!incident) {
      throw new Error('Incident not found');
    }

    return {
      ...incident,
      reporter: incident.reporter
        ? `${incident.reporter.firstName} ${incident.reporter.lastName}`
        : null,
      assignedTeam: incident.assignedTeam?.name,
    };
  }
}
