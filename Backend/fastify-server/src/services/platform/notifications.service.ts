import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class NotificationsService {
  constructor(private readonly db = prisma) {}

  async getNotifications(storeId: string, filters: any) {
    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 50, 100);
    const where: any = { storeId };

    if (filters.unreadOnly) {
      where.read = false;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const [notifications, total] = await Promise.all([
      this.db.notification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: (page - 1) * limit,
      }),
      this.db.notification.count({ where }),
    ]);

    return { notifications, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async markAsRead(notificationId: string, storeId: string) {
    const notification = await this.db.notification.findFirst({
      where: { id: notificationId },
      include: { user: true },
    });

    if (!notification || notification.user.storeId !== storeId) {
      throw new Error('Notification not found');
    }

    const updated = await this.db.notification.update({
      where: { id: notificationId },
      data: { read: true, readAt: new Date() },
    });

    logger.info(`[Notifications] Marked notification ${notificationId} as read`);
    return updated;
  }

  async markAllAsRead(storeId: string, userId?: string) {
    const where: any = { 
      user: { storeId },
      read: false,
    };

    if (userId) {
      where.userId = userId;
    }

    const result = await this.db.notification.updateMany({
      where,
      data: {
        read: true,
        readAt: new Date(),
      },
    });

    logger.info(`[Notifications] Marked ${result.count} notifications as read`);
    return { count: result.count };
  }

  async getUnreadCount(storeId: string, userId?: string) {
    const where: any = { 
      user: { storeId },
      read: false,
    };

    if (userId) {
      where.userId = userId;
    }

    const count = await this.db.notification.count({ where });
    return { count };
  }

  async createNotification(notificationData: any) {
    const { userId, type, title, message, metadata } = notificationData;

    const notification = await this.db.notification.create({
      data: {
        id: `notif-${Date.now()}`,
        userId,
        type,
        title,
        message,
        metadata: metadata || {},
        read: false,
      },
      include: { user: true },
    });

    logger.info(`[Notifications] Created notification ${notification.id}`);
    return notification;
  }

  async sendBulkNotification(storeId: string, notificationData: any) {
    const { userIds, type, title, message, metadata } = notificationData;

    const notifications = await this.db.notification.createMany({
      data: userIds.map((userId: string) => ({
        userId,
        type,
        title,
        message,
        metadata: metadata || {},
        read: false,
      })),
    });

    logger.info(`[Notifications] Sent bulk notification to ${notifications.count} users`);
    return { count: notifications.count };
  }

  async deleteOldNotifications(storeId: string, daysOld: number) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.db.notification.deleteMany({
      where: {
        user: { storeId },
        createdAt: { lt: cutoffDate },
        read: true,
      },
    });

    logger.info(`[Notifications] Deleted ${result.count} old notifications`);
    return { count: result.count };
  }
}
