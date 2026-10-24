"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, X } from "lucide-react";

const MAX = 12;

// A row of photos: add several at once, move them left or right, remove one.
// `value` is a list of image addresses; the first one the website shows is the card photo.
export default function GalleryEditor({ value, onChange }) {
  const input = useRef(null);
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");

  const add = async (files) => {
    const picked = Array.from(files ?? []).slice(0, MAX - value.length);
    if (!picked.length) return;
    setError("");
    setBusy(picked.length);
    const done = [];
    for (const file of picked) {
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/admin/upload", { method: "POST", body });
        const json = await res.json();
        if (!res.ok || !json.url) throw new Error(json.error || "Upload failed.");
        done.push(json.url);
      } catch (err) {
        setError(err.message || "A photo could not be uploaded.");
      } finally {
        setBusy((n) => n - 1);
      }
    }
    if (done.length) onChange([...value, ...done]);
    if (input.current) input.current.value = "";
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = value.slice();
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {value.map((url, i) => (
          <li key={url + i} className="group relative overflow-hidden rounded-xl border border-black/10 bg-[#f1e6d4]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="" className="aspect-[4/3] w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/70 to-transparent px-2 pb-2 pt-6">
              <span className="flex gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move left"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-ink disabled:opacity-40"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === value.length - 1}
                  aria-label="Move right"
                  className="flex h-7 w-7 items-center justify-center rounded-md bg-white/90 text-ink disabled:opacity-40"
                >
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </span>
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                aria-label="Remove photo"
                className="flex h-7 w-7 items-center justify-center rounded-md bg-rose-600 text-white"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}

        {Array.from({ length: busy }, (_, k) => (
          <li key={`busy-${k}`} className="flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-copper/40 bg-copper/5">
            <Loader2 className="h-6 w-6 animate-spin text-copper" />
          </li>
        ))}

        {value.length + busy < MAX && (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-copper/40 text-sm font-semibold text-copper transition hover:bg-copper/5"
            >
              <ImagePlus className="h-6 w-6" />
              Add photos
            </button>
          </li>
        )}
      </ul>

      <p className="mt-2 text-xs text-ink/50">
        Up to {MAX} photos. You can pick many at once. These show on the property page after the main photo above.
      </p>
      {error && <p className="mt-1 text-sm text-rose-700">{error}</p>}

      <input
        ref={input}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => add(e.target.files)}
      />
    </div>
  );
}
