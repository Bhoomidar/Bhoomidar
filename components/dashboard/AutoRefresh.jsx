"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Re-reads the page every so often while it is open, so numbers that change on
// other people's accounts (like new referrals) show up without a reload.
// A partner cannot receive live events for other partners, so this polls.
export default function AutoRefresh({ seconds = 20 }) {
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") router.refresh();
    }, seconds * 1000);
    return () => clearInterval(timer);
  }, [router, seconds]);

  return null;
}
