/**
 * Simple logger for billing package
 */
export const logger = {
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[Billing] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    console.info(`[Billing] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[Billing] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[Billing] ${message}`, ...args);
  },
};
