import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const MAX_BYTES = 5 * 1024 * 1024;
// No SVG or GIF: a photo only.
const TYPES = ["image/jpeg", "image/png", "image/webp"];

const imageKitAuth = () =>
  "Basic " + Buffer.from(process.env.IMAGEKIT_PRIVATE_KEY + ":").toString("base64");

// The logged-in partner, taken from the session. The id never comes from the request.
async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

// Best effort: a leftover old photo on ImageKit is not worth failing the request for.
async function removeFromImageKit(fileId) {
  if (!fileId) return;
  try {
    await fetch(`https://api.imagekit.io/v1/files/${encodeURIComponent(fileId)}`, {
      method: "DELETE",
      headers: { Authorization: imageKitAuth() },
    });
  } catch (err) {
    console.error("ImageKit cleanup error:", err?.message || err);
  }
}

// Upload or replace the partner's own profile photo. Returns { url }.
export async function POST(request) {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Please log in again." }, { status: 401 });

  if (!process.env.IMAGEKIT_PRIVATE_KEY) {
    return NextResponse.json({ error: "Photo upload is not set up." }, { status: 500 });
  }

  try {
    const incoming = await request.formData();
    const file = incoming.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No photo provided." }, { status: 400 });
    }
    if (!TYPES.includes(file.type)) {
      return NextResponse.json({ error: "Please choose a JPG, PNG or WebP photo." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Photo must be under 5 MB." }, { status: 400 });
    }

    const body = new FormData();
    body.append("file", file);
    body.append("fileName", `avatar-${userId}.jpg`);
    body.append("folder", "/bhoomidar/avatars");
    body.append("useUniqueFileName", "true");

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: { Authorization: imageKitAuth() },
      body,
    });
    const json = await res.json();
    if (!res.ok || !json.url) {
      return NextResponse.json({ error: json.message || "Upload failed." }, { status: 502 });
    }

    const admin = createAdminClient();
    const { data: before } = await admin
      .from("profiles")
      .select("avatar_file_id")
      .eq("id", userId)
      .maybeSingle();

    const { error } = await admin
      .from("profiles")
      .update({ avatar_url: json.url, avatar_file_id: json.fileId ?? null })
      .eq("id", userId);
    if (error) {
      console.error("Save avatar error:", error.message);
      await removeFromImageKit(json.fileId);
      return NextResponse.json({ error: "Could not save your photo." }, { status: 500 });
    }

    await removeFromImageKit(before?.avatar_file_id);
    return NextResponse.json({ url: json.url });
  } catch (err) {
    console.error("Avatar upload error:", err?.message || err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}

// Remove the partner's own profile photo.
export async function DELETE() {
  const userId = await currentUserId();
  if (!userId) return NextResponse.json({ error: "Please log in again." }, { status: 401 });

  const admin = createAdminClient();
  const { data: before } = await admin
    .from("profiles")
    .select("avatar_file_id")
    .eq("id", userId)
    .maybeSingle();

  const { error } = await admin
    .from("profiles")
    .update({ avatar_url: null, avatar_file_id: null })
    .eq("id", userId);
  if (error) {
    console.error("Remove avatar error:", error.message);
    return NextResponse.json({ error: "Could not remove your photo." }, { status: 500 });
  }

  await removeFromImageKit(before?.avatar_file_id);
  return NextResponse.json({ ok: true });
}
