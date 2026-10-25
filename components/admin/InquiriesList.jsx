"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Check,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  Inbox,
  Mail,
  MailOpen,
  Phone,
  Search,
  Trash2,
} from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { deleteInquiry, setInquiryStatus } from "@/actions/admin/inquiries";
import { BarsArt, ClipboardArt, HourglassArt, MailArt, PeopleArt } from "@/components/dashboard/StatArt";
import ConfirmDialog from "../ConfirmDialog";
import Modal from "./Modal";
import { btnGhost } from "./ui";

const STATUS = {
  new: { text: "New", pill: "bg-amber-100 text-amber-800 ring-amber-200" },
  read: { text: "Read", pill: "bg-sky-100 text-sky-800 ring-sky-200" },
  closed: { text: "Closed", pill: "bg-black/5 text-ink/60 ring-black/10" },
};

const FILTERS = [
  { id: "all", label: "All" },
  { id: "new", label: "New" },
  { id: "read", label: "Read" },
  { id: "closed", label: "Closed" },
];

const field =
  "w-full rounded-2xl border border-black/10 bg-white text-sm text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)] outline-none transition placeholder:text-ink/45 focus:border-copper focus:ring-4 focus:ring-copper/15";

const when = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const short = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

// A plain 10 digit number is Indian; WhatsApp wants the country code.
const waNumber = (phone) => {
  const d = String(phone ?? "").replace(/\D/g, "");
  return d.length === 10 ? `91${d}` : d;
};

function Pill({ status }) {
  const s = STATUS[status] ?? STATUS.read;
  return <span className={`rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${s.pill}`}>{s.text}</span>;
}

