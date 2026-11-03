"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { phoneError } from "@/lib/phone";
import { aadhaarDigits, aadhaarError, formatAadhaar } from "@/lib/aadhaar";
import { decryptAadhaar, encryptAadhaar, hashAadhaar } from "@/lib/aadhaarCrypto";
import { EMAIL_PATTERN, checkEmailCode, cleanEmail, sendEmailCode } from "@/lib/authCodes";

// "My Customers": a sales partner registers a customer (name, phone, Aadhaar, email checked with a code).
// The customer stays locked to that partner: the same Aadhaar, phone or email cannot be added by another
// partner. See supabase/028_referral_credit_customers.sql.

// The logged-in partner, only when their account is active and activated. The id comes from the session.
async function currentPartner() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await createAdminClient().from("profiles").select("id, is_active, activated_at").eq("id", user.id).maybeSingle();
  return data && data.is_active !== false && data.activated_at ? data : null;
}

// Checks what was typed. Returns { error } or the clean values.
function readInput(input) {
  const name = String(input?.name ?? "").trim().replace(/\s+/g, " ").slice(0, 100);
  const phone = String(input?.phone ?? "").trim();
  const email = cleanEmail(input?.email);
  const aadhaar = aadhaarDigits(input?.aadhaar);

  if (name.length < 2) return { error: "Please enter the customer's name." };
  const phoneErr = phoneError(phone);
  if (phoneErr) return { error: phoneErr };
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." };
  const aadhaarErr = aadhaarError(aadhaar);
  if (aadhaarErr) return { error: aadhaarErr };
  return { name, phone, email, aadhaar };
}

// Is this customer already with a partner? Returns an error message, or "" when the customer is free.
async function lockError(admin, partnerId, { phone, email, aadhaarHash }) {
  const found = await Promise.all([
    admin.from("customers").select("partner_id").eq("aadhaar_hash", aadhaarHash).limit(1).maybeSingle(),
    admin.from("customers").select("partner_id").eq("phone", phone).limit(1).maybeSingle(),
    admin.from("customers").select("partner_id").eq("email", email).limit(1).maybeSingle(),
  ]);
  const hit = found.map((r) => r.data).find(Boolean);
  if (!hit) return "";
  // Another partner is only told that the customer is taken, never who.
  return hit.partner_id === partnerId
    ? "You have already registered this customer."
    : "This customer is already registered under another partner.";
}

// Search by a full Aadhaar number: the id of this partner's customer with that number, or null.
export async function findMyCustomerByAadhaar(aadhaarRaw) {
  const partner = await currentPartner();
  if (!partner) return { id: null };
  const digits = aadhaarDigits(aadhaarRaw);
  if (digits.length !== 12) return { id: null };
  let hash;
  try {
    hash = hashAadhaar(digits);
  } catch {
    return { id: null };
  }
  const { data } = await createAdminClient()
    .from("customers")
    .select("id")
    .eq("partner_id", partner.id)
    .eq("aadhaar_hash", hash)
    .maybeSingle();
  return { id: data?.id ?? null };
}

// The full Aadhaar of one of this partner's own customers, only when they ask for it.
export async function revealMyCustomerAadhaar(id) {
  const partner = await currentPartner();
  if (!partner) return { success: false, error: "Please log in again." };
  if (!/^[0-9a-f-]{36}$/i.test(String(id))) return { success: false, error: "Customer not found." };
  const { data } = await createAdminClient()
    .from("customers")
    .select("aadhaar_encrypted")
    .eq("id", id)
    .eq("partner_id", partner.id)
    .maybeSingle();
  if (!data?.aadhaar_encrypted) return { success: false, error: "Customer not found." };
  try {
    return { success: true, aadhaar: formatAadhaar(decryptAadhaar(data.aadhaar_encrypted)) };
  } catch (err) {
    console.error("Customer Aadhaar decrypt error:", err.message);
    return { success: false, error: "Could not read the Aadhaar number." };
  }
}

// Step 1: checks the details and mails a 6-digit code to the customer's email.
export async function sendCustomerCode(input) {
  const partner = await currentPartner();
  if (!partner) return { error: "Please log in again." };
  const v = readInput(input);
  if (v.error) return v;

  const admin = createAdminClient();
  const locked = await lockError(admin, partner.id, { phone: v.phone, email: v.email, aadhaarHash: hashAadhaar(v.aadhaar) });
  if (locked) return { error: locked };

  const res = await sendEmailCode(v.email, "customer");
  return res.error ? res : { ok: true };
}

// Step 2: checks the code and saves the customer under this partner.
export async function addCustomer(input) {
  const partner = await currentPartner();
  if (!partner) return { error: "Please log in again." };
  const v = readInput(input);
  if (v.error) return v;

  let aadhaarHash;
  let aadhaarEncrypted;
  try {
    aadhaarHash = hashAadhaar(v.aadhaar);
    aadhaarEncrypted = encryptAadhaar(v.aadhaar);
  } catch (err) {
    console.error("Customer Aadhaar encryption error:", err.message);
    return { error: "We could not save the customer. Please try again later." };
  }

  const admin = createAdminClient();
  const locked = await lockError(admin, partner.id, { phone: v.phone, email: v.email, aadhaarHash });
  if (locked) return { error: locked };

  if (!(await checkEmailCode(v.email, "customer", input?.code))) return { error: "This code is wrong or has expired." };

  const { error } = await admin.from("customers").insert({
    partner_id: partner.id,
    full_name: v.name,
    phone: v.phone,
    email: v.email,
    aadhaar_encrypted: aadhaarEncrypted,
    aadhaar_last4: v.aadhaar.slice(-4),
    aadhaar_hash: aadhaarHash,
  });
  if (error) {
    if (error.code === "23505") return { error: "This customer is already registered under a partner." };
    console.error("Add customer error:", error.message);
    return { error: "We could not save the customer. Please try again." };
  }

  revalidatePath("/dashboard/customers");
  revalidatePath("/admin/customers");
  return { success: true };
}
