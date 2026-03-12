import { describe, it, expect, vi, beforeEach } from "vitest";
import { RescueGroqClient } from "./rescue-client";

// Mock logger
vi.mock("@/lib/logger", () => ({
  logger: {
    warn: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Simple mock for groq-sdk module - use a class mock instead of factory
const mockCreate = vi.fn();

vi.mock("groq-sdk", () => ({
  Groq: class MockGroq {
    apiKey: string;
    chat = {
      completions: {
        create: (...args: unknown[]) => mockCreate(...args),
      },
    };
    constructor(opts: { apiKey: string }) {
      this.apiKey = opts.apiKey;
    }
  },
}));

describe("RescueGroqClient", () => {
  let client: RescueGroqClient;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.GROQ_API_KEY_RESCUE = "test-key";
    client = new RescueGroqClient();
  });

  it("should redact sensitive patterns in sanitizeInput", () => {
    const input =
      "Email: test@example.com, Phone: +234-803-123-4567, Key: sk-12345678901234567890, JWT: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoyNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const sanitized = client.sanitizeInput(input);

    expect(sanitized).toContain("[REDACTED_EMAIL]");
    expect(sanitized).toContain("[REDACTED_PHONE]");
    expect(sanitized).toContain("[REDACTED_KEY]");
    expect(sanitized).toContain("[REDACTED_JWT]");
    expect(sanitized).not.toContain("test@example.com");
  });

  it("should redact private keys", () => {
    const input =
      "-----BEGIN RSA PRIVATE KEY-----\nMIIEpAIBAAKCAQEA75...\n-----END RSA PRIVATE KEY-----";
    const sanitized = client.sanitizeInput(input);
    expect(sanitized).toBe("[REDACTED_PRIVATE_KEY]");
  });

  it("should call completions with sanitized content", async () => {
    mockCreate.mockResolvedValue({
      choices: [{ message: { content: "Diagnosis alert" } }],
      model: "test-model",
      usage: {},
    });

    await client.diagnosticCompletion([
      { role: "user", content: "Error with email user@bad.com" },
    ]);

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          expect.objectContaining({
            content: "Error with email [REDACTED_EMAIL]",
          }),
        ],
      }),
    );
  });
});
