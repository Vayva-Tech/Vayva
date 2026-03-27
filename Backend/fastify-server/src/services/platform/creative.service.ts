import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class CreativeService {
  constructor(private readonly db = prisma) {}

  async getProjects(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.priority) where.priority = filters.priority;
    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [projects, total] = await Promise.all([
      this.db.creativeProject.findMany({
        where,
        include: {
          client: true,
          tasks: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.db.creativeProject.count({ where }),
    ]);

    return { projects, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createProject(storeId: string, projectData: any) {
    const {
      name,
      description,
      clientId,
      categoryId,
      startDate,
      endDate,
      budget,
      priority,
      projectManagerId,
      teamMembers,
      tags,
      objectives,
      deliverables,
    } = projectData;

    const project = await this.db.creativeProject.create({
      data: {
        id: `proj-${Date.now()}`,
        storeId,
        name,
        description: description || null,
        clientId,
        categoryId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        budget: budget || 0,
        priority: priority || 'medium',
        status: 'planning',
        projectManagerId: projectManagerId || null,
        teamMembers: teamMembers || [],
        tags: tags || [],
        objectives: objectives || [],
        deliverables: deliverables || [],
      },
    });

    logger.info(`[Creative] Created project ${project.id}`);
    return project;
  }

  async getClients(storeId: string) {
    const clients = await this.db.creativeClient.findMany({
      where: { storeId, active: true },
      include: {
        _count: {
          select: { projects: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    return clients;
  }

  async createClient(storeId: string, clientData: any) {
    const { name, contactEmail, contactPhone, company, website, notes } = clientData;

    const client = await this.db.creativeClient.create({
      data: {
        id: `client-${Date.now()}`,
        storeId,
        name,
        contactEmail,
        contactPhone: contactPhone || null,
        company: company || null,
        website: website || null,
        active: true,
        notes: notes || null,
      },
    });

    logger.info(`[Creative] Created client ${client.id}`);
    return client;
  }

  async getTasks(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { storeId };

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.status) where.status = filters.status;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;

    const [tasks, total] = await Promise.all([
      this.db.creativeTask.findMany({
        where,
        include: {
          project: true,
          assignee: true,
        },
        orderBy: { dueDate: 'asc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.creativeTask.count({ where }),
    ]);

    return { tasks, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async createTask(storeId: string, taskData: any) {
    const {
      projectId,
      title,
      description,
      assigneeId,
      dueDate,
      priority,
      estimatedHours,
    } = taskData;

    const task = await this.db.creativeTask.create({
      data: {
        id: `task-${Date.now()}`,
        storeId,
        projectId,
        title,
        description: description || null,
        assigneeId: assigneeId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || 'medium',
        status: 'todo',
        estimatedHours: estimatedHours || 0,
        actualHours: 0,
      },
    });

    logger.info(`[Creative] Created task ${task.id}`);
    return task;
  }

  async updateTaskStatus(taskId: string, storeId: string, status: string) {
    const task = await this.db.creativeTask.findFirst({
      where: { id: taskId, storeId },
    });

    if (!task) {
      throw new Error('Task not found');
    }

    const updated = await this.db.creativeTask.update({
      where: { id: taskId },
      data: {
        status,
        ...(status === 'completed' ? { completedAt: new Date() } : {}),
      },
    });

    logger.info(`[Creative] Updated task ${taskId} status to ${status}`);
    return updated;
  }

  async getTimesheets(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.taskId) where.taskId = filters.taskId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.fromDate || filters.toDate) {
      where.date = {};
      if (filters.fromDate) where.date.gte = filters.fromDate;
      if (filters.toDate) where.date.lte = filters.toDate;
    }

    const [timesheets, total] = await Promise.all([
      this.db.creativeTimesheet.findMany({
        where,
        include: {
          task: {
            include: { project: true },
          },
          user: true,
        },
        orderBy: { date: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.creativeTimesheet.count({ where }),
    ]);

    return { timesheets, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async approveTimesheet(timesheetId: string, storeId: string) {
    const timesheet = await this.db.creativeTimesheet.findFirst({
      where: { id: timesheetId },
      include: { task: { include: { project: true } } },
    });

    if (!timesheet || timesheet.task.project.storeId !== storeId) {
      throw new Error('Timesheet not found');
    }

    const updated = await this.db.creativeTimesheet.update({
      where: { id: timesheetId },
      data: {
        status: 'approved',
        approvedAt: new Date(),
      },
    });

    logger.info(`[Creative] Approved timesheet ${timesheetId}`);
    return updated;
  }

  async getInvoices(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const where: any = { storeId };

    if (filters.clientId) where.clientId = filters.clientId;
    if (filters.status) where.status = filters.status;

    const [invoices, total] = await Promise.all([
      this.db.creativeInvoice.findMany({
        where,
        include: {
          client: true,
          project: true,
        },
        orderBy: { dueDate: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.creativeInvoice.count({ where }),
    ]);

    return { invoices, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getAssets(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { storeId };

    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.type) where.assetType = filters.type;

    const [assets, total] = await Promise.all([
      this.db.creativeAsset.findMany({
        where,
        include: { project: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.creativeAsset.count({ where }),
    ]);

    return { assets, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async getCreativeStats(storeId: string) {
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      pendingTasks,
      totalRevenue,
    ] = await Promise.all([
      this.db.creativeProject.count({ where: { storeId } }),
      this.db.creativeProject.count({ where: { storeId, status: 'active' } }),
      this.db.creativeProject.count({ where: { storeId, status: 'completed' } }),
      this.db.creativeTask.count({ where: { project: { storeId } } }),
      this.db.creativeTask.count({
        where: { project: { storeId }, status: { in: ['todo', 'in_progress'] } },
      }),
      this.db.creativeInvoice.aggregate({
        where: { project: { storeId } },
        _sum: { amount: true },
      }),
    ]);

    return {
      projects: {
        total: totalProjects,
        active: activeProjects,
        completed: completedProjects,
      },
      tasks: {
        total: totalTasks,
        pending: pendingTasks,
      },
      revenue: { total: totalRevenue._sum.amount || 0 },
    };
  }
}
