"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  CircleHelp,
  Eye,
  EyeOff,
  LayoutGrid,
  Loader2,
  Pencil,
  Plus,
  Search,
  Table,
  Trash2,
} from "lucide-react";
import { deleteFaq, moveFaq, saveFaq, setFaqActive } from "@/actions/admin/faqs";
import { BarsArt, HourglassArt, OrgChartArt, TeamArt } from "@/components/dashboard/StatArt";
import ConfirmDialog from "../ConfirmDialog";
import Select from "../Select";
import Modal from "./Modal";
import Switch from "./Switch";
import { btnGhost, btnPrimary, inputCls, labelCls } from "./ui";

const EMPTY = { id: "", question: "", answer: "" };
const MAX_Q = 200;
const MAX_A = 1500;

const field =
  "w-full rounded-2xl border border-black/10 bg-white text-sm text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)] outline-none transition placeholder:text-ink/45 focus:border-copper focus:ring-4 focus:ring-copper/15";
const th = "px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55";

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

// One question and its answer, as a visitor sees it. Used for the live preview.
function FaqPreview({ question, answer }) {
  return (
    <div className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-28px_rgba(110,60,20,0.5)] ring-1 ring-black/5">
      <div className="flex items-start gap-3 px-5 py-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white shadow-md shadow-copper/30">
          Q
        </span>
        <p className="min-w-0 break-words text-[15px] font-bold leading-snug text-ink">
          {question.trim() || "Your question shows here"}
        </p>
      </div>
      <div className="border-t border-black/5 bg-[#fffaf3] px-5 py-4">
        <p className="whitespace-pre-line break-words text-sm leading-relaxed text-ink/70">
          {answer.trim() || "The answer shows here, under the question."}
        </p>
      </div>
    </div>
  );
}

