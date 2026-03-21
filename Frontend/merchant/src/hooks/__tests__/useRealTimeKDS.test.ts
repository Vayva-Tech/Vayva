import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealTimeKDS } from '@/hooks/useRealTimeKDS';

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher, config) => ({
    data: key?.includes('tickets') ? { 
      data: [
        {
          id: 'ticket_1',
          ticketNumber: 'TKT-001',
          orderId: 'order_123',
          type: 'dine-in',
          tableNumber: '5',
          serverName: 'John Doe',
          status: 'cooking',
          stationId: 'grill',
          priority: 'normal',
          timerSeconds: 420,
          targetTime: new Date(Date.now() + 600000),
          createdAt: new Date(Date.now() - 420000),
          items: [
            {
              id: 'item_1',
              name: 'Grilled Salmon',
              quantity: 1,
              status: 'cooking',
              station: 'grill',
              modifiers: [{ name: 'Temperature', value: 'Medium' }],
            },
          ],
        },
      ]
    } : { 
      stations: [
        {
          id: 'grill',
          name: 'Grill Station',
          type: 'grill',
          isActive: true,
          queueLength: 3,
          avgCookTime: 12.5,
          efficiency: 95,
          tickets: [],
        },
      ]
    },
    error: null,
    isLoading: false,
    mutate: vi.fn(),
  })),
}));

describe('useRealTimeKDS Hook', () => {
  it('should return tickets and stations', async () => {
    const { result } = renderHook(() => useRealTimeKDS());

    // Wait for hook to initialize
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(result.current.tickets).toHaveLength(1);
    expect(result.current.stations).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should provide action functions', () => {
    const { result } = renderHook(() => useRealTimeKDS());

    expect(result.current.updateTicketStatus).toBeDefined();
    expect(result.current.bumpTicket).toBeDefined();
    expect(result.current.markItemComplete).toBeDefined();
    expect(result.current.voidTicket).toBeDefined();
  });

  it('should filter tickets by status', async () => {
    const { result } = renderHook(() => useRealTimeKDS());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const cookingTickets = result.current.tickets.filter(
      t => t.status === 'cooking'
    );

    expect(cookingTickets).toHaveLength(1);
    expect(cookingTickets[0].status).toBe('cooking');
  });

  it('should calculate ticket urgency', async () => {
    const { result } = renderHook(() => useRealTimeKDS());

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    const ticket = result.current.tickets[0];
    
    // Ticket created 7 minutes ago, should be normal urgency
    expect(ticket.timerSeconds).toBeGreaterThan(0);
    expect(ticket.priority).toBe('normal');
  });
});
