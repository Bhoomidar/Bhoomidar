"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";
import { decryptAadhaar, decryptText } from "@/lib/aadhaarCrypto";
import { formatAadhaar } from "@/lib/aadhaar";
import { getPayment } from "@/lib/payment";
import { formatRupees } from "@/lib/partnerFee";

export async function getPartners() {
  await requireAdmin();
  const { data } = await createAdminClient()
    .from("profiles")
    .select(
      "id, full_name, email, phone, role, is_active, created_at, activated_at, activation_amount, activation_note, credit_amount, credit_paid_at, avatar_url, dob, address_line, city, state, pincode, aadhaar_last4, father_name, nominee_name, referral_code, referred_by",
    )
    .order("created_at", { ascending: false });
  // A partner activated on credit who still owes: how much is left.
  const rows = data ?? [];
  const db = createAdminClient();
  await Promise.all(
    rows
      .filter((p) => p.credit_amount != null && !p.credit_paid_at)
      .map(async (p) => {
        p.credit_owed = Number((await db.rpc("credit_owed", { p: p.id })).data ?? 0);
      }),
  );
  return rows;
}

// Everyone on the platform with just enough to draw the referral tree:
// no Aadhaar, DOB or address.
export async function getReferralTree() {
  await requireAdmin();
  const { data } = await createAdminClient()
    .from("profiles")
    .select("id, full_name, email, phone, role, is_active, created_at, activated_at, avatar_url, referral_code, referred_by, city, state")
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
      credit_amount: null,
      credit_paid_at: null,
    })
    .eq("id", id);
  if (error) return { success: false, error: "Could not activate the partner." };
  const db = createAdminClient();
  await db.rpc("sync_ranks", { p: id });
  // The partner who referred this one gets their share of the joining amount (once).
  await db.rpc("pay_referral_bonus", { p_referee: id });
  revalidatePath("/admin", "layout");
  return { success: true };
}

// Put an activated partner back to "waiting for payment".
export async function deactivatePartner(id) {
  await requireAdmin();
  const db = createAdminClient();
  // On credit and not paid yet: the debt goes away together with the activation.
  const { data: now } = await db.from("profiles").select("credit_amount, credit_paid_at").eq("id", id).maybeSingle();
  if (now?.credit_amount != null && !now.credit_paid_at) {
    await db.from("commission_entries").delete().eq("partner_id", id).eq("kind", "credit_due");
  }
  const { error } = await db
    .from("profiles")
    .update({ activated_at: null, activation_amount: null, activation_note: null, credit_amount: null, credit_paid_at: null })
    .eq("id", id);
  if (error) return { success: false, error: "Could not deactivate the partner." };
  revalidatePath("/admin", "layout");
  return { success: true };
}

