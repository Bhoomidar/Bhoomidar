"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LayoutGrid,
  Loader2,
  MessageSquareQuote,
  Pencil,
  Plus,
  Quote,
  Search,
  Star,
  Table,
  Trash2,
  Users,
} from "lucide-react";
import {
  deleteTestimonial,
  saveTestimonial,
  setTestimonialActive,
} from "@/actions/admin/testimonials";
import { AwardArt, BarsArt, HourglassArt, PeopleArt, TeamArt } from "@/components/dashboard/StatArt";
import ConfirmDialog from "../ConfirmDialog";
import Select from "../Select";
import Modal from "./Modal";
import Highlighted from "../Highlighted";
import Switch from "./Switch";
import { btnGhost, btnPrimary, inputCls, labelCls } from "./ui";

const EMPTY = { id: "", name: "", role: "", text: "", rating: 5 };
const MAX_TEXT = 600;

const th = "px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55";

const field =
  "w-full rounded-2xl border border-black/10 bg-white text-sm text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)] outline-none transition placeholder:text-ink/45 focus:border-copper focus:ring-4 focus:ring-copper/15";

function Stars({ value, size = "h-4 w-4" }) {
  return (
    <span className="flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${size} ${i < value ? "text-copper-light" : "text-black/15"}`}
          fill="currentColor"
          strokeWidth={0}
        />
      ))}
    </span>
  );
}

// One testimonial, drawn the same way in the list and in the live preview.
function QuoteCard({ t, status, children }) {
  const name = t.name?.trim() || "Partner name";
  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-6 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5">
      <Quote className="pointer-events-none absolute -right-2 -top-2 h-24 w-24 rotate-180 text-copper/[0.08]" strokeWidth={1.5} />

      <div className="relative flex items-center justify-between gap-3">
        <Stars value={t.rating} size="h-[18px] w-[18px]" />
        {status}
      </div>

      <p className="relative mt-4 flex-1 whitespace-pre-line text-[15px] leading-relaxed text-ink/80">
        {t.text?.trim() ? <Highlighted text={t.text} /> : "What the partner says will show here."}
      </p>

      <div className="relative mt-5 flex items-center gap-3.5 border-t border-black/10 pt-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-base font-bold text-white shadow-md shadow-copper/30 ring-2 ring-white">
          {name[0].toUpperCase()}
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block [overflow-wrap:anywhere] text-[15px] font-bold text-ink">{name}</span>
          <span className="mt-0.5 block [overflow-wrap:anywhere] text-sm text-ink/55">{t.role?.trim() || "Role"}</span>
        </span>
      </div>

      {children}
    </div>
  );
}

