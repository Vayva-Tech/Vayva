/**
 * Feature Flag Service
 * Manages feature flags and registration flags
 */
export class FlagService {
  /**
   * Check if email is allowed to register (anti-fraud)
   */
  static async checkRegistrationFlags(email: string): Promise<{ allowed: boolean; reason?: string }> {
    const res = await fetch("/api/auth/merchant/check-flag", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      throw new Error(`Failed to check registration flags: ${res.statusText}`);
    }
    return res.json();
  }

  /**
   * Check if a feature flag is enabled
   */
  static async isEnabled(flag: string): Promise<boolean> {
    const res = await fetch(`/api/flags/${flag}`);
    if (!res.ok) return true; // Default to enabled if check fails
    const data = await res.json();
    return data.enabled ?? true;
  }
}
