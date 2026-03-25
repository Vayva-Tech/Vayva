import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { prismaDelegates } from '@vayva/db';

interface Client extends WebSocket {
  userId?: string;
  storeId?: string;
}

interface Message {
  type: 'message' | 'typing' | 'presence' | 'channel_update';
  payload: unknown;
}

// Store active connections
const clients: Map<string, Client[]> = new Map();

export function initializeWebSocketServer(wss: WebSocketServer) {
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
    const client = ws as Client;
    const url = new URL(req.url || '', `http://${req.headers.host}`);
    const userId = url.searchParams.get('userId');
    const storeId = url.searchParams.get('storeId');

    if (!userId || !storeId) {
      client.close(4000, 'Missing userId or storeId');
      return;
    }

    // Store user info on connection
    client.userId = userId;
    client.storeId = storeId;

    // Add to clients map
    const key = `${storeId}-${userId}`;
    if (!clients.has(key)) {
      clients.set(key, []);
    }
    clients.get(key)!.push(client);

    console.warn(`User ${userId} connected to store ${storeId}`);

    // Send welcome message
    sendToClient(client, {
      type: 'presence',
      payload: { status: 'connected', userId },
    });

    // Broadcast presence update
    broadcastToStore(storeId, {
      type: 'presence',
      payload: { userId, status: 'online' },
    });

    // Handle incoming messages
    client.on('message', async (data: Buffer) => {
      try {
        const message: Message = JSON.parse(data.toString());
        await handleMessage(client, message);
      } catch (error) {
        console.error('Error processing message:', error);
        sendToClient(client, {
          type: 'message',
          payload: { error: 'Failed to process message' },
        });
      }
    });

    // Handle disconnection
    client.on('close', () => {
      const key = `${storeId}-${userId}`;
      const storeClients = clients.get(key);
      if (storeClients) {
        const index = storeClients.indexOf(client);
        if (index > -1) {
          storeClients.splice(index, 1);
        }
        if (storeClients.length === 0) {
          clients.delete(key);
        }
      }

      console.warn(`User ${userId} disconnected from store ${storeId}`);

      // Broadcast presence update
      broadcastToStore(storeId, {
        type: 'presence',
        payload: { userId, status: 'offline' },
      });
    });

    // Handle errors
    client.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
}

async function handleMessage(client: Client, message: Message) {
  const { type, payload } = message;

  switch (type) {
    case 'message':
      await handleChatMessage(client, payload);
      break;
    case 'typing':
      handleTypingIndicator(client, payload);
      break;
    default:
      console.warn('Unknown message type:', type);
  }
}

async function handleChatMessage(client: Client, payload: unknown) {
  const p = payload as Record<string, unknown>;
  const channelId = p.channelId as string | undefined;
  const text = p.text as string | undefined;
  const attachments = p.attachments as unknown[] | undefined;

  if (!channelId || !text) {
    sendToClient(client, {
      type: 'message',
      payload: { error: 'Channel ID and text are required' },
    });
    return;
  }

  // Save message to database
  const savedMessage = await prismaDelegates.chatMessage.create({
    data: {
      channelId,
      senderId: client.userId!,
      text,
      attachments: attachments || [],
      read: false,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Broadcast message to all channel members
  const channel = await prismaDelegates.chatChannel.findUnique({
    where: { id: channelId },
    include: { members: true },
  });

  if (channel) {
    channel.members.forEach((member: unknown) => {
      const m = member as { userId: string };
      const key = `${client.storeId}-${m.userId}`;
      const memberClients = clients.get(key);
      if (memberClients) {
        memberClients.forEach((mc) => {
          sendToClient(mc, {
            type: 'message',
            payload: {
              id: savedMessage.id,
              channelId,
              senderId: savedMessage.senderId,
              senderName: savedMessage.sender.name,
              text: savedMessage.text,
              timestamp: savedMessage.createdAt,
              attachments: savedMessage.attachments,
              read: false,
            },
          });
        });
      }
    });
  }
}

function handleTypingIndicator(client: Client, payload: unknown) {
  const p = payload as Record<string, unknown>;
  const channelId = p.channelId as string;
  const isTyping = Boolean(p.isTyping);

  // Broadcast typing indicator to channel members
  broadcastToChannel(client.storeId!, channelId, {
    type: 'typing',
    payload: {
      channelId,
      userId: client.userId,
      isTyping,
    },
  });
}

function sendToClient(client: Client, message: Message) {
  if (client.readyState === WebSocket.OPEN) {
    client.send(JSON.stringify(message));
  }
}

function broadcastToStore(storeId: string, message: Message) {
  clients.forEach((storeClients, key) => {
    if (key.startsWith(`${storeId}-`)) {
      storeClients.forEach((client) => {
        sendToClient(client, message);
      });
    }
  });
}

function broadcastToChannel(storeId: string, channelId: string, message: Message) {
  // Get all users in the channel and broadcast to them
  prismaDelegates.channelMember
    .findMany({
      where: { channelId },
      include: { user: true },
    })
    .then((members: unknown[]) => {
      members.forEach((member: unknown) => {
        const m = member as { userId: string };
        const key = `${storeId}-${m.userId}`;
        const memberClients = clients.get(key);
        if (memberClients) {
          memberClients.forEach((client) => {
            sendToClient(client, message);
          });
        }
      });
    })
    .catch((error: unknown) => {
      console.error('Error broadcasting to channel:', error);
    });
}

// Cleanup inactive connections periodically
setInterval(() => {
  clients.forEach((storeClients, key) => {
    storeClients.forEach((client, index) => {
      if (client.readyState !== WebSocket.OPEN) {
        storeClients.splice(index, 1);
      }
    });
    if (storeClients.length === 0) {
      clients.delete(key);
    }
  });
}, 60000); // Run every minute

export { clients };
