/**
 * Optional feature-module engine base used by vertical packages that register
 * pluggable features at runtime (subscriptions, booking, health records, etc.).
 */

export interface Feature {
  readonly id?: string;
}

export abstract class IndustryEngine<TConfig = Record<string, unknown>> {
  protected readonly config: TConfig;
  protected readonly features = new Map<string, Feature>();

  constructor(config: TConfig) {
    this.config = config;
  }

  abstract initialize(): Promise<void>;
}
