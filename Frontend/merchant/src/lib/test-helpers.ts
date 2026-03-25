/**
 * Test Helpers for API Testing
 */

import { Mock } from "vitest";

/**
 * Create a mock Request object
 */
export function createMockRequest(
  method: string,
  url: string,
  body?: Record<string, unknown>,
  params?: Record<string, string>,
  headers: Record<string, string> = {}
): Request {
  const fullUrl = url.startsWith("http") 
    ? url 
    : `http://test${url}`;

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  };

  if (body && ["POST", "PUT", "PATCH"].includes(method)) {
    init.body = JSON.stringify(body);
  }

  const request = new Request(fullUrl, init);

  // Add params to URL for dynamic routes
  if (params) {
    Object.assign(request, { params });
  }

  return request;
}

/**
 * Create a mock Response object
 */
export function createMockResponse(
  status: number,
  data?: Record<string, unknown>,
  headers: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
  });
}

/**
 * Mock Prisma client
 */
export function createMockPrisma() {
  return {
    store: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    order: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    customer: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      count: vi.fn(),
    },
    auditLog: {
      create: vi.fn(),
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
    $transaction: vi.fn((fn) => fn()),
    $queryRaw: vi.fn(),
  };
}

/**
 * Mock Redis client
 */
export function createMockRedis() {
  return {
    get: vi.fn(),
    set: vi.fn(),
    setex: vi.fn(),
    del: vi.fn(),
    incr: vi.fn(),
    expire: vi.fn(),
    keys: vi.fn(),
    pipeline: vi.fn().mockReturnValue({
      set: vi.fn(),
      exec: vi.fn(),
    }),
    ping: vi.fn(),
  };
}

/**
 * Mock logger
 */
export function createMockLogger() {
  return {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  };
}

/**
 * Mock NextAuth session
 */
export function createMockSession(user: {
  id: string;
  email: string;
  storeId: string;
  role: string;
}) {
  return {
    user,
    expires: new Date(Date.now() + 86400000).toISOString(),
  };
}

/**
 * Setup test environment
 */
export function setupTestEnvironment() {
  const mockPrisma = createMockPrisma();
  const mockRedis = createMockRedis();
  const mockLogger = createMockLogger();

  // Mock modules
  vi.mock("@/lib/prisma", () => ({
    prisma: mockPrisma,
  }));

  vi.mock("@/lib/redis", () => ({
    getRedis: () => mockRedis,
  }));

  vi.mock("@vayva/shared", () => ({
    logger: mockLogger,
  }));

  return {
    mockPrisma,
    mockRedis,
    mockLogger,
  };
}

/**
 * Cleanup test environment
 */
export function cleanupTestEnvironment() {
  vi.clearAllMocks();
  vi.resetAllMocks();
}

/**
 * Wait for async operations
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Suppress console output during tests
 */
export function suppressConsole() {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error,
    info: console.info,
  };

  beforeEach(() => {
    console.log = vi.fn();
    console.warn = vi.fn();
    console.error = vi.fn();
    console.info = vi.fn();
  });

  afterEach(() => {
    console.log = originalConsole.log;
    console.warn = originalConsole.warn;
    console.error = originalConsole.error;
    console.info = originalConsole.info;
  });
}
