"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { phoneError } from "@/lib/phone";
import { aadhaarDigits, aadhaarError, formatAadhaar } from "@/lib/aadhaar";
import { encryptAadhaar, hashAadhaar } from "@/lib/aadhaarCrypto";
import { findState, pincodeError } from "@/lib/india";
import { dobError, normalizeReferralCode } from "@/lib/referral";

// Only allow redirects to a path on this site.
function safeRedirect(target) {
  return typeof target === "string" && target.startsWith("/") && !target.startsWith("//")
    ? target
    : "/dashboard";
}

export async function login(_prevState, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "Wrong email or password." };

  // The admin can switch a partner off (admin panel > Partners).
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_active")
    .eq("id", data.user.id)
    .maybeSingle();
  if (profile?.is_active === false) {
    await supabase.auth.signOut();
    return { error: "This account is switched off. Please contact us." };
  }

  revalidatePath("/", "layout");
  redirect(safeRedirect(formData.get("redirect_to")));
}

// Creates the account directly (no email confirmation) and logs the user in.
// Besides the login details it stores the partner's KYC details and, when a
// referral code was given, links the new partner under the partner who owns it.
export async function register(_prevState, formData) {
  const text = (name) => String(formData.get(name) ?? "").trim();
  const fullName = text("full_name");
  const phone = text("phone");
  const email = text("email").toLowerCase();
  const password = String(formData.get("password") ?? "");
  const dob = text("dob");
  const aadhaar = aadhaarDigits(formData.get("aadhaar"));
  const addressLine = text("address_line");
  const city = text("city");
  const stateInfo = findState(text("state"));
  const pincode = text("pincode");
  const rawRef = text("referral_code");
  const fatherName = text("father_name").slice(0, 100);
  const nomineeName = text("nominee_name").slice(0, 100);

  // Handed back to the form so the partner does not have to type everything again.
  // The password is never sent back.
  const values = {
    full_name: fullName,
    phone,
    email,
    dob,
    aadhaar: formatAadhaar(aadhaar),
    address_line: addressLine,
    city,
    state: stateInfo?.code ?? "",
    pincode,
    referral_code: rawRef,
    father_name: fatherName,
    nominee_name: nomineeName,
  };
  const fail = (error) => ({ error, values });

  if (!fullName || !email || !password || !addressLine || !city) {
    return fail("Please fill in all the fields.");
  }
  const phoneErr = phoneError(phone);
  if (phoneErr) return fail(phoneErr);
  if (password.length < 6) {
    return fail("Password must be at least 6 characters.");
  }
  const dobErr = dobError(dob);
  if (dobErr) return fail(dobErr);
  const aadhaarErr = aadhaarError(aadhaar);
  if (aadhaarErr) return fail(aadhaarErr);
  if (!stateInfo) return fail("Please select your state.");
  const pincodeErr = pincodeError(pincode);
  if (pincodeErr) return fail(pincodeErr);
  if (!fatherName) return fail("Please enter your father's name.");
  if (!nomineeName) return fail("Please enter your nominee's name.");
  if (formData.get("consent") !== "on") {
    return fail("Please confirm that your details are correct.");
  }

  const admin = createAdminClient();

  // Optional referral code: it must belong to an activated partner (one whose
  // joining payment has been received).
  let referrerId = null;
  if (rawRef) {
    const code = normalizeReferralCode(rawRef);
    const { data: referrer } = code
      ? await admin
          .from("profiles")
          .select("id, is_active, activated_at")
          .eq("referral_code", code)
          .maybeSingle()
      : { data: null };
    if (!referrer || referrer.is_active === false || !referrer.activated_at) {
      return fail("This referral code is not valid. Check it, or leave it empty.");
    }
    referrerId = referrer.id;
  }

  let aadhaarHash;
  let aadhaarEncrypted;
  try {
    aadhaarHash = hashAadhaar(aadhaar);
    aadhaarEncrypted = encryptAadhaar(aadhaar);
  } catch (err) {
    console.error("Aadhaar encryption error:", err.message);
    return fail("We could not create your account. Please try again later.");
  }

  const { data: sameAadhaar } = await admin
    .from("profiles")
    .select("id")
    .eq("aadhaar_hash", aadhaarHash)
    .maybeSingle();
  if (sameAadhaar) return fail("A partner with this Aadhaar number already exists.");

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone, state_code: stateInfo.code },
  });

  if (createError) {
    const message = createError.message.toLowerCase();
    if (message.includes("already") && (message.includes("registered") || message.includes("exists"))) {
      return fail("An account with this email already exists. Please log in.");
    }
    console.error("Register error:", createError.message);
    return fail("We could not create your account. Please try again.");
  }

  // The profile row (and the partner's own referral code) was created by a
  // database trigger. Now add the rest. If this fails, remove the half-made
  // account so the partner can simply try again.
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      dob,
      address_line: addressLine,
      city,
      state: stateInfo.name,
      pincode,
      aadhaar_encrypted: aadhaarEncrypted,
      aadhaar_last4: aadhaar.slice(-4),
      aadhaar_hash: aadhaarHash,
      father_name: fatherName,
      nominee_name: nomineeName,
      referred_by: referrerId,
    })
    .eq("id", created.user.id);

  if (profileError) {
    console.error("Register profile error:", profileError.message);
    await admin.auth.admin.deleteUser(created.user.id);
    return fail(
      profileError.code === "23505"
        ? "A partner with this Aadhaar number already exists."
        : "We could not create your account. Please try again.",
    );
  }

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    redirect("/login");
  }

  revalidatePath("/", "layout");
  redirect(safeRedirect(formData.get("redirect_to")));
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