function StatusPill({ live }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold ring-1 ${
        live ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-black/5 text-ink/55 ring-black/10"
      }`}
    >
      {live ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
      {live ? "Live" : "Hidden"}
    </span>
  );
}

function TestimonialForm({ initial, onDone }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await saveTestimonial(form);
      if (res.success) onDone(true);
      else setError(res.error || "Could not save.");
    });
  };

  return (
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_330px]">
      <div className="min-w-0 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="t-name">Name</label>
            <input
              id="t-name"
              required
              maxLength={80}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="t-role">Role</label>
            <input
              id="t-role"
              maxLength={80}
              value={form.role}
              onChange={(e) => set("role", e.target.value)}
              placeholder="e.g. Sales Partner"
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <p className={labelCls}>Stars</p>
          <div className="flex items-center gap-1 rounded-2xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-black/10 sm:w-fit">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => set("rating", n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                aria-pressed={form.rating === n}
                className="rounded-lg p-1 transition hover:scale-110"
              >
                <Star
                  className={`h-7 w-7 ${n <= form.rating ? "text-copper-light" : "text-black/15"}`}
                  fill="currentColor"
                  strokeWidth={0}
                />
              </button>
            ))}
            <span className="ml-2 text-sm font-bold text-ink/70">{form.rating} / 5</span>
          </div>
        </div>

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-ink/70" htmlFor="t-text">What they said</label>
            <span className={`text-xs font-semibold ${form.text.length > MAX_TEXT - 40 ? "text-amber-700" : "text-ink/45"}`}>
              {form.text.length}/{MAX_TEXT}
            </span>
          </div>
          <textarea
            id="t-text"
            required
            rows={6}
            maxLength={MAX_TEXT}
            value={form.text}
            onChange={(e) => set("text", e.target.value)}
            placeholder="A few honest lines in the partner's own words."
            className={`${inputCls} resize-y`}
          />
          <p className="mt-1.5 text-xs text-ink/50">
            To make some words stand out, put <b>**</b> on both sides of them, like{" "}
            <span className="font-semibold text-copper-dark">**helpful at every step**</span>.
          </p>
        </div>

        {error && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">{error}</p>
        )}

        <div className="flex justify-end gap-3 border-t border-black/5 pt-5">
          <button type="button" onClick={() => onDone(false)} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={pending} className={btnPrimary}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save testimonial
          </button>
        </div>
      </div>

      <aside className="lg:sticky lg:top-4">
        <p className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">
          <Eye className="h-4 w-4 text-copper" />
          How it looks
          <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-200">
            LIVE
          </span>
        </p>
        <QuoteCard t={form} />
      </aside>
    </form>
  );
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

export default function TestimonialsManager({ testimonials }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [stars, setStars] = useState("all");
  const [view, setView] = useState("table"); // "table" | "grid"
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const run = (fn) =>
    start(async () => {
      setError("");
      const res = await fn();
      if (res && !res.success) setError(res.error || "Something went wrong.");
      router.refresh();
    });

  const live = testimonials.filter((t) => t.is_active).length;
  const average = testimonials.length
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : "0.0";

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return testimonials.filter((t) => {
      if (status === "live" && !t.is_active) return false;
      if (status === "hidden" && t.is_active) return false;
      if (stars !== "all" && String(t.rating) !== stars) return false;
      if (!term) return true;
      return [t.name, t.role, t.text].join(" ").toLowerCase().includes(term);
    });
  }, [testimonials, search, status, stars]);

  const stats = [
    {
      icon: Users,
      art: PeopleArt,
      label: "All testimonials",
      value: testimonials.length,
      note: "from partners",
      theme: { bg: "from-[#fdebdc] to-[#fff6ec]", ring: "ring-copper/10", chip: "bg-[#f9d6b8] text-copper", art: "text-copper" },
    },
    {
      icon: Eye,
      art: BarsArt,
      label: "Live on website",
      value: live,
      note: "shown on the home page",
      theme: { bg: "from-[#dff5e8] to-[#f5fcf8]", ring: "ring-emerald-300/30", chip: "bg-emerald-200/80 text-emerald-700", art: "text-emerald-500" },
    },
    {
      icon: EyeOff,
      art: HourglassArt,
      label: "Hidden",
      value: testimonials.length - live,
      note: "switched off for now",
      theme: { bg: "from-[#fff1cf] to-[#fffaf0]", ring: "ring-amber-300/30", chip: "bg-amber-200/80 text-amber-700", art: "text-amber-500" },
    },
    {
      icon: Star,
      art: AwardArt,
      label: "Average rating",
      value: average,
      note: "out of 5 stars",
      theme: { bg: "from-[#ece4fb] to-[#f9f6ff]", ring: "ring-violet-300/30", chip: "bg-violet-200/80 text-violet-700", art: "text-violet-500" },
    },
  ];

  // Used by the Cards view, and on phones in the Table view.
  const cards = shown.map((t) => (
            <li key={t.id} className={t.is_active ? "" : "opacity-70"}>
              <QuoteCard t={t} status={<StatusPill live={t.is_active} />}>
                <div className="relative mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4">
                  <label className="flex items-center gap-2.5">
                    <Switch
                      checked={t.is_active}
                      disabled={pending}
                      label={`Show ${t.name} on the website`}
                      onChange={(v) => run(() => setTestimonialActive(t.id, v))}
                    />
                    <span className="text-xs font-semibold text-ink/55">{t.is_active ? "Shown" : "Hidden"}</span>
                  </label>
                  <span className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setDeleting(t)}
                      aria-label={`Delete ${t.name}`}
                      title="Delete"
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-ink/70 shadow-sm transition hover:border-rose-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditing(t)}
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5"
                    >
                      <Pencil className="h-4 w-4" />
                      Edit
                    </button>
                  </span>
                </div>
              </QuoteCard>
            </li>
          ));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative xl:w-[320px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-copper" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, role or words..."
            className={`${field} py-3.5 pl-11 pr-4`}
          />
        </div>
        <Select
          wrapperClassName="xl:w-[170px]"
          variant="toolbar"
          value={status}
          onChange={setStatus}
          ariaLabel="Filter by status"
          menuMinWidth={170}
          options={[
            { value: "all", label: "All" },
            { value: "live", label: "Live" },
            { value: "hidden", label: "Hidden" },
          ]}
        />
        <Select
          wrapperClassName="xl:w-[190px]"
          variant="toolbar"
          value={stars}
          onChange={setStars}
          ariaLabel="Filter by stars"
          menuMinWidth={190}
          options={[
            { value: "all", label: "All ratings" },
            ...[5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: `${"★".repeat(n)}${"☆".repeat(5 - n)}` })),
          ]}
        />
        <p className="text-sm text-ink/60">
          Showing {shown.length} of {testimonials.length}
        </p>
        <div className="flex items-center gap-3 xl:ml-auto">
          <div className="inline-flex gap-1 rounded-2xl bg-[#faf1e6] p-1 ring-1 ring-black/5">
            {[
              ["table", Table, "Table"],
              ["grid", LayoutGrid, "Cards"],
            ].map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-label={label}
                title={label}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  view === id ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30" : "text-ink/55 hover:text-copper"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </button>
            ))}
          </div>
          <button onClick={() => setEditing(EMPTY)} className={`${btnPrimary} !rounded-2xl !px-5 !py-3`}>
            <Plus className="h-4 w-4" /> Add testimonial
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">{error}</p>
      )}

      {shown.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-14 text-center shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5">
          <TeamArt className="h-28 w-44" />
          <p className="mt-2 text-sm font-semibold text-ink/65">
            {testimonials.length === 0 ? "No testimonials yet. Add the first one." : "No testimonial matches this."}
          </p>
        </div>
      ) : (
        <>
          {view === "table" && (
            <>
              <div className="hidden overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-black/5 bg-gradient-to-b from-white to-[#fcf6ee]">
                      <th className={`${th} pl-6`}>Partner</th>
                      <th className={`${th} hidden xl:table-cell`}>Stars</th>
                      <th className={th}>What they said</th>
                      <th className={th}>Live</th>
                      <th className={`${th} pr-6 text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {shown.map((t) => (
                      <tr key={t.id} className={`align-top transition hover:bg-[#fffaf3] ${t.is_active ? "" : "opacity-70"}`}>
                        <td className="py-5 pl-6 pr-3">
                          <div className="flex items-center gap-3.5">
                            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-base font-bold text-white shadow-md shadow-copper/30 ring-2 ring-white">
                              {(t.name || "?")[0].toUpperCase()}
                            </span>
                            <span className="min-w-0 max-w-[200px] leading-tight">
                              <span className="block break-words text-[15px] font-bold text-ink">{t.name}</span>
                              <span className="mt-0.5 block break-words text-sm text-ink/55">{t.role || "—"}</span>
                              <span className="mt-1.5 block xl:hidden">
                                <Stars value={t.rating} />
                              </span>
                            </span>
                          </div>
                        </td>
                        <td className="hidden px-3 py-5 xl:table-cell">
                          <Stars value={t.rating} />
                          <span className="mt-1 block text-xs font-semibold text-ink/50">{t.rating} / 5</span>
                        </td>
                        <td className="px-3 py-5">
                          <p className="max-w-[460px] whitespace-pre-line break-words text-sm leading-relaxed text-ink/75"><Highlighted text={t.text} /></p>
                        </td>
                        <td className="px-3 py-5">
                          <div className="flex items-center gap-2.5">
                            <Switch
                              checked={t.is_active}
                              disabled={pending}
                              label={`Show ${t.name} on the website`}
                              onChange={(v) => run(() => setTestimonialActive(t.id, v))}
                            />
                            <StatusPill live={t.is_active} />
                          </div>
                        </td>
                        <td className="py-5 pl-3 pr-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setEditing(t)}
                              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5"
                            >
                              <Pencil className="h-4 w-4" />
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleting(t)}
                              aria-label={`Delete ${t.name}`}
                              title="Delete"
                              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-ink/70 shadow-sm transition hover:border-rose-400 hover:text-rose-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Phones: the same cards as the Cards view */}
              <ul className="grid gap-5 md:hidden">{cards}</ul>
            </>
          )}

          {view !== "table" && <ul className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">{cards}</ul>}
        </>
      )}

      {editing && (
        <Modal
          size="xl"
          icon={MessageSquareQuote}
          title={editing.id ? "Edit testimonial" : "Add testimonial"}
          subtitle={editing.id ? editing.name : "Words from a partner, shown on the home page."}
          onClose={() => setEditing(null)}
        >
          <TestimonialForm
            initial={editing}
            onDone={(changed) => {
              setEditing(null);
              if (changed) router.refresh();
            }}
          />
        </Modal>
      )}

      {deleting && (
        <ConfirmDialog
          tone="danger"
          icon={Trash2}
          title="Delete this testimonial?"
          text={
            <>
              The testimonial from <b className="text-ink">{deleting.name}</b> will be deleted for good. To keep it but
              hide it, switch it off instead.
            </>
          }
          confirmText="Yes, delete"
          busy={pending}
          onConfirm={() => {
            const t = deleting;
            start(async () => {
              setError("");
              const res = await deleteTestimonial(t.id);
              if (res && !res.success) setError(res.error || "Could not delete.");
              setDeleting(null);
              router.refresh();
            });
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
