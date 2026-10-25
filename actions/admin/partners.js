"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptAadhaar } from "@/lib/aadhaarCrypto";
import { formatAadhaar } from "@/lib/aadhaar";
import { getPayment } from "@/lib/payment";

export async function getPartners() {
  await requireAdmin();
  const { data } = await createAdminClient()
    .from("profiles")
    .select(
      "id, full_name, email, phone, role, is_active, created_at, activated_at, activation_amount, activation_note, avatar_url, dob, address_line, city, state, pincode, aadhaar_last4, father_name, nominee_name, referral_code, referred_by",
    )
    .order("created_at", { ascending: false });
  return data ?? [];
}

// Everyone on the platform with just enough to draw the referral tree:
// no Aadhaar, DOB or address.
export async function getReferralTree() {
  await requireAdmin();
  const { data } = await createAdminClient()
    .from("profiles")
    .select("id, full_name, email, phone, role, is_active, created_at, activated_at, avatar_url, referral_code, referred_by")
    .order("created_at", { ascending: true });
  return data ?? [];
}

// A switched-off partner can no longer log in or open the dashboard.
export async function setPartnerActive(id, isActive) {
  await requireAdmin();
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ is_active: !!isActive })
    .eq("id", id);
  if (error) return { success: false, error: "Could not update the partner." };
  revalidatePath("/admin/partners");
  return { success: true };
}

// The partner has paid the joining fee: switch the account on. Works at any time.
export async function activatePartner(id, note, amount) {
  await requireAdmin();
  // The amount the partner really paid. Left empty, it is the joining payment set on the Payment Details page.
  const typed = Math.round(Number(String(amount ?? "").replace(/[^0-9.]/g, "")));
  if (amount !== undefined && amount !== "" && (!Number.isFinite(typed) || typed < 0 || typed > 100000000)) {
    return { success: false, error: "Enter the amount in rupees, numbers only." };
  }
  const paid = typed > 0 ? typed : (await getPayment()).amount;
  const { error } = await createAdminClient()
    .from("profiles")
    .update({
      activated_at: new Date().toISOString(),
      activation_amount: paid,
      activation_note: String(note ?? "").trim().slice(0, 200) || null,
    })
    .eq("id", id);
  if (error) return { success: false, error: "Could not activate the partner." };
  await createAdminClient().rpc("sync_ranks", { p: id });
  revalidatePath("/admin", "layout");
  return { success: true };
}

// Put an activated partner back to "waiting for payment".
export async function deactivatePartner(id) {
  await requireAdmin();
  const { error } = await createAdminClient()
    .from("profiles")
    .update({ activated_at: null, activation_amount: null, activation_note: null })
    .eq("id", id);
  if (error) return { success: false, error: "Could not deactivate the partner." };
  revalidatePath("/admin", "layout");
  return { success: true };
}

// The full Aadhaar number, for checking a partner's documents. Only on request,
// so it is never sent to the browser along with the partner list.
export async function revealAadhaar(id) {
  await requireAdmin();
  const column = "aadhaar_encrypted";
  const { data } = await createAdminClient()
    .from("profiles")
    .select(column)
    .eq("id", id)
    .maybeSingle();
  if (!data?.[column]) return { success: false, error: "No Aadhaar saved." };
  try {
    return { success: true, aadhaar: formatAadhaar(decryptAadhaar(data[column])) };
  } catch (err) {
    console.error("Aadhaar decrypt error:", err.message);
    return { success: false, error: "Could not read the Aadhaar number." };
  }
}

// Everything about one partner, for the admin's full profile page: their profile
// (never the stored Aadhaar, that is revealed on request), sign in details, who
// referred them and their whole team, level by level.
export async function getPartnerDetail(id) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(String(id))) return null;
  const db = createAdminClient();

  const { data: profile } = await db
    .from("profiles")
    .select(
      "id, full_name, email, phone, role, is_active, created_at, activated_at, activation_amount, activation_note, avatar_url, dob, address_line, city, state, pincode, aadhaar_last4, father_name, nominee_name, referral_code, referred_by",
    )
    .eq("id", id)
    .maybeSingle();
  if (!profile) return null;

  const { data: authData } = await db.auth.admin.getUserById(id);

  let referrer = null;
  if (profile.referred_by) {
    const { data } = await db
      .from("profiles")
      .select("id, full_name, email, referral_code, avatar_url")
      .eq("id", profile.referred_by)
      .maybeSingle();
    referrer = data;
  }

  // The team under this partner: those they referred, those those partners referred, ...
  const team = [];
  let parents = [id];
  for (let level = 1; level <= 10 && parents.length && team.length < 500; level++) {
    const { data } = await db
      .from("profiles")
      .select("id, full_name, email, phone, referral_code, is_active, activated_at, created_at, avatar_url, city, state, referred_by")
      .in("referred_by", parents)
      .order("created_at", { ascending: true });
    if (!data?.length) break;
    for (const p of data) team.push({ ...p, level });
    parents = data.map((p) => p.id);
  }

  return {
    profile,
    signedUpAt: authData?.user?.created_at ?? profile.created_at,
    lastSignInAt: authData?.user?.last_sign_in_at ?? null,
    referrer,
    team,
  };
}
