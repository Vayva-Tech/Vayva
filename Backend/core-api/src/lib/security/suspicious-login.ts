import { prisma } from "@vayva/db";
import { logAuditEvent, AuditEventType } from "@/lib/audit";
import { logger } from "@vayva/shared";
import { getRedisClient } from "@/lib/redis";
import { ResendEmailService } from "@/lib/email/resend";

export interface DeviceInfo {
  ipAddress: string;
  userAgent: string;
  deviceId?: string;
  fingerprint?: string;
}

export interface SuspiciousActivityAlert {
  id: string;
  type: "new_device" | "new_location" | "multiple_failures" | "unusual_time" | "ip_reputation";
  severity: "low" | "medium" | "high" | "critical";
  userId: string;
  storeId?: string;
  deviceInfo: DeviceInfo;
  timestamp: Date;
  details: Record<string, unknown>;
  verified: boolean;
}

// Known good devices stored per user
const TRUSTED_DEVICES_PREFIX = "trusted_devices:";
const FAILED_LOGIN_PREFIX = "failed_login:";
const SUSPICIOUS_ACTIVITY_PREFIX = "suspicious_activity:";

/**
 * Check if device is trusted for user
 */
export async function isTrustedDevice(
  userId: string,
  deviceInfo: DeviceInfo,
): Promise<boolean> {
  try {
    const redis = await getRedisClient();
    const key = `${TRUSTED_DEVICES_PREFIX}${userId}`;
    const devices = await redis.smembers(key);

    if (!devices || devices.length === 0) {
      return false;
    }

    // Check if current device fingerprint matches any trusted device
    const deviceFingerprint = generateDeviceFingerprint(deviceInfo);
    return devices.includes(deviceFingerprint);
  } catch (error) {
    logger.warn("Failed to check trusted devices", { error, userId });
    return false;
  }
}

/**
 * Add device as trusted for user
 */
export async function addTrustedDevice(
  userId: string,
  deviceInfo: DeviceInfo,
): Promise<void> {
  try {
    const redis = await getRedisClient();
    const key = `${TRUSTED_DEVICES_PREFIX}${userId}`;
    const deviceFingerprint = generateDeviceFingerprint(deviceInfo);

    await redis.sadd(key, deviceFingerprint);
    // Expire after 90 days
    await redis.expire(key, 90 * 24 * 60 * 60);
  } catch (error) {
    logger.warn("Failed to add trusted device", { error, userId });
  }
}

/**
 * Remove trusted device
 */
export async function removeTrustedDevice(
  userId: string,
  deviceFingerprint: string,
): Promise<void> {
  try {
    const redis = await getRedisClient();
    const key = `${TRUSTED_DEVICES_PREFIX}${userId}`;
    await redis.srem(key, deviceFingerprint);
  } catch (error) {
    logger.warn("Failed to remove trusted device", { error, userId });
  }
}

/**
 * Track failed login attempt and check for brute force
 */
export async function trackFailedLogin(
  identifier: string,
  deviceInfo: DeviceInfo,
): Promise<{ attempts: number; shouldAlert: boolean }> {
  try {
    const redis = await getRedisClient();
    const key = `${FAILED_LOGIN_PREFIX}${identifier}`;

    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, 15 * 60); // 15 minute window
    }

    // Alert on 5+ failed attempts
    const shouldAlert = current >= 5;

    if (shouldAlert) {
      // Log suspicious activity
      await logSuspiciousActivity(
        identifier,
        "multiple_failures",
        "medium",
        deviceInfo,
        { failedAttempts: current },
      );
    }

    return { attempts: current, shouldAlert };
  } catch (error) {
    logger.warn("Failed to track login attempt", { error, identifier });
    return { attempts: 0, shouldAlert: false };
  }
}

/**
 * Clear failed login attempts on successful login
 */
export async function clearFailedLogins(identifier: string): Promise<void> {
  try {
    const redis = await getRedisClient();
    await redis.del(`${FAILED_LOGIN_PREFIX}${identifier}`);
  } catch (error) {
    logger.warn("Failed to clear failed logins", { error, identifier });
  }
}

/**
 * Detect suspicious login patterns
 */
export async function detectSuspiciousLogin(
  userId: string,
  storeId: string | null,
  deviceInfo: DeviceInfo,
): Promise<SuspiciousActivityAlert | null> {
  const alerts: SuspiciousActivityAlert["type"][] = [];

  // Check 1: New device
  const isKnownDevice = await isTrustedDevice(userId, deviceInfo);
  if (!isKnownDevice) {
    alerts.push("new_device");
  }

  // Check 2: Failed login attempts recently
  const redis = await getRedisClient();
  const failedKey = `${FAILED_LOGIN_PREFIX}${userId}`;
  const failedAttempts = await redis.get(failedKey);
  if (failedAttempts && parseInt(failedAttempts) >= 3) {
    alerts.push("multiple_failures");
  }

  // Check 3: Unusual time (outside 6AM - 11PM local time)
  const hour = new Date().getHours();
  if (hour < 6 || hour > 23) {
    alerts.push("unusual_time");
  }

  // Check 4: Recent suspicious activity from same IP
  const suspiciousKey = `${SUSPICIOUS_ACTIVITY_PREFIX}${deviceInfo.ipAddress}`;
  const recentSuspicious = await redis.get(suspiciousKey);
  if (recentSuspicious) {
    alerts.push("ip_reputation");
  }

  // Determine severity based on alert combination
  let severity: SuspiciousActivityAlert["severity"] = "low";
  if (alerts.includes("multiple_failures") && alerts.includes("new_device")) {
    severity = "critical";
  } else if (alerts.includes("new_device")) {
    severity = "high";
  } else if (alerts.length >= 2) {
    severity = "medium";
  }

  if (alerts.length === 0) {
    return null;
  }

  const alert: SuspiciousActivityAlert = {
    id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: alerts[0], // Primary type
    severity,
    userId,
    storeId: storeId || undefined,
    deviceInfo,
    timestamp: new Date(),
    details: { allAlerts: alerts },
    verified: false,
  };

  // Log the suspicious activity
  await logSuspiciousActivity(userId, alerts[0], severity, deviceInfo, {
    allAlerts: alerts,
    isKnownDevice,
  });

  // Store in Redis for recent lookups
  try {
    await redis.setex(
      `${SUSPICIOUS_ACTIVITY_PREFIX}${userId}:${alert.id}`,
      24 * 60 * 60, // 24 hours
      JSON.stringify(alert),
    );
  } catch (e) {
    logger.warn("Failed to store suspicious activity", { e });
  }

  return alert;
}

