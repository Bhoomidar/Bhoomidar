"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BadgeCheck, Plus, Ruler, Search, ShoppingBag, Wallet } from "lucide-react";
import { cancelSale, previewSale, recordSale } from "@/actions/admin/commission";
import { fmtArea, fmtDate, fmtPoints } from "@/lib/points";
import ConfirmButton from "./ConfirmButton";
import Modal from "./Modal";
import { btnGhost, btnPrimary, card, inputCls, labelCls } from "./ui";

const today = () => new Date().toLocaleDateString("en-CA");

const blank = () => ({ sellerId: "", title: "", customer: "", area: "", value: "", date: today(), note: "" });

const KIND_TEXT = { sale: "Own sale (personal commission)", team: "Team commission" };

export default function SalesManager({ sales, sellers, propertyTitles }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const confirmed = sales.filter((s) => s.status === "confirmed");
  const totals = {
    count: confirmed.length,
    area: confirmed.reduce((t, s) => t + s.area, 0),
    value: confirmed.reduce((t, s) => t + s.value, 0),
    commission: confirmed.reduce((t, s) => t + s.commission, 0),
  };

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sales;
    return sales.filter((s) => [s.sellerName, s.sellerCode, s.title, s.customer].join(" ").toLowerCase().includes(term));
  }, [sales, search]);

  const cancel = (s) =>
    start(async () => {
      setError("");
      const res = await cancelSale(s.id);
      if (!res.success) setError(res.error);
      router.refresh();
    });

  const stats = [
    { icon: ShoppingBag, label: "Confirmed sales", value: totals.count },
    { icon: Ruler, label: "Sq. yards sold", value: fmtArea(totals.area) },
    { icon: Wallet, label: "Total sale value", value: `₹${fmtPoints(totals.value)}` },
    { icon: BadgeCheck, label: "Points given as commission", value: fmtPoints(totals.commission) },
  ];

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className={card}>
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-copper/10 text-copper">
              <Icon className="h-5 w-5" />
            </span>
            <p className="mt-3 text-2xl font-extrabold tabular-nums text-ink">{value}</p>
            <p className="mt-0.5 text-xs text-ink/55">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partner, property or customer"
            className={`${inputCls} pl-10`}
          />
        </div>
        <button onClick={() => setOpen(true)} className={btnPrimary}>
          <Plus className="h-4 w-4" />
          Record a sale
        </button>
      </div>

      {error && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

      <div className={`${card} mt-4 overflow-x-auto !p-0`}>
        {shown.length === 0 ? (
          <p className="px-6 py-14 text-center text-sm text-ink/55">
            {sales.length === 0 ? "No sales yet. Record the first one." : "No sale matches your search."}
          </p>
        ) : (
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="border-b border-black/5 text-[11px] font-semibold uppercase tracking-wider text-ink/50">
              <tr>
                <th className="px-5 py-3.5">Date</th>
                <th className="px-4 py-3.5">Sold by</th>
                <th className="px-4 py-3.5">Property</th>
                <th className="px-4 py-3.5 text-right">Sq. yards</th>
                <th className="px-4 py-3.5 text-right">Value</th>
                <th className="px-4 py-3.5 text-right">Commission</th>
                <th className="px-5 py-3.5 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {shown.map((s) => (
                <tr key={s.id} className={s.status === "cancelled" ? "opacity-55" : ""}>
                  <td className="whitespace-nowrap px-5 py-4 text-ink/70">{fmtDate(s.date)}</td>
                  <td className="px-4 py-4">
                    <span className="block font-semibold text-ink">{s.sellerName}</span>
                    <span className="block text-xs text-ink/50">
                      {s.sellerCode} · {s.rate}% rate
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className="block font-medium text-ink">{s.title}</span>
                    {s.customer && <span className="block text-xs text-ink/50">Buyer: {s.customer}</span>}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums">{fmtArea(s.area)}</td>
                  <td className="px-4 py-4 text-right tabular-nums">₹{fmtPoints(s.value)}</td>
                  <td className="px-4 py-4 text-right font-semibold tabular-nums text-copper">{fmtPoints(s.commission)}</td>
                  <td className="px-5 py-4 text-right">
                    {s.status === "cancelled" ? (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">Cancelled</span>
                    ) : (
                      <ConfirmButton
                        onConfirm={() => cancel(s)}
                        confirmText="Yes, cancel"
                        disabled={pending}
                        className="rounded-lg border border-black/10 px-3 py-1.5 text-xs font-semibold text-ink/70 transition hover:border-rose-300 hover:text-rose-700"
                      >
                        Cancel sale
                      </ConfirmButton>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {open && (
        <SaleModal
          sellers={sellers}
          propertyTitles={propertyTitles}
          onClose={() => setOpen(false)}
          onDone={() => {
            setOpen(false);
            router.refresh();
          }}
        />
      )}
    </>
  );
}

function SaleModal({ sellers, propertyTitles, onClose, onDone }) {
  const [form, setForm] = useState(blank);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    setPreview(null);
  };

  const check = (e) => {
    e.preventDefault();
    setError("");
    start(async () => {
      const res = await previewSale(form);
      if (!res.success) return setError(res.error);
      setPreview(res);
    });
  };

  const confirm = () =>
    start(async () => {
      setError("");
      const res = await recordSale(form);
      if (!res.success) return setError(res.error);
      onDone();
    });

  const seller = sellers.find((s) => s.id === form.sellerId);

  return (
    <Modal title={preview ? "Check the commission" : "Record a sale"} onClose={onClose}>
      {preview ? (
        <div className="space-y-6">
          <div className="rounded-2xl bg-[#fbf7f0] p-5 ring-1 ring-black/5">
            <p className="font-semibold text-ink">{form.title}</p>
            <p className="mt-1 text-sm text-ink/60">
              Sold by <b className="text-ink">{seller?.name}</b> · {fmtArea(form.area)} sq. yards · ₹{fmtPoints(form.value)}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl ring-1 ring-black/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-black/[0.03] text-[11px] font-semibold uppercase tracking-wider text-ink/50">
                <tr>
                  <th className="px-4 py-3">Partner</th>
                  <th className="px-4 py-3">For</th>
                  <th className="px-4 py-3 text-right">Rate</th>
                  <th className="px-4 py-3 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {preview.rows.map((r) => (
                  <tr key={r.partnerId + r.kind}>
                    <td className="px-4 py-3 font-semibold text-ink">{r.name}</td>
                    <td className="px-4 py-3 text-ink/65">
                      {KIND_TEXT[r.kind]}
                      {r.level > 0 && <span className="text-ink/40"> · level {r.level} up</span>}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">{r.rate}%</td>
                    <td className="px-4 py-3 text-right font-bold tabular-nums text-copper">{fmtPoints(r.points)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-black/[0.03]">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-ink">Total points given</td>
                  <td className="px-4 py-3 text-right font-bold tabular-nums text-ink">{fmtPoints(preview.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="text-xs text-ink/55">
            1 point = ₹1. The area is added to the seller and everyone above them, and their ranks update right away.
            You can cancel a sale later; its commission is then taken back.
          </p>
          {error && <p className="text-sm text-rose-700">{error}</p>}

          <div className="flex justify-between gap-3">
            <button type="button" onClick={() => setPreview(null)} className={btnGhost}>
              <ArrowLeft className="h-4 w-4" />
              Edit
            </button>
            <button type="button" onClick={confirm} disabled={pending} className={btnPrimary}>
              {pending ? "Saving..." : "Confirm and record sale"}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={check} className="space-y-5">
          <div>
            <label className={labelCls} htmlFor="sale-seller">Sold by (active partner)</label>
            <select id="sale-seller" required value={form.sellerId} onChange={set("sellerId")} className={inputCls}>
              <option value="">Choose a partner</option>
              {sellers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.code && `(${s.code})`}
                </option>
              ))}
            </select>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="sale-title">Property</label>
              <input
                id="sale-title"
                required
                list="sale-properties"
                value={form.title}
                onChange={set("title")}
                maxLength={200}
                placeholder="Plot 12, Residential Plots"
                className={inputCls}
              />
              <datalist id="sale-properties">
                {propertyTitles.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </div>
            <div>
              <label className={labelCls} htmlFor="sale-customer">Buyer name (optional)</label>
              <input id="sale-customer" value={form.customer} onChange={set("customer")} maxLength={150} className={inputCls} />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <div>
              <label className={labelCls} htmlFor="sale-area">Area (sq. yards)</label>
              <input id="sale-area" required type="number" min="0.01" step="0.01" value={form.area} onChange={set("area")} placeholder="100" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="sale-value">Sale value (₹)</label>
              <input id="sale-value" required type="number" min="1" step="1" value={form.value} onChange={set("value")} placeholder="1000000" className={inputCls} />
            </div>
            <div>
              <label className={labelCls} htmlFor="sale-date">Sale date</label>
              <input id="sale-date" required type="date" value={form.date} onChange={set("date")} className={inputCls} />
            </div>
          </div>

          <div>
            <label className={labelCls} htmlFor="sale-note">Note (optional)</label>
            <input id="sale-note" value={form.note} onChange={set("note")} maxLength={300} placeholder="Registry number, remarks..." className={inputCls} />
          </div>

          {error && <p className="text-sm text-rose-700">{error}</p>}

          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending ? "Working it out..." : "Check commission"}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
