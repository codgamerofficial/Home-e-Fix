/**
 * Home-e-Fix Cloudflare Turnstile Verification Client Service
 * Coordinates frontend token acquisition with backend Cloudflare Siteverify (/api/turnstile/verify).
 *
 * Architecture:
 * Client Widget (cf-turnstile-response)
 *        ↓
 * Backend Gateway (/api/turnstile/verify)
 *        ↓
 * Cloudflare Siteverify API (https://challenges.cloudflare.com/turnstile/v0/siteverify)
 *        ↓
 * Supabase Auth / Account Action
 */

export interface TurnstileVerificationResult {
  success: boolean;
  verified: boolean;
  action?: string;
  hostname?: string;
  challenge_ts?: string;
  error?: string;
  bypass?: boolean;
}

export const turnstileService = {
  /**
   * Verifies a Cloudflare Turnstile token with the Home-e-Fix backend Siteverify endpoint.
   * Fails closed: if token is missing or verification fails, the action is rejected.
   *
   * @param token - The cf-turnstile-response token from the Turnstile widget
   * @param action - Expected action identifier (e.g. 'professional_otp', 'professional_kyc_submit', 'customer_signup')
   */
  async verifyToken(
    token?: string | null,
    action?: string
  ): Promise<TurnstileVerificationResult> {
    const isProd =
      typeof import.meta !== "undefined" && Boolean(import.meta.env?.PROD);

    // If no token is provided:
    if (!token) {
      if (isProd) {
        return {
          success: false,
          verified: false,
          error: "Please complete the security verification challenge before continuing.",
        };
      }

      // In local development environments without configured Turnstile keys, allow transparent bypass
      const isSiteKeyConfigured = Boolean(
        typeof import.meta !== "undefined" && import.meta.env
          ? import.meta.env.VITE_TURNSTILE_SITE_KEY
          : undefined
      );

      if (!isSiteKeyConfigured) {
        return { success: true, verified: true, bypass: true, action };
      }

      return {
        success: false,
        verified: false,
        error: "Please complete the security verification challenge before continuing.",
      };
    }

    // Dev bypass token used in unit tests or local non-interactive environments
    if (token === "dev_turnstile_bypass_token") {
      if (isProd) {
        return {
          success: false,
          verified: false,
          error: "Test security token is not permitted in production.",
        };
      }
      return { success: true, verified: true, bypass: true, action };
    }

    try {
      const response = await fetch("/api/turnstile/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-turnstile-token": token,
        },
        body: JSON.stringify({ token, action }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          verified: false,
          error:
            data.error ||
            "Security challenge verification failed. Please try again.",
        };
      }

      return {
        success: true,
        verified: true,
        action: data.action,
        hostname: data.hostname,
        challenge_ts: data.challenge_ts,
        bypass: data.bypass,
      };
    } catch (err: any) {
      // Fallback for local development only if edge worker / API proxy is not running
      if (!isProd && typeof import.meta !== "undefined" && import.meta.env?.DEV) {
        console.warn(
          "[Turnstile] Backend verification endpoint unavailable in dev, permitting fallback:",
          err?.message
        );
        return { success: true, verified: true, bypass: true, action };
      }

      return {
        success: false,
        verified: false,
        error:
          "Network error during security verification. Please check your connection and retry.",
      };
    }
  },
};
