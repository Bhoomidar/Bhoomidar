"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { phoneError } from "@/lib/phone";
import { aadhaarDigits, aadhaarError, formatAadhaar } from "@/lib/aadhaar";
import { encryptAadhaar, hashAadhaar } from "@/lib/aadhaarCrypto";
import { findState, pincodeError } from "@/lib/india";
import { dobError, loginCodeCandidates } from "@/lib/referral";
import {
  EMAIL_PATTERN,
  checkEmailCode,
  cleanEmail,
  consumeResetToken,
  isEmailVerified,
  sendEmailCode,
  sendResetLink,
  finishEmailVerification,
} from "@/lib/authCodes";

// Only allow redirects to a path on this site.
function safeRedirect(target) {
  return typeof target === "string" && target.startsWith("/") && !target.startsWith("//")
    ? target
    : "/dashboard";
}

// What a partner typed in "email or referral code" -> their email, or "" when there is no such partner.
async function resolveEmail(typedRaw) {
  const typed = String(typedRaw ?? "").trim();
  if (!typed) return "";
  if (typed.includes("@")) return cleanEmail(typed);
  const codes = loginCodeCandidates(typed);
  if (!codes.length) return "";
  const { data: owner } = await createAdminClient()
    .from("profiles")
    .select("email")
    .in("referral_code", codes)
    .limit(1)
    .maybeSingle();
  return owner?.email ? cleanEmail(owner.email) : "";
}

export async function login(_prevState, formData) {
  // The partner can type their email, or their own referral code, and then the password.
  const typed = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!typed || !password) {
    return { error: "Please enter your email or referral code, and your password." };
  }

  let email = typed.toLowerCase();
  if (!typed.includes("@")) {
    const codes = loginCodeCandidates(typed);
    if (!codes.length) return { error: "Wrong email, referral code or password." };
    const { data: owner } = await createAdminClient()
      .from("profiles")
      .select("email")
      .in("referral_code", codes)
      .limit(1)
      .maybeSingle();
    // The same answer whether the code exists or not, so nobody can use this to find codes.
    if (!owner?.email) return { error: "Wrong email, referral code or password." };
    email = owner.email.toLowerCase();
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: typed.includes("@") ? "Wrong email or password." : "Wrong email, referral code or password." };

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
  const district = text("district").slice(0, 80);
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
    district,
    state: stateInfo?.code ?? "",
    pincode,
    referral_code: rawRef,
    father_name: fatherName,
    nominee_name: nomineeName,
  };
  const fail = (error) => ({ error, values });

  if (!fullName || !email || !password || !addressLine || !city || !district) {
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
  // The email must be proved first, with the code sent to it (see sendRegisterCode).
  if (!(await isEmailVerified(email))) {
    return fail("Please verify your email with the code we send you.");
  }

  const admin = createAdminClient();

  // The referral code is needed to register: it must belong to an activated partner (one whose
  // joining payment has been received). That partner becomes the one who referred this person.
  if (!rawRef) return fail("Please enter the referral code of the partner who invited you.");
  const codes = loginCodeCandidates(rawRef);
  const { data: referrer } = codes.length
    ? await admin
        .from("profiles")
        .select("id, is_active, activated_at")
        .in("referral_code", codes)
        .limit(1)
        .maybeSingle()
    : { data: null };
  if (!referrer || referrer.is_active === false || !referrer.activated_at) {
    return fail("This referral code is not valid. Check it with the partner who invited you.");
  }
  const referrerId = referrer.id;

  let aadhaarHash;
  let aadhaarEncrypted;
  try {
    aadhaarHash = hashAadhaar(aadhaar);
    aadhaarEncrypted = encryptAadhaar(aadhaar);
  } catch (err) {
    console.error("Aadhaar encryption error:", err.message);
    // while developing, show the real reason on the form too
    return fail(
      process.env.NODE_ENV === "production"
        ? "We could not create your account. Please try again later."
        : `We could not create your account. (${err.message})`,
    );
  }

  const { data: sameAadhaar } = await admin
    .from("profiles")
    .select("id")
    .eq("aadhaar_hash", aadhaarHash)
    .maybeSingle();
  if (sameAadhaar) return fail("A partner with this Aadhaar number already exists.");

  // The partner's code is made from the state and the district they gave.
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone, state_code: stateInfo.code, district },
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
      district,
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

  await finishEmailVerification(email);

  const supabase = await createClient();
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    redirect("/login");
  }

  revalidatePath("/", "layout");
  redirect(safeRedirect(formData.get("redirect_to")));
}

