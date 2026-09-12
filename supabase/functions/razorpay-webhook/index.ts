// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-razorpay-signature",
};

/**
 * Computes HMAC-SHA256 signature using native Web Crypto API.
 */
async function computeHmacSha256(secret: string, rawBody: string): Promise<string> {
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
    encoder.encode(rawBody)
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
    const signatureHeader = req.headers.get("x-razorpay-signature");
    const webhookSecret = Deno.env.get("RAZORPAY_WEBHOOK_SECRET") || Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!webhookSecret) {
      console.error("Razorpay webhook secret is not configured");
      return new Response(
        JSON.stringify({ error: "Webhook secret not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const rawBody = await req.text();

    // Verify webhook signature
    if (signatureHeader) {
      const expectedSignature = await computeHmacSha256(webhookSecret, rawBody);
      if (expectedSignature !== signatureHeader) {
        console.error("Webhook signature mismatch!");
        return new Response(
          JSON.stringify({ error: "Invalid webhook signature" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const eventData = JSON.parse(rawBody);
    const eventName = eventData.event;
    const payload = eventData.payload;

    console.log(`Received Razorpay webhook event: ${eventName}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);
    const nowIso = new Date().toISOString();

    if (eventName === "payment.captured") {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const notes = paymentEntity.notes || {};

      // Update payment record
      await adminClient
        .from("payments")
        .update({
          gateway_status: "SUCCESS",
          gateway_payment_id: paymentId,
          verified_at: nowIso,
          webhook_received_at: nowIso,
        })
        .eq("gateway_order_id", orderId);

      // If booking payment, confirm booking
      if (notes.purpose === "BOOKING" && notes.booking_id) {
        await adminClient
          .from("bookings")
          .update({
            payment_status: "SUCCESS",
            status: "CONFIRMED",
          })
          .eq("id", notes.booking_id);
      }
    } else if (eventName === "payment.failed") {
      const paymentEntity = payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      const notes = paymentEntity.notes || {};

      await adminClient
        .from("payments")
        .update({
          gateway_status: "FAILED",
          gateway_payment_id: paymentId,
          webhook_received_at: nowIso,
        })
        .eq("gateway_order_id", orderId);

      if (notes.purpose === "BOOKING" && notes.booking_id) {
        await adminClient
          .from("bookings")
          .update({
            payment_status: "FAILED",
          })
          .eq("id", notes.booking_id);
      }
    } else if (eventName === "refund.processed") {
      const refundEntity = payload.refund.entity;
      const paymentId = refundEntity.payment_id;
      const refundId = refundEntity.id;

      await adminClient
        .from("refunds")
        .update({
          status: "COMPLETED",
          gateway_refund_id: refundId,
          processed_at: nowIso,
        })
        .eq("gateway_refund_id", refundId);
    }

    return new Response(
      JSON.stringify({ status: "ok", received: true, event: eventName }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Webhook processing error:", err);
    return new Response(
      JSON.stringify({ error: "Webhook handler failed" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
