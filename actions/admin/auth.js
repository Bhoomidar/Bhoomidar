"use server";

import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  COOKIE_NAME,
  MAX_AGE_SECONDS,
  createAdminSessionToken,
} from "@/lib/adminSession";

// Compares two strings without leaking how many characters matched.
function safeEqual(a, b) {
  const ha = crypto.createHash("sha256").update(String(a)).digest();
  const hb = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(ha, hb);
}

export async function adminLogin(_prev, formData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const adminEmail = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "";

  if (!adminEmail || !adminPassword || !process.env.ADMIN_SESSION_SECRET) {
    return { error: "Admin login is not set up. Check ADMIN_* values in .env." };
  }

  const ok = safeEqual(email, adminEmail) && safeEqual(password, adminPassword);
  if (!ok) {
    await new Promise((r) => setTimeout(r, 600)); // slows down password guessing
    return { error: "Wrong email or password." };
  }

  const store = await cookies();
  store.set(COOKIE_NAME, await createAdminSessionToken(adminEmail), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE_SECONDS,
    path: "/",
  });
  redirect("/admin");
}

export async function adminLogout() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  redirect("/admin/login");
}
