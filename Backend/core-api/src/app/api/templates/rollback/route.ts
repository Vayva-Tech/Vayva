import { NextRequest } from 'next/server';
import { prisma } from '@vayva/prisma';
import { getSessionUser } from '@/lib/session.server';

export async function POST(_request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Find most recent backup
    const backup = await prisma.storeBackup.findFirst({
      where: {
        merchantId: user.merchantId,
        storeId: user.storeId,
        backupType: 'PRE_TEMPLATE_APPLY',
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!backup) {
      return new Response(
        JSON.stringify({ error: 'No backup found to rollback to', success: false }),
        { status: 404 }
      );
    }

    // Restore from backup
    await prisma.store.update({
      where: { id: user.storeId },
      data: {
        layout: backup.configuration.layout,
        theme: backup.configuration.theme,
        widgets: backup.configuration.widgets,
        industrySlug: backup.configuration.industrySlug,
        publishedAt: null, // Mark as needing review
      },
    });

    // Log rollback
    await prisma.auditLog.create({
      data: {
        merchantId: user.merchantId,
        userId: user.id,
        action: 'TEMPLATE_ROLLED_BACK',
        details: {
          backupId: backup.id,
          backupCreatedAt: backup.createdAt,
          reason: 'User requested rollback',
        },
      },
    });

    // Optionally delete the backup after successful rollback
    // await prisma.storeBackup.delete({ where: { id: backup.id } });

    return new Response(JSON.stringify({
      success: true,
      message: 'Template rolled back successfully',
    }));

  } catch (error) {
    console.error('[TEMPLATE] Rollback failed:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to rollback template', success: false }),
      { status: 500 }
    );
  }
}
