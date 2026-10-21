"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, Phone, Trash2 } from "lucide-react";
import { deleteInquiry, setInquiryStatus } from "@/actions/admin/inquiries";
import ConfirmButton from "./ConfirmButton";
import { card, iconBtn } from "./ui";

const STATUS = {
  new: "bg-copper/15 text-copper-dark",
  read: "bg-sky-500/15 text-sky-700",
  closed: "bg-black/10 text-ink/60",
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "closed", label: "Closed" },
];

const when = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export default function InquiriesList({ inquiries }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [pending, start] = useTransition();

  const counts = useMemo(
    () => ({
      all: inquiries.length,
      new: inquiries.filter((i) => i.status === "new").length,
      read: inquiries.filter((i) => i.status === "read").length,
      closed: inquiries.filter((i) => i.status === "closed").length,
    }),
    [inquiries],
  );
  const shown = inquiries.filter((i) => filter === "all" || i.status === filter);

  const run = (fn) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  return (
    <div>
      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              filter === f.id
                ? "border-transparent bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/25"
                : "border-black/10 bg-white text-ink/75 hover:border-copper hover:text-copper"
            }`}
          >
            {f.label} <span className="opacity-70">({counts[f.id]})</span>
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <div className={`${card} py-14 text-center text-ink/60`}>
          No messages here.
        </div>
      ) : (
        <ul className="space-y-4">
          {shown.map((q) => (
            <li key={q.id} className={`${card} !p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold text-ink">{q.name}</p>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ${STATUS[q.status]}`}
                    >
                      {q.status}
                    </span>
                    {q.interest && (
                      <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-[11px] font-medium text-ink/65">
                        {q.interest}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-ink/50">{when(q.created_at)}</p>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <a
                    href={`tel:${q.phone}`}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-copper/10 px-3 py-1.5 font-semibold text-copper-dark transition hover:bg-copper/20"
                  >
                    <Phone className="h-3.5 w-3.5" />
                    {q.phone}
                  </a>
                  {q.email && (
                    <a
                      href={`mailto:${q.email}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-black/5 px-3 py-1.5 font-medium text-ink/75 transition hover:bg-black/10"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      {q.email}
                    </a>
                  )}
                </div>
              </div>

              <p className="mt-4 whitespace-pre-line rounded-xl bg-[#fbf7f0] p-4 text-sm leading-relaxed text-ink/80">
                {q.message}
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {["new", "read", "closed"]
                  .filter((s) => s !== q.status)
                  .map((s) => (
                    <button
                      key={s}
                      disabled={pending}
                      onClick={() => run(() => setInquiryStatus(q.id, s))}
                      className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-xs font-semibold capitalize text-ink/75 transition hover:border-copper hover:text-copper disabled:opacity-50"
                    >
                      Mark as {s}
                    </button>
                  ))}
                <span className="ml-auto">
                  <ConfirmButton
                    onConfirm={() => run(() => deleteInquiry(q.id))}
                    className={`${iconBtn} hover:!border-rose-500 hover:!text-rose-600`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </ConfirmButton>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
