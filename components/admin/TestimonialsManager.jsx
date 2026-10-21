"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Plus, Star, Trash2 } from "lucide-react";
import {
  deleteTestimonial,
  saveTestimonial,
  setTestimonialActive,
} from "@/actions/admin/testimonials";
import ConfirmButton from "./ConfirmButton";
import Modal from "./Modal";
import Switch from "./Switch";
import { btnGhost, btnPrimary, card, iconBtn, inputCls, labelCls } from "./ui";

const EMPTY = { id: "", name: "", role: "", text: "", rating: 5 };

function TestimonialForm({ initial, onDone }) {
  const [form, setForm] = useState(initial);
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
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Name</label>
          <input
            required
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Role</label>
          <input
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            placeholder="e.g. Sales Partner"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Stars</label>
          <select
            value={form.rating}
            onChange={(e) => set("rating", Number(e.target.value))}
            className={inputCls}
          >
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} star{n > 1 ? "s" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className={labelCls}>What they said</label>
          <textarea
            required
            rows={4}
            value={form.text}
            onChange={(e) => set("text", e.target.value)}
            className={`${inputCls} resize-y`}
          />
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-rose-500/25 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-3 border-t border-black/5 pt-5">
        <button type="button" onClick={() => onDone(false)} className={btnGhost}>
          Cancel
        </button>
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save
        </button>
      </div>
    </form>
  );
}

export default function TestimonialsManager({ testimonials }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const run = (fn) =>
    start(async () => {
      setError("");
      const res = await fn();
      if (res && !res.success) setError(res.error || "Something went wrong.");
      router.refresh();
    });

  return (
    <div>
      <div className="mb-5 flex justify-end">
        <button onClick={() => setEditing(EMPTY)} className={btnPrimary}>
          <Plus className="h-4 w-4" /> Add testimonial
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-rose-500/25 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      {testimonials.length === 0 ? (
        <div className={`${card} py-14 text-center text-ink/60`}>
          No testimonials yet.
        </div>
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {testimonials.map((t) => (
            <li
              key={t.id}
              className={`${card} flex flex-col !p-5 ${t.is_active ? "" : "opacity-60"}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-base font-bold text-ink">{t.name}</p>
                  <p className="text-sm text-ink/55">{t.role || "—"}</p>
                </div>
                <span className="flex shrink-0 gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-4 w-4 text-copper-light"
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  ))}
                </span>
              </div>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">{t.text}</p>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-black/5 pt-4">
                <span className="flex items-center gap-2 text-xs text-ink/55">
                  <Switch
                    checked={t.is_active}
                    disabled={pending}
                    label="Show on website"
                    onChange={(v) => run(() => setTestimonialActive(t.id, v))}
                  />
                  {t.is_active ? "Live" : "Hidden"}
                </span>
                <span className="flex items-center gap-2">
                  <button
                    className={iconBtn}
                    onClick={() => setEditing(t)}
                    aria-label="Edit"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <ConfirmButton
                    onConfirm={() => run(() => deleteTestimonial(t.id))}
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

      {editing && (
        <Modal
          title={editing.id ? "Edit testimonial" : "Add testimonial"}
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
    </div>
  );
}
