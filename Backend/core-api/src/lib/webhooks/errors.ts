export class WebhookSignatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookSignatureError";
  }
}

export class WebhookEventError extends Error {
  readonly resourceId: string | number | undefined;
  readonly topic: string | undefined;

  constructor(
    message: string,
    resourceId?: string | number,
    topic?: string,
  ) {
    super(message);
    this.name = "WebhookEventError";
    this.resourceId = resourceId;
    this.topic = topic;
  }
}
