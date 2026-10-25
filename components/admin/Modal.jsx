"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

// fullOnPhone: on a phone the popup fills the whole screen (a page of its own), on a bigger screen it is the usual card.
export default function Modal({ title, subtitle, icon: Icon, size = "md", fullOnPhone = false, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 z-[60] flex justify-center overflow-y-auto bg-[#140d08]/65 backdrop-blur-sm sm:items-center sm:p-4 ${
        fullOnPhone ? "items-stretch p-0" : "items-start p-4"
      }`}
    >
      <div
        className="absolute inset-0"
        onClick={onClose}
        aria-hidden
      />
      <div
        className={`fade-up relative w-full ${size === "xl" ? "max-w-5xl" : "max-w-2xl"} bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-5 shadow-[0_40px_90px_-24px_rgba(60,30,10,0.7)] sm:my-6 sm:rounded-3xl sm:p-8 sm:ring-1 sm:ring-copper/20 ${
          fullOnPhone ? "min-h-full rounded-none pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:min-h-0" : "my-6 rounded-3xl ring-1 ring-copper/20"
        }`}
      >
        <div
          className={`mb-6 flex items-center justify-between gap-3 border-b border-black/5 pb-4 ${
            fullOnPhone
              ? "sticky top-0 z-10 -mx-5 -mt-5 mb-5 bg-[#fffaf3]/95 px-5 pt-5 backdrop-blur sm:static sm:mx-0 sm:mt-0 sm:mb-6 sm:bg-transparent sm:px-0 sm:pt-0 sm:backdrop-blur-none"
              : ""
          }`}
        >
          <div className="flex min-w-0 items-center gap-3.5">
            {Icon && (
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30">
                <Icon className="h-6 w-6" />
              </span>
            )}
            <div className="min-w-0 leading-tight">
              <h2 className="break-words font-display text-2xl font-bold text-ink">{title}</h2>
              {subtitle && <p className="mt-1 text-sm text-ink/55">{subtitle}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-ink/60 shadow-sm ring-1 ring-black/10 transition hover:text-copper hover:ring-copper"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
