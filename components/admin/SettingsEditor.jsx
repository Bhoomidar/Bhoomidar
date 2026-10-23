"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, RotateCcw, Save } from "lucide-react";
import { saveSettings, resetSettings } from "@/actions/admin/content";
import { DEFAULTS, isOn, num } from "@/lib/siteContent";
import ImageUploader from "./ImageUploader";
import Switch from "./Switch";
import ConfirmButton from "./ConfirmButton";
import { btnPrimary, card, inputCls, labelCls } from "./ui";

// One editable form per tab. `initial` holds the current value of every key.
export default function SettingsEditor({ tabs, initial }) {
  const [active, setActive] = useState(tabs[0].id);
  const [form, setForm] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState(null);

  const tab = tabs.find((t) => t.id === active);
  const set = (key, value) => {
    setForm((p) => ({ ...p, [key]: value }));
    setMsg(null);
  };
  const dirty = (t) => t.fields.some((f) => form[f.key] !== saved[f.key]);

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
    });

  return (
    <div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-3">
        {tabs.map((t) => {
          const isActive = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                setActive(t.id);
                setMsg(null);
              }}
              className={`relative shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition ${
                isActive
                  ? "border-transparent bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/25"
                  : "border-black/10 bg-white text-ink/75 hover:border-copper hover:text-copper"
              }`}
            >
              {t.label}
              {dirty(t) && (
                <span
                  title="Unsaved changes"
                  className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-amber-500 ring-2 ring-white"
                />
              )}
            </button>
          );
        })}
      </div>

      <div className={`${card} mt-2`}>
        {tab.note && (
          <p className="mb-5 rounded-xl bg-copper/10 px-4 py-3 text-sm text-copper-dark">
            {tab.note}
          </p>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          {tab.fields.map((field) => {
            const wide = !["text", "range", "toggle"].includes(field.type);
            const isToggle = field.type === "toggle";
            return (
              <div key={field.key} className={wide ? "sm:col-span-2" : ""}>
                {isToggle ? (
                  <div className="flex items-center justify-between gap-4 rounded-xl border border-black/10 bg-[#fbf7f0] px-4 py-3">
                    <span>
                      <span className="block text-sm font-semibold text-ink">{field.label}</span>
                      <span className="block text-xs text-ink/55">
                        {isOn(form[field.key]) ? "Shown" : "Hidden"}
                      </span>
                    </span>
                    <Switch
                      label={field.label}
                      checked={isOn(form[field.key])}
                      onChange={(on) => set(field.key, on ? "1" : "0")}
                    />
                  </div>
                ) : (
                  <label className={labelCls} htmlFor={field.key}>
                    {field.label}
                    {field.type === "range" && (
                      <span className="ml-2 font-bold text-copper">
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
                  <input
                    id={field.key}
                    type="range"
                    min={field.min}
                    max={field.max}
                    value={num(form[field.key], num(field.default))}
                    onChange={(e) => set(field.key, e.target.value)}
                    className="w-full accent-copper"
                  />
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

        <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-black/5 pt-6">
          <button type="button" onClick={save} disabled={pending} className={btnPrimary}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>

          <ConfirmButton
            onConfirm={reset}
            confirmText="Yes, reset"
            disabled={pending}
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink/60 transition hover:text-rose-700"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to original
          </ConfirmButton>

          {msg && (
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-medium ${
                msg.ok ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {msg.ok && <Check className="h-4 w-4" />}
              {msg.text}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
