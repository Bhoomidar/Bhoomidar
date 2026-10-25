"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Building2, Check, Eye, ExternalLink, Loader2, MapPin, Plus, X } from "lucide-react";
import { saveProperty } from "@/actions/admin/properties";
import { DETAIL_ICONS } from "@/lib/icons";
import Select from "../Select";
import GalleryEditor from "./GalleryEditor";
import ImageUploader from "./ImageUploader";
import Switch from "./Switch";
import { btnGhost, btnPrimary, iconBtn, inputCls, labelCls } from "./ui";

export const EMPTY_PROPERTY = {};

const EMPTY = {
  id: "",
  title: "",
  category: "",
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
  show_on_home: true,
  banner_url: "",
};

// One item per line in a text box <-> a list.
const toLines = (list) => (Array.isArray(list) ? list.join("\n") : "");
const fromLines = (text) => text.split("\n").map((t) => t.trim()).filter(Boolean);

export const arr = (v) => (Array.isArray(v) ? v : []);

// How much of a property's own page is filled in: what is there, what is missing.
export function completeness(p) {
  const checks = [
    ["Location", !!p.location],
    ["One line about it", !!p.tagline],
    ["About text", !!p.description],
    ["More photos", arr(p.gallery).length > 0],
    ["Key details", arr(p.specs).some((s) => s.value)],
    ["Why you will like it", arr(p.highlights).length > 0],
    ["Facilities", arr(p.amenities).length > 0],
    ["Map link", !!p.map_url],
  ];
  const done = checks.filter(([, ok]) => ok).length;
  return { done, total: checks.length, missing: checks.filter(([, ok]) => !ok).map(([label]) => label) };
}

function SectionTitle({ icon: Icon, title, note }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
        <Icon className="h-5 w-5" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-xl font-bold text-ink">{title}</p>
        {note && <p className="mt-0.5 text-xs text-ink/55">{note}</p>}
      </div>
    </div>
  );
}

