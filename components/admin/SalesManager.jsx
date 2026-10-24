"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Ban,
  Building2,
  CalendarDays,
  Check,
  ChevronDown,
  IndianRupee,
  Plus,
  Ruler,
  Search,
  ShoppingBag,
  StickyNote,
  UserRound,
  Wallet,
} from "lucide-react";
import { cancelSale, previewSale, recordSale } from "@/actions/admin/commission";
import { fmtArea, fmtDate, fmtPoints } from "@/lib/points";
import { BarsArt, ClipboardArt, CoinPileArt, CoinsArt, HouseArt } from "@/components/dashboard/StatArt";
import ConfirmDialog from "../ConfirmDialog";
import DatePicker from "../DatePicker";
import Select, { Suggest } from "../Select";
import Modal from "./Modal";
import { btnGhost, btnPrimary, inputCls, labelCls } from "./ui";

const today = () => new Date().toLocaleDateString("en-CA");

const blank = () => ({ sellerId: "", title: "", customer: "", area: "", value: "", date: today(), note: "" });

const KIND_TEXT = { sale: "Own sale (personal commission)", team: "Team commission" };

const field =
  "w-full rounded-2xl border border-black/10 bg-white text-sm text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)] outline-none transition placeholder:text-ink/45 focus:border-copper focus:ring-4 focus:ring-copper/15";
const th = "px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55";

function Avatar({ url, name, className = "h-12 w-12 text-base" }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark font-bold text-white shadow-md shadow-copper/30 ring-2 ring-white ${className}`}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        (name || "?")[0].toUpperCase()
      )}
    </span>
  );
}

function Stat({ icon: Icon, art: Art, label, value, note, theme }) {
  return (
    <div
      className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ${theme.ring} transition duration-300 hover:-translate-y-1`}
    >
      <Art
        className={`pointer-events-none absolute bottom-3 right-3 h-20 w-24 origin-bottom-right transition duration-500 group-hover:scale-110 ${theme.art ?? ""}`}
      />
      <div className="relative flex items-center gap-4">
        <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full shadow-sm ${theme.chip}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 leading-tight">
          <p className="text-sm font-medium text-ink/70">{label}</p>
          <p className="mt-1 text-3xl font-extrabold tabular-nums text-ink">{value}</p>
        </div>
      </div>
      <p className="relative mt-3 max-w-[62%] text-xs text-ink/55">{note}</p>
    </div>
  );
}

function StatusPill({ status }) {
  return status === "cancelled" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800 ring-1 ring-rose-200">
      <Ban className="h-3 w-3" />
      Cancelled
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 ring-1 ring-emerald-200">
      <Check className="h-3 w-3" strokeWidth={3} />
      Confirmed
    </span>
  );
}

