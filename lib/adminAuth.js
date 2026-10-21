import { cookies } from "next/headers";
import { COOKIE_NAME, verifyAdminSessionToken } from "@/lib/adminSession";

// Returns { email } for a logged-in admin, otherwise null.
export async function getAdmin() {
  const store = await cookies();
  return verifyAdminSessionToken(store.get(COOKIE_NAME)?.value);
}

// Call at the top of EVERY admin server action and admin API route.
// Server actions are public endpoints, so the proxy alone is not enough.
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) throw new Error("Not authorised");
  return admin;
}
