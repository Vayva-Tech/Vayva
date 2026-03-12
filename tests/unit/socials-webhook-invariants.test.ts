import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";

import {
  webhookHandler,
  instagramWebhookHandler,
// @ts-expect-error - Module resolution pending
} from "../../services/whatsapp-service/src/controller";

function makeReply() {
  const reply: any = {
    statusCode: 200,
    payload: undefined as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send(payload: any) {
      this.payload = payload;
      return this;
    },
  };
  return reply;
}

function makeLog() {
  return {
    error: (_: any) => {},
    warn: (_: any) => {},
    info: (_: any) => {},
  };
}

describe("Socials webhooks - signature invariants", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  it("rejects WhatsApp webhook when signature is invalid in production", async () => {
    process.env = {
      ...process.env,
      NODE_ENV: "production",
      WHATSAPP_APP_SECRET: "secret",
    };

    const raw = Buffer.from(JSON.stringify({ entry: [] }));

    const req: any = {
      headers: { "x-hub-signature-256": "sha256=invalid" },
      body: { entry: [] },
      rawBody: raw,
      log: makeLog(),
    };

    const reply = makeReply();

    await webhookHandler(req, reply);

    expect(reply.statusCode).toBe(403);
    expect(reply.payload).toBe("Forbidden");
  });

  it("rejects Instagram webhook when signature is invalid in production", async () => {
    process.env = {
      ...process.env,
      NODE_ENV: "production",
      META_APP_SECRET: "secret",
    };

    const rawPayload = { object: "instagram", entry: [] };
    const raw = Buffer.from(JSON.stringify(rawPayload));

    const req: any = {
      headers: { "x-hub-signature-256": "sha256=invalid" },
      body: rawPayload,
      rawBody: raw,
      log: makeLog(),
    };

    const reply = makeReply();

    await instagramWebhookHandler(req, reply);

    expect(reply.statusCode).toBe(403);
    expect(reply.payload).toBe("Forbidden");
  });

  it("accepts WhatsApp webhook when signature matches", async () => {
    process.env = {
      ...process.env,
      NODE_ENV: "production",
      WHATSAPP_APP_SECRET: "secret",
    };

    const body = { entry: [] };
    const raw = Buffer.from(JSON.stringify(body));

    const hmac = crypto.createHmac(
      "sha256",
      String(process.env.WHATSAPP_APP_SECRET || ""),
    );
    const digest = hmac.update(raw).digest("hex");

    const req: any = {
      headers: { "x-hub-signature-256": `sha256=${digest}` },
      body,
      rawBody: raw,
      log: makeLog(),
    };

    const reply = makeReply();

    await webhookHandler(req, reply);

    expect(reply.statusCode).toBe(200);
    expect(reply.payload).toEqual({ status: "success" });
  });
});
