"use client";

import { useState } from "react";

// Two-step button: the first click asks "Sure?", the second click does it.
export default function ConfirmButton({
  onConfirm,
  children,
  confirmText = "Yes, delete",
  className = "",
  disabled,
}) {
  const [asking, setAsking] = useState(false);

  if (asking) {
    return (
      <span className="inline-flex items-center gap-2 text-sm">
        <span className="text-ink/60">Sure?</span>
        <button
          type="button"
          onClick={() => {
            setAsking(false);
            onConfirm();
          }}
          className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-rose-700"
        >
          {confirmText}
        </button>
        <button
          type="button"
          onClick={() => setAsking(false)}
          className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:bg-black/5"
        >
          No
        </button>
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => setAsking(true)}
      className={className}
    >
      {children}
    </button>
  );
}
