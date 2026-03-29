import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class SupportService {
  constructor(private readonly db = prisma) {}

  async getConversations(storeId: string) {
    const conversations = await this.db.supportConversation.findMany({
      where: { storeId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return conversations.map((c) => ({
      id: c.id,
      subject: c.subject,
      status: c.status,
      priority: c.priority,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      lastMessage: c.messages[0],
      assignedTo: c.assignedTo
        ? `${c.assignedTo.firstName} ${c.assignedTo.lastName}`
        : null,
    }));
  }

  async getConversationById(conversationId: string, storeId: string) {
    const conversation = await this.db.supportConversation.findFirst({
      where: { id: conversationId, storeId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    return {
      ...conversation,
      assignedTo: conversation.assignedTo
        ? `${conversation.assignedTo.firstName} ${conversation.assignedTo.lastName}`
        : null,
    };
  }

  async createConversation(storeId: string, userId: string, data: any) {
    const conversation = await this.db.supportConversation.create({
      data: {
        storeId,
        userId,
        subject: data.subject,
        message: data.message,
        priority: data.priority || 'medium',
        status: 'open',
      },
    });

    logger.info(`[Support] Created conversation ${conversation.id}`);
    return conversation;
  }

  async sendMessage(conversationId: string, userId: string, message: string, isInternal: boolean) {
    const supportMessage = await this.db.supportMessage.create({
      data: {
        conversationId,
        userId,
        message,
        isInternal,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    await this.db.supportConversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
        lastMessageAt: new Date(),
      },
    });

    logger.info(`[Support] Message sent in conversation ${conversationId}`);
    return {
      ...supportMessage,
      senderName: supportMessage.user
        ? `${supportMessage.user.firstName} ${supportMessage.user.lastName}`
        : isInternal
          ? 'Support Team'
          : 'User',
    };
  }
}
