"use server";

import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptAadhaar, hashAadhaar } from "@/lib/aadhaarCrypto";
import { aadhaarDigits, formatAadhaar } from "@/lib/aadhaar";

// Every customer that partners have registered, with the partner each one is locked to.
export async function getCustomers() {
  await requireAdmin();
  const { data } = await createAdminClient()
    .from("customers")
    .select("id, full_name, phone, email, aadhaar_last4, created_at, partner_id, partner:profiles!partner_id(full_name, email, referral_code)")
    .order("created_at", { ascending: false })
    .limit(2000);
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.full_name,
    phone: c.phone,
    email: c.email,
    last4: c.aadhaar_last4,
    at: c.created_at,
    partnerId: c.partner_id,
    partnerName: c.partner?.full_name || c.partner?.email || "Partner",
    partnerCode: c.partner?.referral_code || "",
  }));
}

// Search by a full Aadhaar number: the id of the customer with that number, or null.
// (The number is stored encrypted, so it is looked up by its hash.)
export async function findCustomerByAadhaar(aadhaarRaw) {
  await requireAdmin();
  const digits = aadhaarDigits(aadhaarRaw);
  if (digits.length !== 12) return { id: null };
  let hash;
  try {
    hash = hashAadhaar(digits);
  } catch {
    return { id: null };
  }
  const { data } = await createAdminClient().from("customers").select("id").eq("aadhaar_hash", hash).maybeSingle();
  return { id: data?.id ?? null };
}

// The full Aadhaar number of one customer, only when the admin asks for it.
export async function revealCustomerAadhaar(id) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(String(id))) return { success: false, error: "Customer not found." };
  const { data } = await createAdminClient().from("customers").select("aadhaar_encrypted").eq("id", id).maybeSingle();
  if (!data?.aadhaar_encrypted) return { success: false, error: "No Aadhaar saved." };
  try {
    return { success: true, aadhaar: formatAadhaar(decryptAadhaar(data.aadhaar_encrypted)) };
  } catch (err) {
    console.error("Customer Aadhaar decrypt error:", err.message);
    return { success: false, error: "Could not read the Aadhaar number." };
  }
}
