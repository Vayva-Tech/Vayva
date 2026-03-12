import "next-auth";

declare module "next-auth" {
  interface User {
    storeId: string;
    storeName: string;
    role: string | null;
    plan: string;
    trialEndsAt: Date | string | null;
    emailVerified: boolean;
    onboardingCompleted: boolean;
  }

  interface Session {
    user: User & {
      id: string;
    };
  }

  interface AuthOptions {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    adapter?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    session?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pages?: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    providers: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    callbacks?: any;
    secret?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    storeId: string;
    storeName: string;
    role: string | null;
    plan: string;
    trialEndsAt: Date | string | null;
    emailVerified: boolean;
    onboardingCompleted: boolean;
    lastActive?: number;
    error?: string;
  }
}
