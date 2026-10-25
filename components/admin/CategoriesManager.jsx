"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Check, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { deleteCategory, moveCategory, saveCategory } from "@/actions/admin/categories";
import { CATEGORY_ICON_CHOICES, categoryIconOf } from "@/lib/icons";
import ConfirmDialog from "../ConfirmDialog";
import { btnGhost, btnPrimary, card, iconBtn, inputCls, labelCls } from "./ui";

// Name + tab text + icon of one type. Used to add a type and to change one.
function CategoryForm({ initial, busy, onSave, onCancel, submitText }) {
  const [form, setForm] = useState({ name: "", label: "", icon: "Home", ...initial });
  const set = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
      className="space-y-4"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelCls}>Name of the type</label>
          <input
            required
            maxLength={40}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Plots"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls}>Text on the filter tab (optional)</label>
          <input
            maxLength={40}
            value={form.label}
            onChange={(e) => set("label", e.target.value)}
            placeholder="e.g. Residential Plots (empty = the name)"
            className={inputCls}
          />
        </div>
      </div>

      <div>
        <label className={labelCls}>Icon</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(CATEGORY_ICON_CHOICES).map(([key, Icon]) => (
            <button
              key={key}
              type="button"
              title={key}
              aria-label={key}
              aria-pressed={form.icon === key}
              onClick={() => set("icon", key)}
              className={`flex h-11 w-11 items-center justify-center rounded-xl border transition ${
                form.icon === key
                  ? "border-copper bg-copper/10 text-copper ring-2 ring-copper/30"
                  : "border-black/10 bg-white text-ink/60 hover:border-copper hover:text-copper"
              }`}
            >
              <Icon className="h-5 w-5" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={busy} className={btnPrimary}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
          {submitText}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} className={btnGhost}>
            <X className="h-4 w-4" /> Cancel
          </button>
        )}
      </div>
    </form>
  );
}

// Admin > Properties > Types: add, rename, re-order and delete the property types.
export default function CategoriesManager({ categories }) {
  const router = useRouter();
  const [editing, setEditing] = useState(null); // id of the row being changed
  const [deleting, setDeleting] = useState(null);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");
  const [pending, start] = useTransition();

  const run = (fn, done) =>
    start(async () => {
      setError("");
      setOk("");
      const res = await fn();
      if (res && !res.success) setError(res.error || "Something went wrong.");
      else if (done) setOk(done);
      router.refresh();
      return res;
    });

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">{error}</p>
      )}
      {ok && (
        <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
          <Check className="h-4 w-4" /> {ok}
        </p>
      )}

      <div className={card}>
        <h2 className="flex items-center gap-2 font-display text-xl font-bold text-ink">
          <Plus className="h-5 w-5 text-copper" /> Add a type
        </h2>
        <p className="mt-1 mb-5 text-sm text-ink/60">
          A new type can be chosen on any property and gets its own filter tab on the website.
        </p>
        <CategoryForm
          key={categories.length}
          busy={pending}
          submitText="Add type"
          onSave={(form) => run(() => saveCategory({ ...form, id: "" }), `"${form.name.trim()}" is added.`)}
        />
      </div>

      <div className={card}>
        <h2 className="font-display text-xl font-bold text-ink">Your types</h2>
        <p className="mt-1 mb-4 text-sm text-ink/60">
          The order here is the order of the filter tabs and of the Type list on a property.
        </p>

        {categories.length === 0 ? (
          <p className="py-8 text-center text-sm text-ink/55">No types yet. Add the first one above.</p>
        ) : (
          <ul className="divide-y divide-black/5">
            {categories.map((c, i) => {
              const Icon = categoryIconOf(c.icon);
              if (editing === c.id) {
                return (
                  <li key={c.id} className="py-5">
                    <CategoryForm
                      initial={{ name: c.name, label: c.label, icon: c.icon }}
                      busy={pending}
                      submitText="Save"
                      onCancel={() => setEditing(null)}
                      onSave={(form) =>
                        run(async () => {
                          const res = await saveCategory({ ...form, id: c.id });
                          if (res.success) setEditing(null);
                          return res;
                        }, "Saved.")
                      }
                    />
                  </li>
                );
              }
              return (
                <li key={c.id} className="flex flex-wrap items-center gap-4 py-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-copper/10 text-copper">
                    <Icon className="h-6 w-6" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-ink">{c.name}</p>
                    <p className="text-xs text-ink/55">
                      {c.count} propert{c.count === 1 ? "y" : "ies"}
                      {c.label && c.label !== c.name ? ` · tab says "${c.label}"` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        className={`${iconBtn} disabled:opacity-30`}
                        disabled={pending || i === 0}
                        onClick={() => run(() => moveCategory(c.id, -1))}
                        aria-label="Move up"
                        title="Move up"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className={`${iconBtn} disabled:opacity-30`}
                        disabled={pending || i === categories.length - 1}
                        onClick={() => run(() => moveCategory(c.id, 1))}
                        aria-label="Move down"
                        title="Move down"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>
                      <button type="button" onClick={() => setEditing(c.id)} className={btnGhost}>
                        <Pencil className="h-4 w-4" /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(c)}
                        aria-label={`Delete ${c.name}`}
                        title="Delete"
                        className={`${iconBtn} hover:!border-rose-500 hover:!text-rose-600`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {deleting && (
        <ConfirmDialog
          tone="danger"
          icon={Trash2}
          title="Delete this type?"
          text={
            <>
              <b className="text-ink">{deleting.name}</b> will be removed from the Type list and from the filter tabs.
              {deleting.count > 0 && " It still has properties, so it cannot be deleted until they have another type."}
            </>
          }
          confirmText="Yes, delete"
          busy={pending}
          onConfirm={() => {
            const c = deleting;
            setDeleting(null);
            run(() => deleteCategory(c.id), `"${c.name}" is deleted.`);
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
