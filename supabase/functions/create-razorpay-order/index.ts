// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  booking_id?: string;
  purpose: "BOOKING" | "WALLET_TOPUP" | "MEMBERSHIP";
  /** Only used for WALLET_TOPUP — the amount in INR (server-validated min/max) */
  topup_amount?: number;
}

interface RazorpayOrderResponse {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
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

    // Create Supabase client with user's JWT for RLS
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verify user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired token" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Parse request ──
    const body: CreateOrderRequest = await req.json();
    const { booking_id, purpose, topup_amount } = body;

    if (!purpose) {
      return new Response(
        JSON.stringify({ error: "Missing required field: purpose" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Determine authoritative amount from database ──
    let amountInr: number;
    let receipt: string;

    if (purpose === "BOOKING") {
      if (!booking_id) {
        return new Response(
          JSON.stringify({ error: "booking_id is required for BOOKING purpose" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Read amount from bookings table — NEVER trust client amount
      const { data: booking, error: bookingError } = await supabaseClient
        .from("bookings")
        .select("id, total_amount, payment_status, customer_id")
        .eq("id", booking_id)
        .single();

      if (bookingError || !booking) {
        return new Response(
          JSON.stringify({ error: "Booking not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      if (booking.payment_status === "SUCCESS") {
        return new Response(
          JSON.stringify({ error: "This booking is already paid" }),
          { status: 409, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      amountInr = Number(booking.total_amount);
      receipt = `booking_${booking_id}`;

    } else if (purpose === "WALLET_TOPUP") {
      // Server-side validation of topup amount
      const amount = Number(topup_amount);
      if (!amount || amount < 50 || amount > 50000) {
        return new Response(
          JSON.stringify({ error: "Wallet top-up must be between ₹50 and ₹50,000" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      amountInr = amount;
      receipt = `wallet_${user.id}_${Date.now()}`;

    } else if (purpose === "MEMBERSHIP") {
      // VIP Pass price is authoritative — hardcoded server-side, NOT from client
      amountInr = 299;
      receipt = `membership_${user.id}_${Date.now()}`;

    } else {
      return new Response(
        JSON.stringify({ error: `Unknown purpose: ${purpose}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Amount validation ──
    if (amountInr <= 0) {
      return new Response(
        JSON.stringify({ error: "Invalid amount — must be greater than zero" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const amountPaise = Math.round(amountInr * 100);

    // ── Create Razorpay Order via REST API ──
    const razorpayKeyId = Deno.env.get("RAZORPAY_KEY_ID");
    const razorpayKeySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!razorpayKeyId || !razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: "Payment gateway is not configured on the server" }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${btoa(`${razorpayKeyId}:${razorpayKeySecret}`)}`,
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt,
        notes: {
          purpose,
          user_id: user.id,
          booking_id: booking_id || "",
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errBody = await razorpayResponse.text();
      console.error("Razorpay order creation failed:", errBody);
      return new Response(
        JSON.stringify({ error: "Failed to create payment order with gateway" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const razorpayOrder: RazorpayOrderResponse = await razorpayResponse.json();

    // ── Insert payment record in database ──
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: paymentRecord, error: insertError } = await adminClient
      .from("payments")
      .insert({
        booking_id: booking_id || null,
        customer_id: user.id,
        amount: amountInr,
        payment_method: "RAZORPAY",
        gateway_status: "CREATED",
        gateway_order_id: razorpayOrder.id,
        gateway_payment_id: null,
        purpose,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("Failed to insert payment record:", insertError);
      // Non-blocking — the order was created, we can still proceed
    }

    // ── Update booking status to PENDING_PAYMENT if applicable ──
    if (purpose === "BOOKING" && booking_id) {
      await adminClient
        .from("bookings")
        .update({
          payment_status: "PROCESSING",
          status: "PAYMENT_PROCESSING",
        })
        .eq("id", booking_id);
    }

    // ── Return order details to frontend ──
    return new Response(
      JSON.stringify({
        order_id: razorpayOrder.id,
        amount: amountInr,
        amount_paise: amountPaise,
        currency: razorpayOrder.currency,
        receipt: razorpayOrder.receipt,
        payment_record_id: paymentRecord?.id || null,
        razorpay_key_id: razorpayKeyId,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("create-razorpay-order error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
