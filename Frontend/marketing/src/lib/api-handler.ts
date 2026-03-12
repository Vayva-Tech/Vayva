// Stub file for @/lib/api-handler
// This is a compatibility shim for marketing and storefront apps

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function withVayvaAPI(permission: string, handler: (...args: unknown[]) => unknown) {
  return handler;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function withAuth(handler: (...args: unknown[]) => unknown) {
  return handler;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function withStoreAuth(handler: (...args: unknown[]) => unknown) {
  return handler;
}

// API Handler for marketing app
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withMarketingAPI(handler: unknown) {
  return handler;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function withStoreAPI(handler: unknown) {
  return handler;
}

export const apiHandler = {
  withVayvaAPI,
  withAuth,
  withStoreAuth,
  withMarketingAPI,
  withStoreAPI,
};

export default apiHandler;
