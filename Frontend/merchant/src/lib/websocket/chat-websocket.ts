// @ts-nocheck
import { Server as SocketIOServer } from "socket.io";
import { logger } from "@/lib/logger";

interface ChatMessage {
  id: string;
  storeId: string;
  customerId?: string;
  senderId: string;
  senderName: string;
  senderType: "customer" | "support";
  message: string;
  timestamp: string;
  status: "sent" | "delivered" | "read";
}

interface ChatRoom {
  id: string;
  storeId: string;
  customerId?: string;
  participants: string[];
  createdAt: string;
}

const activeRooms = new Map<string, ChatRoom>();
const onlineUsers = new Map<string, Set<string>>();

export function setupWebSocket(io: SocketIOServer) {
  io.on("connection", (socket) => {
    logger.info("[WS_CONNECTED]", { socketId: socket.id });

    // Join store room
    socket.on("join_store", (data: { storeId: string; userId: string; userType: "agent" | "customer" }) => {
      const { storeId, userId, userType } = data;
      
      socket.join(`store:${storeId}`);
      
      // Track online users
      if (!onlineUsers.has(storeId)) {
        onlineUsers.set(storeId, new Set());
      }
      onlineUsers.get(storeId)!.add(userId);

      // Create or join chat room
      const roomId = `${storeId}_${userId}`;
      const chatRoom: ChatRoom = {
        id: roomId,
        storeId,
        customerId: userType === "customer" ? userId : undefined,
        participants: [userId],
        createdAt: new Date().toISOString(),
      };

      activeRooms.set(roomId, chatRoom);
      socket.join(`room:${roomId}`);

      logger.info("[WS_JOIN_ROOM]", { roomId, storeId, userId, userType });

      // Notify others in store
      socket.to(`store:${storeId}`).emit("user_online", {
        userId,
        userType,
        timestamp: new Date().toISOString(),
      });

      // Send current online count
      socket.emit("online_count", {
        count: onlineUsers.get(storeId)?.size || 0,
      });
    });

    // Send message
    socket.on("send_message", (data: { 
      roomId: string; 
      storeId: string; 
      message: string; 
      senderId: string; 
      senderName: string;
      senderType: "customer" | "support";
    }) => {
      const { roomId, storeId, message, senderId, senderName, senderType } = data;
      
      const chatMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        storeId,
        customerId: senderType === "customer" ? senderId : undefined,
        senderId,
        senderName,
        senderType,
        message,
        timestamp: new Date().toISOString(),
        status: "sent",
      };

      // Broadcast to room
      io.to(`room:${roomId}`).emit("new_message", chatMessage);

      // Notify support agents of new customer message
      if (senderType === "customer") {
        socket.to(`store:${storeId}`).emit("customer_message", {
          roomId,
          message: chatMessage,
        });
      }

      logger.info("[WS_MESSAGE_SENT]", { roomId, senderId, senderType });
    });

    // Typing indicator
    socket.on("typing_start", (data: { roomId: string; userId: string }) => {
      socket.to(`room:${data.roomId}`).emit("user_typing", {
        userId: data.userId,
        timestamp: new Date().toISOString(),
      });
    });

    socket.on("typing_stop", (data: { roomId: string; userId: string }) => {
      socket.to(`room:${data.roomId}`).emit("user_stopped_typing", {
        userId: data.userId,
      });
    });

    // Read receipts
    socket.on("mark_read", (data: { roomId: string; messageId: string }) => {
      socket.to(`room:${data.roomId}`).emit("message_read", {
        messageId: data.messageId,
        readAt: new Date().toISOString(),
      });
    });

    // Agent actions
    socket.on("agent_action", (data: { 
      roomId: string; 
      action: "assign" | "transfer" | "close"; 
      agentId?: string;
    }) => {
      io.to(`room:${data.roomId}`).emit("agent_action", {
        action: data.action,
        agentId: data.agentId,
        timestamp: new Date().toISOString(),
      });
    });

    // Disconnect
    socket.on("disconnect", () => {
      // Remove from online users
      onlineUsers.forEach((users, storeId) => {
        users.forEach(userId => {
          // In production, would track user-socket mapping
        });
      });

      logger.info("[WS_DISCONNECTED]", { socketId: socket.id });
    });

    // Error handling
    socket.on("error", (error: Error) => {
      logger.error("[WS_ERROR]", error);
    });
  });

  // Periodic cleanup
  setInterval(() => {
    // Cleanup inactive rooms older than 24 hours
    const now = Date.now();
    activeRooms.forEach((room, roomId) => {
      const roomAge = now - new Date(room.createdAt).getTime();
      if (roomAge > 24 * 60 * 60 * 1000) {
        activeRooms.delete(roomId);
      }
    });
  }, 60 * 60 * 1000); // Run every hour

  return io;
}

// Helper functions for HTTP endpoints
export function getOnlineCount(storeId: string): number {
  return onlineUsers.get(storeId)?.size || 0;
}

export function getActiveRooms(storeId: string): number {
  let count = 0;
  activeRooms.forEach(room => {
    if (room.storeId === storeId) count++;
  });
  return count;
}
