import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@vayva/payments", () => ({
  Paystack: {
    initializeTransaction: vi.fn(),
    verifyTransaction: vi.fn(),
    getBanks: vi.fn(),
    resolveAccount: vi.fn(),
    createTransferRecipient: vi.fn(),
  },
}));

vi.mock("@vayva/shared", () => ({
  urls: {
    merchantBase: () => "https://merchant.vayva.ng",
  },
}));

import { PaystackService } from "@/lib/payment/paystack";
import { Paystack } from "@vayva/payments";

describe("PaystackService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("initializeTransaction", () => {
    it("initializes a transaction and returns formatted response", async () => {
      vi.mocked(Paystack.initializeTransaction).mockResolvedValue({
        authorizationUrl: "https://checkout.paystack.com/abc",
        accessCode: "access_abc",
        reference: "ref_123",
      });

      const result = await PaystackService.initializeTransaction({
        email: "test@example.com",
        amount: 200000,
        reference: "ref_123",
        callback_url:
          "https://merchant.vayva.ng/dashboard/settings/subscription?payment=success",
      });

      expect(result.status).toBe(true);
      expect(result.data.authorization_url).toBe(
        "https://checkout.paystack.com/abc",
      );
      expect(result.data.access_code).toBe("access_abc");
      expect(result.data.reference).toBe("ref_123");
    });

    it("rejects callback URLs from untrusted hosts", async () => {
      await expect(
        PaystackService.initializeTransaction({
          email: "test@example.com",
          amount: 200000,
          reference: "ref_123",
          callback_url: "https://evil.com/steal",
        }),
      ).rejects.toThrow("Invalid callbackUrl host");
    });

    it("uses default merchant checkout URL when callback_url is omitted", async () => {
      vi.mocked(Paystack.initializeTransaction).mockResolvedValue({
        authorizationUrl: "https://checkout.paystack.com/abc",
        accessCode: "access_abc",
        reference: "ref_123",
      });

      const result = await PaystackService.initializeTransaction({
        email: "test@example.com",
        amount: 200000,
        reference: "ref_123",
      });

      expect(result.status).toBe(true);
      expect(Paystack.initializeTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          callbackUrl: "https://merchant.vayva.ng/checkout/success",
        }),
      );
    });
  });

  describe("verifyTransaction", () => {
    it("returns the raw Paystack response", async () => {
      const rawResponse = {
        status: true,
        message: "Verification successful",
        data: { status: "success", amount: 200000, currency: "NGN" },
      };
      vi.mocked(Paystack.verifyTransaction).mockResolvedValue({
        status: "success",
        amountKobo: 200000,
        paidAt: "2025-01-01T00:00:00.000Z",
        gatewayResponse: "Successful",
        raw: rawResponse,
      });

      const result = await PaystackService.verifyTransaction("ref_123");
      expect(result).toEqual(rawResponse);
    });
  });

  describe("createPaymentForPlanChange", () => {
    it("throws for FREE plan", async () => {
      await expect(
        PaystackService.createPaymentForPlanChange(
          "test@example.com",
          "FREE",
          "store_123",
        ),
      ).rejects.toThrow("Cannot create payment for free plan");
    });

    it("throws for unknown plan", async () => {
      await expect(
        PaystackService.createPaymentForPlanChange(
          "test@example.com",
          "UNKNOWN",
          "store_123",
        ),
      ).rejects.toThrow("Cannot create payment for free plan");
    });

    it("calculates correct amount for STARTER plan (no VAT in metadata)", async () => {
      vi.mocked(Paystack.initializeTransaction).mockResolvedValue({
        authorizationUrl: "https://checkout.paystack.com/abc",
        accessCode: "access_abc",
        reference: "sub_store_123_1234567890",
      });

      const result = await PaystackService.createPaymentForPlanChange(
        "test@example.com",
        "STARTER",
        "store_123",
      );

      expect(result.authorization_url).toBe(
        "https://checkout.paystack.com/abc",
      );
      // STARTER monthly = 25_000 NGN → 2_500_000 kobo
      expect(Paystack.initializeTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amountKobo: 2500000,
          metadata: expect.objectContaining({
            type: "subscription",
            newPlan: "STARTER",
            baseAmountKobo: 2500000,
            vatAmountKobo: 0,
            vatRate: 0,
          }),
        }),
      );
    });

    it("calculates correct amount for PRO plan (no VAT in metadata)", async () => {
      vi.mocked(Paystack.initializeTransaction).mockResolvedValue({
        authorizationUrl: "https://checkout.paystack.com/def",
        accessCode: "access_def",
        reference: "sub_store_123_1234567890",
      });

      await PaystackService.createPaymentForPlanChange(
        "test@example.com",
        "PRO",
        "store_123",
      );

      // PRO monthly = 35_000 NGN → 3_500_000 kobo
      expect(Paystack.initializeTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amountKobo: 3500000,
          metadata: expect.objectContaining({
            newPlan: "PRO",
            baseAmountKobo: 3500000,
            vatAmountKobo: 0,
            vatRate: 0,
          }),
        }),
      );
    });
  });

  describe("verifyPlanChangePayment", () => {
    it("returns parsed verification result on success", async () => {
      vi.mocked(Paystack.verifyTransaction).mockResolvedValue({
        status: "success",
        amountKobo: 2150000,
        paidAt: "2025-01-01T00:00:00.000Z",
        gatewayResponse: "Successful",
        raw: {
          status: true,
          message: "Verification successful",
          data: {
            status: "success",
            amount: 2150000,
            currency: "NGN",
            metadata: { storeId: "store_123", newPlan: "STARTER" },
          },
        },
      });

      const result = await PaystackService.verifyPlanChangePayment("ref_123");
      expect(result.success).toBe(true);
      expect(result.storeId).toBe("store_123");
      expect(result.newPlan).toBe("STARTER");
      expect(result.amountKobo).toBe(2150000);
      expect(result.currency).toBe("NGN");
    });

    it("throws if payment status is not success", async () => {
      vi.mocked(Paystack.verifyTransaction).mockResolvedValue({
        status: "failed",
        amountKobo: null,
        paidAt: null,
        gatewayResponse: null,
        raw: {
          status: true,
          message: "Verification successful",
          data: { status: "failed" },
        },
      });

      await expect(
        PaystackService.verifyPlanChangePayment("ref_123"),
      ).rejects.toThrow("Payment not successful");
    });

    it("throws if metadata is missing storeId or newPlan", async () => {
      vi.mocked(Paystack.verifyTransaction).mockResolvedValue({
        status: "success",
        amountKobo: 2150000,
        paidAt: "2025-01-01T00:00:00.000Z",
        gatewayResponse: "Successful",
        raw: {
          status: true,
          message: "Verification successful",
          data: { status: "success", metadata: {} },
        },
      });

      await expect(
        PaystackService.verifyPlanChangePayment("ref_123"),
      ).rejects.toThrow("Invalid payment metadata");
    });
  });

  describe("initiateTemplatePurchase", () => {
    it("converts NGN to kobo and returns authorization URL", async () => {
      vi.mocked(Paystack.initializeTransaction).mockResolvedValue({
        authorizationUrl: "https://checkout.paystack.com/tpl",
        accessCode: "access_tpl",
        reference: "tpl_abc12345_store_123_1234567890",
      });

      const result = await PaystackService.initiateTemplatePurchase(
        "test@example.com",
        "template_abc12345",
        "store_123",
        5000,
      );

      expect(result.authorization_url).toBe(
        "https://checkout.paystack.com/tpl",
      );
      expect(Paystack.initializeTransaction).toHaveBeenCalledWith(
        expect.objectContaining({
          amountKobo: 500000, // 5000 * 100
          metadata: expect.objectContaining({
            templateId: "template_abc12345",
            type: "template_purchase",
          }),
        }),
      );
    });
  });

  describe("getBanks", () => {
    it("delegates to Paystack.getBanks", async () => {
      const banks = [
        {
          id: 1,
          name: "GTBank",
          slug: "gtbank",
          code: "058",
          longcode: "",
          type: "nuban",
          country: "Nigeria",
          currency: "NGN",
        },
      ];
      vi.mocked(Paystack.getBanks).mockResolvedValue(banks);

      const result = await PaystackService.getBanks();
      expect(result).toEqual(banks);
    });
  });

  describe("resolveAccount", () => {
    it("delegates to Paystack.resolveAccount", async () => {
      const resolved = {
        account_number: "0123456789",
        account_name: "Test User",
        bank_id: 1,
      };
      vi.mocked(Paystack.resolveAccount).mockResolvedValue(resolved);

      const result = await PaystackService.resolveAccount("0123456789", "058");
      expect(result).toEqual(resolved);
    });
  });

  describe("createTransferRecipient", () => {
    it("returns raw data from Paystack response", async () => {
      vi.mocked(Paystack.createTransferRecipient).mockResolvedValue({
        recipientCode: "RCP_test",
        raw: {
          status: true,
          message: "Transfer recipient created",
          data: {
            recipient_code: "RCP_test",
            type: "nuban",
            name: "Test User",
          },
        },
      });

      const result = await PaystackService.createTransferRecipient(
        "Test User",
        "0123456789",
        "058",
      );
      expect(result).toEqual({
        recipient_code: "RCP_test",
        type: "nuban",
        name: "Test User",
      });
    });
  });
});
