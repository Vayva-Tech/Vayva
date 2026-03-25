import { logger } from '@vayva/shared';

/** @vayva/shared logger expects structured fields, not a raw caught value */
export function logEngineError(scope: string, error: unknown): void {
  const message = error instanceof Error ? error.message : String(error);
  logger.error(scope, { message });
}
