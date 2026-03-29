import { FastifyPluginAsync } from 'fastify';
import { WalletService } from '../services/financial/wallet.service';
import { z } from 'zod';

export const walletRoutes: FastifyPluginAsync = async (fastify) => {
  const walletService = new WalletService();

  // GET /api/wallet/summary - Get wallet balance and status
  fastify.get('/summary', {
    preHandler: [fastify.authenticate],
    schema: {
      response: {
        200: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            data: {
              type: 'object',
              properties: {
                balance: { type: 'number' },
                availableBalance: { type: 'number' },
                pendingKobo: { type: 'number' },
                status: { type: 'string' },
                pinSet: { type: 'boolean' },
                currency: { type: 'string' },
              },
            },
          },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const summary = await walletService.getSummary(storeId);
        
        return reply.send({
          success: true,
          data: summary,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // GET /api/wallet/transactions - Get transaction ledger
  fastify.get('/transactions', {
    preHandler: [fastify.authenticate],
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'number', default: 50 },
          offset: { type: 'number', default: 0 },
        },
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const query = request.query as any;
        
        const transactions = await walletService.getLedger(storeId, {
          limit: query.limit,
          offset: query.offset,
        });
        
        return reply.send({
          success: true,
          data: transactions,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // POST /api/wallet/pin/set - Set wallet PIN
  fastify.post('/pin/set', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          pin: { type: 'string' },
        },
        required: ['pin'],
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const body = request.body as any;
        
        if (!/^\d{6}$/.test(body.pin)) {
          return reply.status(400).send({
            success: false,
            message: 'PIN must be exactly 6 digits',
          });
        }
        
        await walletService.setPin(storeId, body.pin);
        
        return reply.send({
          success: true,
          message: 'PIN set successfully',
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // POST /api/wallet/pin/verify - Verify wallet PIN
  fastify.post('/pin/verify', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          pin: { type: 'string' },
        },
        required: ['pin'],
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const body = request.body as any;
        
        const isValid = await walletService.verifyPin(storeId, body.pin);
        
        return reply.send({
          success: true,
          valid: isValid,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // POST /api/wallet/bank/add - Add bank account
  fastify.post('/bank/add', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          accountNumber: { type: 'string' },
          bankCode: { type: 'string' },
          bankName: { type: 'string' },
          accountName: { type: 'string' },
        },
        required: ['accountNumber', 'bankCode', 'bankName', 'accountName'],
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const body = request.body as any;
        
        const bankAccount = await walletService.addBank(storeId, body);
        
        return reply.send({
          success: true,
          data: bankAccount,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // GET /api/wallet/bank/list - List bank accounts
  fastify.get('/bank/list', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        
        const banks = await walletService.listBanks(storeId);
        
        return reply.send({
          success: true,
          data: banks,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // POST /api/wallet/bank/set-default - Set default bank account
  fastify.post('/bank/set-default', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          bankAccountId: { type: 'string' },
        },
        required: ['bankAccountId'],
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const body = request.body as any;
        
        await walletService.setDefaultBank(storeId, body.bankAccountId);
        
        return reply.send({
          success: true,
          message: 'Default bank account updated',
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // GET /api/wallet/withdraw/eligibility - Check withdrawal eligibility
  fastify.get('/withdraw/eligibility', {
    preHandler: [fastify.authenticate],
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        
        const eligibility = await walletService.getEligibility(storeId);
        
        return reply.send({
          success: true,
          data: eligibility,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // POST /api/wallet/withdraw/quote - Get withdrawal quote with fees
  fastify.post('/withdraw/quote', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          amountKobo: { type: 'number' },
        },
        required: ['amountKobo'],
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const body = request.body as any;
        
        const quote = await walletService.getWithdrawalQuote(storeId, body.amountKobo);
        
        return reply.send({
          success: true,
          data: quote,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // POST /api/wallet/withdraw/initiate - Initiate withdrawal
  fastify.post('/withdraw/initiate', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          amountKobo: { type: 'number' },
          bankAccountId: { type: 'string' },
          idempotencyKey: { type: 'string' },
        },
        required: ['amountKobo', 'bankAccountId'],
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const body = request.body as any;
        
        const result = await walletService.initiateWithdrawal(storeId, {
          amountKobo: body.amountKobo,
          bankAccountId: body.bankAccountId,
          idempotencyKey: body.idempotencyKey,
        });
        
        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });

  // POST /api/wallet/withdraw/confirm - Confirm withdrawal and process via Paystack
  fastify.post('/withdraw/confirm', {
    preHandler: [fastify.authenticate],
    schema: {
      body: {
        type: 'object',
        properties: {
          withdrawalId: { type: 'string' },
          otpCode: { type: 'string' },
        },
        required: ['withdrawalId'],
      },
    },
    handler: async (request, reply) => {
      try {
        const storeId = (request as any).user.storeId;
        const body = request.body as any;
        
        const result = await walletService.confirmWithdrawal(storeId, {
          withdrawalId: body.withdrawalId,
          otpCode: body.otpCode,
        });
        
        return reply.send({
          success: true,
          data: result,
        });
      } catch (error) {
        fastify.log.error(error);
        throw error;
      }
    },
  });
};
