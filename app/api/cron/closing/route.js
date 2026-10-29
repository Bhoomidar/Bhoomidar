import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// The nightly closing, called by Vercel Cron (see vercel.json) at 1 AM India time.
// It shares last month's partnership and C.T.O. bonus once the month is over (the database
// function does the work and skips anything already shared, so calling it twice is safe).
// Vercel sends the secret in "Authorization: Bearer <CRON_SECRET>"; nobody else may call it.
export const dynamic = "force-dynamic";

function allowed(request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const got = Buffer.from(request.headers.get("authorization") ?? "");
  const want = Buffer.from(`Bearer ${secret}`);
  return got.length === want.length && timingSafeEqual(got, want);
}

export async function GET(request) {
  if (!allowed(request)) return NextResponse.json({ error: "Not allowed." }, { status: 401 });

  const { data, error } = await createAdminClient().rpc("nightly_closing");
  if (error) {
    console.error("nightly closing:", error.message);
    return NextResponse.json({ ok: false, error: "The closing could not run." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, result: data });
}
