import type { TurnstileVerificationResult } from "../types/auth";

/**
 * Server-Side Cloudflare Turnstile Verification
 *
 * Calls Cloudflare Siteverify:
 * POST https://challenges.cloudflare.com/turnstile/v0/siteverify
 *
 * Security Invariants:
 * 1. NEVER logs Turnstile secrets or candidate tokens.
 * 2. Enforces action matching ('customer_otp' or 'professional_otp').
 * 3. Enforces hostname validation (production 'home-e-fix.vercel.app').
 * 4. Fails closed with HTTP 403 on any challenge rejection.
 */
export async function verifyTurnstileToken(
  token: string,
  expectedAction: string,
  secretKey: string,
  clientIp?: string,
  customAllowedHostnames?: string
): Promise<TurnstileVerificationResult> {
  if (!token || typeof token !== "string" || token.trim() === "") {
    return {
      success: false,
      error: "Security verification failed. Please try again.",
    };
  }

  if (!secretKey) {
    // Missing server secret is a configuration error
    return {
      success: false,
      error: "Security service configuration error.",
    };
  }

  try {
    const formData = new URLSearchParams();
    formData.append("secret", secretKey);
    formData.append("response", token);
    if (clientIp) {
      formData.append("remoteip", clientIp);
    }

    const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });

    const cfData: any = await cfRes.json().catch(() => ({}));

    if (!cfRes.ok || !cfData.success) {
      return {
        success: false,
        error: "Security verification failed. Please try again.",
      };
    }

    // Validate Action
    if (expectedAction && cfData.action && cfData.action !== expectedAction) {
      return {
        success: false,
        error: "Security verification failed. Please try again.",
      };
    }

    // Validate Hostname
    const allowed = (
      customAllowedHostnames ||
      "home-e-fix.vercel.app,localhost,127.0.0.1"
    )
      .split(",")
      .map((h) => h.trim().toLowerCase())
      .filter(Boolean);

    if (allowed.length > 0 && cfData.hostname) {
      const returnedHost = cfData.hostname.toLowerCase();
      const isAllowed = allowed.some(
        (h) => returnedHost === h || returnedHost.endsWith(`.${h}`)
      );
      if (!isAllowed) {
        return {
          success: false,
          error: "Security verification failed. Please try again.",
        };
      }
    }

    return {
      success: true,
      action: cfData.action,
      hostname: cfData.hostname,
    };
  } catch {
    return {
      success: false,
      error: "Security verification failed. Please try again.",
    };
  }
}
