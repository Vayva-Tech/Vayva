/**
 * Request ID Generation and Tracking
 * 
 * Generates unique request IDs for debugging and correlation
 */

export interface RequestIdMetadata {
  requestId: string;
  timestamp: number;
  source: string;
}

/**
 * Generate a unique request ID
 * Format: req_<timestamp>_<random>_<sequence>
 */
export function generateRequestId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  const sequence = getRequestSequence();
  
  return `req_${timestamp}_${random}_${sequence}`;
}

/**
 * Get incrementing sequence number for this session
 */
let sequenceCounter = 0;
function getRequestSequence(): string {
  sequenceCounter = (sequenceCounter + 1) % 1000;
  return sequenceCounter.toString().padStart(3, '0');
}

/**
 * Generate request metadata for tracking
 */
export function generateRequestMetadata(source?: string): RequestIdMetadata {
  return {
    requestId: generateRequestId(),
    timestamp: Date.now(),
    source: source || 'unknown',
  };
}

/**
 * Create request ID header object
 */
export function createRequestIdHeaders(requestId?: string): Record<string, string> {
  const id = requestId || generateRequestId();
  return {
    'X-Request-ID': id,
    'X-Correlation-ID': id,
  };
}

/**
 * Extract request ID from response headers
 */
export function extractRequestId(headers: Headers): string | null {
  return (
    headers.get('X-Request-ID') ||
    headers.get('X-Correlation-ID') ||
    headers.get('X-Trace-ID') ||
    null
  );
}

/**
 * Log request with metadata
 */
export function logRequest(
  method: string,
  url: string,
  requestId?: string,
  metadata?: Record<string, unknown>
): void {
  const id = requestId || generateRequestId();
  
  // eslint-disable-next-line no-console
  console.debug('[HTTP]', {
    requestId: id,
    method,
    url,
    timestamp: new Date().toISOString(),
    ...metadata,
  });
}

/**
 * Log response with metadata
 */
export function logResponse(
  method: string,
  url: string,
  status: number,
  durationMs: number,
  requestId?: string
): void {
  const id = requestId || generateRequestId();
  
  // eslint-disable-next-line no-console
  console.debug('[HTTP]', {
    requestId: id,
    method,
    url,
    status,
    durationMs,
    timestamp: new Date().toISOString(),
  });
}
