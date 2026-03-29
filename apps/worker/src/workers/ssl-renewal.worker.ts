/**
 * SSL Renewal Worker
 * 
 * Automatically renews SSL certificates for custom domains:
 * - Checks daily for certificates expiring within 30 days
 * - Auto-renews eligible certificates
 * - Sends notifications for successful/failed renewals
 * - Monitors domain health
 */

import { prisma } from '@vayva/db';
import { logger } from '../lib/logger';
import { DomainsService } from './services/platform/domains.service';
import { NotificationsService } from './services/platform/notifications.service';

const domainsService = new DomainsService();
const notificationService = new NotificationsService();

interface WorkerMetrics {
  processedAt: Date;
  domainsChecked: number;
  certificatesRenewed: number;
  renewalsFailed: number;
  notificationsSent: number;
}

/**
 * Main worker function - runs daily
 */
export async function processSSLRenewals(): Promise<WorkerMetrics> {
  const metrics: WorkerMetrics = {
    processedAt: new Date(),
    domainsChecked: 0,
    certificatesRenewed: 0,
    renewalsFailed: 0,
    notificationsSent: 0,
  };

  try {
    logger.info('[SSLWorker] Starting SSL certificate renewal processing');

    // Get all verified domains with SSL
    const domains = await prisma.domain.findMany({
      where: {
        status: 'verified',
        sslStatus: 'active',
        sslExpiresAt: {
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expiring within 30 days
        },
      },
      include: {
        store: {
          include: {
            user: true,
          },
        },
      },
    });

    metrics.domainsChecked = domains.length;
    logger.info(`[SSLWorker] Found ${domains.length} domains needing renewal`);

    for (const domain of domains) {
      try {
        const daysUntilExpiry = domain.sslExpiresAt
          ? Math.round((domain.sslExpiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
          : 0;

        logger.info(
          `[SSLWorker] Processing ${domain.domainName} - expires in ${daysUntilExpiry} days`
        );

        // Attempt renewal
        const result = await domainsService.renewSSLCertificate(domain.id, domain.storeId);

        if (result.success) {
          metrics.certificatesRenewed++;
          logger.info(`[SSLWorker] Successfully renewed ${domain.domainName}`);

          // Send success notification
          await notificationService.createNotification({
            userId: domain.store.userId,
            type: 'domain_ssl',
            title: 'SSL Certificate Renewed',
            message: `Your SSL certificate for ${domain.domainName} has been successfully renewed.`,
            metadata: {
              domainId: domain.id,
              domainName: domain.domainName,
              action: 'renewed',
            },
          });

          metrics.notificationsSent++;
        } else {
          metrics.renewalsFailed++;
          logger.warn(`[SSLWorker] Failed to renew ${domain.domainName}: ${result.message}`);

          // Send warning notification
          await notificationService.createNotification({
            userId: domain.store.userId,
            type: 'domain_ssl',
            title: 'SSL Certificate Renewal Failed',
            message: `Failed to renew SSL certificate for ${domain.domainName}. Please contact support.`,
            metadata: {
              domainId: domain.id,
              domainName: domain.domainName,
              action: 'failed',
            },
          });

          metrics.notificationsSent++;
        }
      } catch (error) {
        metrics.renewalsFailed++;
        logger.error(`[SSLWorker] Error renewing ${domain.domainName}`, error);

        // Send error notification
        try {
          await notificationService.createNotification({
            userId: domain.store.userId,
            type: 'domain_ssl',
            title: 'SSL Certificate Error',
            message: `An error occurred while processing SSL certificate for ${domain.domainName}.`,
            metadata: {
              domainId: domain.id,
              domainName: domain.domainName,
              action: 'error',
            },
          });
          metrics.notificationsSent++;
        } catch (notifError) {
          logger.error(`[SSLWorker] Failed to send notification`, notifError);
        }
      }
    }

    logger.info(
      `[SSLWorker] Processing complete. ` +
        `Checked: ${metrics.domainsChecked}, ` +
        `Renewed: ${metrics.certificatesRenewed}, ` +
        `Failed: ${metrics.renewalsFailed}`
    );

    return metrics;
  } catch (error) {
    logger.error('[SSLWorker] Critical error during processing', error);
    throw error;
  }
}

/**
 * Check domain health for all verified domains
 */
export async function checkDomainHealth(): Promise<{ checked: number; healthy: number; unhealthy: number }> {
  try {
    logger.info('[SSLWorker] Starting domain health checks');

    const domains = await prisma.domain.findMany({
      where: {
        status: 'verified',
      },
    });

    let healthy = 0;
    let unhealthy = 0;

    for (const domain of domains) {
      try {
        const result = await domainsService.checkDomainHealth(domain.id, domain.storeId);
        
        if (result.healthy) {
          healthy++;
        } else {
          unhealthy++;
          
          // Notify about unhealthy domain
          const domainWithStore = await prisma.domain.findFirst({
            where: { id: domain.id },
            include: { store: { include: { user: true } } },
          });

          if (domainWithStore) {
            await notificationService.createNotification({
              userId: domainWithStore.store.userId,
              type: 'domain_health',
              title: 'Domain Health Check Failed',
              message: `Your domain ${domain.domainName} failed health checks. Please check your DNS and SSL configuration.`,
              metadata: {
                domainId: domain.id,
                domainName: domain.domainName,
                checks: result.checks,
              },
            });
          }
        }
      } catch (error) {
        unhealthy++;
        logger.error(`[SSLWorker] Health check failed for ${domain.domainName}`, error);
      }
    }

    logger.info(`[SSLWorker] Health check complete: ${healthy} healthy, ${unhealthy} unhealthy`);

    return { checked: domains.length, healthy, unhealthy };
  } catch (error) {
    logger.error('[SSLWorker] Error during health check', error);
    return { checked: 0, healthy: 0, unhealthy: 0 };
  }
}

// Export for use in worker scheduler
if (process.env.WORKER_MODE === 'ssl') {
  logger.info('[SSLWorker] Starting in standalone mode');
  
  // Run immediately if in standalone mode
  Promise.all([
    processSSLRenewals(),
    checkDomainHealth(),
  ]).catch((error) => {
    logger.error('[SSLWorker] Fatal error', error);
    process.exit(1);
  });
}
