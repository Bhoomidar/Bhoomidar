"use client";

import { Fragment, useState, useTransition } from "react";
import {
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  CircleHelp,
  Eye,
  EyeOff,
  ExternalLink,
  FileText,
  Globe,
  Gift,
  Hash,
  Heart,
  ImageIcon,
  LayoutGrid,
  ListOrdered,
  Loader2,
  Megaphone,
  MessageSquareQuote,
  MousePointerClick,
  PanelBottom,
  PhoneCall,
  RotateCcw,
  Save,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trophy,
  Undo2,
  Wallet,
} from "lucide-react";
import { saveSettings, resetSettings } from "@/actions/admin/content";
import { DEFAULTS, isOn, num } from "@/lib/siteContent";
import ConfirmDialog from "../ConfirmDialog";
import ImageUploader from "./ImageUploader";
import Switch from "./Switch";
import { btnPrimary, card, inputCls, labelCls } from "./ui";

// A small picture for each section, found by the section's id.
const TAB_ICONS = {
  hero: Sparkles,
  hero_banner: ImageIcon,
  banner: ImageIcon,
  banner_photos: ImageIcon,
  top: Sparkles,
  top_photos: ImageIcon,
  ranks: Trophy,
  start: ListOrdered,
  seo: Globe,
  visibility: Eye,
  properties: Building2,
  why: BadgeCheck,
  testimonials: MessageSquareQuote,
  home_faq: CircleHelp,
  faq: CircleHelp,
  cta: Megaphone,
  benefits: Gift,
  story: BookOpen,
  numbers: Hash,
  mission: Target,
  values: Heart,
  steps: ListOrdered,
  buttons: MousePointerClick,
  info: PhoneCall,
  social: Share2,
  page: FileText,
  footer: PanelBottom,
  amount: Wallet,
  pay: Wallet,
  team: PhoneCall,
};

const iconOf = (id) => TAB_ICONS[id] ?? LayoutGrid;

const isPlain = (f) => f.type === undefined || f.type === "text" || f.type === "textarea";

// Which card a field belongs in, judging by its label. null = on its own.
//   "Benefit 1 - title"      -> card "Benefit 1",  field "title"
//   "Heading - line 2"       -> card "Heading",    field "line 2"
//   "Button 1 text"          -> card "Button 1",   field "text"
//   "Question 2" / "Answer 2"-> card "Question 2"
function groupOf(label) {
  if (label.includes(" - ")) {
    const [title, ...rest] = label.split(" - ");
    return { title, inner: rest.join(" - ") };
  }
  let m = /^(.+?) (\d+) (.+)$/.exec(label);
  if (m) return { title: `${m[1]} ${m[2]}`, inner: m[3] };
  m = /^(Question|Answer) (\d+)$/.exec(label);
  if (m) return { title: `Question ${m[2]}`, inner: m[1] };
  return null;
}