export default function SalesManager({ sales, sellers, propertyTitles }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [cancelling, setCancelling] = useState(null);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  const confirmed = sales.filter((s) => s.status === "confirmed");
  const cancelledCount = sales.length - confirmed.length;
  const totals = {
    count: confirmed.length,
    area: confirmed.reduce((t, s) => t + s.area, 0),
    value: confirmed.reduce((t, s) => t + s.value, 0),
    commission: confirmed.reduce((t, s) => t + s.commission, 0),
  };

  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return sales.filter((s) => {
      if (filter !== "all" && s.status !== filter) return false;
      if (!term) return true;
      return [s.sellerName, s.sellerCode, s.title, s.customer].join(" ").toLowerCase().includes(term);
    });
  }, [sales, search, filter]);

  const shownTotals = useMemo(() => {
    const ok = shown.filter((s) => s.status === "confirmed");
    return {
      area: ok.reduce((t, s) => t + s.area, 0),
      value: ok.reduce((t, s) => t + s.value, 0),
      commission: ok.reduce((t, s) => t + s.commission, 0),
    };
  }, [shown]);

  const confirmCancel = () =>
    start(async () => {
      const s = cancelling;
      setError("");
      const res = await cancelSale(s.id);
      if (!res.success) setError(res.error);
      setCancelling(null);
      router.refresh();
    });

  const stats = [
    {
      icon: ShoppingBag,
      art: HouseArt,
      label: "Confirmed sales",
      value: totals.count,
      note: cancelledCount > 0 ? `${cancelledCount} cancelled` : "no cancelled sales",
      theme: { bg: "from-[#fdebdc] to-[#fff6ec]", ring: "ring-copper/10", chip: "bg-[#f9d6b8] text-copper" },
    },
    {
      icon: Ruler,
      art: BarsArt,
      label: "Sq. yards sold",
      value: fmtArea(totals.area),
      note: "area across confirmed sales",
      theme: { bg: "from-[#dff5e8] to-[#f5fcf8]", ring: "ring-emerald-300/30", chip: "bg-emerald-200/80 text-emerald-700", art: "text-emerald-500" },
    },
    {
      icon: Wallet,
      art: CoinPileArt,
      label: "Total sale value",
      value: `₹${fmtPoints(totals.value)}`,
      note: "value of confirmed sales",
      theme: { bg: "from-[#fff1cf] to-[#fffaf0]", ring: "ring-amber-300/30", chip: "bg-amber-200/80 text-amber-700" },
    },
    {
      icon: BadgeCheck,
      art: CoinsArt,
      label: "Commission given",
      value: fmtPoints(totals.commission),
      note: "points to sellers and their teams",
      theme: { bg: "from-[#ece4fb] to-[#f9f6ff]", ring: "ring-violet-300/30", chip: "bg-violet-200/80 text-violet-700", art: "text-violet-500" },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative lg:w-[340px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-copper" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partner, property or buyer..."
            className={`${field} py-3.5 pl-11 pr-4`}
          />
        </div>
        <Select
          wrapperClassName="lg:w-[190px]"
          variant="toolbar"
          value={filter}
          onChange={setFilter}
          ariaLabel="Filter sales"
          menuMinWidth={190}
          options={[
            { value: "all", label: "All sales" },
            { value: "confirmed", label: "Confirmed" },
            { value: "cancelled", label: "Cancelled" },
          ]}
        />
        <p className="text-sm text-ink/60">
          Showing {shown.length} of {sales.length}
        </p>
        <button onClick={() => setOpen(true)} className={`${btnPrimary} !rounded-2xl !px-5 !py-3 lg:ml-auto`}>
          <Plus className="h-4 w-4" />
          Record a sale
        </button>
      </div>

      {error && <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">{error}</p>}

      <div className="overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5">
        {shown.length === 0 ? (
          <div className="flex flex-col items-center px-6 py-12 text-center">
            <ClipboardArt className="h-28 w-32" />
            <p className="mt-2 text-sm font-semibold text-ink/65">
              {sales.length === 0 ? "No sales yet. Record the first one." : "No sale matches your search."}
            </p>
          </div>
        ) : (
          <>
            {/* Phones: a card per sale */}
            <ul className="divide-y divide-black/5 md:hidden">
              {shown.map((s) => (
                <li key={s.id} className={`px-5 py-4 ${s.status === "cancelled" ? "opacity-60" : ""}`}>
                  <div className="flex items-start gap-3.5">
                    <Avatar url={s.sellerAvatar} name={s.sellerName} />
                    <div className="min-w-0 flex-1 leading-tight">
                      <p className="truncate text-[15px] font-bold text-ink">{s.title}</p>
                      <a href={`/admin/partners/${s.sellerId}`} className="mt-1 block truncate text-[13px] text-ink/60">
                        {s.sellerName} · {s.sellerCode}
                      </a>
                      <p className="mt-0.5 text-xs text-ink/50">
                        {fmtDate(s.date)}
                        {s.customer && ` · Buyer: ${s.customer}`}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-extrabold tabular-nums text-copper-dark ring-1 ring-amber-200">
                      {fmtPoints(s.commission)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs text-ink/55">
                      <b className="text-ink">{fmtArea(s.area)}</b> sq. yd · <b className="text-ink">₹{fmtPoints(s.value)}</b>
                    </span>
                    {s.status === "cancelled" ? (
                      <StatusPill status={s.status} />
                    ) : (
                      <button
                        onClick={() => setCancelling(s)}
                        disabled={pending}
                        className="rounded-xl bg-white px-3.5 py-1.5 text-xs font-bold text-ink/70 shadow-sm ring-1 ring-black/10 transition hover:text-rose-700 hover:ring-rose-300"
                      >
                        Cancel sale
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            <table className="hidden w-full text-left md:table">
              <thead>
                <tr className="border-b border-black/5 bg-gradient-to-b from-white to-[#fcf6ee]">
                  <th className={`${th} pl-6`}>Property</th>
                  <th className={th}>Sold by</th>
                  <th className={`${th} text-right`}>Area &amp; value</th>
                  <th className={`${th} text-right`}>Commission</th>
                  <th className={`${th} pr-6 text-right`}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {shown.map((s) => (
                  <tr key={s.id} className={`transition hover:bg-[#fffaf3] ${s.status === "cancelled" ? "opacity-60" : ""}`}>
                    <td className="py-4 pl-6 pr-3">
                      <span className="block max-w-[260px] truncate text-[15px] font-bold text-ink" title={s.title}>
                        {s.title}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-[#faf1e6] px-2.5 py-0.5 text-[11px] font-semibold text-ink/65 ring-1 ring-black/5">
                          {fmtDate(s.date)}
                        </span>
                        {s.customer && <span className="text-xs text-ink/55">Buyer: {s.customer}</span>}
                      </span>
                      {s.note && <span className="mt-1 block max-w-[260px] truncate text-xs text-ink/45">{s.note}</span>}
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar url={s.sellerAvatar} name={s.sellerName} />
                        <span className="min-w-0 max-w-[200px] leading-tight">
                          <a
                            href={`/admin/partners/${s.sellerId}`}
                            className="block truncate text-[15px] font-bold text-ink transition hover:text-copper"
                            title="Open full profile"
                          >
                            {s.sellerName}
                          </a>
                          <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                            <span className="rounded-full bg-[#f6ecdf] px-2.5 py-0.5 font-mono text-[11px] font-semibold text-ink/75 ring-1 ring-copper/10">
                              {s.sellerCode || "—"}
                            </span>
                            <span className="rounded-full bg-copper/10 px-2.5 py-0.5 text-[11px] font-bold text-copper-dark ring-1 ring-copper/15">
                              {s.rate}% rate
                            </span>
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <span className="block text-sm font-bold tabular-nums text-ink">₹{fmtPoints(s.value)}</span>
                      <span className="mt-1 block text-xs tabular-nums text-ink/55">{fmtArea(s.area)} sq. yd</span>
                    </td>
                    <td className="px-3 py-4 text-right">
                      <span className="inline-block rounded-full bg-amber-50 px-3.5 py-1.5 text-base font-extrabold tabular-nums text-copper-dark ring-1 ring-amber-200">
                        {fmtPoints(s.commission)}
                      </span>
                    </td>
                    <td className="py-4 pl-3 pr-6 text-right">
                      {s.status === "cancelled" ? (
                        <StatusPill status={s.status} />
                      ) : (
                        <div className="flex flex-col items-end gap-1.5">
                          <StatusPill status={s.status} />
                          <button
                            onClick={() => setCancelling(s)}
                            disabled={pending}
                            className="text-xs font-medium text-copper underline underline-offset-2 transition hover:text-rose-700 disabled:opacity-50"
                          >
                            Cancel sale
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-black/10 bg-[#fcf6ee]">
                  <td className="py-4 pl-6 pr-3 text-xs font-bold uppercase tracking-[0.12em] text-ink/60" colSpan={2}>
                    Confirmed in this list
                  </td>
                  <td className="px-3 py-4 text-right">
                    <span className="block text-sm font-bold tabular-nums text-ink">₹{fmtPoints(shownTotals.value)}</span>
                    <span className="block text-xs tabular-nums text-ink/55">{fmtArea(shownTotals.area)} sq. yd</span>
                  </td>
                  <td className="px-3 py-4 text-right text-base font-extrabold tabular-nums text-copper-dark">
                    {fmtPoints(shownTotals.commission)}
                  </td>
                  <td className="pr-6" />
                </tr>
              </tfoot>
            </table>
          </>
        )}
      </div>

      {cancelling && (
        <ConfirmDialog
          tone="danger"
          icon={Ban}
          title="Cancel this sale?"
          text={
            <>
              <b className="text-ink">{cancelling.title}</b> sold by <b className="text-ink">{cancelling.sellerName}</b>{" "}
              will be cancelled and the <b className="text-ink">{fmtPoints(cancelling.commission)}</b> commission points
              given for it are taken back.
            </>
          }
          confirmText="Yes, cancel sale"
          cancelText="Keep it"
          busy={pending}
          onConfirm={confirmCancel}
          onCancel={() => setCancelling(null)}
        />
      )}

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
    </div>
  );
}

// "1 Sale details -> 2 Check commission" at the top of the pop-up.
function Steps({ step }) {
  const items = ["Sale details", "Check commission"];
  return (
    <ol className="mb-6 flex items-center gap-3">
      {items.map((label, i) => {
        const n = i + 1;
        const done = step > n;
        const now = step === n;
        return (
          <li key={label} className="flex flex-1 items-center gap-3 last:flex-none">
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                done
                  ? "bg-emerald-500 text-white"
                  : now
                    ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                    : "bg-black/5 text-ink/40"
              }`}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
            </span>
            <span className={`whitespace-nowrap text-sm font-bold ${now || done ? "text-ink" : "text-ink/40"}`}>{label}</span>
            {i < items.length - 1 && <span className={`h-0.5 flex-1 rounded-full ${done ? "bg-emerald-400" : "bg-black/10"}`} />}
          </li>
        );
      })}
    </ol>
  );
}

// A labelled input with an icon on the left and an optional suffix.
function Field({ id, label, icon: Icon, suffix, children }) {
  return (
    <div>
      <label className={labelCls} htmlFor={id}>
        {label}
      </label>
      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-copper">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        {children}
        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink/45">
            {suffix}
          </span>
        )}
      </div>
    </div>
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
  const perYard = Number(form.area) > 0 && Number(form.value) > 0 ? Math.round(Number(form.value) / Number(form.area)) : 0;

  return (
    <Modal
      title={preview ? "Check the commission" : "Record a sale"}
      subtitle={preview ? "Make sure everything looks right before saving." : "A confirmed sale gives commission to the seller and their team."}
      icon={preview ? BadgeCheck : ShoppingBag}
      onClose={onClose}
    >
      <Steps step={preview ? 2 : 1} />

      {preview ? (
        <div className="space-y-6">
          <div className="flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <Avatar url={seller?.avatarUrl} name={seller?.name} className="h-14 w-14 text-lg" />
            <div className="min-w-0 flex-1 leading-tight">
              <p className="truncate text-base font-bold text-ink">{form.title}</p>
              <p className="mt-1 text-sm text-ink/60">
                Sold by <b className="text-ink">{seller?.name}</b> · {fmtArea(form.area)} sq. yards
              </p>
            </div>
            <div className="shrink-0 text-right leading-tight">
              <p className="text-xs text-ink/55">Sale value</p>
              <p className="mt-1 text-xl font-extrabold tabular-nums text-copper">₹{fmtPoints(form.value)}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-gradient-to-b from-white to-[#fcf6ee] text-[11px] font-semibold uppercase tracking-wider text-ink/55">
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
              <tfoot className="bg-[#fcf6ee]">
                <tr>
                  <td colSpan={3} className="px-4 py-3 text-sm font-semibold text-ink">Total points given</td>
                  <td className="px-4 py-3 text-right text-base font-extrabold tabular-nums text-copper-dark">{fmtPoints(preview.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="rounded-xl bg-[#fbf7f0] px-3.5 py-3 text-xs text-ink/55 ring-1 ring-black/5">
            1 point = ₹1. The area is added to the seller and everyone above them, and their ranks update right away.
            You can cancel a sale later; its commission is then taken back.
          </p>
          {error && <p className="text-sm font-medium text-rose-700">{error}</p>}

          <div className="flex justify-between gap-3">
            <button type="button" onClick={() => setPreview(null)} className={btnGhost}>
              <ArrowLeft className="h-4 w-4" />
              Edit
            </button>
            <button type="button" onClick={confirm} disabled={pending} className={btnPrimary}>
              {pending ? "Saving..." : "Confirm and record sale"}
              {!pending && <Check className="h-4 w-4" strokeWidth={3} />}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={check} className="space-y-5">
          {/* Who sold it */}
          <div>
            <label className={labelCls} htmlFor="sale-seller">Sold by (active partner)</label>
            <Select
              id="sale-seller"
              required
              searchable
              icon={UserRound}
              value={form.sellerId}
              onChange={(v) => {
                setForm((f) => ({ ...f, sellerId: v }));
                setPreview(null);
              }}
              placeholder="Choose a partner"
              options={sellers.map((s) => ({ value: s.id, label: s.name, hint: s.code, avatar: true, avatarUrl: s.avatarUrl }))}
            />

            {seller && (
              <div className="mt-3 flex items-center gap-3.5 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-copper/20">
                <Avatar url={seller.avatarUrl} name={seller.name} className="h-11 w-11 text-sm" />
                <div className="min-w-0 flex-1 leading-tight">
                  <p className="truncate text-sm font-bold text-ink">{seller.name}</p>
                  <p className="mt-1 text-xs text-ink/55">Gets the commission, and so does everyone above them</p>
                </div>
                {seller.code && (
                  <span className="shrink-0 rounded-full bg-[#f6ecdf] px-2.5 py-1 font-mono text-[11px] font-semibold text-ink/75 ring-1 ring-copper/10">
                    {seller.code}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelCls} htmlFor="sale-title">Property</label>
              <Suggest
                id="sale-title"
                required
                icon={Building2}
                options={propertyTitles}
                value={form.title}
                onChange={(t) => {
                  setForm((f) => ({ ...f, title: t }));
                  setPreview(null);
                }}
                maxLength={200}
                placeholder="Plot 12, Residential Plots"
                className={`${inputCls} pl-11`}
              />
            </div>
            <Field id="sale-customer" label="Buyer name (optional)" icon={UserRound}>
              <input id="sale-customer" value={form.customer} onChange={set("customer")} maxLength={150} placeholder="Who bought it" className={`${inputCls} pl-11`} />
            </Field>
          </div>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field id="sale-area" label="Area (sq. yards)" icon={Ruler} suffix="sq. yd">
              <input id="sale-area" required type="number" min="0.01" step="0.01" value={form.area} onChange={set("area")} placeholder="100" className={`${inputCls} pl-11 pr-16`} />
            </Field>
            <Field id="sale-value" label="Sale value" icon={IndianRupee}>
              <input id="sale-value" required type="number" min="1" step="1" value={form.value} onChange={set("value")} placeholder="1000000" className={`${inputCls} pl-11`} />
            </Field>
            <div>
              <label className={labelCls} htmlFor="sale-date">Sale date</label>
              <DatePicker
                id="sale-date"
                required
                value={form.date}
                onChange={(date) => {
                  setForm((f) => ({ ...f, date }));
                  setPreview(null);
                }}
                className={`${inputCls} pl-11 pr-11`}
              />
            </div>
          </div>

          {perYard > 0 && (
            <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-2.5 text-sm text-emerald-900 ring-1 ring-emerald-200">
              <Ruler className="h-4 w-4 shrink-0 text-emerald-600" />
              That is about <b>₹{fmtPoints(perYard)}</b> per sq. yard.
            </p>
          )}

          <Field id="sale-note" label="Note (optional)" icon={StickyNote}>
            <input id="sale-note" value={form.note} onChange={set("note")} maxLength={300} placeholder="Registry number, remarks..." className={`${inputCls} pl-11`} />
          </Field>

          {error && (
            <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">{error}</p>
          )}

          <div className="flex items-center justify-between gap-3 border-t border-black/5 pt-5">
            <p className="hidden text-xs text-ink/50 sm:block">Nothing is saved until you confirm on the next step.</p>
            <div className="ml-auto flex gap-3">
              <button type="button" onClick={onClose} className={btnGhost}>Cancel</button>
              <button type="submit" disabled={pending} className={btnPrimary}>
                {pending ? "Working it out..." : "Check commission"}
                {!pending && <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </form>
      )}
    </Modal>
  );
}
