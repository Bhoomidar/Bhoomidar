import { NextResponse } from "next/server";
import { getAdmin } from "@/lib/adminAuth";

const MAX_BYTES = 8 * 1024 * 1024;

// Admin-only image upload to ImageKit. Returns { url }.
export async function POST(request) {
  if (!(await getAdmin())) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }

  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    return NextResponse.json({ error: "ImageKit is not set up." }, { status: 500 });
  }

  try {
    const incoming = await request.formData();
    const file = incoming.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (!file.type?.startsWith("image/")) {
      return NextResponse.json({ error: "Please choose an image file." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "Image must be under 8 MB." }, { status: 400 });
    }

    const body = new FormData();
    body.append("file", file);
    body.append("fileName", file.name || `upload-${Date.now()}.jpg`);
    body.append("folder", "/bhoomidar");
    body.append("useUniqueFileName", "true");

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(privateKey + ":").toString("base64"),
      },
      body,
    });
    const json = await res.json();
    if (!res.ok || !json.url) {
      return NextResponse.json(
        { error: json.message || "Upload failed." },
        { status: 502 },
      );
    }
    return NextResponse.json({ url: json.url });
  } catch (err) {
    console.error("Upload error:", err?.message || err);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
