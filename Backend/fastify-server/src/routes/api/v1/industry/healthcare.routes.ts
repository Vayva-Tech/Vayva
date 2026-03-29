import { FastifyPluginAsync } from 'fastify';
import { HealthcareService } from '../../../../services/industry/healthcare.service';

const healthcareService = new HealthcareService();

export const healthcareRoutes: FastifyPluginAsync = async (server) => {
  server.get('/patients', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        limit: query.limit ? parseInt(query.limit, 10) : 50,
        offset: query.offset ? parseInt(query.offset, 10) : 0,
        status: query.status,
        search: query.search,
      };

      const result = await healthcareService.getPatients(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/patients', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const patientData = request.body as any;

      try {
        const patient = await healthcareService.createPatient(storeId, patientData);
        return reply.code(201).send({ success: true, data: patient });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create patient' 
        });
      }
    },
  });

  server.get('/patients/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      const patient = await healthcareService.getPatientById(id, storeId);
      
      if (!patient) {
        return reply.code(404).send({ success: false, error: 'Patient not found' });
      }

      return reply.send({ success: true, data: patient });
    },
  });

  server.put('/patients/:id', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const updates = request.body as any;

      try {
        const patient = await healthcareService.updatePatient(id, storeId, updates);
        return reply.send({ success: true, data: patient });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to update patient' 
        });
      }
    },
  });

  server.get('/patients/:id/history', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      const records = await healthcareService.getPatientHistory(id, storeId);
      return reply.send({ success: true, data: records });
    },
  });

  server.get('/patients/:id/consent', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      const consents = await healthcareService.getConsentForms(id, storeId);
      return reply.send({ success: true, data: consents });
    },
  });

  server.get('/appointments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const query = request.query as any;

      const filters = {
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
        date: query.date,
        status: query.status,
        patientId: query.patientId,
        providerId: query.providerId,
      };

      const result = await healthcareService.getAppointments(storeId, filters);
      return reply.send({ success: true, data: result });
    },
  });

  server.post('/appointments', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const appointmentData = request.body as any;

      try {
        const appointment = await healthcareService.createAppointment(storeId, appointmentData);
        return reply.code(201).send({ success: true, data: appointment });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create appointment' 
        });
      }
    },
  });

  server.post('/appointments/:id/checkin', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;

      try {
        const appointment = await healthcareService.checkinAppointment(id, storeId);
        return reply.send({ success: true, data: appointment });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to check in' 
        });
      }
    },
  });

  server.post('/appointments/:id/cancel', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const { id } = request.params as any;
      const { reason } = request.body as any;

      try {
        const appointment = await healthcareService.cancelAppointment(id, storeId, reason);
        return reply.send({ success: true, data: appointment });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to cancel appointment' 
        });
      }
    },
  });

  server.get('/labs', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const labs = await healthcareService.getLabs(storeId);
      return reply.send({ success: true, data: labs });
    },
  });

  server.post('/labs', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const labData = request.body as any;

      try {
        const lab = await healthcareService.createLab(storeId, labData);
        return reply.code(201).send({ success: true, data: lab });
      } catch (error) {
        return reply.code(400).send({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to create lab' 
        });
      }
    },
  });

  server.get('/dashboard', {
    preHandler: [server.authenticate],
    handler: async (request, reply) => {
      const storeId = (request.user as any).storeId;
      const stats = await healthcareService.getHealthcareStats(storeId);
      return reply.send({ success: true, data: stats });
    },
  });
};
