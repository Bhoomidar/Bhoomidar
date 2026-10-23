"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Info } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Keeps the dashboard in step with what the admin does. When the admin marks the
// payment paid, switches the account on or off, or puts it back to unpaid, the
// change arrives here at once, the page re-reads the account (no reload needed)
// and a short message tells the partner what happened.
export default function LiveStatus({ userId, active, activated }) {
  const router = useRouter();
  const known = useRef({ active, activated });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const supabase = createClient();
    let timer;

    const announce = (next) => {
      clearTimeout(timer);
      setToast(next);
      timer = setTimeout(() => setToast(null), 7000);
    };

    const channel = supabase
      .channel(`partner-${userId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${userId}` },
        ({ new: row }) => {
          const now = { active: row.is_active !== false, activated: !!row.activated_at };
          const before = known.current;
          known.current = now;

          if (now.active !== before.active) {
            announce(
              now.active
                ? { tone: "good", text: "Your account is switched on again." }
                : { tone: "bad", text: "Your account has been switched off by the admin." },
            );
          } else if (now.activated !== before.activated) {
            announce(
              now.activated
                ? { tone: "good", text: "Payment received. Your account is now active!" }
                : { tone: "wait", text: "Your account is waiting for payment confirmation." },
            );
          }
          router.refresh();
        },
      )
      .subscribe();

    // Back on this tab after a while (or a dropped connection): catch up.
    const onVisible = () => document.visibilityState === "visible" && router.refresh();
    document.addEventListener("visibilitychange", onVisible);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisible);
      supabase.removeChannel(channel);
    };
  }, [userId, router]);

  if (!toast) return null;

  const tones = {
    good: { box: "bg-emerald-600", icon: CheckCircle2 },
    wait: { box: "bg-amber-600", icon: Clock },
    bad: { box: "bg-rose-600", icon: Info },
  };
  const { box, icon: Icon } = tones[toast.tone];

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fade-up fixed right-4 top-20 z-[70] flex max-w-sm items-start gap-3 rounded-2xl px-5 py-4 text-sm font-semibold text-white shadow-2xl lg:top-6 ${box}`}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      {toast.text}
    </div>
  );
}
