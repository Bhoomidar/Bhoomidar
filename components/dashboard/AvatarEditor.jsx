"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Loader2, X } from "lucide-react";

// Centre square of the chosen photo, shrunk to 512 px. Keeps uploads small and
// fixes phone photos that are rotated. Falls back to the original file.
async function squarePhoto(file, size = 512) {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const side = Math.min(bitmap.width, bitmap.height);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = Math.min(size, side);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff"; // transparent PNGs get a white background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
    return blob ?? file;
  } catch {
    return file;
  }
}

// The partner's profile photo with a camera button to add or change it, and a
// small cross to remove it. The photo is stored on ImageKit and its address is
// saved on the profile (see app/api/profile/avatar).
export default function AvatarEditor({ url, initials, overlap = true }) {
  const router = useRouter();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const send = async (request) => {
    setBusy(true);
    setError("");
    try {
      const res = await request();
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong.");
      router.refresh();
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  };

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose a photo.");
    const photo = await squarePhoto(file);
    const body = new FormData();
    body.append("file", photo, "avatar.jpg");
    send(() => fetch("/api/profile/avatar", { method: "POST", body }));
  };

  const remove = () => {
    if (!window.confirm("Remove your profile photo?")) return;
    send(() => fetch("/api/profile/avatar", { method: "DELETE" }));
  };

  return (
    <div className="shrink-0">
      <div className={`relative h-28 w-28 sm:h-32 sm:w-32 ${overlap ? "-mt-14 sm:-mt-16" : ""}`}>
        <span className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark font-display text-4xl font-bold text-white shadow-xl ring-[6px] ring-white sm:text-5xl">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="Your profile photo" className="h-full w-full object-cover" />
          ) : (
            initials
          )}
        </span>

        {busy && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45">
            <Loader2 className="h-7 w-7 animate-spin text-white" />
          </span>
        )}

        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy}
          aria-label={url ? "Change profile photo" : "Add profile photo"}
          title={url ? "Change photo" : "Add photo"}
          className="absolute bottom-0 right-0 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg ring-4 ring-white transition hover:scale-110 disabled:opacity-60"
        >
          <Camera className="h-[18px] w-[18px]" />
        </button>

        {url && !busy && (
          <button
            type="button"
            onClick={remove}
            aria-label="Remove profile photo"
            title="Remove photo"
            className="absolute right-0 top-0 flex h-7 w-7 items-center justify-center rounded-full bg-white text-ink/60 shadow-md ring-1 ring-black/10 transition hover:text-rose-600"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onPick}
          className="hidden"
        />
      </div>
      {error && (
        <p role="alert" className="mt-3 max-w-[14rem] text-xs font-medium text-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
