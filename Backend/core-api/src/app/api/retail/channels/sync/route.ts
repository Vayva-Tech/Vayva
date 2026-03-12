import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/retail/channels/sync
 * Manually trigger channel sync
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { channelId } = body;

    if (!channelId) {
      return NextResponse.json(
        { error: 'Channel ID required' },
        { status: 400 }
      );
    }

    // Get the channel
    const channel = await prisma.salesChannel.findUnique({
      where: { id: channelId, businessId: session.user.id },
    });

    if (!channel) {
      return NextResponse.json(
        { error: 'Channel not found' },
        { status: 404 }
      );
    }

    // Update sync status
    const updatedChannel = await prisma.salesChannel.update({
      where: { id: channelId },
      data: {
        lastSyncAttempt: new Date(),
        syncStatus: 'syncing',
      },
    });

    // In a real implementation, this would trigger a background job
    // For now, we'll simulate success after a delay
    setTimeout(async () => {
      await prisma.salesChannel.update({
        where: { id: channelId },
        data: {
          syncStatus: 'synced',
          lastSuccessfulSync: new Date(),
        },
      });
    }, 2000);

    return NextResponse.json({
      success: true,
      data: {
        channelId: updatedChannel.id,
        channelName: updatedChannel.name,
        syncStarted: new Date(),
        estimatedCompletion: new Date(Date.now() + 2000),
      },
      message: 'Channel sync initiated',
    });
  } catch (error) {
    console.error('Channel sync error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate channel sync' },
      { status: 500 }
    );
  }
}
