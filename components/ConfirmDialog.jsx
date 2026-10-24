"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Loader2 } from "lucide-react";

const TONES = {
  danger: {
    chip: "bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600 ring-rose-200",
    glow: "bg-rose-400/30",
    btn: "from-rose-500 to-rose-700 shadow-rose-600/35",
  },
  warn: {
    chip: "bg-gradient-to-br from-amber-100 to-amber-50 text-amber-600 ring-amber-200",
    glow: "bg-amber-400/30",
    btn: "from-copper-light to-copper-dark shadow-copper/35",
  },
};

// A themed replacement for window.confirm(). Render it while you are asking,
// and unmount it from onCancel / onConfirm.
export default function ConfirmDialog({
  title,
  text,
  confirmText = "Yes, continue",
  cancelText = "Cancel",
  tone = "warn",
  icon: Icon = AlertTriangle,
  busy = false,
  onConfirm,
  onCancel,
}) {
  const t = TONES[tone] ?? TONES.warn;

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onCancel]);

  return createPortal(
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-[#140d08]/65 backdrop-blur-sm" onClick={onCancel} aria-hidden />

      <div className="fade-up relative w-full max-w-md overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-7 text-center shadow-[0_40px_90px_-24px_rgba(60,30,10,0.7)] ring-1 ring-copper/20 sm:p-8">
        <div className={`pointer-events-none absolute -top-16 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl ${t.glow}`} />

        <span className="relative mx-auto flex h-[72px] w-[72px] items-center justify-center">
          <span className="absolute -inset-2 rounded-full bg-white/70" />
          <span className={`absolute inset-0 rounded-full shadow-lg ring-1 ${t.chip}`} />
          <Icon className="relative h-8 w-8" strokeWidth={1.8} />
        </span>

        <h2 id="confirm-title" className="relative mt-5 font-display text-2xl font-bold text-ink">
          {title}
        </h2>
        <p className="relative mt-2.5 text-[15px] leading-relaxed text-ink/65">{text}</p>

        <div className="relative mt-7 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            autoFocus
            className="rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-ink shadow-sm ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:ring-copper/40 disabled:opacity-60"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-b px-5 py-3.5 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-60 ${t.btn}`}
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
