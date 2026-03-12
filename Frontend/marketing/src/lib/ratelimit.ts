export async function checkRateLimit(identifier: string, limit: number, window: number) {
  return { success: true, remaining: limit };
}

export const rateLimit = {
  check: checkRateLimit,
};