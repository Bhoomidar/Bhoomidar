"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteFaq, moveFaq, saveFaq, setFaqActive } from "@/actions/admin/faqs";
import ConfirmButton from "./ConfirmButton";
import Modal from "./Modal";
import Switch from "./Switch";
import { btnGhost, btnPrimary, card, iconBtn, inputCls, labelCls } from "./ui";

const EMPTY = { id: "", question: "", answer: "" };

function FaqForm({ initial, onDone }) {
  const [form, setForm] = useState(initial);
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

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <label className={labelCls}>Question</label>
        <input
          required
          maxLength={200}
          value={form.question}
          onChange={(e) => set("question", e.target.value)}
          placeholder="e.g. How do I become a partner?"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Answer</label>
        <textarea
          required
          rows={6}
          maxLength={1500}
          value={form.answer}
          onChange={(e) => set("answer", e.target.value)}
          className={`${inputCls} resize-y`}
        />
        <p className="mt-1.5 text-xs text-ink/50">{form.answer.length} / 1500</p>
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

export default function FaqsManager({ faqs }) {
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
      <div className="mb-5 flex items-center justify-between gap-3">
        <p className="text-sm text-ink/60">
          Shown on the home page in this order. Use the arrows to change it.
        </p>
        <button onClick={() => setEditing(EMPTY)} className={btnPrimary}>
          <Plus className="h-4 w-4" /> Add question
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-rose-500/25 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      {faqs.length === 0 ? (
        <div className={`${card} py-14 text-center text-ink/60`}>No questions yet.</div>
      ) : (
        <ul className="space-y-3">
          {faqs.map((f, i) => (
            <li
              key={f.id}
              className={`${card} flex flex-col gap-4 !p-5 sm:flex-row sm:items-start ${f.is_active ? "" : "opacity-60"}`}
            >
              <span className="flex shrink-0 items-center gap-2 sm:flex-col">
                <button
                  className={iconBtn}
                  disabled={pending || i === 0}
                  onClick={() => run(() => moveFaq(f.id, -1))}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  className={iconBtn}
                  disabled={pending || i === faqs.length - 1}
                  onClick={() => run(() => moveFaq(f.id, 1))}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </span>

              <div className="min-w-0 flex-1">
                <p className="text-base font-bold text-ink">{f.question}</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink/70">{f.answer}</p>
              </div>

              <div className="flex shrink-0 items-center justify-between gap-4 border-t border-black/5 pt-4 sm:flex-col sm:items-end sm:border-0 sm:pt-0">
                <span className="flex items-center gap-2 text-xs text-ink/55">
                  <Switch
                    checked={f.is_active}
                    disabled={pending}
                    label="Show on website"
                    onChange={(v) => run(() => setFaqActive(f.id, v))}
                  />
                  {f.is_active ? "Live" : "Hidden"}
                </span>
                <span className="flex items-center gap-2">
                  <button className={iconBtn} onClick={() => setEditing(f)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <ConfirmButton
                    onConfirm={() => run(() => deleteFaq(f.id))}
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
        <Modal title={editing.id ? "Edit question" : "Add question"} onClose={() => setEditing(null)}>
          <FaqForm
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
