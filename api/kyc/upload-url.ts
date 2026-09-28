/**
 * Vercel Serverless / Edge Function: /api/kyc/upload-url
 * Generates an authorized, time-limited signed upload URL for private KYC documents
 * in the 'professional-kyc' Supabase Storage bucket.
 *
 * Enforces:
 * - Supabase session authentication (Zero anonymous uploads)
 * - Strict 10MB maximum file size limit
 * - Strict whitelist of MIME types: PDF, JPG, PNG, WebP
 * - Isolated storage path: {user_id}/{category}/{unique_id}.{ext}
 * - Zero public exposure: KYC documents are stored in a private bucket
 */

import { createClient } from "@supabase/supabase-js";

export const config = {
  runtime: "edge",
};

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const CATEGORY_MAP: Record<string, string> = {
  IDENTITY_DOCUMENT: "government-id",
  identity_document: "government-id",
  BANK_DOCUMENT: "bank-proof",
  bank_document: "bank-proof",
  SKILL_CERTIFICATE: "certification",
  skill_certificate: "certification",
  PROFESSIONAL_CERTIFICATE: "certification",
  professional_certificate: "certification",
  PROFILE_PHOTO: "profile-photo",
  profile_photo: "profile-photo",
};

function jsonResponse(data: unknown, status = 200, origin = "*"): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-turnstile-token",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get("origin") || "*";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-turnstile-token",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, origin);
  }

  // 1. Supabase credentials resolution
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error("[KYC Upload] Missing Supabase backend configuration");
    return jsonResponse(
      { error: "Storage service is temporarily unavailable. Please try again later." },
      503,
      origin
    );
  }

  // 2. Parse request payload
  let body: any = {};
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON request payload." }, 400, origin);
  }

  const { docType, fileName, fileSize, mimeType, userId: clientUserId } = body;

  // 3. Authenticate User via Authorization header (Supabase JWT)
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.replace(/^Bearer\s+/i, "").trim();

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let authenticatedUserId: string | null = null;

  if (token) {
    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (!userError && userData?.user?.id) {
      authenticatedUserId = userData.user.id;
    }
  }

  // Allow client-supplied userId only in development if auth header is absent
  const finalUserId = authenticatedUserId || (process.env.NODE_ENV !== "production" ? clientUserId : null);

  if (!finalUserId) {
    return jsonResponse(
      { error: "Please sign in before uploading your documents." },
      401,
      origin
    );
  }

  // 4. Validate file size (10 MB limit)
  if (!fileSize || typeof fileSize !== "number" || fileSize <= 0) {
    return jsonResponse({ error: "Invalid file size." }, 400, origin);
  }

  if (fileSize > MAX_FILE_SIZE_BYTES) {
    return jsonResponse(
      { error: "File size must be 10 MB or less." },
      400,
      origin
    );
  }

  // 5. Validate MIME type
  if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
    return jsonResponse(
      { error: "Please upload a PDF, JPG, JPEG, PNG, or WEBP file." },
      400,
      origin
    );
  }

  // 6. Validate file extension
  const rawExt = typeof fileName === "string" ? fileName.split(".").pop()?.toLowerCase() : "";
  if (!rawExt || !ALLOWED_EXTENSIONS.has(rawExt)) {
    return jsonResponse(
      { error: "Invalid file extension. Allowed formats: .pdf, .jpg, .jpeg, .png, .webp" },
      400,
      origin
    );
  }

  // 7. Structured and sanitized storage path: {user_id}/{category}/{unique_id}.{ext}
  const folder = CATEGORY_MAP[docType] || "documents";
  const uniqueId = crypto.randomUUID ? crypto.randomUUID() : `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const storagePath = `${finalUserId}/${folder}/${uniqueId}.${rawExt}`;

  // 8. Generate signed upload URL in the private 'professional-kyc' bucket
  try {
    const { data, error } = await supabaseAdmin.storage
      .from("professional-kyc")
      .createSignedUploadUrl(storagePath);

    if (error) {
      console.error("[KYC Signed Upload Error]", error);
      return jsonResponse(
        { error: "We couldn't initialize document upload right now. Please try again." },
        500,
        origin
      );
    }

    return jsonResponse(
      {
        success: true,
        storagePath,
        signedUrl: data.signedUrl,
        token: data.token,
      },
      200,
      origin
    );
  } catch (err: any) {
    console.error("[KYC Upload Exception]", err);
    return jsonResponse(
      { error: "Failed to generate upload URL. Please try again." },
      500,
      origin
    );
  }
}
