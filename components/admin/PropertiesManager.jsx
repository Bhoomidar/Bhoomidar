"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ExternalLink, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import {
  deleteProperty,
  moveProperty,
  saveProperty,
  setPropertyActive,
} from "@/actions/admin/properties";
import { CATEGORIES, DETAIL_ICONS } from "@/lib/icons";
import ConfirmButton from "./ConfirmButton";
import GalleryEditor from "./GalleryEditor";
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
  slug: "",
  tagline: "",
  location: "",
  description: "",
  gallery: [],
  highlights: [],
  specs: [
    { label: "Plot size", value: "" },
    { label: "Location", value: "" },
    { label: "Papers", value: "Checked and clear" },
  ],
  amenities: [],
  map_url: "",
};

// One item per line in a text box <-> a list.
const toLines = (list) => (Array.isArray(list) ? list.join("\n") : "");
const fromLines = (text) => text.split("\n").map((t) => t.trim()).filter(Boolean);

function PropertyForm({ initial, onDone }) {
  const [form, setForm] = useState({
    ...EMPTY,
    ...initial,
    badge: initial.badge ?? "",
    slug: initial.slug ?? "",
    tagline: initial.tagline ?? "",
    location: initial.location ?? "",
    description: initial.description ?? "",
    map_url: initial.map_url ?? "",
    gallery: Array.isArray(initial.gallery) ? initial.gallery : [],
    highlights: Array.isArray(initial.highlights) ? initial.highlights : [],
    amenities: Array.isArray(initial.amenities) ? initial.amenities : [],
    specs: Array.isArray(initial.specs) ? initial.specs : [],
  });
  // The text boxes keep what is typed (blank lines and all); the list is made when saving.
  const [highlightsText, setHighlightsText] = useState(toLines(initial.highlights));
  const [amenitiesText, setAmenitiesText] = useState(toLines(initial.amenities));
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));
  const setDetail = (i, patch) =>
    set("details", form.details.map((d, idx) => (idx === i ? { ...d, ...patch } : d)));

  const submit = (e) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await saveProperty({
        ...form,
        highlights: fromLines(highlightsText),
        amenities: fromLines(amenitiesText),
      });
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

      {/* everything for the property's own page */}
      <div className="space-y-5 rounded-2xl border border-copper/20 bg-[#fff8ef] p-5">
        <div>
          <p className="font-display text-xl font-bold text-ink">Property page</p>
          <p className="mt-1 text-xs text-ink/60">
            What customers see when they open this property. All of it is optional.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Location (shown under the title)</label>
            <input
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="e.g. Sector 150, Noida, Uttar Pradesh"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Google Maps link (optional)</label>
            <input
              value={form.map_url}
              onChange={(e) => set("map_url", e.target.value)}
              placeholder="https://maps.google.com/..."
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>One line about it</label>
            <input
              maxLength={160}
              value={form.tagline}
              onChange={(e) => set("tagline", e.target.value)}
              placeholder="e.g. Gated plots with wide roads and parks"
              className={inputCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>About this property</label>
            <textarea
              rows={6}
              maxLength={5000}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Write a few lines. Leave a blank line to start a new paragraph."
              className={`${inputCls} resize-y`}
            />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Page address</label>
            <div className="flex items-center gap-2">
              <span className="shrink-0 text-sm text-ink/50">/properties/</span>
              <input
                value={form.slug}
                onChange={(e) => set("slug", e.target.value)}
                placeholder="made from the title if you leave this empty"
                className={inputCls}
              />
            </div>
            <p className="mt-1.5 text-xs text-ink/50">Small letters, numbers and dashes. Changing it changes the link.</p>
          </div>
        </div>

        <div>
          <label className={labelCls}>More photos</label>
          <GalleryEditor value={form.gallery} onChange={(list) => set("gallery", list)} />
        </div>

        <div>
          <label className={labelCls}>Key details (boxes like &ldquo;Plot size - 1200 Sq. Yards&rdquo;)</label>
          <div className="space-y-3">
            {form.specs.map((s, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={s.label}
                  onChange={(e) =>
                    set("specs", form.specs.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))
                  }
                  placeholder="Name, e.g. Plot size"
                  className={`${inputCls} w-2/5`}
                  aria-label="Name"
                />
                <input
                  value={s.value}
                  onChange={(e) =>
                    set("specs", form.specs.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))
                  }
                  placeholder="Value, e.g. 1200 - 2400 Sq. Yards"
                  className={inputCls}
                  aria-label="Value"
                />
                <button
                  type="button"
                  onClick={() => set("specs", form.specs.filter((_, idx) => idx !== i))}
                  aria-label="Remove"
                  className={iconBtn}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          {form.specs.length < 12 && (
            <button
              type="button"
              onClick={() => set("specs", [...form.specs, { label: "", value: "" }])}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-copper"
            >
              <Plus className="h-4 w-4" /> Add a detail
            </button>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className={labelCls}>Why you will like it (one point per line)</label>
            <textarea
              rows={5}
              value={highlightsText}
              onChange={(e) => setHighlightsText(e.target.value)}
              placeholder={"All papers checked and clear\nGated community"}
              className={`${inputCls} resize-y`}
            />
          </div>
          <div>
            <label className={labelCls}>Facilities (one per line)</label>
            <textarea
              rows={5}
              value={amenitiesText}
              onChange={(e) => setAmenitiesText(e.target.value)}
              placeholder={"Gated entry\nPark\nStreet lights"}
              className={`${inputCls} resize-y`}
            />
          </div>
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
                  {p.location ? ` · ${p.location}` : ""}
                </p>
                {p.slug && (
                  <a
                    href={`/properties/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold text-copper hover:underline"
                  >
                    <ExternalLink className="h-3 w-3" />
                    /properties/{p.slug} · {1 + (Array.isArray(p.gallery) ? p.gallery.length : 0)} photos
                  </a>
                )}
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
