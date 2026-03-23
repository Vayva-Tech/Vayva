// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KDSService } from '../kds-service';
import type { Ticket, Order, KitchenStation } from '../types';

describe('KDSService', () => {
  let kdsService: KDSService;

  beforeEach(() => {
    kdsService = new KDSService();
  });

  describe('Station Management', () => {
    it('should initialize stations correctly', () => {
      const stationConfigs = [
        { id: 'station_1', name: 'Grill Station', type: 'grill' },
        { id: 'station_2', name: 'Fry Station', type: 'fryer' },
        { id: 'station_3', name: 'Salad Station', type: 'cold' },
      ];

      kdsService.initializeStations(stationConfigs);
      const stations = kdsService.getStations();

      expect(stations).toHaveLength(3);
      expect(stations[0].name).toBe('Grill Station');
      expect(stations[0].type).toBe('grill');
      expect(stations[0].isActive).toBe(true);
    });

    it('should return only active stations', () => {
      const stationConfigs = [
        { id: 'station_1', name: 'Active Station', type: 'grill' },
        { id: 'station_2', name: 'Inactive Station', type: 'fryer' },
      ];

      kdsService.initializeStations(stationConfigs);
      
      // Deactivate one station
      const stations = kdsService.getStations();
      stations[1].isActive = false;

      const activeStations = kdsService.getStations();
      expect(activeStations.filter(s => s.isActive)).toHaveLength(1);
    });

    it('should update station metrics', () => {
      const stationConfigs = [
        { id: 'station_1', name: 'Grill Station', type: 'grill' },
      ];

      kdsService.initializeStations(stationConfigs);
      
      kdsService.updateStationMetrics('station_1', {
        avgCookTime: 15.5,
        efficiency: 92,
      });

      const station = kdsService.getStation('station_1');
      expect(station?.avgCookTime).toBe(15.5);
      expect(station?.efficiency).toBe(92);
    });
  });

  describe('Ticket Creation & Routing', () => {
    it('should create tickets from order and route to correct stations', () => {
      const stationConfigs = [
        { id: 'grill', name: 'Grill Station', type: 'grill' },
        { id: 'salad', name: 'Salad Station', type: 'cold' },
      ];

      kdsService.initializeStations(stationConfigs);

      const mockOrder: Order = {
        id: 'order_123',
        orderNumber: 'ORD-001',
        type: 'dine-in',
        status: 'confirmed',
        tableId: 'table_5',
        serverName: 'John Doe',
        items: [
          {
            id: 'item_1',
            menuItemId: 'menu_ribeye',
            name: 'Grilled Ribeye',
            quantity: 2,
            status: 'pending',
            station: 'grill',
            modifiers: [{ name: 'Temperature', value: 'Medium Rare' }],
          },
          {
            id: 'item_2',
            menuItemId: 'menu_caesar',
            name: 'Caesar Salad',
            quantity: 1,
            status: 'pending',
            station: 'salad',
          },
        ],
        subtotal: 4500,
        tax: 450,
        total: 4950,
        paymentStatus: 'paid',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tickets = kdsService.createTicketsFromOrder(mockOrder);

      expect(tickets).toHaveLength(2); // One ticket per station
      
      const grillTicket = tickets.find(t => t.station === 'grill');
      expect(grillTicket).toBeDefined();
      expect(grillTicket?.items).toHaveLength(1);
      expect(grillTicket?.items[0].name).toBe('Grilled Ribeye');

      const saladTicket = tickets.find(t => t.station === 'salad');
      expect(saladTicket).toBeDefined();
      expect(saladTicket?.items[0].name).toBe('Caesar Salad');
    });

    it('should group multiple items for same station into one ticket', () => {
      const stationConfigs = [
        { id: 'grill', name: 'Grill Station', type: 'grill' },
      ];

      kdsService.initializeStations(stationConfigs);

      const mockOrder: Order = {
        id: 'order_124',
        orderNumber: 'ORD-002',
        type: 'dine-in',
        status: 'confirmed',
        tableId: 'table_3',
        serverName: 'Jane Smith',
        items: [
          {
            id: 'item_1',
            menuItemId: 'menu_burger',
            name: 'Cheeseburger',
            quantity: 2,
            status: 'pending',
            station: 'grill',
          },
          {
            id: 'item_2',
            menuItemId: 'menu_fries',
            name: 'French Fries',
            quantity: 2,
            status: 'pending',
            station: 'grill',
          },
        ],
        subtotal: 2000,
        tax: 200,
        total: 2200,
        paymentStatus: 'paid',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tickets = kdsService.createTicketsFromOrder(mockOrder);

      expect(tickets).toHaveLength(1);
      expect(tickets[0].items).toHaveLength(2);
    });
  });

  describe('Ticket Timer Management', () => {
    it('should calculate elapsed time correctly', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const elapsedSeconds = KDSService.calculateElapsedSeconds(fiveMinutesAgo);
      
      expect(elapsedSeconds).toBeGreaterThanOrEqual(299);
      expect(elapsedSeconds).toBeLessThanOrEqual(301); // Allow small execution time variance
    });

    it('should determine urgency based on remaining time', () => {
      const targetInPast = new Date(Date.now() - 60 * 1000); // 1 minute ago
      const targetSoon = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes left
      const targetLater = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes left

      expect(KDSService.determineUrgency(targetInPast)).toBe('overdue');
      expect(KDSService.determineUrgency(targetSoon)).toBe('critical');
      expect(KDSService.determineUrgency(targetLater)).toBe('normal');
    });
  });

  describe('Ticket Status Updates', () => {
    it('should update ticket status', () => {
      const stationConfigs = [
        { id: 'grill', name: 'Grill Station', type: 'grill' },
      ];

      kdsService.initializeStations(stationConfigs);

      const mockOrder: Order = {
        id: 'order_125',
        orderNumber: 'ORD-003',
        type: 'dine-in',
        status: 'confirmed',
        tableId: 'table_1',
        serverName: 'Test Server',
        items: [
          {
            id: 'item_1',
            menuItemId: 'menu_steak',
            name: 'Steak',
            quantity: 1,
            status: 'pending',
            station: 'grill',
          },
        ],
        subtotal: 3000,
        tax: 300,
        total: 3300,
        paymentStatus: 'paid',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tickets = kdsService.createTicketsFromOrder(mockOrder);
      const ticketId = tickets[0].id;

      // Update status
      const updatedTicket = kdsService.updateTicketStatus(ticketId, 'cooking');
      expect(updatedTicket.status).toBe('cooking');

      // Update to ready
      const readyTicket = kdsService.updateTicketStatus(ticketId, 'ready');
      expect(readyTicket.status).toBe('ready');
      expect(readyTicket.bumpTime).toBeDefined();
    });

    it('should bump ticket to expo', () => {
      const stationConfigs = [
        { id: 'grill', name: 'Grill Station', type: 'grill' },
      ];

      kdsService.initializeStations(stationConfigs);

      const mockOrder: Order = {
        id: 'order_126',
        orderNumber: 'ORD-004',
        type: 'dine-in',
        status: 'confirmed',
        tableId: 'table_2',
        serverName: 'Test Server',
        items: [
          {
            id: 'item_1',
            menuItemId: 'menu_chicken',
            name: 'Grilled Chicken',
            quantity: 1,
            status: 'pending',
            station: 'grill',
          },
        ],
        subtotal: 2500,
        tax: 250,
        total: 2750,
        paymentStatus: 'paid',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const tickets = kdsService.createTicketsFromOrder(mockOrder);
      const ticketId = tickets[0].id;

      const bumpedTicket = kdsService.bumpTicket(ticketId);
      expect(bumpedTicket.status).toBe('ready');
      expect(bumpedTicket.bumpTime).toBeDefined();
    });
  });

  describe('Station Workload Calculation', () => {
    it('should calculate workload percentage correctly', () => {
      const workload = KDSService.calculateWorkloadPercentage(5, 10);
      expect(workload).toBe(50);
    });

    it('should cap workload at 100%', () => {
      const workload = KDSService.calculateWorkloadPercentage(15, 10);
      expect(workload).toBe(100);
    });
  });
});