// Shows what the three banner sliders do. On the left, the whole photo with a
// bright box: the part that stays in view on a narrower screen. On the right,
// that part as it looks on the site, with the extra darkness and a sample heading.
function BannerPreview({ src, x, y, overlay, phone, usingLaptopPhoto }) {
  const [ratio, setRatio] = useState(16 / 9); // photo width / height

  // The screen the box stands for: a tall phone, or a narrower laptop window.
  const target = phone ? 9 / 16 : 4 / 3;

  // Where the box sits on the photo (same rule as CSS object-position).
  let box;
  if (ratio > target) {
    const w = (target / ratio) * 100;
    box = { width: `${w}%`, height: "100%", left: `${(100 - w) * (x / 100)}%`, top: 0 };
  } else {
    const h = (ratio / target) * 100;
    box = { width: "100%", height: `${h}%`, left: 0, top: `${(100 - h) * (y / 100)}%` };
  }

  if (!src) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-copper/25 bg-white px-4 py-6 text-center text-sm text-ink/50">
        Add a photo above and a preview shows here.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-start gap-x-8 gap-y-5 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10 sm:p-5">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">The whole photo</p>
        <div className="relative w-full max-w-[260px] overflow-hidden rounded-xl ring-1 ring-black/10" style={{ aspectRatio: ratio }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            onLoad={(e) => setRatio(e.currentTarget.naturalWidth / e.currentTarget.naturalHeight || 16 / 9)}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span
            className="absolute rounded-md ring-2 ring-white transition-all duration-150"
            style={{ ...box, boxShadow: "0 0 0 999px rgba(20,12,6,0.55)" }}
          />
        </div>
        <p className="mt-2 max-w-[260px] text-xs text-ink/50">The bright box is the part that stays in view.</p>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-ink/50">
          {phone ? "On a phone" : "On a narrower screen"}
        </p>
        <div
          className={`relative overflow-hidden ring-1 ring-black/15 ${
            phone ? "w-[116px] rounded-[1.1rem] ring-2 ring-ink/70" : "w-[220px] rounded-xl"
          }`}
          style={{ aspectRatio: target }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            style={{ objectPosition: `${x}% ${y}%` }}
          />
          <span className="absolute inset-0 bg-black transition-opacity duration-150" style={{ opacity: overlay / 100 }} />
          <span
            className={`absolute inset-x-0 top-1/2 -translate-y-1/2 px-2 text-center font-display font-bold leading-tight text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)] ${
              phone ? "text-[13px]" : "text-base"
            }`}
          >
            Your heading
          </span>
        </div>
        <p className="mt-2 max-w-[220px] text-xs text-ink/50">
          {usingLaptopPhoto
            ? "No phone photo is set, so the laptop photo is used."
            : "Is the heading easy to read? If not, raise the darkness."}
        </p>
      </div>
    </div>
  );
}

// One editable form per section. `initial` holds the current value of every key.
//   nav       "side" (default): sections listed on the left on wide screens.
//             "tabs": sections as pills above the form.
//   siteHref  the public page these settings change, for the "Open live page" button
//   top(form) / aside(form)  something above, or beside, the form that sees unsaved values
export default function SettingsEditor({ tabs, initial, top, aside, nav = "side", siteHref, siteLabel = "Open live page" }) {
  const [active, setActive] = useState(tabs[0].id);
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState(null);
  const [askReset, setAskReset] = useState(false);

  const tab = tabs.find((t) => t.id === active);
  const set = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setMsg(null);
  };
  const dirty = (t) => t.fields.some((f) => form[f.key] !== saved[f.key]);
  const tabDirty = dirty(tab);
  const side = nav === "side";

  const allFields = tabs.flatMap((t) => t.fields);
  const toggles = allFields.filter((f) => f.type === "toggle");
  const hiddenCount = toggles.filter((f) => !isOn(form[f.key])).length;
  const unsavedTabs = tabs.filter(dirty).length;

  const save = () =>
    start(async () => {
      const entries = Object.fromEntries(tab.fields.map((f) => [f.key, form[f.key]]));
      const res = await saveSettings(entries);
      if (res.success) {
        setSaved((p) => ({ ...p, ...entries }));
        setMsg({ ok: true, text: "Saved. The website is updated." });
      } else {
        setMsg({ ok: false, text: res.error || "Could not save." });
      }
    });

  const discard = () => {
    setForm((p) => ({ ...p, ...Object.fromEntries(tab.fields.map((f) => [f.key, saved[f.key]])) }));
    setMsg(null);
  };

  const reset = () =>
    start(async () => {
      const keys = tab.fields.map((f) => f.key);
      const res = await resetSettings(keys);
      if (res.success) {
        const defaults = Object.fromEntries(keys.map((k) => [k, DEFAULTS[k]]));
        setForm((p) => ({ ...p, ...defaults }));
        setSaved((p) => ({ ...p, ...defaults }));
        setMsg({ ok: true, text: "Back to the original text." });
      } else {
        setMsg({ ok: false, text: res.error || "Could not reset." });
      }
      setAskReset(false);
    });

  const pick = (id) => {
    setActive(id);
    setMsg(null);
  };

  const TabIcon = iconOf(tab.id);

  // Fields that belong together ("Benefit 1 - title", "Benefit 1 - text", or
  // "Heading - line 1", "Heading - line 2") are drawn together in one card.
  const groups = new Map(); // index of the first field -> { title, items }
  const inGroup = new Set(); // indexes of the other fields of a group
  for (let i = 0; i < tab.fields.length; ) {
    const g = isPlain(tab.fields[i]) ? groupOf(tab.fields[i].label) : null;
    if (!g) {
      i++;
      continue;
    }
    const items = [{ field: tab.fields[i], inner: g.inner }];
    let j = i + 1;
    while (j < tab.fields.length && isPlain(tab.fields[j])) {
      const gj = groupOf(tab.fields[j].label);
      if (!gj || gj.title !== g.title) break;
      items.push({ field: tab.fields[j], inner: gj.inner });
      j++;
    }
    if (items.length >= 2) {
      groups.set(i, { title: g.title, items });
      for (let k = i + 1; k < j; k++) inGroup.add(k);
    }
    i = j;
  }

  return (
    <div className="space-y-6">
      {top?.(form)}

      {/* Overview: how big this page is, and a way to look at it */}
      {side && (
        <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-gradient-to-r from-white via-[#fff7ec] to-[#fbeedd] p-4 shadow-[0_18px_40px_-26px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:gap-4 sm:p-5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30">
            <Sparkles className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1 leading-tight">
            <p className="font-display text-xl font-bold text-ink">
              {tabs.length} sections <span className="text-copper">to customize</span>
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink/55">
              <span>{allFields.length} settings</span>
              {toggles.length > 0 && (
                <span className={hiddenCount > 0 ? "font-semibold text-amber-700" : ""}>
                  {hiddenCount > 0 ? `${hiddenCount} hidden on the site` : "everything is shown"}
                </span>
              )}
              {unsavedTabs > 0 && <span className="font-semibold text-amber-700">{unsavedTabs} with unsaved changes</span>}
            </p>
          </div>
          {siteHref && (
            <a
              href={siteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)] ring-1 ring-black/10 transition hover:-translate-y-0.5 hover:text-copper hover:ring-copper"
            >
              <ExternalLink className="h-4 w-4 text-copper" />
              {siteLabel}
            </a>
          )}
        </div>
      )}

      <div
        className={
          aside
            ? side
              ? "grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]"
              : "grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_400px]"
            : ""
        }
      >
        <div className={side ? "grid items-start gap-6 xl:grid-cols-[250px_minmax(0,1fr)]" : "min-w-0"}>
          {/* Sections: a list on the left (wide screens), pills elsewhere */}
          {side && (
            <nav aria-label="Sections" className="hidden space-y-2 xl:sticky xl:top-28 xl:block">
              {tabs.map((t) => {
                const Icon = iconOf(t.id);
                const on = t.id === active;
                const hasToggle = t.fields.some((f) => f.type === "toggle");
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => pick(t.id)}
                    aria-current={on ? "true" : undefined}
                    className={`group relative flex w-full items-center gap-3 rounded-2xl p-3 text-left transition ${
                      on
                        ? "bg-gradient-to-r from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30"
                        : "bg-white text-ink shadow-sm ring-1 ring-black/5 hover:-translate-y-0.5 hover:ring-copper/40"
                    }`}
                  >
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${
                        on ? "bg-white/20 text-white" : "bg-copper/10 text-copper group-hover:bg-copper/15"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate text-sm font-bold">{t.label}</span>
                      <span className={`mt-0.5 block text-xs ${on ? "text-white/75" : "text-ink/50"}`}>
                        {hasToggle ? "show / hide" : `${t.fields.length} settings`}
                      </span>
                    </span>
                    {dirty(t) && (
                      <span
                        title="Unsaved changes"
                        className={`h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400 ring-2 ${on ? "ring-copper-dark" : "ring-white"}`}
                      />
                    )}
                  </button>
                );
              })}
            </nav>
          )}

          <div className="min-w-0">
            <div className={`no-scrollbar -mx-1 overflow-x-auto px-1 pb-3 ${side ? "xl:hidden" : ""}`}>
              <div className="inline-flex gap-1 rounded-2xl bg-[#faf1e6] p-1 ring-1 ring-black/5">
                {tabs.map((t) => {
                  const isActive = t.id === active;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => pick(t.id)}
                      className={`relative shrink-0 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                        isActive
                          ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                          : "text-ink/65 hover:text-copper"
                      }`}
                    >
                      {t.label}
                      {dirty(t) && (
                        <span
                          title="Unsaved changes"
                          className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-[#faf1e6]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={`${card} ${side ? "" : "mt-2"}`}>
              {side && (
                <div className="mb-6 flex items-center gap-3.5 border-b border-black/5 pb-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30">
                    <TabIcon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 leading-tight">
                    <h2 className="font-display text-2xl font-bold text-ink">{tab.label}</h2>
                    <p className="mt-1 text-sm text-ink/55">
                      {tab.fields.length} settings in this section
                    </p>
                  </div>
                </div>
              )}

              {tab.note && (
                <p className="mb-6 rounded-2xl bg-copper/10 px-4 py-3 text-sm text-copper-dark ring-1 ring-copper/15">
                  {tab.note}
                </p>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                {tab.fields.map((field, idx) => {
                  if (inGroup.has(idx)) return null;
                  const group = groups.get(idx);
                  if (group) {
                    return (
                      <div key={`g-${field.key}`} className="rounded-2xl bg-white/70 p-4 ring-1 ring-black/5 sm:col-span-2 sm:p-5">
                        <p className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-copper-dark">
                          <span className="h-1.5 w-1.5 rounded-full bg-copper" />
                          {group.title}
                        </p>
                        <div className="grid gap-4 sm:grid-cols-2">
                          {group.items.map(({ field: gf, inner }) => (
                            <div key={gf.key} className={gf.type === "textarea" ? "sm:col-span-2" : ""}>
                              <label className={labelCls} htmlFor={gf.key}>
                                {inner ? inner.charAt(0).toUpperCase() + inner.slice(1) : gf.label}
                              </label>
                              {gf.hint && <p className="-mt-0.5 mb-2 text-xs text-ink/50">{gf.hint}</p>}
                              {gf.type === "textarea" ? (
                                <textarea
                                  id={gf.key}
                                  rows={3}
                                  value={form[gf.key] ?? ""}
                                  onChange={(e) => set(gf.key, e.target.value)}
                                  className={`${inputCls} resize-y`}
                                />
                              ) : (
                                <input
                                  id={gf.key}
                                  value={form[gf.key] ?? ""}
                                  onChange={(e) => set(gf.key, e.target.value)}
                                  className={inputCls}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  const wide = !["text", "range", "toggle"].includes(field.type);
                  const isToggle = field.type === "toggle";
                  const on = isToggle && isOn(form[field.key]);

                  // Sliders: one tidy row each (name and help on the left, slider on the right),
                  // with a short heading above the first slider of a group.
                  if (field.type === "range") {
                    const first = tab.fields[idx - 1]?.type !== "range";
                    const device = field.label.includes(" - ") ? field.label.split(" - ")[0] : "";
                    const name = field.label.includes(" - ") ? field.label.split(" - ").slice(1).join(" - ") : field.label;
                    const value = num(form[field.key], num(field.default));

                    // Banner sliders: keys look like <page>_image[_mobile]_pos_x / _pos_y / _overlay[_mobile]
                    const banner = /^(.+)_image(_mobile)?_pos_x$/.exec(field.key);
                    let preview = null;
                    if (first && banner) {
                      const [, p, m] = banner;
                      const own = form[`${p}_image${m ?? ""}`];
                      const src = own || (m ? form[`${p}_image`] : "");
                      preview = (
                        <BannerPreview
                          src={src}
                          phone={!!m}
                          usingLaptopPhoto={!!m && !own && !!src}
                          x={num(form[`${p}_image${m ?? ""}_pos_x`], 50)}
                          y={num(form[`${p}_image${m ?? ""}_pos_y`], 50)}
                          overlay={num(form[`${p}_overlay${m ? "_mobile" : ""}`], 0)}
                        />
                      );
                    }

                    return (
                      <Fragment key={field.key}>
                        {first && (
                          <div className="space-y-4 sm:col-span-2">
                            <div>
                              <p className="flex items-center gap-2 text-sm font-bold text-ink">
                                <SlidersHorizontal className="h-4 w-4 text-copper" />
                                {device ? `Fine-tune the ${device.toLowerCase()} photo` : "Fine-tune"}
                              </p>
                              <p className="mt-1 text-xs text-ink/50">
                                Choose which part of the photo stays visible, and how dark it is behind the text.
                                {preview ? " Move a slider and the preview changes." : ""}
                              </p>
                            </div>
                            {preview}
                          </div>
                        )}
                        <div className="sm:col-span-2">
                          <div className="rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-black/10 sm:grid sm:grid-cols-[minmax(0,230px)_minmax(0,1fr)] sm:items-center sm:gap-6">
                            <label htmlFor={field.key} className="block leading-tight">
                              <span className="block text-sm font-bold text-ink">{name}</span>
                              {field.hint && <span className="mt-1 block text-xs text-ink/50">{field.hint}</span>}
                            </label>
                            <div className="mt-3 flex items-center gap-3 sm:mt-0">
                              <span className="w-9 shrink-0 text-right text-[11px] font-medium text-ink/40">
                                {field.min}
                                {field.unit}
                              </span>
                              <input
                                id={field.key}
                                type="range"
                                min={field.min}
                                max={field.max}
                                value={value}
                                onChange={(e) => set(field.key, e.target.value)}
                                className="min-w-0 flex-1 accent-copper"
                              />
                              <span className="w-9 shrink-0 text-[11px] font-medium text-ink/40">
                                {field.max}
                                {field.unit}
                              </span>
                              <span className="w-14 shrink-0 rounded-full bg-copper/10 px-2.5 py-1 text-center text-xs font-bold text-copper-dark ring-1 ring-copper/15">
                                {value}
                                {field.unit}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Fragment>
                    );
                  }

                  return (
                    <div key={field.key} className={wide ? "sm:col-span-2" : ""}>
                      {isToggle ? (
                        <div
                          className={`flex items-center justify-between gap-4 rounded-2xl px-4 py-3.5 ring-1 transition ${
                            on ? "bg-white shadow-sm ring-black/10" : "bg-black/[0.03] ring-black/10"
                          }`}
                        >
                          <span className="flex min-w-0 items-center gap-3">
                            <span
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                                on ? "bg-emerald-100 text-emerald-700" : "bg-black/5 text-ink/40"
                              }`}
                            >
                              {on ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                            </span>
                            <span className="min-w-0 leading-tight">
                              <span className="block text-sm font-bold text-ink">{field.label}</span>
                              <span className={`mt-0.5 block text-xs font-semibold ${on ? "text-emerald-700" : "text-ink/45"}`}>
                                {on ? "Shown on the site" : "Hidden"}
                              </span>
                            </span>
                          </span>
                          <Switch
                            label={field.label}
                            checked={on}
                            onChange={(v) => set(field.key, v ? "1" : "0")}
                          />
                        </div>
                      ) : (
                        <label className={`${labelCls} flex items-center justify-between gap-3`} htmlFor={field.key}>
                          <span>{field.label}</span>
                          {field.type === "range" && (
                            <span className="rounded-full bg-copper/10 px-2.5 py-0.5 text-xs font-bold text-copper-dark ring-1 ring-copper/15">
                              {num(form[field.key], num(field.default))}
                              {field.unit}
                            </span>
                          )}
                        </label>
                      )}
                      {field.hint && !isToggle && (
                        <p className="-mt-0.5 mb-2 text-xs text-ink/50">{field.hint}</p>
                      )}
                      {field.type === "image" ? (
                        <ImageUploader
                          value={form[field.key]}
                          onChange={(url) => set(field.key, url)}
                          optional={field.optional}
                          natural
                          aspect={field.phone ? "aspect-[9/16]" : undefined}
                          maxWidth={field.phone ? "max-w-[170px]" : undefined}
                        />
                      ) : field.type === "range" ? (
                        <div className="rounded-2xl bg-white px-4 py-3.5 shadow-sm ring-1 ring-black/10">
                          <input
                            id={field.key}
                            type="range"
                            min={field.min}
                            max={field.max}
                            value={num(form[field.key], num(field.default))}
                            onChange={(e) => set(field.key, e.target.value)}
                            className="w-full accent-copper"
                          />
                          <div className="mt-1 flex justify-between text-[11px] font-medium text-ink/40">
                            <span>
                              {field.min}
                              {field.unit}
                            </span>
                            <span>
                              {field.max}
                              {field.unit}
                            </span>
                          </div>
                        </div>
                      ) : isToggle ? null : field.type === "textarea" ? (
                        <textarea
                          id={field.key}
                          rows={3}
                          value={form[field.key] ?? ""}
                          onChange={(e) => set(field.key, e.target.value)}
                          className={`${inputCls} resize-y`}
                        />
                      ) : (
                        <input
                          id={field.key}
                          value={form[field.key] ?? ""}
                          onChange={(e) => set(field.key, e.target.value)}
                          className={inputCls}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Stays in view while you scroll a long form */}
              <div className="sticky bottom-4 z-20 mt-8 flex flex-wrap items-center gap-3 rounded-2xl bg-white/90 p-3 shadow-[0_18px_40px_-18px_rgba(60,30,10,0.45)] ring-1 ring-black/10 backdrop-blur sm:gap-4">
                <button type="button" onClick={save} disabled={pending || !tabDirty} className={btnPrimary}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save changes
                </button>

                {tabDirty && (
                  <>
                    <button
                      type="button"
                      onClick={discard}
                      disabled={pending}
                      className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-copper"
                    >
                      <Undo2 className="h-4 w-4" />
                      Discard
                    </button>
                    <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Unsaved changes
                    </span>
                  </>
                )}

                {msg && !tabDirty && (
                  <span
                    className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                      msg.ok ? "text-emerald-700" : "text-rose-700"
                    }`}
                  >
                    {msg.ok && <Check className="h-4 w-4" />}
                    {msg.text}
                  </span>
                )}
                {msg && tabDirty && !msg.ok && <span className="text-sm font-medium text-rose-700">{msg.text}</span>}

                <button
                  type="button"
                  onClick={() => setAskReset(true)}
                  disabled={pending}
                  className="ml-auto inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-rose-700 disabled:opacity-50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset to original
                </button>
              </div>
            </div>
          </div>
        </div>

        {aside && <div className={side ? "2xl:sticky 2xl:top-28" : "xl:sticky xl:top-28"}>{aside(form)}</div>}
      </div>

      {askReset && (
        <ConfirmDialog
          tone="danger"
          icon={RotateCcw}
          title="Reset to original?"
          text={
            <>
              Everything on the <b className="text-ink">{tab.label}</b> section goes back to the original text. This cannot be undone.
            </>
          }
          confirmText="Yes, reset"
          busy={pending}
          onConfirm={reset}
          onCancel={() => setAskReset(false)}
        />
      )}
    </div>
  );
}
