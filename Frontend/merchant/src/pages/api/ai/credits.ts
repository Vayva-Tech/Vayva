// @ts-nocheck
/**
 * AI Credit Management API Routes
 * =================================
 * Endpoints for merchants to manage their AI credits
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@vayva/db';
import { AICreditService } from '@/lib/ai/credit-service';
import { logger } from '@/lib/logger';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession({ req, ...authOptions });

  if (!session?.user?.storeId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const storeId = session.user.storeId;

  try {
    switch (req.method) {
      case 'GET':
        return handleGetCredits(req, res, storeId);
      
      case 'POST':
        return handleTopUpCredits(req, res, storeId);
      
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
  } catch (error) {
    logger.error('[AI Credits API] Error handling request', { error });
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * GET /api/ai/credits
 * Get current credit balance and usage summary
 */
async function handleGetCredits(
  req: NextApiRequest,
  res: NextApiResponse,
  storeId: string
) {
  const summary = await AICreditService.getCreditSummary(storeId);
  
  // Check if low credit alert should be shown
  const alertInfo = await AICreditService.checkLowCreditAlert(storeId);

  return res.status(200).json({
    success: true,
    data: {
      ...summary,
      showAlert: alertInfo.showAlert,
      lastTopupAt: null, // Will be populated from subscription
    },
  });
}

/**
 * POST /api/ai/credits/topup
 * Purchase additional credits
 */
async function handleTopUpCredits(
  req: NextApiRequest,
  res: NextApiResponse,
  storeId: string
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { creditsAmount, paymentReference } = req.body;

  // Validate input
  if (!creditsAmount || creditsAmount <= 0) {
    return res.status(400).json({ error: 'Invalid credits amount' });
  }

  // For now, we'll simulate a successful top-up
  // In production, this would verify payment with Paystack/Stripe first
  
  const transactionId = paymentReference || `topup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const result = await AICreditService.addCredits(
      storeId,
      creditsAmount,
      transactionId
    );

    return res.status(200).json({
      success: true,
      message: `Successfully added ${creditsAmount} credits`,
      data: result,
    });
  } catch (error) {
    logger.error('[AI Credits API] Top-up failed', { 
      storeId, 
      creditsAmount, 
      error 
    });
    
    return res.status(500).json({
      success: false,
      error: 'Failed to process top-up',
    });
  }
}
