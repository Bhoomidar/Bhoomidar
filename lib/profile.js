import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { matchState } from "@/lib/india";

// The logged-in partner and their profile. Cached per request, so the
// dashboard layout and pages can all call it without extra queries.
export const getCurrentPartner = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "full_name, email, phone, is_active, created_at, activated_at, dob, address_line, city, district, state, pincode, aadhaar_last4, avatar_url, father_name, nominee_name, referral_code, referred_by, bank_holder, bank_name, bank_branch, bank_ifsc, bank_account_last4, upi_id, bank_updated_at",
    )
    .eq("id", user.id)
    .maybeSingle();

  const name = profile?.full_name || user.user_metadata?.full_name || "Partner";
  // The district is only added when it is a different place from the city.
  const district = profile?.district && profile.district.toLowerCase() !== (profile.city ?? "").toLowerCase() ? profile.district : "";
  const address = [profile?.address_line, profile?.city, district, profile?.state, profile?.pincode]
    .filter(Boolean)
    .join(", ");

  return {
    user,
    name,
    firstName: name.split(" ")[0],
    email: profile?.email ?? user.email,
    phone: profile?.phone || "",
    active: profile?.is_active !== false,
    activated: !!profile?.activated_at,
    // Signed up but the joining payment is not received yet.
    pending: profile?.is_active !== false && !profile?.activated_at,
    joined: new Date(profile?.created_at ?? user.created_at).toLocaleDateString(
      "en-IN",
      { day: "numeric", month: "long", year: "numeric" },
    ),
    dob: profile?.dob
      ? new Date(profile.dob).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "",
    address,
    // The pieces of the address, for the edit form.
    addressParts: {
      address_line: profile?.address_line ?? "",
      city: profile?.city ?? "",
      state: matchState(profile?.state)?.code ?? "",
      pincode: profile?.pincode ?? "",
    },
    activatedOn: profile?.activated_at
      ? new Date(profile.activated_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "",
    aadhaarLast4: profile?.aadhaar_last4 ?? "",
    // Only the last 4 digits of the account number are ever sent to the partner's pages.
    bank: {
      added: !!profile?.bank_account_last4,
      holder: profile?.bank_holder ?? "",
      name: profile?.bank_name ?? "",
      branch: profile?.bank_branch ?? "",
      ifsc: profile?.bank_ifsc ?? "",
      last4: profile?.bank_account_last4 ?? "",
      upi: profile?.upi_id ?? "",
      updatedOn: profile?.bank_updated_at
        ? new Date(profile.bank_updated_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" })
        : "",
    },
    avatarUrl: profile?.avatar_url ?? "",
    fatherName: profile?.father_name ?? "",
    nomineeName: profile?.nominee_name ?? "",
    referralCode: profile?.referral_code ?? "",
    referredBy: profile?.referred_by ?? null,
  };
});

// Who referred this partner, and who they referred. Only names and codes are
// returned: no phone, email or Aadhaar of other partners ever reaches the page.
// Partners cannot read other partners' rows directly, so this uses the
// service role; it must only ever be called with the logged-in partner's own id.
export const getNetwork = cache(async (partnerId, referredById) => {
  const admin = createAdminClient();

  let referrer = null;
  if (referredById) {
    const { data } = await admin
      .from("profiles")
      .select("full_name, referral_code, avatar_url, city, state, created_at")
      .eq("id", referredById)
      .maybeSingle();
    if (data) {
      referrer = {
        name: data.full_name,
        code: data.referral_code,
        avatar: data.avatar_url || "",
        place: [data.city, data.state].filter(Boolean).join(", "),
        joined: shortDate(data.created_at),
      };
    }
  }

  const { data: direct } = await admin
    .from("profiles")
    .select("id, full_name, referral_code, created_at, is_active, activated_at")
    .eq("referred_by", partnerId)
    .order("created_at", { ascending: false });

  // How many people each of them has referred in turn.
  const ids = (direct ?? []).map((p) => p.id);
  const counts = {};
  if (ids.length) {
    const { data: below } = await admin.from("profiles").select("referred_by").in("referred_by", ids);
    for (const row of below ?? []) counts[row.referred_by] = (counts[row.referred_by] ?? 0) + 1;
  }

  const referrals = (direct ?? []).map((p) => ({
    id: p.id,
    name: p.full_name,
    code: p.referral_code,
    active: p.is_active !== false,
    pending: !p.activated_at,
    referredCount: counts[p.id] ?? 0,
    joinedAt: p.created_at,
    joined: new Date(p.created_at).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  }));

  return { referrer, referrals };
});

const shortDate = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// Everyone under this partner, level by level: the people they referred (level 1),
// the people those partners referred (level 2), and so on. Each person comes with
// what a team member should see: name, photo, code, place, joining and payment
// status. Never phone, email, date of birth or Aadhaar.
// Like getNetwork, call it only with the logged-in partner's own id.
export const getDownline = cache(async (partnerId) => {
  const admin = createAdminClient();
  const nodes = [];
  let parents = [partnerId];

  for (let level = 1; level <= 10 && parents.length && nodes.length < 500; level++) {
    const { data } = await admin
      .from("profiles")
      .select(
        "id, full_name, referral_code, created_at, is_active, activated_at, avatar_url, city, state, referred_by",
      )
      .in("referred_by", parents)
      .order("created_at", { ascending: true });
    if (!data?.length) break;

    for (const p of data) {
      nodes.push({
        id: p.id,
        parentId: p.referred_by,
        level,
        name: p.full_name || "Partner",
        code: p.referral_code,
        avatar: p.avatar_url || "",
        place: [p.city, p.state].filter(Boolean).join(", "),
        joined: shortDate(p.created_at),
        activatedOn: p.activated_at ? shortDate(p.activated_at) : "",
        status: p.is_active === false ? "off" : p.activated_at ? "active" : "unpaid",
      });
    }
    parents = data.map((p) => p.id);
  }
  return nodes;
});

export const initials = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
