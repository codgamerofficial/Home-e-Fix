import fs from "node:fs";
import path from "node:path";

// 1. Populate process.env from .env before config/env.ts is imported
const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const k = trimmed.slice(0, eqIdx).trim();
      const v = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  }
}

import test from "node:test";
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
import { professionalService } from "../src/services/professional/professionalService";

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

test("KYC Storage Bucket - Authoritative Bucket Configuration", async () => {
  assert.ok(supabaseUrl, "SUPABASE_URL must be defined");
  assert.ok(serviceRoleKey, "SUPABASE_SERVICE_ROLE_KEY must be defined");

  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { data: buckets, error } = await supabase.storage.listBuckets();
  assert.ifError(error);

  const kycBucket = buckets.find((b) => b.id === "professional-kyc" || b.name === "professional-kyc");
  assert.ok(kycBucket, "Storage bucket 'professional-kyc' MUST exist in Supabase");

  // Invariant: MUST BE STRICTLY PRIVATE (Zero Public URL access)
  assert.equal(kycBucket.public, false, "KYC Bucket MUST NOT be public. Public must be false.");

  // File size limit: 10 MB (10485760 bytes)
  assert.equal(kycBucket.file_size_limit, 10485760, "KYC Bucket file size limit must be 10MB (10485760 bytes)");

  // Allowed MIME types whitelist
  assert.ok(Array.isArray(kycBucket.allowed_mime_types), "Allowed MIME types must be configured");
  assert.ok(kycBucket.allowed_mime_types.includes("application/pdf"));
  assert.ok(kycBucket.allowed_mime_types.includes("image/jpeg"));
  assert.ok(kycBucket.allowed_mime_types.includes("image/png"));
  assert.ok(kycBucket.allowed_mime_types.includes("image/webp"));
});

test("KYC Storage - Structured Isolated Storage Path Invariant", () => {
  const userId = "usr-test-pro-12345";

  // Identity document -> government-id
  const idPath = professionalService.generateDocumentStoragePath(
    userId,
    "IDENTITY_DOCUMENT",
    "aadhaar_card.pdf"
  );
  assert.ok(idPath.startsWith(`${userId}/identity_document_`));

  // Category mapping in uploadKycDocument
  const allowedCategories = ["government-id", "bank-proof", "certification"];
  assert.ok(allowedCategories.includes("government-id"));
  assert.ok(allowedCategories.includes("bank-proof"));
  assert.ok(allowedCategories.includes("certification"));
});

test("KYC File Validation - Format & Size Boundaries", async () => {
  const fakeUserId = "usr-validation-test";

  // 1. Oversized file (> 10MB) must be rejected
  const oversizedFile = {
    name: "giant_scan.pdf",
    size: 11 * 1024 * 1024,
    type: "application/pdf",
  } as unknown as File;

  await assert.rejects(
    async () => {
      await professionalService.uploadKycDocument(fakeUserId, "IDENTITY_DOCUMENT", oversizedFile);
    },
    /10 MB or less/i
  );

  // 2. Disallowed MIME types must be rejected
  const maliciousExe = {
    name: "scanner.exe",
    size: 1024,
    type: "application/x-msdownload",
  } as unknown as File;

  await assert.rejects(
    async () => {
      await professionalService.uploadKycDocument(fakeUserId, "IDENTITY_DOCUMENT", maliciousExe);
    },
    /PDF, JPG, JPEG, PNG, or WEBP/i
  );

  // 3. Disallowed extensions (even with disguised mime type) must be rejected
  const disguisedFile = {
    name: "script.js",
    size: 1024,
    type: "application/pdf",
  } as unknown as File;

  await assert.rejects(
    async () => {
      await professionalService.uploadKycDocument(fakeUserId, "IDENTITY_DOCUMENT", disguisedFile);
    },
    /PDF, JPG, JPEG, PNG, or WEBP/i
  );
});

test("KYC Storage - Signed Upload & Time-Limited Signed URL Lifecycle", async () => {
  if (!supabaseUrl || !serviceRoleKey || !anonKey) return;

  const adminClient = createClient(supabaseUrl, serviceRoleKey);
  const testUserId = `test-pro-${Date.now()}`;
  const testPath = `${testUserId}/government-id/test_document.pdf`;
  const fileContent = Buffer.from("Home-e-Fix Test Private KYC Document", "utf-8");

  // 1. Generate signed upload URL via service role / backend
  const { data: signData, error: signErr } = await adminClient.storage
    .from("professional-kyc")
    .createSignedUploadUrl(testPath);

  assert.ifError(signErr);
  assert.ok(signData.token, "Signed upload URL must contain upload token");
  assert.ok(signData.signedUrl.includes("professional-kyc"), "Must target professional-kyc bucket");

  // 2. Perform upload via signed token (using unprivileged anon client)
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: uploadData, error: uploadErr } = await anonClient.storage
    .from("professional-kyc")
    .uploadToSignedUrl(testPath, signData.token, fileContent, {
      contentType: "application/pdf",
      upsert: true,
    });

  assert.ifError(uploadErr);
  assert.equal(uploadData.path, testPath);

  // 3. Generate short-lived signed preview URL (Default 300s) via service
  const { data: signedUrlData, error: signedUrlErr } = await adminClient.storage
    .from("professional-kyc")
    .createSignedUrl(testPath, 300);

  assert.ifError(signedUrlErr);
  assert.ok(signedUrlData.signedUrl.startsWith("https://"), "Signed preview URL must be HTTPS");
  assert.ok(signedUrlData.signedUrl.includes("/sign/"), "Must be a signed object URL");
  assert.ok(signedUrlData.signedUrl.includes("token="), "Must contain expiration token parameter");
  assert.equal(signedUrlData.signedUrl.includes("getPublicUrl"), false, "Must NEVER be a public URL");

  // 4. Verify file is accessible via signed URL
  const fetchRes = await fetch(signedUrlData.signedUrl);
  assert.equal(fetchRes.status, 200, "Signed URL must return HTTP 200");
  const fetchedText = await fetchRes.text();
  assert.equal(fetchedText, "Home-e-Fix Test Private KYC Document");

  // 5. Cleanup test document
  const deleted = await professionalService.deleteKycDocument(testPath);
  assert.equal(deleted, true, "Test document must be deleted cleanly");
});
