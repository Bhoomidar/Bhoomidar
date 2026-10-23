"use client";

import { useState, useTransition } from "react";
import { Eye, EyeOff } from "lucide-react";
import { revealAadhaar } from "@/actions/admin/partners";
import { maskAadhaar } from "@/lib/aadhaar";

// The Aadhaar number, masked. The full number is fetched only when the admin asks.
export default function AadhaarReveal({ id, last4 }) {
  const [full, setFull] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const reveal = () =>
    start(async () => {
      setError("");
      const res = await revealAadhaar(id);
      if (res.success) setFull(res.aadhaar);
      else setError(res.error);
    });

  return (
    <span className="flex flex-wrap items-center gap-3">
      <span className="font-mono tracking-wider">{full || maskAadhaar(last4)}</span>
      {last4 &&
        (full ? (
          <button
            type="button"
            onClick={() => setFull("")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-copper hover:text-copper"
          >
            <EyeOff className="h-3.5 w-3.5" />
            Hide
          </button>
        ) : (
          <button
            type="button"
            onClick={reveal}
            disabled={pending}
            className="inline-flex items-center gap-1.5 rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-copper hover:text-copper disabled:opacity-60"
          >
            <Eye className="h-3.5 w-3.5" />
            {pending ? "Loading..." : "Show full number"}
          </button>
        ))}
      {error && <span className="w-full text-xs font-normal text-rose-700">{error}</span>}
    </span>
  );
}
