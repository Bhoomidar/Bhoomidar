"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { phoneError } from "@/lib/phone";
import { findState, pincodeError } from "@/lib/india";

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
