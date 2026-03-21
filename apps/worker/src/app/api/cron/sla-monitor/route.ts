/**
 * DAILY SLA MONITOR CRON JOB
 * 
 * Runs every business day at 9:00 AM WAT (West Africa Time)
 * Checks for accessibility SLA breaches and sends notifications
 * 
 * Deployed via GitHub Actions scheduled workflow or Vercel Cron
 */

import { checkSLABreaches } from './sla-monitor';

export async function POST() {
  try {
    console.log('[Cron Job] Starting daily SLA breach check...');
    
    await checkSLABreaches();
    
    console.log('[Cron Job] SLA breach check completed successfully');
    
    return new Response(
      JSON.stringify({ success: true, message: 'SLA breach check completed' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('[Cron Job] SLA breach check failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500 }
    );
  }
}

// For local testing
if (process.env.NODE_ENV === 'development') {
  // Run immediately in dev mode
  checkSLABreaches().catch(console.error);
}
