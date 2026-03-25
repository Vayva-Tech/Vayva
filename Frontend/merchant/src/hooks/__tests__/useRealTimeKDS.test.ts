import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRealTimeKDS } from '@/hooks/useRealTimeKDS';

// jsdom + Node fetch require absolute URLs; stub fetch for hook bootstrapping
function mockFetchForKds() {
  return vi.fn(async (input: RequestInfo | URL, _init?: RequestInit) => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof Request
          ? input.url
          : String(input);
    if (url.includes('/api/merchant/me')) {
      return new Response(JSON.stringify({ storeId: 'test-store-id' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

// Avoid real WebSocket + reconnect timers in jsdom
class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;
  readyState = MockWebSocket.OPEN;
  onopen: ((ev: Event) => void) | null = null;
  onmessage: ((ev: MessageEvent) => void) | null = null;
  onclose: ((ev: CloseEvent) => void) | null = null;
  onerror: ((ev: Event) => void) | null = null;
  constructor() {
    queueMicrotask(() => this.onopen?.(new Event('open')));
  }
  close() {}
  send() {}
  addEventListener() {}
  removeEventListener() {}
}

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key, _fetcher, _config) => ({
    data: key?.includes('tickets')
      ? {
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
          ],
        }
      : {
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
          ],
        },
    error: null,
    isLoading: false,
    mutate: vi.fn(),
  })),
}));

describe('useRealTimeKDS Hook', () => {
  const OriginalWebSocket = globalThis.WebSocket;

  beforeAll(() => {
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket);
  });

  afterAll(() => {
    vi.stubGlobal('WebSocket', OriginalWebSocket);
  });

  beforeEach(() => {
    vi.stubGlobal('fetch', mockFetchForKds());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.stubGlobal('WebSocket', MockWebSocket as unknown as typeof WebSocket);
  });

  it('should return tickets and stations', async () => {
    const { result } = renderHook(() => useRealTimeKDS());

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    expect(result.current.tickets).toHaveLength(1);
    expect(result.current.stations).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should provide action functions', async () => {
    const { result } = renderHook(() => useRealTimeKDS());

    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.updateTicketStatus).toBeDefined();
    expect(result.current.bumpTicket).toBeDefined();
    expect(result.current.markItemComplete).toBeDefined();
    expect(result.current.voidTicket).toBeDefined();
  });

  it('should filter tickets by status', async () => {
    const { result } = renderHook(() => useRealTimeKDS());

    await act(async () => {
      await Promise.resolve();
    });

    const cookingTickets = result.current.tickets.filter((t) => t.status === 'cooking');

    expect(cookingTickets).toHaveLength(1);
    expect(cookingTickets[0].status).toBe('cooking');
  });

  it('should calculate ticket urgency', async () => {
    const { result } = renderHook(() => useRealTimeKDS());

    await act(async () => {
      await Promise.resolve();
    });

    const ticket = result.current.tickets[0];

    expect(ticket.timerSeconds).toBeGreaterThan(0);
    expect(ticket.priority).toBe('normal');
  });
});
