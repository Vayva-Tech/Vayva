/**
 * Social Media Integration API Routes
 * Handles all social platform connections and management
 */

import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

// Helper functions
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

/**
 * GET /api/social-connections
 * Get all social platform connections for the store
 */
export async function GET(_request: NextRequest) {
  return withVayvaAPI(
    PERMISSIONS.INTEGRATIONS_MANAGE,
    async (_req, { storeId }) => {
      try {
        // Get existing connections
        const connections = await prisma.socialConnection.findMany({
          where: { storeId },
          select: {
            id: true,
            platform: true,
            accountName: true,
            status: true,
            createdAt: true,
            lastActive: true,
          },
        });

        // Get connection stats
        const statsPromises = connections.map(async (conn) => {
          const stats = await prisma.socialStat.findFirst({
            where: { 
              storeId,
              platform: conn.platform,
            },
            orderBy: { createdAt: 'desc' },
          });
          
          return {
            platform: conn.platform,
            messages: stats?.messageCount || 0,
            conversions: stats?.conversionCount || 0,
            engagement: stats?.engagementRate || 0,
          };
        });

        const stats = await Promise.all(statsPromises);

        return NextResponse.json({
          success: true,
          data: {
            connections,
            stats,
            summary: {
              totalConnected: connections.filter(c => c.status === 'CONNECTED').length,
              totalPlatforms: connections.length,
            }
          }
        });
      } catch (error: unknown) {
        logger.error("[SOCIAL_CONNECTIONS_GET]", error, { storeId });
        return NextResponse.json(
          { error: "Failed to fetch social connections" },
          { status: 500 }
        );
      }
    }
  );
}

/**
 * POST /api/social-connections
 * Connect a new social platform
 */
export async function POST(_request: NextRequest) {
  return withVayvaAPI(
    PERMISSIONS.INTEGRATIONS_MANAGE,
    async (req, { storeId, user }) => {
      try {
        const parsedBody: unknown = await req.json().catch(() => ({}));
        const body = isRecord(parsedBody) ? parsedBody : {};
        
        const platformId = getString(body.platform);
        const token = getString(body.token);
        const config = isRecord(body.config) ? body.config : {};

        if (!platformId || !token) {
          return NextResponse.json(
            { error: "Platform and token are required" },
            { status: 400 }
          );
        }

        // Validate supported platforms
        const supportedPlatforms = ['telegram', 'discord', 'whatsapp', 'instagram'];
        if (!supportedPlatforms.includes(platformId)) {
          return NextResponse.json(
            { error: `Unsupported platform: ${platformId}` },
            { status: 400 }
          );
        }

        // Validate token format based on platform
        if (platformId === 'telegram' && !/^\d+:[\w-]+$/.test(token)) {
          return NextResponse.json(
            { error: "Invalid Telegram bot token format" },
            { status: 400 }
          );
        }

        if (platformId === 'discord' && !/^[\w.]{50,}$/.test(token)) {
          return NextResponse.json(
            { error: "Invalid Discord bot token format" },
            { status: 400 }
          );
        }

        // Test connection (in real implementation, make actual API calls)
        const connectionTest = await testPlatformConnection(platformId, token);
        if (!connectionTest.success) {
          return NextResponse.json(
            { error: connectionTest.error || "Failed to connect to platform" },
            { status: 400 }
          );
        }

        // Create or update connection record
        const connection = await prisma.socialConnection.upsert({
          where: {
            storeId_platform: {
              storeId,
              platform: platformId,
            }
          },
          create: {
            storeId,
            platform: platformId,
            token: encryptToken(token), // In production, encrypt tokens
            accountName: connectionTest.accountName,
            status: 'CONNECTED',
            config: config,
          },
          update: {
            token: encryptToken(token),
            accountName: connectionTest.accountName,
            status: 'CONNECTED',
            config: config,
            lastActive: new Date(),
          },
        });

        // Log the connection
        logger.info("[SOCIAL_CONNECTION_CREATED]", {
          storeId,
          platform: platformId,
          userId: user.id,
          accountName: connectionTest.accountName,
        });

        return NextResponse.json({
          success: true,
          data: {
            id: connection.id,
            platform: connection.platform,
            accountName: connection.accountName,
            status: connection.status,
            createdAt: connection.createdAt,
          }
        });

      } catch (error: unknown) {
        logger.error("[SOCIAL_CONNECTIONS_POST]", error, { storeId });
        return NextResponse.json(
          { error: "Failed to create social connection" },
          { status: 500 }
        );
      }
    }
  );
}

/**
 * Test platform connection
 * In production, this would make actual API calls to validate tokens
 */
async function testPlatformConnection(platform: string, _token: string): Promise<{
  success: boolean;
  accountName?: string;
  error?: string;
}> {
  // Simulate API calls - in real implementation:
  
  if (platform === 'telegram') {
    // Would call Telegram Bot API: https://api.telegram.org/bot[TOKEN]/getMe
    return {
      success: true,
      accountName: 'Telegram Bot'
    };
  }

  if (platform === 'discord') {
    // Would call Discord API: https://discord.com/api/users/@me
    return {
      success: true,
      accountName: 'Discord Bot'
    };
  }

  return {
    success: false,
    error: 'Unsupported platform'
  };
}

/**
 * Encrypt token for storage
 * In production, use proper encryption
 */
function encryptToken(token: string): string {
  // Placeholder - implement proper encryption
  return Buffer.from(token).toString('base64');
}

/**
 * Decrypt token for use
 * In production, use proper decryption
 */
function _decryptToken(encryptedToken: string): string {
  // Placeholder - implement proper decryption
  return Buffer.from(encryptedToken, 'base64').toString();
}