// Registration, step "verify email": sends a 6-digit code to the email the new partner typed.
export async function sendRegisterCode(emailRaw) {
  const email = cleanEmail(emailRaw);
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." };
  const { data: taken } = await createAdminClient().from("profiles").select("id").eq("email", email).maybeSingle();
  if (taken) return { error: "An account with this email already exists. Please log in." };
  // Verified a moment ago (the form may be sent for 30 minutes after that): no new code is needed.
  if (await isEmailVerified(email)) return { ok: true, verified: true };
  const res = await sendEmailCode(email, "register");
  return res.error ? res : { ok: true };
}

// Registration: has this email already been verified (not long ago)? So the form can skip the code.
export async function checkRegisterEmail(emailRaw) {
  const email = cleanEmail(emailRaw);
  if (!EMAIL_PATTERN.test(email)) return { verified: false };
  return { verified: await isEmailVerified(email) };
}

// Registration: checks the code. Right: the email counts as verified for a while.
export async function verifyRegisterCode(emailRaw, code) {
  const ok = await checkEmailCode(emailRaw, "register", code);
  return ok ? { ok: true } : { error: "This code is wrong or has expired." };
}

// Login with a code from the email instead of the password: sends the code.
// The answer is the same whether the partner exists or not.
export async function sendLoginCode(typedRaw) {
  if (!String(typedRaw ?? "").trim()) return { error: "Please enter your email or referral code." };
  const email = await resolveEmail(typedRaw);
  if (email) {
    const { data: profile } = await createAdminClient()
      .from("profiles")
      .select("id, is_active")
      .eq("email", email)
      .maybeSingle();
    if (profile && profile.is_active !== false) {
      const res = await sendEmailCode(email, "login");
      if (res.error) return res;
    }
  }
  // Says where the code went. An email the person typed is shown as typed; for a referral code only a masked
  // address comes back (h***l@gmail.com), so the full email of a partner never leaves the server.
  const typed = String(typedRaw).trim();
  let sentTo = "";
  if (typed.includes("@")) sentTo = cleanEmail(typed);
  else if (email) {
    const [name, domain] = email.split("@");
    sentTo = `${name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`}@${domain}`;
  }
  return { ok: true, sentTo };
}

// Login with a code from the email: checks the code and logs the partner in.
export async function loginWithCode(_prevState, formData) {
  const wrong = { error: "This code is wrong or has expired." };
  const email = await resolveEmail(formData.get("email"));
  if (!email || !(await checkEmailCode(email, "login", formData.get("code")))) return wrong;

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("id, is_active").eq("email", email).maybeSingle();
  if (!profile) return wrong;
  if (profile.is_active === false) return { error: "This account is switched off. Please contact us." };

  // A one-time sign-in token for this email, made by the server and used at once (no email is sent by it).
  const { data: link, error: linkError } = await admin.auth.admin.generateLink({ type: "magiclink", email });
  const tokenHash = link?.properties?.hashed_token;
  if (linkError || !tokenHash) {
    console.error("Login code error:", linkError?.message);
    return { error: "We could not log you in. Please try again." };
  }
  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: "email" });
  if (verifyError) {
    console.error("Login code error:", verifyError.message);
    return { error: "We could not log you in. Please try again." };
  }

  revalidatePath("/", "layout");
  redirect(safeRedirect(formData.get("redirect_to")));
}

// "Forgot password": emails a one-time link. The answer is the same whether the partner exists or not.
export async function requestPasswordReset(_prevState, formData) {
  if (!String(formData.get("email") ?? "").trim()) return { error: "Please enter your email or referral code." };
  const email = await resolveEmail(formData.get("email"));
  if (email) {
    const { data: profile } = await createAdminClient().from("profiles").select("id").eq("email", email).maybeSingle();
    if (profile) {
      const res = await sendResetLink(email);
      if (res.error) return res;
    }
  }
  return { sent: true };
}

// The page the link of "forgot password" opens: sets the new password.
export async function resetPassword(_prevState, formData) {
  const password = String(formData.get("password") ?? "");
  const again = String(formData.get("password2") ?? "");
  if (password.length < 6) return { error: "Password must be at least 6 characters." };
  if (password !== again) return { error: "The two passwords are not the same." };

  const email = await consumeResetToken(formData.get("token"));
  if (!email) return { error: "This link is not valid any more. Please ask for a new one.", expired: true };

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("id").eq("email", email).maybeSingle();
  const { error } = profile
    ? await admin.auth.admin.updateUserById(profile.id, { password })
    : { error: { message: "no such partner" } };
  if (error) {
    console.error("Password reset error:", error.message);
    return { error: "We could not change the password. Please ask for a new link.", expired: true };
  }

  redirect("/login?reset=1");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}
