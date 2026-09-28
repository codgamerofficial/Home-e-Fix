/**
 * In-Memory & Edge Rate Limiter
 *
 * Defaults:
 * - Cooldown: 60 seconds per phone
 * - Hourly Limit: 5 requests per rolling hour per phone
 * - IP Limit: 10 requests per 5 minutes per IP
 */

interface PhoneRateRecord {
  lastRequestAt: number;
  requestTimestamps: number[];
}

const PHONE_RATE_MAP = new Map<string, PhoneRateRecord>();
const IP_RATE_MAP = new Map<string, number[]>();

export interface RateLimitCheckResult {
  allowed: boolean;
  retryAfterSeconds?: number;
  reason?: string;
}

export function checkPhoneRateLimit(
  phone: string,
  cooldownSeconds = 60,
  maxRequestsPerHour = 5
): RateLimitCheckResult {
  const now = Date.now();
  const record = PHONE_RATE_MAP.get(phone) || {
    lastRequestAt: 0,
    requestTimestamps: [],
  };

  // 1. Check Resend Cooldown
  const elapsedSinceLast = (now - record.lastRequestAt) / 1000;
  if (record.lastRequestAt > 0 && elapsedSinceLast < cooldownSeconds) {
    const remaining = Math.ceil(cooldownSeconds - elapsedSinceLast);
    return {
      allowed: false,
      retryAfterSeconds: remaining,
      reason: `Please wait ${remaining}s before requesting a new OTP.`,
    };
  }

  // 2. Check Hourly Limit
  const oneHourAgo = now - 60 * 60 * 1000;
  const recentTimestamps = record.requestTimestamps.filter((t) => t > oneHourAgo);

  if (recentTimestamps.length >= maxRequestsPerHour) {
    return {
      allowed: false,
      retryAfterSeconds: 3600,
      reason: "Too many OTP requests. Please wait and try again.",
    };
  }

  // Update record
  recentTimestamps.push(now);
  PHONE_RATE_MAP.set(phone, {
    lastRequestAt: now,
    requestTimestamps: recentTimestamps,
  });

  // Prune map if excessively large
  if (PHONE_RATE_MAP.size > 10000) {
    const oldestKey = PHONE_RATE_MAP.keys().next().value;
    if (oldestKey) PHONE_RATE_MAP.delete(oldestKey);
  }

  return { allowed: true };
}

export function checkIpRateLimit(
  ip: string,
  maxRequests = 10,
  windowSeconds = 300
): RateLimitCheckResult {
  if (!ip) return { allowed: true };

  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const timestamps = (IP_RATE_MAP.get(ip) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxRequests) {
    return {
      allowed: false,
      retryAfterSeconds: windowSeconds,
      reason: "Too many OTP requests from this connection. Please wait and try again.",
    };
  }

  timestamps.push(now);
  IP_RATE_MAP.set(ip, timestamps);

  if (IP_RATE_MAP.size > 10000) {
    const oldestKey = IP_RATE_MAP.keys().next().value;
    if (oldestKey) IP_RATE_MAP.delete(oldestKey);
  }

  return { allowed: true };
}
