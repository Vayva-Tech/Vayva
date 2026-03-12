import { logger } from "@vayva/shared";
import { DispatchJobStatus } from "@vayva/db";

export interface CreateJobParams {
  pickup: {
    name: string;
    phone: string;
    address: string;
  };
  dropoff: {
    name: string;
    phone: string;
    address: string;
  };
  items: Array<{ description: string; quantity: number }>;
  vehicleType?: string;
}

export interface JobResult {
  providerJobId: string;
  trackingUrl?: string;
  status: DispatchJobStatus;
}

export class KwikProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.KWIK_API_KEY || "";
  }

  async createJob(_params: CreateJobParams): Promise<JobResult> {
    // Stub implementation for now - fully mocking the external call
    // as per project constraints when API keys might be missing

    if (!this.apiKey) {
      logger.warn("[KwikProvider] Missing API Key, using mock result.", {
        app: "worker",
      });
    }

    // Mock Response
    return {
      providerJobId: `kwik_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      status: "CREATED",
      trackingUrl: `https://kwik.delivery/track/mock/${Date.now()}`,
    };
  }
}
