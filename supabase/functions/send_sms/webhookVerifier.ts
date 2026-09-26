/**
 * Standard Webhook (Svix-compatible) Signature Verification for Supabase Auth Hooks
 *
 * References:
 * - Supabase Auth Hooks: https://supabase.com/docs/guides/auth/auth-hooks
 * - Standard Webhooks: https://github.com/standard-webhooks/standard-webhooks
 */

export interface WebhookVerificationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Timing-safe byte array comparison to prevent timing attacks.
 */
function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

/**
 * Base64 string to Uint8Array decoder.
 */
function base64ToBytes(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Uint8Array to Base64 string encoder.
 */
function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Verifies standard webhook headers from Supabase Send SMS Auth Hook.
 */
export async function verifyWebhookSignature(
  headers: Headers,
  rawBody: string,
  secret: string
): Promise<WebhookVerificationResult> {
  if (!secret) {
    return {
      isValid: false,
      error: "Server configuration error: SEND_SMS_HOOK_SECRET is not configured.",
    };
  }

  // Retrieve standard webhook headers (case-insensitive)
  const webhookId =
    headers.get("webhook-id") ||
    headers.get("x-webhook-id") ||
    headers.get("msg-id");
  const webhookTimestamp =
    headers.get("webhook-timestamp") ||
    headers.get("x-webhook-timestamp") ||
    headers.get("timestamp");
  const webhookSignature =
    headers.get("webhook-signature") ||
    headers.get("x-webhook-signature") ||
    headers.get("signature");

  if (!webhookId || !webhookTimestamp || !webhookSignature) {
    return {
      isValid: false,
      error: "Missing required webhook signature headers (webhook-id, webhook-timestamp, webhook-signature).",
    };
  }

  // 1. Replay attack protection: Enforce 5-minute maximum tolerance
  const now = Math.floor(Date.now() / 1000);
  const timestampSec = parseInt(webhookTimestamp, 10);
  if (isNaN(timestampSec) || Math.abs(now - timestampSec) > 300) {
    return {
      isValid: false,
      error: "Webhook timestamp is outside of the acceptable 5-minute drift window (replay prevention).",
    };
  }

  // 2. Prepare secret key for HMAC-SHA256
  let keyBytes: Uint8Array;
  if (secret.startsWith("whsec_")) {
    // Svix / Supabase base64 secret format
    try {
      keyBytes = base64ToBytes(secret.replace("whsec_", ""));
    } catch {
      keyBytes = new TextEncoder().encode(secret);
    }
  } else {
    try {
      keyBytes = base64ToBytes(secret);
    } catch {
      keyBytes = new TextEncoder().encode(secret);
    }
  }

  // 3. Compute expected signature over: "${webhookId}.${webhookTimestamp}.${rawBody}"
  const toSign = `${webhookId}.${webhookTimestamp}.${rawBody}`;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes as ArrayBufferView<ArrayBuffer>,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    new TextEncoder().encode(toSign)
  );

  const expectedSignature = bytesToBase64(new Uint8Array(signatureBuffer));
  const expectedBytes = new Uint8Array(signatureBuffer);

  // 4. Verify against space-delimited signatures (e.g. "v1,abc v1,def")
  const signatures = webhookSignature.split(" ");
  for (const sig of signatures) {
    const parts = sig.split(",");
    if (parts.length === 2) {
      const version = parts[0];
      const candidateSig = parts[1];

      if (version === "v1") {
        try {
          const candidateBytes = base64ToBytes(candidateSig);
          if (timingSafeEqual(expectedBytes, candidateBytes)) {
            return { isValid: true };
          }
        } catch {
          // If candidate is not valid base64, continue to next
        }
      }
    }
  }

  return {
    isValid: false,
    error: "Invalid webhook signature. Request authentication failed.",
  };
}