// The partner cannot pay the joining amount now: activate the account on credit. The joining
// amount becomes a debt (the balance starts below zero) and what the partner earns pays it off.
// Until it is paid off there is no partnership bonus, and the referrer's bonus waits too.
// deposit: what the partner pays now (0 = nothing). The rest of the joining amount is the credit.
export async function activatePartnerOnCredit(id, note, deposit) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(String(id))) return { success: false, error: "Partner not found." };
  const db = createAdminClient();
  const fee = (await getPayment()).amount;
  if (!(fee > 0)) return { success: false, error: "Set the joining amount on the Payment Details page first." };

  // What the partner pays now. Empty = nothing. It must be less than the whole amount (the whole amount is "Payment received").
  const typed = String(deposit ?? "").replace(/[^0-9.]/g, "");
  const paidNow = typed === "" ? 0 : Math.round(Number(typed));
  if (!Number.isFinite(paidNow) || paidNow < 0) return { success: false, error: "Enter the deposit in rupees, numbers only." };
  if (paidNow >= fee) return { success: false, error: "The deposit must be less than the joining amount. Use Payment received for the full amount." };
  const left = fee - paidNow; // what stays on credit

  const { data: p } = await db.from("profiles").select("activated_at").eq("id", id).maybeSingle();
  if (!p) return { success: false, error: "Partner not found." };
  if (p.activated_at) return { success: false, error: "This partner is already activated." };

  const { error } = await db
    .from("profiles")
    .update({
      activated_at: new Date().toISOString(),
      activation_amount: paidNow > 0 ? paidNow : null,
      activation_note:
        (paidNow > 0 ? `Deposit ${formatRupees(paidNow)} · credit ${formatRupees(left)}` : "On credit") +
        (String(note ?? "").trim() ? ` · ${String(note).trim().slice(0, 150)}` : ""),
      credit_amount: left,
      credit_paid_at: null,
    })
    .eq("id", id);
  if (error) return { success: false, error: "Could not activate the partner." };

  const { error: entryError } = await db.from("commission_entries").insert({
    partner_id: id,
    kind: "credit_due",
    points: -left,
    note: paidNow > 0 ? `Joining amount on credit (${formatRupees(paidNow)} paid, ${formatRupees(left)} on credit)` : "Joining amount on credit",
  });
  if (entryError) {
    console.error("credit entry:", entryError.message);
    await db.from("profiles").update({ activated_at: null, activation_amount: null, activation_note: null, credit_amount: null }).eq("id", id);
    return { success: false, error: "Could not put the joining amount on credit." };
  }

  await db.rpc("sync_ranks", { p: id });
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// The partner paid what is still owed from the credit (cash, UPI...): the debt is closed.
export async function markCreditPaid(id, note) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(String(id))) return { success: false, error: "Partner not found." };
  const db = createAdminClient();
  const { data: p } = await db.from("profiles").select("credit_amount, credit_paid_at, activation_amount").eq("id", id).maybeSingle();
  if (!p || p.credit_amount == null) return { success: false, error: "This partner is not on credit." };
  if (p.credit_paid_at) return { success: false, error: "The credit was already marked as paid." };

  // Only what is still owed: earnings may have paid a part of it already.
  const owed = Number((await db.rpc("credit_owed", { p: id })).data ?? 0);
  if (owed > 0) {
    const { error } = await db.from("commission_entries").insert({
      partner_id: id,
      kind: "credit_paid",
      points: owed,
      note: "Joining amount paid",
    });
    if (error) return { success: false, error: "Could not save the payment." };
  }
  const text = String(note ?? "").trim().slice(0, 150);
  const { error } = await db
    .from("profiles")
    .update({
      credit_paid_at: new Date().toISOString(),
      // the whole joining amount: what was deposited at the start plus what was left on credit
      activation_amount: Number(p.activation_amount ?? 0) + Number(p.credit_amount),
      activation_note: text ? "Credit paid · " + text : "Credit paid",
    })
    .eq("id", id);
  if (error) return { success: false, error: "Could not update the partner." };

  await db.rpc("pay_referral_bonus", { p_referee: id });
  revalidatePath("/admin", "layout");
  revalidatePath("/dashboard", "layout");
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

// The full bank account number, for paying a partner. Only on request, like the Aadhaar.
export async function revealBankAccount(id) {
  await requireAdmin();
  if (!/^[0-9a-f-]{36}$/i.test(String(id))) return { success: false, error: "Partner not found." };
  const { data } = await createAdminClient().from("profiles").select("bank_account_encrypted").eq("id", id).maybeSingle();
  if (!data?.bank_account_encrypted) return { success: false, error: "No bank account saved." };
  try {
    return { success: true, account: decryptText(data.bank_account_encrypted) };
  } catch (err) {
    console.error("Bank account decrypt error:", err.message);
    return { success: false, error: "Could not read the account number." };
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
      "id, full_name, email, phone, role, is_active, created_at, activated_at, activation_amount, activation_note, credit_amount, credit_paid_at, avatar_url, dob, address_line, city, state, pincode, aadhaar_last4, father_name, nominee_name, referral_code, referred_by, bank_holder, bank_name, bank_branch, bank_ifsc, bank_account_last4, upi_id, bank_updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!profile) return null;
  if (profile.credit_amount != null && !profile.credit_paid_at) {
    profile.credit_owed = Number((await db.rpc("credit_owed", { p: id })).data ?? 0);
  }

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
