/**
 * DAILY SLA MONITOR CRON JOB
 * 
 * Runs every day at 9:00 AM WAT
 * Checks for SLA breaches and sends notifications
 */

import { checkSLABreaches } from './sla-monitor';

export const config = {
  schedule: '0 8 * * *', // Every day at 8:00 AM UTC (9:00 AM WAT)
};

export default async function slaMonitorCron() {
  console.log('[Cron] Starting SLA breach monitoring...');
  
  try {
    const result = await checkSLABreaches();
    
    console.log('[Cron] SLA monitoring complete:', {
      warnings: result.warnings,
      breaches: result.breaches,
      totalChecked: result.totalChecked,
    });
    
    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error('[Cron] SLA monitoring failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
