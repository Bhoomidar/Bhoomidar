"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { phoneError } from "@/lib/phone";

const clean = (v, max) => String(v ?? "").trim().slice(0, max);

// Public contact form: saves the message so the admin can read it.
export async function submitInquiry(_prev, formData) {
  // Hidden field only bots fill in.
  if (clean(formData.get("company"), 50)) return { success: true };

  const name = clean(formData.get("name"), 80);
  const phone = clean(formData.get("phone"), 10);
  const email = clean(formData.get("email"), 120);
  const interest = clean(formData.get("interest"), 60);
  const message = clean(formData.get("message"), 1500);

  if (!name || !message) return { error: "Please fill in your name and message." };
  const phoneErr = phoneError(phone);
  if (phoneErr) return { error: phoneErr };
  if (email && !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  const { error } = await createAdminClient().from("inquiries").insert({
    name,
    phone,
    email: email || null,
    interest: interest || null,
    message,
  });
  if (error) {
    console.error("submitInquiry:", error.message);
    return { error: "We could not send your message. Please try again." };
  }

  revalidatePath("/admin", "layout");
  return { success: true };
}
