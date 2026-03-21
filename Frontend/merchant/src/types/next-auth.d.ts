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
        adapter?: any;
        session?: any;
        pages?: any;
        providers: any[];
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