/**
 * Log suspicious activity to audit log
 */
async function logSuspiciousActivity(
  userId: string,
  type: SuspiciousActivityAlert["type"],
  severity: SuspiciousActivityAlert["severity"],
  deviceInfo: DeviceInfo,
  details: Record<string, unknown>,
): Promise<void> {
  try {
    // Get user's primary store
    const membership = await prisma.membership.findFirst({
      where: { userId, status: "ACTIVE" },
      select: { storeId: true },
    });

    await logAuditEvent(
      membership?.storeId || "",
      userId,
      AuditEventType.LOGIN_ATTEMPT_FAILED,
      {
        targetType: "login",
        targetId: userId,
        reason: `Suspicious activity detected: ${type}`,
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        meta: {
          type,
          severity,
          ...details,
        },
      },
    );

    // Send notification to user about suspicious activity
    await notifyUserOfSuspiciousActivity(userId, type, deviceInfo);
  } catch (error) {
    logger.error("Failed to log suspicious activity", { error, userId, type });
  }
}

/**
 * Notify user of suspicious activity
 */
async function notifyUserOfSuspiciousActivity(
  userId: string,
  type: SuspiciousActivityAlert["type"],
  deviceInfo: DeviceInfo,
): Promise<void> {
  try {
    // Get user details for email
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });

    if (!user?.email) {
      logger.warn("Cannot send security alert - user email not found", { userId });
      return;
    }

    // Send security alert email
    await ResendEmailService.sendSecurityAlertEmail(
      user.email,
      user.firstName || "Valued Customer",
      type,
      deviceInfo.ipAddress,
      deviceInfo.userAgent,
      new Date().toLocaleString("en-NG", {
        timeZone: "Africa/Lagos",
        dateStyle: "full",
        timeStyle: "short",
      }),
    );

    logger.info("Security alert email sent", {
      userId,
      email: user.email,
      alertType: type,
      ipAddress: deviceInfo.ipAddress,
    });
  } catch (error) {
    logger.warn("Failed to notify user of suspicious activity", { error, userId });
  }
}

/**
 * Generate device fingerprint from device info
 */
function generateDeviceFingerprint(deviceInfo: DeviceInfo): string {
  // Simple hash of user agent and IP
  const str = `${deviceInfo.userAgent}:${deviceInfo.ipAddress}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return `fp_${Math.abs(hash).toString(16)}`;
}

/**
 * Verify suspicious activity alert (user confirmed it's legitimate)
 */
export async function verifySuspiciousActivity(
  alertId: string,
  userId: string,
  verified: boolean,
): Promise<void> {
  try {
    const redis = await getRedisClient();
    const key = `${SUSPICIOUS_ACTIVITY_PREFIX}${userId}:${alertId}`;
    const alertData = await redis.get(key);

    if (alertData) {
      const alert: SuspiciousActivityAlert = JSON.parse(alertData);
      alert.verified = verified;

      if (verified) {
        // Add device as trusted since user verified it
        await addTrustedDevice(userId, alert.deviceInfo);
      }

      // Update stored alert
      await redis.setex(key, 24 * 60 * 60, JSON.stringify(alert));

      // Log verification
      await logAuditEvent(
        alert.storeId || "",
        userId,
        AuditEventType.ACCOUNT_SECURITY_ACTION,
        {
          targetType: "suspicious_activity",
          targetId: alertId,
          reason: verified ? "User verified activity as legitimate" : "User reported suspicious activity",
          meta: { alertType: alert.type, verified },
        },
      );
    }
  } catch (error) {
    logger.error("Failed to verify suspicious activity", { error, alertId });
  }
}

/**
 * Get recent suspicious activity for user
 */
export async function getRecentSuspiciousActivity(
  userId: string,
  limit: number = 10,
): Promise<SuspiciousActivityAlert[]> {
  try {
    const redis = await getRedisClient();
    const pattern = `${SUSPICIOUS_ACTIVITY_PREFIX}${userId}:*`;
    const keys = await redis.keys(pattern);

    const alerts: SuspiciousActivityAlert[] = [];
    for (const key of keys.slice(0, limit)) {
      const data = await redis.get(key);
      if (data) {
        alerts.push(JSON.parse(data));
      }
    }

    return alerts.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  } catch (error) {
    logger.warn("Failed to get suspicious activity", { error, userId });
    return [];
  }
}