function FaqForm({ initial, onDone }) {
  const [form, setForm] = useState({ ...EMPTY, ...initial });
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const submit = (e) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await saveFaq(form);
      if (res.success) onDone(true);
      else setError(res.error || "Could not save.");
    });
  };

  const counter = (n, max) => (
    <span className={`text-xs font-semibold ${n > max - 40 ? "text-amber-700" : "text-ink/45"}`}>
      {n}/{max}
    </span>
  );

  return (
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="min-w-0 space-y-5">
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-ink/70" htmlFor="faq-q">Question</label>
            {counter(form.question.length, MAX_Q)}
          </div>
          <input
            id="faq-q"
            required
            maxLength={MAX_Q}
            value={form.question}
            onChange={(e) => set("question", e.target.value)}
            placeholder="e.g. How do I become a partner?"
            className={inputCls}
          />
        </div>
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-semibold text-ink/70" htmlFor="faq-a">Answer</label>
            {counter(form.answer.length, MAX_A)}
          </div>
          <textarea
            id="faq-a"
            required
            rows={8}
            maxLength={MAX_A}
            value={form.answer}
            onChange={(e) => set("answer", e.target.value)}
            placeholder="Keep it short and clear. A blank line starts a new paragraph."
            className={`${inputCls} resize-y`}
          />
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
            Save question
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
        <FaqPreview question={form.question} answer={form.answer} />
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

export default function FaqsManager({ faqs }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
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

  const live = faqs.filter((f) => f.is_active).length;
  const filtering = !!search.trim() || status !== "all";

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return faqs.filter((f) => {
      if (status === "live" && !f.is_active) return false;
      if (status === "hidden" && f.is_active) return false;
      if (!term) return true;
      return `${f.question} ${f.answer}`.toLowerCase().includes(term);
    });
  }, [faqs, search, status]);

  const stats = [
    {
      icon: CircleHelp,
      art: OrgChartArt,
      label: "All questions",
      value: faqs.length,
      note: "in the FAQ section",
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
      value: faqs.length - live,
      note: "switched off for now",
      theme: { bg: "from-[#fff1cf] to-[#fffaf0]", ring: "ring-amber-300/30", chip: "bg-amber-200/80 text-amber-700", art: "text-amber-500" },
    },
  ];

  // The up / down arrows. They work on the whole list, so they stop while you filter.
  const arrows = (f, i) => (
    <span className="flex items-center gap-1.5 sm:flex-col">
      <button
        type="button"
        disabled={pending || filtering || i === 0}
        onClick={() => run(() => moveFaq(f.id, -1))}
        aria-label="Move up"
        title={filtering ? "Clear the search and filter to re-order" : "Move up"}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white text-ink/70 transition enabled:hover:border-copper enabled:hover:text-copper disabled:opacity-30"
      >
        <ArrowUp className="h-4 w-4" />
      </button>
      <button
        type="button"
        disabled={pending || filtering || i === faqs.length - 1}
        onClick={() => run(() => moveFaq(f.id, 1))}
        aria-label="Move down"
        title={filtering ? "Clear the search and filter to re-order" : "Move down"}
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/10 bg-white text-ink/70 transition enabled:hover:border-copper enabled:hover:text-copper disabled:opacity-30"
      >
        <ArrowDown className="h-4 w-4" />
      </button>
    </span>
  );

  // Used by the Cards view, and on phones in the Table view.
  const cards = shown.map((f) => {
    const i = faqs.findIndex((x) => x.id === f.id);
    return (
      <li
        key={f.id}
        className={`flex flex-col gap-4 rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:flex-row sm:items-start ${
          f.is_active ? "" : "opacity-70"
        }`}
      >
        <div className="flex shrink-0 items-center gap-3 sm:flex-col">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-base font-bold text-white shadow-md shadow-copper/30">
            {i + 1}
          </span>
          {arrows(f, i)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill live={f.is_active} />
          </div>
          <p className="mt-2 break-words text-base font-bold text-ink">{f.question}</p>
          <p className="mt-2 whitespace-pre-line break-words text-sm leading-relaxed text-ink/70">{f.answer}</p>
        </div>

        <div className="flex shrink-0 items-center justify-between gap-4 border-t border-black/10 pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
          <label className="flex items-center gap-2.5">
            <Switch
              checked={f.is_active}
              disabled={pending}
              label="Show on website"
              onChange={(v) => run(() => setFaqActive(f.id, v))}
            />
            <span className="text-xs font-semibold text-ink/55">{f.is_active ? "Shown" : "Hidden"}</span>
          </label>
          <span className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDeleting(f)}
              aria-label="Delete"
              title="Delete"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-ink/70 shadow-sm transition hover:border-rose-400 hover:text-rose-600"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setEditing(f)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </button>
          </span>
        </div>
      </li>
    );
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative xl:w-[340px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-copper" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search a question or answer..."
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
        <p className="text-sm text-ink/60">
          Showing {shown.length} of {faqs.length}
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
            <Plus className="h-4 w-4" /> Add question
          </button>
        </div>
      </div>

      <p className="-mt-2 text-sm text-ink/55">
        Shown on the home page in this order. Use the arrows to change it
        {filtering ? " (clear the search and filter first)." : "."}
      </p>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">{error}</p>
      )}

      {shown.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-14 text-center shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5">
          <TeamArt className="h-28 w-44" />
          <p className="mt-2 text-sm font-semibold text-ink/65">
            {faqs.length === 0 ? "No questions yet. Add the first one." : "No question matches this."}
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
                      <th className={`${th} pl-6`}>Order</th>
                      <th className={th}>Question and answer</th>
                      <th className={th}>Live</th>
                      <th className={`${th} pr-6 text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {shown.map((f) => {
                      const i = faqs.findIndex((x) => x.id === f.id);
                      return (
                        <tr key={f.id} className={`align-top transition hover:bg-[#fffaf3] ${f.is_active ? "" : "opacity-70"}`}>
                          <td className="py-5 pl-6 pr-3">
                            <div className="flex items-center gap-3">
                              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white shadow-md shadow-copper/30">
                                {i + 1}
                              </span>
                              {arrows(f, i)}
                            </div>
                          </td>
                          <td className="px-3 py-5">
                            <p className="max-w-[560px] break-words text-[15px] font-bold leading-snug text-ink">{f.question}</p>
                            <p className="mt-1.5 max-w-[560px] whitespace-pre-line break-words text-sm leading-relaxed text-ink/65">
                              {f.answer}
                            </p>
                          </td>
                          <td className="px-3 py-5">
                            <div className="flex items-center gap-2.5">
                              <Switch
                                checked={f.is_active}
                                disabled={pending}
                                label="Show on website"
                                onChange={(v) => run(() => setFaqActive(f.id, v))}
                              />
                              <StatusPill live={f.is_active} />
                            </div>
                          </td>
                          <td className="py-5 pl-3 pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setEditing(f)}
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5"
                              >
                                <Pencil className="h-4 w-4" />
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleting(f)}
                                aria-label="Delete"
                                title="Delete"
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-ink/70 shadow-sm transition hover:border-rose-400 hover:text-rose-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Phones: the same cards as the Cards view */}
              <ul className="space-y-4 md:hidden">{cards}</ul>
            </>
          )}

          {view !== "table" && <ul className="space-y-4">{cards}</ul>}
        </>
      )}

      {editing && (
        <Modal
          size="xl"
          icon={CircleHelp}
          title={editing.id ? "Edit question" : "Add question"}
          subtitle={editing.id ? editing.question : "A question and its answer for the home page."}
          onClose={() => setEditing(null)}
        >
          <FaqForm
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
          title="Delete this question?"
          text={
            <>
              <b className="text-ink">{deleting.question}</b> will be deleted for good. To keep it but hide it, switch it
              off instead.
            </>
          }
          confirmText="Yes, delete"
          busy={pending}
          onConfirm={() => {
            const f = deleting;
            start(async () => {
              setError("");
              const res = await deleteFaq(f.id);
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
