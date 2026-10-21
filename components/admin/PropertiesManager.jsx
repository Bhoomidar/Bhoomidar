"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  deleteProperty,
  moveProperty,
  saveProperty,
  setPropertyActive,
} from "@/actions/admin/properties";
import { CATEGORIES, DETAIL_ICONS } from "@/lib/icons";
import ConfirmButton from "./ConfirmButton";
import ImageUploader from "./ImageUploader";
import Modal from "./Modal";
import Switch from "./Switch";
import { btnGhost, btnPrimary, card, iconBtn, inputCls, labelCls } from "./ui";

const EMPTY = {
  id: "",
  title: "",
  category: CATEGORIES[0],
  image_url: "",
  badge: "",
  price: "",
  unit: "Starting price",
  details: [
    { icon: "MapPin", text: "" },
    { icon: "Ruler", text: "" },
    { icon: "ShieldCheck", text: "" },
    { icon: "Trees", text: "" },
  ],
};

function PropertyForm({ initial, onDone }) {
  const [form, setForm] = useState({ ...initial, badge: initial.badge ?? "" });
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const setDetail = (i, patch) =>
    set("details", form.details.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const submit = (e) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await saveProperty(form);
      if (res.success) onDone(true);
      else setError(res.error || "Could not save.");
    });
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelCls}>Title</label>
          <input
            required
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="e.g. Residential Plots"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Type</label>
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value)}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Blue tag on the image (optional)</label>
          <input
            value={form.badge}
            onChange={(e) => set("badge", e.target.value)}
            placeholder="e.g. New Launch"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Price</label>
          <input
            required
            value={form.price}
            onChange={(e) => set("price", e.target.value)}
            placeholder="e.g. ₹18,00,000"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Small text under the price</label>
          <input
            value={form.unit}
            onChange={(e) => set("unit", e.target.value)}
            placeholder="e.g. Starting price"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Image</label>
        <ImageUploader
          value={form.image_url}
          onChange={(url) => set("image_url", url)}
          aspect="aspect-[4/3]"
        />
      </div>

      <div>
        <label className={labelCls}>Detail lines (shown on the card)</label>
        <div className="space-y-3">
          {form.details.map((d, i) => {
            const Icon = DETAIL_ICONS[d.icon] ?? DETAIL_ICONS.MapPin;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-copper/10 text-copper">
                  <Icon className="h-5 w-5" />
                </span>
                <select
                  value={d.icon}
                  onChange={(e) => setDetail(i, { icon: e.target.value })}
                  className={`${inputCls} w-36 shrink-0`}
                  aria-label="Icon"
                >
                  {Object.keys(DETAIL_ICONS).map((name) => (
                    <option key={name}>{name}</option>
                  ))}
                </select>
                <input
                  value={d.text}
                  onChange={(e) => setDetail(i, { text: e.target.value })}
                  placeholder="e.g. Gated Community"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() =>
                    set("details", form.details.filter((_, idx) => idx !== i))
                  }
                  aria-label="Remove line"
                  className={iconBtn}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
        {form.details.length < 6 && (
          <button
            type="button"
            onClick={() => set("details", [...form.details, { icon: "MapPin", text: "" }])}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-copper"
          >
            <Plus className="h-4 w-4" /> Add a line
          </button>
        )}
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
          Save property
        </button>
      </div>
    </form>
  );
}

export default function PropertiesManager({ properties }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null); // null | property | EMPTY
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
          <Plus className="h-4 w-4" /> Add property
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-xl border border-rose-500/25 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {error}
        </p>
      )}

      {properties.length === 0 ? (
        <div className={`${card} py-14 text-center text-ink/60`}>
          No properties yet. Click “Add property” to create the first one.
        </div>
      ) : (
        <ul className="space-y-3">
          {properties.map((p, i) => (
            <li
              key={p.id}
              className={`${card} flex flex-col gap-4 !p-4 sm:flex-row sm:items-center ${
                p.is_active ? "" : "opacity-60"
              }`}
            >
              <div className="h-24 w-full shrink-0 overflow-hidden rounded-xl bg-[#f1e6d4] sm:h-20 sm:w-32">
                {p.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-bold text-ink">{p.title}</h3>
                  <span className="rounded-full bg-copper/10 px-2.5 py-0.5 text-[11px] font-semibold text-copper">
                    {p.category}
                  </span>
                  {p.badge && (
                    <span className="rounded-full bg-[#2f6fd6]/10 px-2.5 py-0.5 text-[11px] font-semibold text-[#2f6fd6]">
                      {p.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink/60">
                  {p.price} · {p.unit}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Switch
                  checked={p.is_active}
                  disabled={pending}
                  label="Show on website"
                  onChange={(v) => run(() => setPropertyActive(p.id, v))}
                />
                <span className="mr-2 text-xs text-ink/55">
                  {p.is_active ? "Live" : "Hidden"}
                </span>
                <button
                  className={iconBtn}
                  disabled={pending || i === 0}
                  onClick={() => run(() => moveProperty(p.id, -1))}
                  aria-label="Move up"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  className={iconBtn}
                  disabled={pending || i === properties.length - 1}
                  onClick={() => run(() => moveProperty(p.id, 1))}
                  aria-label="Move down"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  className={iconBtn}
                  onClick={() => setEditing(p)}
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <ConfirmButton
                  onConfirm={() => run(() => deleteProperty(p.id))}
                  className={`${iconBtn} hover:!border-rose-500 hover:!text-rose-600`}
                >
                  <Trash2 className="h-4 w-4" />
                </ConfirmButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing && (
        <Modal
          title={editing.id ? "Edit property" : "Add property"}
          onClose={() => setEditing(null)}
        >
          <PropertyForm
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
