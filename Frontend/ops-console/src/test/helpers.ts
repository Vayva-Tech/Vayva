import { vi } from "vitest";
import { NextRequest } from "next/server";

/**
 * Creates a mock Next.js API request for testing
 */
export function createMockRequest(
  url: string,
  options: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): NextRequest {
  const { method = "GET", body, headers = {} } = options;
  
  const request = new Request(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  }) as NextRequest;

  // Add nextUrl property
  Object.defineProperty(request, "nextUrl", {
    value: new URL(url, "http://localhost:3002"),
    writable: true,
  });

  return request;
}

/**
 * Extracts JSON body from a NextResponse
 */
export async function getResponseJson(response: Response): Promise<unknown> {
  return response.json();
}

/**
 * Creates mock Prisma client for testing
 */
type MockModel = Record<string, ReturnType<typeof vi.fn>>;

interface PrismaOverrides {
  store?: MockModel;
  order?: MockModel;
  opsUser?: MockModel;
  kycRecord?: MockModel;
  dispute?: MockModel;
  opsAuditEvent?: MockModel;
  shipment?: MockModel;
  opsSession?: MockModel;
  impersonationSession?: MockModel;
  webhookEvent?: MockModel;
  supportTicket?: MockModel;
  ledger?: MockModel;
  disputeTimelineEvent?: MockModel;
  $transaction?: ReturnType<typeof vi.fn>;
}

type MockPrisma = PrismaOverrides & {
  store: MockModel;
  order: MockModel;
  opsUser: MockModel;
  kycRecord: MockModel;
  dispute: MockModel;
  opsAuditEvent: MockModel;
  shipment: MockModel;
  opsSession: MockModel;
  impersonationSession: MockModel;
  webhookEvent: MockModel;
  supportTicket: MockModel;
  ledger: MockModel;
  disputeTimelineEvent: MockModel;
  $transaction: ReturnType<typeof vi.fn>;
};

export function createMockPrisma(
  overrides: PrismaOverrides = {}
): MockPrisma {
  return {
    // Store/merchant models
    store: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      update: vi.fn().mockResolvedValue({}),
      ...(overrides.store ?? {}),
    },
    
    // Order models
    order: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      aggregate: vi.fn().mockResolvedValue({ _sum: { total: 0 } }),
      ...(overrides.order ?? {}),
    },
    
    // User models
    opsUser: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({}),
      update: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      ...(overrides.opsUser ?? {}),
    },
    
    // KYC models
    kycRecord: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      update: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 0 }),
      ...(overrides.kycRecord ?? {}),
    },
    
    // Dispute models
    dispute: {
      findMany: vi.fn().mockResolvedValue([]),
      findUnique: vi.fn().mockResolvedValue(null),
      count: vi.fn().mockResolvedValue(0),
      update: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockResolvedValue({}),
      ...(overrides.dispute ?? {}),
    },
    
    // Audit/event models
    opsAuditEvent: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      create: vi.fn().mockResolvedValue({}),
      createMany: vi.fn().mockResolvedValue({ count: 0 }),
      ...(overrides.opsAuditEvent ?? {}),
    },
    
    // Shipment models
    shipment: {
      findUnique: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockResolvedValue({}),
      ...(overrides.shipment ?? {}),
    },
    
    // Session models
    opsSession: {
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      ...(overrides.opsSession ?? {}),
    },
    
    // Impersonation models
    impersonationSession: {
      findMany: vi.fn().mockResolvedValue([]),
      findFirst: vi.fn().mockResolvedValue(null),
      create: vi.fn().mockResolvedValue({}),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
      ...(overrides.impersonationSession ?? {}),
    },
    
    // Webhook models
    webhookEvent: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      ...(overrides.webhookEvent ?? {}),
    },
    
    // Support models
    supportTicket: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
      ...(overrides.supportTicket ?? {}),
    },
    
    // Ledger models
    ledger: {
      create: vi.fn().mockResolvedValue({}),
      ...(overrides.ledger ?? {}),
    },
    
    // Dispute timeline
    disputeTimelineEvent: {
      create: vi.fn().mockResolvedValue({}),
      ...(overrides.disputeTimelineEvent ?? {}),
    },
    
    // Transaction wrapper
    $transaction: overrides.$transaction ?? vi.fn((callback) => callback({})),
  } as MockPrisma;
}

/**
 * Creates mock authenticated user context
 */
export function createMockUser(
  overrides: Partial<{
    id: string;
    email: string;
    name: string;
    role: string;
    isActive: boolean;
    isMfaEnabled: boolean;
    password: string;
  }> = {}
) {
  return {
    id: "user-123",
    email: "admin@vayva.co",
    name: "Test Admin",
    role: "OPS_ADMIN",
    isActive: true,
    isMfaEnabled: false,
    password: "$2a$12$hashedpassword",
    ...overrides,
  };
}

/**
 * Mock OpsAuthService responses
 */
export function mockOpsAuthService(
  session: ReturnType<typeof createMockUser> | null = null
) {
  return {
    requireSession: vi.fn().mockResolvedValue(
      session ? { user: session } : null
    ),
    getSession: vi.fn().mockResolvedValue(
      session ? { user: session } : null
    ),
    requireRole: vi.fn(),
    logEvent: vi.fn().mockResolvedValue(undefined),
    isRateLimited: vi.fn().mockResolvedValue(false),
    bootstrapOwner: vi.fn().mockResolvedValue(undefined),
    login: vi.fn(),
  };
}