// How the card looks on the website, built from what is typed in the form.
function CardPreview({ form }) {
  const lines = form.details.filter((d) => d.text.trim());
  return (
    <div>
      <p className="mb-3 flex items-center gap-2 px-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink/55">
        <Eye className="h-4 w-4 text-copper" />
        How the card looks
        <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 ring-1 ring-emerald-200">
          LIVE
        </span>
      </p>
      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-28px_rgba(110,60,20,0.5)] ring-1 ring-black/5">
        <div className="relative aspect-[4/3] bg-[#f1e6d4]">
          {form.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-ink/40">No image yet</div>
          )}
          {form.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-[#2f6fd6] px-3 py-1 text-[11px] font-bold text-white shadow-md">
              {form.badge}
            </span>
          )}
        </div>
        <div className="p-4">
          <p className="[overflow-wrap:anywhere] font-display text-lg font-bold text-ink">{form.title || "Property title"}</p>
          <p className="mt-0.5 text-xs font-semibold text-copper">{form.category}</p>
          <p className="mt-3 text-2xl font-extrabold tabular-nums text-ink">{form.price || "₹ —"}</p>
          <p className="text-xs text-ink/50">{form.unit}</p>
          {lines.length > 0 && (
            <ul className="mt-3 space-y-1.5 border-t border-black/5 pt-3">
              {lines.map((d, i) => {
                const Icon = DETAIL_ICONS[d.icon] ?? DETAIL_ICONS.MapPin;
                return (
                  <li key={i} className="flex items-center gap-2 text-xs text-ink/70">
                    <Icon className="h-3.5 w-3.5 shrink-0 text-copper" />
                    <span className="[overflow-wrap:anywhere]">{d.text}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
      {form.location && (
        <p className="mt-3 flex items-center gap-1.5 px-1 text-xs text-ink/55">
          <MapPin className="h-3.5 w-3.5 text-copper" />
          {form.location}
        </p>
      )}
    </div>
  );
}

export default function PropertyForm({ initial, onDone, categories = [] }) {
  const [form, setForm] = useState({
    ...EMPTY,
    ...initial,
    category: initial.category || categories[0]?.name || "",
    badge: initial.badge ?? "",
    slug: initial.slug ?? "",
    tagline: initial.tagline ?? "",
    location: initial.location ?? "",
    description: initial.description ?? "",
    map_url: initial.map_url ?? "",
    gallery: arr(initial.gallery),
    highlights: arr(initial.highlights),
    amenities: arr(initial.amenities),
    specs: arr(initial.specs),
    show_on_home: initial.show_on_home !== false,
    banner_url: initial.banner_url ?? "",
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

  const live = { ...form, highlights: fromLines(highlightsText), amenities: fromLines(amenitiesText) };
  const done = completeness(live);

  return (
    <form onSubmit={submit} className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-8">
        {/* The card */}
        <section className="space-y-5">
          <SectionTitle icon={Building2} title="The card" note="What shows in the list of properties on the website." />
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
              <Select
                value={form.category}
                onChange={(v) => set("category", v)}
                options={categories.map((c) => c.name)}
                ariaLabel="Type"
              />
              <p className="mt-1.5 text-xs text-ink/50">
                Need another type? <a href="/admin/properties/categories" className="font-semibold text-copper underline-offset-2 hover:underline">Add or change types</a>
              </p>
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

          <div className="flex items-center justify-between gap-4 rounded-xl border border-black/10 bg-[#fbf7f0] px-4 py-3">
            <span>
              <span className="block text-sm font-semibold text-ink">Show on the home page</span>
              <span className="block text-xs text-ink/55">
                {form.show_on_home ? "Listed on the home page" : "Not on the home page"}. It stays on the Properties page.
              </span>
            </span>
            <Switch
              label="Show on the home page"
              checked={form.show_on_home}
              onChange={(v) => set("show_on_home", v)}
            />
          </div>

          <div>
            <label className={labelCls}>Image</label>
            <ImageUploader value={form.image_url} onChange={(url) => set("image_url", url)} aspect="aspect-[4/3]" />
          </div>

          <div>
            <label className={labelCls}>Detail lines (shown on the card)</label>
            <div className="space-y-3">
              {form.details.map((d, i) => {
                const Icon = DETAIL_ICONS[d.icon] ?? DETAIL_ICONS.MapPin;
                return (
                  <div key={i} className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 sm:flex">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-copper/10 text-copper">
                      <Icon className="h-5 w-5" />
                    </span>
                    <Select
                      wrapperClassName="min-w-0 sm:w-40 sm:shrink-0"
                      value={d.icon}
                      onChange={(v) => setDetail(i, { icon: v })}
                      ariaLabel="Icon"
                      menuMinWidth={200}
                      options={Object.keys(DETAIL_ICONS).map((name) => ({ value: name, label: name, icon: DETAIL_ICONS[name] }))}
                    />
                    <input
                      value={d.text}
                      onChange={(e) => setDetail(i, { text: e.target.value })}
                      placeholder="e.g. Gated Community"
                      className={`${inputCls} order-last col-span-3 sm:order-none sm:col-span-1`}
                    />
                    <button
                      type="button"
                      onClick={() => set("details", form.details.filter((_, idx) => idx !== i))}
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
        </section>

        {/* The property's own page */}
        <section className="space-y-5 rounded-3xl bg-white/70 p-5 ring-1 ring-copper/20 sm:p-6">
          <SectionTitle
            icon={ExternalLink}
            title="Property page"
            note="What customers see when they open this property. All of it is optional."
          />

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
            <label className={labelCls}>Banner photo of this page (optional)</label>
            <p className="-mt-0.5 mb-2 text-xs text-ink/50">
              The big wide photo behind the name at the top. Leave it empty to use the card image.
            </p>
            <ImageUploader
              value={form.banner_url}
              onChange={(url) => set("banner_url", url)}
              optional
              natural
            />
          </div>

          <div>
            <label className={labelCls}>More photos</label>
            <GalleryEditor value={form.gallery} onChange={(list) => set("gallery", list)} />
          </div>

          <div>
            <label className={labelCls}>Key details (boxes like &ldquo;Plot size - 1200 Sq. Yards&rdquo;)</label>
            <div className="space-y-3">
              {form.specs.map((s, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex">
                  <input
                    value={s.label}
                    onChange={(e) =>
                      set("specs", form.specs.map((x, idx) => (idx === i ? { ...x, label: e.target.value } : x)))
                    }
                    placeholder="Name, e.g. Plot size"
                    className={`${inputCls} min-w-0 sm:w-2/5`}
                    aria-label="Name"
                  />
                  <input
                    value={s.value}
                    onChange={(e) =>
                      set("specs", form.specs.map((x, idx) => (idx === i ? { ...x, value: e.target.value } : x)))
                    }
                    placeholder="Value, e.g. 1200 - 2400 Sq. Yards"
                    className={`${inputCls} order-last col-span-2 sm:order-none sm:col-span-1`}
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
        </section>

        {error && (
          <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">{error}</p>
        )}

        <div className="sticky bottom-4 z-20 flex justify-end gap-3 rounded-2xl bg-white/90 p-3 shadow-[0_18px_40px_-18px_rgba(60,30,10,0.45)] ring-1 ring-black/10 backdrop-blur">
          <button type="button" onClick={() => onDone(false)} className={btnGhost}>
            Cancel
          </button>
          <button type="submit" disabled={pending} className={btnPrimary}>
            {pending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save property
          </button>
        </div>
      </div>

      {/* Stays beside the form while you scroll */}
      <aside className="space-y-5 lg:sticky lg:top-28">
        <CardPreview form={form} />

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between text-xs font-semibold text-ink/60">
            <span>Property page filled in</span>
            <span className="text-copper-dark">
              {done.done} of {done.total}
            </span>
          </div>
          <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-black/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-copper-light to-emerald-500 transition-all"
              style={{ width: `${(done.done / done.total) * 100}%` }}
            />
          </div>
          {done.missing.length > 0 ? (
            <p className="mt-3 text-xs leading-relaxed text-ink/55">
              Still empty: {done.missing.join(", ")}.
            </p>
          ) : (
            <p className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <Check className="h-3.5 w-3.5" strokeWidth={3} /> Everything is filled in.
            </p>
          )}
        </div>
      </aside>
    </form>
  );
}


// The form on its own page: after saving or cancelling, go back to the list.
export function PropertyPageForm({ initial, categories = [] }) {
  const router = useRouter();
  return (
    <PropertyForm
      initial={initial}
      categories={categories}
      onDone={(changed) => {
        router.push("/admin/properties");
        if (changed) router.refresh();
      }}
    />
  );
}
