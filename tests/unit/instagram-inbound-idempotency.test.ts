import { describe, it, expect, vi, beforeEach } from "vitest";

const mocks = vi.hoisted(() => ({
  messageFindFirst: vi.fn(),
  messageCreate: vi.fn(),
  contactFindUnique: vi.fn(),
  contactCreate: vi.fn(),
  conversationFindUnique: vi.fn(),
  conversationCreate: vi.fn(),
  conversationUpdate: vi.fn(),
}));

vi.mock("@vayva/db", () => ({
  Direction: { INBOUND: "INBOUND" },
  MessageStatus: { DELIVERED: "DELIVERED" },
  MessageType: { TEXT: "TEXT" },
  prisma: {
    message: {
      findFirst: mocks.messageFindFirst,
      create: mocks.messageCreate,
    },
    contact: {
      findUnique: mocks.contactFindUnique,
      create: mocks.contactCreate,
    },
    conversation: {
      findUnique: mocks.conversationFindUnique,
      create: mocks.conversationCreate,
      update: mocks.conversationUpdate,
    },
  },
}));

// @ts-expect-error - Module resolution pending
import { InstagramInboundProcessor } from "../../services/whatsapp-service/src/processor/instagram.processor";

describe("InstagramInboundProcessor.processMessage idempotency", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not create duplicate messages for same providerMessageId", async () => {
    const storeId = "store_1";
    const payload = {
      senderId: "sender_1",
      recipientIgBusinessId: "igbiz_1",
      messageId: "mid_1",
      text: "hello",
    };

    const contact = { id: "contact_1" };
    const conversation = { id: "conv_1" };
    const createdMessage = { id: "msg_1" };

    mocks.messageFindFirst
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(createdMessage);

    mocks.contactFindUnique.mockResolvedValueOnce(null);
    mocks.contactCreate.mockResolvedValueOnce(contact);

    mocks.conversationFindUnique.mockResolvedValueOnce(null);
    mocks.conversationCreate.mockResolvedValueOnce(conversation);

    mocks.messageCreate.mockResolvedValueOnce(createdMessage);
    mocks.conversationUpdate.mockResolvedValueOnce({});

    const first = await InstagramInboundProcessor.processMessage(
      storeId,
      payload,
    );
    const second = await InstagramInboundProcessor.processMessage(
      storeId,
      payload,
    );

    expect(first).toBe(createdMessage);
    expect(second).toBe(createdMessage);

    expect(mocks.messageCreate).toHaveBeenCalledTimes(1);
    expect(mocks.contactCreate).toHaveBeenCalledTimes(1);
    expect(mocks.conversationCreate).toHaveBeenCalledTimes(1);
    expect(mocks.conversationUpdate).toHaveBeenCalledTimes(1);
  });
});
