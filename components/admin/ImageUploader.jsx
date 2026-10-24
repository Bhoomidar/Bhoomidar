"use client";

import { useRef, useState } from "react";
import { ImagePlus, Loader2, Trash2, UploadCloud } from "lucide-react";

// Single image: shows a preview and uploads a new one through /api/admin/upload.
// You can click the box or drop a photo on it.
export default function ImageUploader({
  value,
  onChange,
  aspect = "aspect-[16/9]",
  maxWidth = "max-w-sm",
  optional = false,
  natural = false, // show the photo at its real ratio instead of cropping to `aspect`
}) {
  const input = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [size, setSize] = useState(null);
  const [over, setOver] = useState(false);

  const upload = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose a photo.");
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
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        upload(e.dataTransfer.files?.[0]);
      }}
      className={`rounded-2xl border-2 border-dashed p-3 transition sm:p-4 ${
        over ? "border-copper bg-copper/10" : "border-copper/25 bg-white"
      }`}
    >
      <div
        className={`relative overflow-hidden rounded-xl bg-[#f1e6d4] ring-1 ring-black/10 ${
          natural && value ? "w-fit max-w-full" : `w-full ${maxWidth} ${aspect}`
        }`}
      >
        {value && natural ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={value}
            alt=""
            onLoad={(e) =>
              setSize({ w: e.currentTarget.naturalWidth, h: e.currentTarget.naturalHeight })
            }
            className="block h-auto max-h-[420px] w-auto max-w-full sm:max-w-md"
          />
        ) : value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="" className="h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            className="flex h-full min-h-[120px] w-full flex-col items-center justify-center gap-2 text-sm text-ink/50 transition hover:text-copper"
          >
            <UploadCloud className="h-8 w-8 text-copper/70" />
            <span className="font-semibold">Click or drop a photo here</span>
          </button>
        )}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70">
            <Loader2 className="h-6 w-6 animate-spin text-copper" />
          </div>
        )}
      </div>

      {natural && value && size && (
        <p className="mt-2 inline-flex rounded-full bg-[#faf1e6] px-3 py-1 text-xs font-semibold text-ink/60 ring-1 ring-black/5">
          Actual size: {size.w} × {size.h} px
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          <ImagePlus className="h-4 w-4" />
          {uploading ? "Uploading..." : value ? "Change image" : "Upload image"}
        </button>
        {optional && value && (
          <button
            type="button"
            onClick={() => onChange("")}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 rounded-xl bg-white px-3.5 py-2.5 text-sm font-semibold text-ink/60 shadow-sm ring-1 ring-black/10 transition hover:text-rose-700 hover:ring-rose-300 disabled:opacity-60"
          >
            <Trash2 className="h-4 w-4" />
            Remove
          </button>
        )}
        {error && <span className="text-sm font-medium text-rose-700">{error}</span>}
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
