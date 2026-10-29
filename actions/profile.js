"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { phoneError } from "@/lib/phone";
import { findState, pincodeError } from "@/lib/india";
import { encryptText } from "@/lib/aadhaarCrypto";
import { accountDigits, accountError, cleanIfsc, holderError, ifscError, upiError } from "@/lib/bank";

// Who is asking. Every action below works only on the logged-in partner's own
// account: the id always comes from the session, never from the form.
async function currentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return { supabase, user };
}

// Father's name, nominee's name, mobile number and address. The partner's own
// name, date of birth, Aadhaar and email are their identity and are changed only
// by our team.
export async function updateProfile(input) {
  const { user } = await currentUser();
  if (!user) return { success: false, error: "Please log in again." };

  const phone = String(input?.phone ?? "").trim();
  const fatherName = String(input?.father_name ?? "").trim().slice(0, 100);
  const nomineeName = String(input?.nominee_name ?? "").trim().slice(0, 100);
  const addressLine = String(input?.address_line ?? "").trim().slice(0, 200);
  const city = String(input?.city ?? "").trim().slice(0, 100);
  const stateInfo = findState(String(input?.state ?? ""));
  const pincode = String(input?.pincode ?? "").trim();

  if (!fatherName) return { success: false, error: "Please enter your father's name." };
  if (!nomineeName) return { success: false, error: "Please enter your nominee's name." };
  const phoneErr = phoneError(phone);
  if (phoneErr) return { success: false, error: phoneErr };
  if (!addressLine || !city) return { success: false, error: "Please fill in your address." };
  if (!stateInfo) return { success: false, error: "Please select your state." };
  const pincodeErr = pincodeError(pincode);
  if (pincodeErr) return { success: false, error: pincodeErr };

  // Partners have no update rights on their own row, so this goes through the
  // service role, limited to these columns and to this one partner.
  const { error } = await createAdminClient()
    .from("profiles")
    .update({
      phone,
      father_name: fatherName,
      nominee_name: nomineeName,
      address_line: addressLine,
      city,
      state: stateInfo.name,
      pincode,
    })
    .eq("id", user.id);

  if (error) {
    console.error("Update profile error:", error.message);
    return { success: false, error: "We could not save your changes. Please try again." };
  }

  revalidatePath("/dashboard", "layout");
  return { success: true };
}

// The bank details the team pays the partner's points to. The account number is stored encrypted
// and only the last 4 digits come back to the partner. Leave the account number empty to keep the
// one already saved.
export async function updateBank(input) {
  const { user } = await currentUser();
  if (!user) return { success: false, error: "Please log in again." };

  const clean = (v, max) => String(v ?? "").trim().slice(0, max);
  const holder = clean(input?.holder, 80);
  const bankName = clean(input?.bank_name, 80);
  const branch = clean(input?.branch, 100);
  const ifsc = cleanIfsc(input?.ifsc);
  const upi = clean(input?.upi, 60).toLowerCase();
  const account = accountDigits(input?.account);
  const again = accountDigits(input?.account_again);

  const holderErr = holderError(holder);
  if (holderErr) return { success: false, error: holderErr };
  if (!bankName) return { success: false, error: "Enter the bank name." };
  const ifscErr = ifscError(ifsc);
  if (ifscErr) return { success: false, error: ifscErr };
  const upiErr = upiError(upi);
  if (upiErr) return { success: false, error: upiErr };

  const admin = createAdminClient();
  const { data: current } = await admin.from("profiles").select("bank_account_last4").eq("id", user.id).maybeSingle();

  const update = {
    bank_holder: holder,
    bank_name: bankName,
    bank_branch: branch || null,
    bank_ifsc: ifsc,
    upi_id: upi || null,
    bank_updated_at: new Date().toISOString(),
  };

  if (account) {
    const accountErr = accountError(account);
    if (accountErr) return { success: false, error: accountErr };
    if (account !== again) return { success: false, error: "The two account numbers do not match." };
    try {
      update.bank_account_encrypted = encryptText(account);
    } catch (err) {
      console.error("Bank account encryption error:", err.message);
      return { success: false, error: "We could not save your bank details. Please try again later." };
    }
    update.bank_account_last4 = account.slice(-4);
  } else if (!current?.bank_account_last4) {
    return { success: false, error: "Enter your account number." };
  }

  const { error } = await admin.from("profiles").update(update).eq("id", user.id);
  if (error) {
    console.error("Update bank error:", error.message);
    return { success: false, error: "We could not save your bank details. Please try again." };
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/admin", "layout");
  return { success: true };
}

export async function changePassword(current, next) {
  const { supabase, user } = await currentUser();
  if (!user?.email) return { success: false, error: "Please log in again." };

  const oldPassword = String(current ?? "");
  const newPassword = String(next ?? "");
  if (!oldPassword) return { success: false, error: "Enter your current password." };
  if (newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters." };
  }
  if (newPassword === oldPassword) {
    return { success: false, error: "New password must be different from the current one." };
  }

  // Check the current password first, so someone at an unlocked screen cannot change it.
  const { error: wrong } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword,
  });
  if (wrong) return { success: false, error: "Your current password is wrong." };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    console.error("Change password error:", error.message);
    return { success: false, error: "We could not change your password. Please try again." };
  }
  return { success: true };
}
