// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyPaymentRequest {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id?: string;
  purpose?: "BOOKING" | "WALLET_TOPUP" | "MEMBERSHIP";
}

/**
 * Computes HMAC-SHA256 signature using native Web Crypto API.
 */
async function computeHmacSha256(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  const hashArray = Array.from(new Uint8Array(signatureBytes));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req: Request) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── Auth: Extract JWT from Authorization header ──
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing Authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify token
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Parse request payload ──
    const body: VerifyPaymentRequest = await req.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      booking_id,
      purpose = "BOOKING",
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Cryptographic Signature Verification (HMAC-SHA256) ──
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");
    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: "Payment gateway secret not configured on server" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dataToSign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = await computeHmacSha256(razorpayKeySecret, dataToSign);

    const isSignatureValid = expectedSignature === razorpay_signature;

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    if (!isSignatureValid) {
      console.error(
        `Signature verification failed for order ${razorpay_order_id}. Expected ${expectedSignature}, received ${razorpay_signature}`
      );

      // Record fraudulent or failed verification attempt
      await adminClient
        .from("payments")
        .update({
          gateway_status: "SIGNATURE_VERIFICATION_FAILED",
          gateway_payment_id: razorpay_payment_id,
          gateway_signature: razorpay_signature,
        })
        .eq("gateway_order_id", razorpay_order_id);

      return new Response(
        JSON.stringify({
          verified: false,
          error: "Invalid payment signature. Transaction could not be verified.",
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Payment is Authenticated & Verified! ──
    const nowIso = new Date().toISOString();

    // 1. Update Payment Record
    const { data: updatedPayment, error: paymentUpdateError } = await adminClient
      .from("payments")
      .update({
        gateway_status: "SUCCESS",
        gateway_payment_id: razorpay_payment_id,
        gateway_signature: razorpay_signature,
        verified_at: nowIso,
      })
      .eq("gateway_order_id", razorpay_order_id)
      .select()
      .maybeSingle();

    if (paymentUpdateError) {
      console.warn("Payment table update notice:", paymentUpdateError);
    }

    // 2. Handle Purpose Specific Updates
    if (purpose === "BOOKING" && booking_id) {
      const { error: bookingUpdateError } = await adminClient
        .from("bookings")
        .update({
          payment_status: "SUCCESS",
          status: "CONFIRMED",
        })
        .eq("id", booking_id);

      if (bookingUpdateError) {
        console.error("Failed to update booking status:", bookingUpdateError);
      }
    } else if (purpose === "WALLET_TOPUP") {
      // If payment record contains the amount, credit the user's wallet
      const topupAmount = updatedPayment?.amount || 0;
      if (topupAmount > 0) {
        // Query current balance or increment
        const { data: profile } = await adminClient
          .from("profiles")
          .select("wallet_balance")
          .eq("id", user.id)
          .single();

        const newBalance = (Number(profile?.wallet_balance) || 0) + Number(topupAmount);

        await adminClient
          .from("profiles")
          .update({ wallet_balance: newBalance })
          .eq("id", user.id);
      }
    } else if (purpose === "MEMBERSHIP") {
      // Activate VIP membership for 6 months
      const vipExpiresAt = new Date();
      vipExpiresAt.setMonth(vipExpiresAt.getMonth() + 6);

      await adminClient
        .from("profiles")
        .update({
          is_vip: true,
          vip_expires_at: vipExpiresAt.toISOString(),
        })
        .eq("id", user.id);
    }

    return new Response(
      JSON.stringify({
        verified: true,
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
        booking_id: booking_id || null,
        status: "CONFIRMED",
        verified_at: nowIso,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("verify-razorpay-payment error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error during verification" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
