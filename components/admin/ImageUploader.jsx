"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2 } from "lucide-react";

// Single image: shows a preview and uploads a new one through /api/admin/upload.
export default function ImageUploader({ value, onChange, aspect = "aspect-[16/9]" }) {
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const upload = async (file) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body });
      const json = await res.json();
      if (!res.ok || !json.url) throw new Error(json.error || "Upload failed.");
      onChange(json.url);
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  };

  return (
    <div>
      <div
        className={`relative w-full max-w-sm overflow-hidden rounded-xl border border-black/10 bg-[#f1e6d4] ${aspect}`}
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink/40">
            No image
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-copper" />
          </div>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-lg border border-copper px-4 py-2 text-sm font-semibold text-copper transition hover:bg-copper hover:text-white disabled:opacity-60"
        >
          <ImagePlus className="h-4 w-4" />
          {uploading ? "Uploading..." : value ? "Change image" : "Upload image"}
        </button>
        {error && <span className="text-sm text-rose-700">{error}</span>}
      </div>

      <input
        ref={input}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => upload(e.target.files?.[0])}
      />
    </div>
  );
}