function Stat({ icon: Icon, art: Art, label, value, note, theme }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ${theme.ring} transition duration-300 hover:-translate-y-1`}
    >
      <Art
        className={`pointer-events-none absolute bottom-3 right-3 h-20 w-24 origin-bottom-right transition duration-500 group-hover:scale-110 ${theme.art}`}
      />
      <div className="relative flex items-center gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-sm ${theme.chip}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-medium text-ink/70">{label}</p>
          <p className="mt-1 text-4xl font-extrabold tabular-nums text-ink">{value}</p>
        </div>
      </div>
      <p className="relative mt-3 max-w-[62%] text-xs text-ink/55">{note}</p>
    </div>
  );
}

export default function InquiriesList({ inquiries }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [openId, setOpenId] = useState(null);
  const [queue, setQueue] = useState([]); // ids in the order shown when a message was opened
  const [deleting, setDeleting] = useState(null);
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

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return inquiries.filter((i) => {
      if (filter !== "all" && i.status !== filter) return false;
      if (!term) return true;
      return [i.name, i.phone, i.email, i.interest, i.message].join(" ").toLowerCase().includes(term);
    });
  }, [inquiries, filter, search]);

  const run = (fn) =>
    start(async () => {
      await fn();
      router.refresh();
    });

  // Opening a new message marks it as read.
  const openMessage = (q) => {
    setQueue(shown.map((i) => i.id));
    setOpenId(q.id);
    if (q.status === "new") run(() => setInquiryStatus(q.id, "read"));
  };

  const goTo = (id) => {
    setOpenId(id);
    const q = inquiries.find((i) => i.id === id);
    if (q?.status === "new") run(() => setInquiryStatus(id, "read"));
  };

  const markAllRead = () =>
    run(async () => {
      for (const q of inquiries.filter((i) => i.status === "new")) await setInquiryStatus(q.id, "read");
    });

  const confirmDelete = () =>
    start(async () => {
      const q = deleting;
      await deleteInquiry(q.id);
      setDeleting(null);
      setOpenId(null);
      router.refresh();
    });

  const current = openId ? inquiries.find((i) => i.id === openId) : null;
  const pos = current ? queue.indexOf(current.id) : -1;
  const prevId = pos > 0 ? queue[pos - 1] : null;
  const nextId = pos >= 0 && pos < queue.length - 1 ? queue[pos + 1] : null;

  const stats = [
    {
      icon: Inbox,
      art: MailArt,
      label: "All messages",
      value: counts.all,
      note: "sent from the Contact page",
      theme: { bg: "from-[#fdebdc] to-[#fff6ec]", ring: "ring-copper/10", chip: "bg-[#f9d6b8] text-copper", art: "text-copper" },
    },
    {
      icon: Mail,
      art: HourglassArt,
      label: "New",
      value: counts.new,
      note: counts.new > 0 ? "waiting for you to open" : "nothing is waiting",
      theme: { bg: "from-[#fff1cf] to-[#fffaf0]", ring: "ring-amber-300/30", chip: "bg-amber-200/80 text-amber-700", art: "text-amber-500" },
    },
    {
      icon: MailOpen,
      art: PeopleArt,
      label: "Read",
      value: counts.read,
      note: "opened, not closed yet",
      theme: { bg: "from-[#e3ecfd] to-[#f6f9ff]", ring: "ring-sky-300/30", chip: "bg-sky-200/80 text-sky-700", art: "text-sky-500" },
    },
    {
      icon: CheckCheck,
      art: BarsArt,
      label: "Closed",
      value: counts.closed,
      note: "dealt with",
      theme: { bg: "from-[#dff5e8] to-[#f5fcf8]", ring: "ring-emerald-300/30", chip: "bg-emerald-200/80 text-emerald-700", art: "text-emerald-500" },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-[340px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-copper" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, email or message..."
            className={`${field} py-3.5 pl-11 pr-4`}
          />
        </div>

        <div className="no-scrollbar -mx-1 overflow-x-auto px-1">
          <div className="inline-flex gap-1 rounded-2xl bg-[#faf1e6] p-1 ring-1 ring-black/5">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                  filter === f.id
                    ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                    : "text-ink/65 hover:text-copper"
                }`}
              >
                {f.label} <span className="opacity-70">({counts[f.id]})</span>
              </button>
            ))}
          </div>
        </div>

        {counts.new > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            disabled={pending}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)] ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:text-copper hover:ring-copper disabled:opacity-60 lg:ml-auto"
          >
            <CheckCheck className="h-4 w-4 text-copper" />
            Mark all as read
          </button>
        )}
      </div>

      {shown.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-14 text-center shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5">
          <ClipboardArt className="h-28 w-32" />
          <p className="mt-2 text-sm font-semibold text-ink/65">
            {inquiries.length === 0 ? "No messages yet." : "No message matches this."}
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {shown.map((q) => {
            const isNew = q.status === "new";
            return (
              <li key={q.id}>
                <div
                  className={`group flex w-full items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-[0_10px_24px_-18px_rgba(110,60,20,0.5)] ring-1 transition duration-300 hover:-translate-y-0.5 sm:gap-4 sm:px-5 ${
                    isNew ? "ring-2 ring-copper/40" : "ring-black/5 hover:ring-copper/30"
                  }`}
                >
                <button
                  type="button"
                  onClick={() => openMessage(q)}
                  className="flex min-w-0 flex-1 items-center gap-4 text-left"
                >
                  <span className="relative shrink-0">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-base font-bold text-white shadow-md shadow-copper/30 ring-2 ring-white">
                      {(q.name || "?")[0].toUpperCase()}
                    </span>
                    {isNew && <span className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full bg-amber-500 ring-2 ring-white" />}
                  </span>

                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className={`break-words text-[15px] text-ink ${isNew ? "font-extrabold" : "font-bold"}`}>{q.name}</span>
                      <Pill status={q.status} />
                      {q.interest && (
                        <span className="rounded-full bg-[#f6ecdf] px-2.5 py-1 text-[11px] font-semibold text-ink/70 ring-1 ring-copper/10">
                          {q.interest}
                        </span>
                      )}
                    </span>
                    <span className={`mt-1.5 [overflow-wrap:anywhere] text-sm leading-snug ${isNew ? "text-ink/80" : "text-ink/55"}`}>
                      {q.message}
                    </span>
                    <span className="mt-1.5 flex flex-wrap items-center gap-x-3 text-xs text-ink/45">
                      <span className="inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {q.phone}
                      </span>
                      <span className="sm:hidden">{short(q.created_at)}</span>
                    </span>
                  </span>

                </button>

                <span className="hidden shrink-0 text-right text-xs text-ink/50 md:block">{when(q.created_at)}</span>
                <button
                  type="button"
                  onClick={() => openMessage(q)}
                  aria-label={`View message from ${q.name}`}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5"
                >
                  <Eye className="h-4 w-4" />
                  <span className="hidden sm:inline">View</span>
                </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {current && (
        <Modal
          fullOnPhone
          title={current.name}
          subtitle={when(current.created_at)}
          icon={MailOpen}
          onClose={() => setOpenId(null)}
        >
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Pill status={current.status} />
              {current.interest && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f6ecdf] px-3 py-1 text-xs font-semibold text-ink/70 ring-1 ring-copper/10">
                  Interested in: <b className="text-ink">{current.interest}</b>
                </span>
              )}
            </div>

            {/* How to reach them */}
            <div className="grid gap-3 sm:grid-cols-2">
              <a
                href={`tel:${current.phone}`}
                className="group flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:ring-copper/40"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
                  <Phone className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink/50">Call</span>
                  <span className="mt-0.5 block break-all text-sm font-bold text-ink">{current.phone}</span>
                </span>
              </a>

              <a
                href={`https://wa.me/${waNumber(current.phone)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-3 rounded-2xl bg-gradient-to-br from-[#2bd96b] to-[#128c4a] p-3.5 text-white shadow-lg shadow-[#25D366]/25 transition hover:-translate-y-0.5"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[#25D366] shadow-md">
                  <FaWhatsapp className="h-5 w-5" />
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block text-[11px] font-semibold uppercase tracking-wider text-white/85">WhatsApp</span>
                  <span className="mt-0.5 block text-sm font-bold">Chat now</span>
                </span>
              </a>

              {current.email ? (
                <a
                  href={`mailto:${current.email}`}
                  className="group flex items-center gap-3 rounded-2xl bg-white p-3.5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:ring-copper/40 sm:col-span-2"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2a1f] to-[#17110c] text-copper-light shadow-md">
                    <Mail className="h-[18px] w-[18px]" />
                  </span>
                  <span className="min-w-0 leading-tight">
                    <span className="block text-[11px] font-semibold uppercase tracking-wider text-ink/50">Email</span>
                    <span className="mt-0.5 block break-all text-sm font-bold text-ink">{current.email}</span>
                  </span>
                </a>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-white/60 p-3.5 ring-1 ring-black/5 sm:col-span-2">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black/5 text-ink/30">
                    <Mail className="h-[18px] w-[18px]" />
                  </span>
                  <span className="text-sm text-ink/45">No email given</span>
                </div>
              )}
            </div>

            {/* The whole message */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">Message</p>
              <div className="whitespace-pre-wrap break-words rounded-2xl bg-white p-5 text-[15px] leading-relaxed text-ink/85 shadow-sm ring-1 ring-black/5">
                {current.message}
              </div>
            </div>

            {/* Status */}
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">Status</p>
              <div className="inline-flex gap-1 rounded-2xl bg-[#faf1e6] p-1 ring-1 ring-black/5">
                {["new", "read", "closed"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => setInquiryStatus(current.id, s))}
                    className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold capitalize transition disabled:opacity-60 ${
                      current.status === s
                        ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                        : "text-ink/65 hover:text-copper"
                    }`}
                  >
                    {current.status === s && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-5">
              <button
                type="button"
                onClick={() => setDeleting(current)}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-rose-700 shadow-sm ring-1 ring-rose-200 transition hover:bg-rose-50 hover:ring-rose-300"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>

              {queue.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="mr-1 text-xs font-semibold text-ink/50">
                    {pos + 1} of {queue.length}
                  </span>
                  <button
                    type="button"
                    disabled={!prevId}
                    onClick={() => goTo(prevId)}
                    aria-label="Previous message"
                    className={`${btnGhost} !px-3 disabled:opacity-40`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={!nextId}
                    onClick={() => goTo(nextId)}
                    aria-label="Next message"
                    className={`${btnGhost} !px-3 disabled:opacity-40`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          tone="danger"
          icon={Trash2}
          title="Delete this message?"
          text={
            <>
              The message from <b className="text-ink">{deleting.name}</b> will be deleted for good. This cannot be undone.
            </>
          }
          confirmText="Yes, delete"
          busy={pending}
          onConfirm={confirmDelete}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
