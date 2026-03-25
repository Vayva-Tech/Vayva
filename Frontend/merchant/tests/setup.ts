import "@testing-library/jest-dom";
import {
  expect,
  afterEach,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from "vitest";
import { cleanup } from "@testing-library/react";
import React from "react";

const { mockSessionUser } = vi.hoisted(() => ({
  mockSessionUser: {
    id: "user_test_123",
    email: "test@example.com",
    firstName: null as string | null,
    lastName: null as string | null,
    storeId: "store_test_123",
    storeName: "Test Store",
    role: "owner",
    sessionVersion: 0,
  },
}));

vi.mock("@/lib/session.server", () => ({
  requireAuthFromRequest: vi.fn(() => Promise.resolve({ ...mockSessionUser })),
  getSessionUser: vi.fn(),
  requireAuth: vi.fn(),
  clearSession: vi.fn(),
  createSession: vi.fn(),
}));

export { mockSessionUser };

import { requireAuthFromRequest } from "@/lib/session.server";

beforeEach(() => {
  vi.mocked(requireAuthFromRequest).mockImplementation(() =>
    Promise.resolve({ ...mockSessionUser }),
  );
});

// Recharts ResponsiveContainer uses ResizeObserver in jsdom
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock Next.js image
vi.mock("next/image", () => ({
  default: (props: any) => {
    const { src, alt, ...rest } = props;
    // eslint-disable-next-line jsx-a11y/alt-text
    return React.createElement("img", { src, alt, ...rest });
  },
}));

// Mock Next.js link
vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => {
    return React.createElement("a", { href, ...props }, children);
  },
}));

// Suppress console errors/warnings in tests unless explicitly needed
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      (args[0].includes("Warning: ReactDOM.render") ||
        args[0].includes("Not implemented: HTMLFormElement.prototype.submit"))
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("componentWillReceiveProps")
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
