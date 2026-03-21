import { NextRequest } from "next/server";

/**
 * Create a mock NextRequest for testing API routes
 */
export const createMockRequest = (
  method: string,
  url: string,
  options?: {
    body?: any;
    headers?: Record<string, string>;
    searchParams?: Record<string, string>;
  },
): NextRequest => {
  const urlObj = new URL(url, "http://localhost:3000");

  if (options?.searchParams) {
    Object.entries(options.searchParams).forEach(([key, value]) => {
      urlObj.searchParams.set(key, value);
    });
  }

  return new NextRequest(urlObj, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });
};

/**
 * Create a mock authentication context for API route handlers
 */
export const mockAuthContext = (storeId: string, userId: string) => ({
  storeId,
  userId,
  user: {
    id: userId,
    email: "test@example.com",
    firstName: "Test",
    lastName: "User",
  },
});

/**
 * Create a mock response for testing
 */
export const createMockResponse = () => {
  const headers = new Headers();
  return {
    headers,
    status: 200,
    json: async () => ({}),
  };
};

/**
 * Helper to extract JSON from Response object
 */
export const getResponseJson = async (response: Response) => {
  return await response.json();
};

/**
 * Helper to check if response is successful (2xx)
 */
export const isSuccessResponse = (response: Response): boolean => {
  return response.status >= 200 && response.status < 300;
};

/**
 * Helper to check if response is error (4xx or 5xx)
 */
export const isErrorResponse = (response: Response): boolean => {
  return response.status >= 400;
};
