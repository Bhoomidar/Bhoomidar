"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Coins,
  Copy,
  Crown,
  Eye,
  Filter,
  Layers,
  LayoutList,
  LocateFixed,
  MapPin,
  Maximize2,
  Minimize2,
  Minus,
  MoreHorizontal,
  Network,
  Package,
  Plus,
  Power,
  RotateCcw,
  Ruler,
  Scan,
  Search,
  Trophy,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { rankTiers } from "@/lib/data";
import { fmtArea, fmtPoints } from "@/lib/points";
import { BarsArt, CoinsArt, OrgChartArt, PeopleArt } from "@/components/dashboard/StatArt";
import Select from "@/components/Select";

const STATUS = {
  active: { text: "Active", chip: "bg-emerald-100 text-emerald-800", ring: "ring-emerald-400/70", dot: "bg-emerald-500" },
  unpaid: { text: "Unpaid", chip: "bg-amber-100 text-amber-800", ring: "ring-amber-400/70", dot: "bg-amber-400" },
  off: { text: "Off", chip: "bg-rose-100 text-rose-700", ring: "ring-rose-300", dot: "bg-rose-400" },
};

// A different soft colour for each level, so the depth reads at a glance.
const LEVEL_TONES = [
  "bg-copper/10 text-copper-dark",
  "bg-sky-100 text-sky-800",
  "bg-violet-100 text-violet-800",
  "bg-teal-100 text-teal-800",
];

const PAGE = 10;

const initialsOf = (name) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "?";

// Who is under whom, and how many people are below each partner.
function buildTree(nodes, rootId) {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const children = new Map();
  const roots = [];
  for (const n of nodes) {
    if (n.parentId === rootId) {
      roots.push(n.id);
    } else if (byId.has(n.parentId)) {
      if (!children.has(n.parentId)) children.set(n.parentId, []);
      children.get(n.parentId).push(n.id);
    }
  }
  const total = new Map();
  const walk = (id) => {
    let count = 0;
    for (const k of children.get(id) ?? []) count += 1 + walk(k);
    total.set(id, count);
    return count;
  };
  roots.forEach(walk);
  return { byId, children, roots, total };
}

function Avatar({ p, size = "h-14 w-14", text = "text-base" }) {
  const status = STATUS[p.status] ?? STATUS.active;
  return (
    <span className="relative shrink-0">
      <span
        className={`flex ${size} items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark ${text} font-bold text-white shadow-md ring-[3px] ring-offset-2 ring-offset-white ${status.ring}`}
      >
        {p.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.avatar} alt="" className="h-full w-full object-cover" />
        ) : (
          initialsOf(p.name)
        )}
      </span>
      <span className={`absolute bottom-[5%] right-[5%] aspect-square h-[18%] min-h-3.5 rounded-full ring-2 ring-white ${status.dot}`} />
    </span>
  );
}

function RankChip({ p, dark = true }) {
  if (!p.rankTitle) return null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${
        dark ? "bg-night text-copper-light" : "bg-copper/10 text-copper-dark"
      }`}
    >
      <span className={`h-2 w-2 rounded-full bg-gradient-to-br ${rankTiers[(p.rankNo ?? 1) - 1] ?? rankTiers[0]}`} />
      {p.rankTitle}
    </span>
  );
}

function StatusPill({ status }) {
  const s = STATUS[status] ?? STATUS.active;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1 text-xs font-bold ring-1 ring-black/5 ${s.chip}`}>
      {status === "active" && <Check className="h-3 w-3" strokeWidth={3} />}
      {status === "unpaid" && <Clock className="h-3 w-3" />}
      {status === "off" && <Power className="h-3 w-3" />}
      {s.text}
    </span>
  );
}

/* ────────────────────────────── details popup ────────────────────────────── */

// One tile of the popup: icon, small label, bold value, and a faded picture or an arrow.
function Tile({ icon: Icon, label, value, side, onClick }) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={`flex w-full items-center gap-4 rounded-2xl bg-gradient-to-br from-white to-[#fdf6ec] p-4 text-left ring-1 ring-copper/10 ${
        onClick ? "transition hover:-translate-y-0.5 hover:shadow-lg hover:ring-copper/30" : ""
      }`}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-copper/10 text-copper">
        <Icon className="h-5 w-5" />
      </span>
      <span className="min-w-0 flex-1 leading-tight">
        <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/50">{label}</span>
        <span className="mt-1 block [overflow-wrap:anywhere] text-lg font-bold text-ink">{value}</span>
      </span>
      {side}
    </Tag>
  );
}

function Details({ p, tree, onClose, onFull }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const direct = tree.children.get(p.id)?.length ?? 0;
  const team = tree.total.get(p.id) ?? 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm sm:items-center">
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className="relative my-6 w-full max-w-3xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* the top: who, with a soft house */}
        <div className="relative overflow-hidden bg-gradient-to-r from-[#fff3e4] via-[#fff7ec] to-[#fbeedd] px-6 py-6 sm:px-8">
          <div
            className="pointer-events-none absolute right-0 top-0 hidden h-full w-[56%] sm:block"
            style={{
              maskImage: "linear-gradient(to right, transparent, rgba(0,0,0,0.5) 30%, #000 75%)",
              WebkitMaskImage: "linear-gradient(to right, transparent, rgba(0,0,0,0.5) 30%, #000 75%)",
            }}
            aria-hidden
          >
            <Image
              src="/images/villa.png"
              alt=""
              fill
              sizes="360px"
              className="object-cover"
              style={{ objectPosition: "60% 40%", filter: "saturate(0.72) sepia(0.18) brightness(1.1) contrast(0.92)" }}
            />
            <div className="absolute inset-0 bg-[#fff3e3]/30" />
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink/80 shadow-lg shadow-black/10 ring-1 ring-black/5 transition hover:text-copper"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="relative flex items-center gap-5 sm:gap-6">
            <Avatar p={p} size="h-24 w-24 sm:h-28 sm:w-28" text="text-3xl" />
            <div className="min-w-0 leading-tight">
              <h3 className="[overflow-wrap:anywhere] font-display text-3xl font-bold text-ink">{p.name}</h3>
              <p className="mt-1.5 font-mono text-base font-semibold text-copper-dark">{p.code}</p>
              <p className="mt-3 flex flex-wrap items-center gap-2.5">
                <StatusPill status={p.status} />
                <span className="rounded-full bg-white/80 px-4 py-1 text-sm font-semibold text-ink/70 shadow-sm ring-1 ring-black/5">
                  Level {p.level}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3 p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Tile icon={Crown} label="Rank" value={p.rankTitle || "Sales Partner"} />
            <Tile
              icon={Package}
              label="Sold by them"
              value={`${fmtArea(p.soldArea ?? 0)} sq. yd`}
              side={<BarsArt className="h-10 w-12 shrink-0 text-copper" />}
            />
            <Tile
              icon={Coins}
              label="Points you earned"
              value={fmtPoints(p.earned ?? 0)}
              side={<Trophy className="h-8 w-8 shrink-0 text-copper/40" strokeWidth={1.4} />}
            />
            <Tile
              icon={Users}
              label="Their team"
              value={`${direct} direct · ${team} in all`}
              onClick={() => onFull(p.id)}
              side={<ChevronRight className="h-5 w-5 shrink-0 text-ink/40" />}
            />
          </div>

          <div className="grid grid-cols-1 overflow-hidden rounded-2xl bg-gradient-to-br from-white to-[#fdf6ec] ring-1 ring-copper/10 sm:grid-cols-2 sm:divide-x sm:divide-black/5">
            <div className="relative flex items-center gap-4 overflow-hidden p-4 pr-16">
              <MapPin className="pointer-events-none absolute bottom-2 right-3 h-12 w-12 text-copper/15" strokeWidth={1.3} />
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-copper/10 text-copper">
                <MapPin className="h-5 w-5" />
              </span>
              <span className="relative min-w-0 leading-tight">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/50">Location</span>
                <span className="mt-1 block text-base font-bold text-ink">{p.place || "Not added"}</span>
              </span>
            </div>
            <div className="relative flex items-center gap-4 overflow-hidden p-4 pr-16">
              <CalendarDays className="pointer-events-none absolute bottom-2 right-3 h-12 w-12 text-copper/15" strokeWidth={1.3} />
              <span className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-copper/10 text-copper">
                <CalendarDays className="h-5 w-5" />
              </span>
              <span className="relative min-w-0 leading-tight">
                <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-ink/50">Joined on</span>
                <span className="mt-1 block text-base font-bold text-ink">{p.joined}</span>
                {p.activatedOn && <span className="mt-0.5 block text-xs text-emerald-700">Active since {p.activatedOn}</span>}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onFull(p.id)}
            className="group mx-auto flex w-fit items-center justify-center gap-3 rounded-2xl bg-gradient-to-b from-copper-light to-copper-dark px-8 py-3.5 text-base font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
          >
            <Users className="h-5 w-5" />
            View full details
            <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── "People you referred" table ───────────────────────── */

// The partner's direct referrals as a table, with a status filter.
// `children` is shown at the bottom of the card.
export function ReferralsTable({ nodes, rootId, children }) {
  const direct = useMemo(() => nodes.filter((n) => n.level === 1), [nodes]);
  const tree = useMemo(() => buildTree(nodes, rootId), [nodes, rootId]);
  const [filter, setFilter] = useState("all");
  const [shown, setShown] = useState(PAGE);
  const [menu, setMenu] = useState(null);
  const [copied, setCopied] = useState("");
  const [detailsId, setDetailsId] = useState(null);

  const counts = {
    all: direct.length,
    active: direct.filter((n) => n.status === "active").length,
    unpaid: direct.filter((n) => n.status === "unpaid").length,
  };
  const rows = direct.filter((n) => filter === "all" || n.status === filter);

  // The "..." menu floats above the page (position: fixed), so the table's own
  // scroll box can never cut it off. It closes on an outside click, Escape, or scroll.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onDown = (e) => !e.target.closest?.("[data-row-menu]") && close();
    const onKey = (e) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [menu]);

  const openMenu = (e, id) => {
    if (menu?.id === id) return setMenu(null);
    const r = e.currentTarget.getBoundingClientRect();
    const below = window.innerHeight - r.bottom > 130;
    setMenu({
      id,
      right: Math.max(8, window.innerWidth - r.right),
      ...(below ? { top: r.bottom + 8 } : { bottom: window.innerHeight - r.top + 8 }),
    });
  };

  const copyId = async (p) => {
    try {
      await navigator.clipboard.writeText(p.code);
      setCopied(p.id);
      setTimeout(() => setCopied(""), 1600);
    } catch {
      // Clipboard can be blocked; the ID stays visible to copy by hand.
    }
    setMenu(null);
  };

  const detailsNode = detailsId ? tree.byId.get(detailsId) : null;

  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-copper/10 text-copper ring-1 ring-copper/15">
            <Users className="h-5 w-5" />
          </span>
          <div className="min-w-0 leading-tight">
            <h2 className="text-lg font-bold text-ink sm:text-xl">People you referred</h2>
            <p className="mt-1 text-sm text-ink/55">Track all the people who joined using your code.</p>
          </div>
        </div>

        <Select
          wrapperClassName="w-full sm:w-auto sm:shrink-0"
          variant="pill"
          value={filter}
          onChange={(v) => {
            setFilter(v);
            setShown(PAGE);
          }}
          ariaLabel="Filter by status"
          menuMinWidth={180}
          options={[
            { value: "all", label: `All (${counts.all})` },
            { value: "active", label: `Active (${counts.active})` },
            { value: "unpaid", label: `Unpaid (${counts.unpaid})` },
          ]}
        />
      </div>

      {direct.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-3xl border-2 border-dashed border-copper/25 bg-[#fbf7f0]/60 px-6 py-12 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-copper/10 text-copper ring-8 ring-copper/5">
            <Users className="h-9 w-9" strokeWidth={1.6} />
          </span>
          <p className="mt-5 font-display text-2xl font-bold text-ink">Nobody has joined yet</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
            Share your referral link above. Every partner who joins with your code shows up here.
          </p>
        </div>
      ) : rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink/55">No one matches this filter.</p>
      ) : (
        <div className="mt-5">
          <ul className="space-y-3 md:hidden">
            {rows.slice(0, shown).map((p) => (
              <li key={p.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/10">
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white shadow-sm">
                    {p.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                      initialsOf(p.name)
                    )}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block [overflow-wrap:anywhere] text-[15px] font-bold text-ink">{p.name}</span>
                    {p.rankTitle && <span className="mt-1 block [overflow-wrap:anywhere] text-xs text-ink/50">{p.rankTitle}</span>}
                  </span>
                  <StatusPill status={p.status} />
                </div>

                <dl className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-[#fbf7f0] px-3.5 py-2.5">
                  <div className="min-w-0">
                    <dt className="text-[11px] text-ink/50">Partner ID</dt>
                    <dd className="mt-0.5 font-mono text-[13px] text-ink/80 [overflow-wrap:anywhere]">{p.code}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className="text-[11px] text-ink/50">Joined on</dt>
                    <dd className="mt-0.5 text-[13px] text-ink/80">{p.joined}</dd>
                  </div>
                </dl>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDetailsId(p.id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-[13px] font-semibold text-ink/80 shadow-sm ring-1 ring-black/10 transition hover:text-copper hover:ring-copper"
                  >
                    <Eye className="h-4 w-4 text-copper" />
                    View details
                  </button>
                  <button
                    type="button"
                    data-row-menu
                    onClick={(e) => openMenu(e, p.id)}
                    aria-label="More actions"
                    aria-expanded={menu?.id === p.id}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-ink/70 shadow-sm ring-1 ring-black/10 transition hover:text-copper hover:ring-copper"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                  {copied === p.id && <span className="text-xs font-semibold text-emerald-600">Copied</span>}
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-2xl ring-1 ring-black/5 md:block">
            <table className="w-full min-w-[780px] text-left text-sm">
              <thead className="bg-[#f6f0e7] text-xs font-semibold text-ink/60">
                <tr>
                  <th className="px-5 py-3.5">#</th>
                  <th className="px-4 py-3.5">Name</th>
                  <th className="px-4 py-3.5">Partner ID</th>
                  <th className="px-4 py-3.5">Joined on</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 bg-white">
                {rows.slice(0, shown).map((p, i) => (
                  <tr key={p.id} className="transition hover:bg-[#fdf7ef]">
                    <td className="px-5 py-4 text-ink/60">{i + 1}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-3">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white shadow-sm">
                          {p.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={p.avatar} alt="" className="h-full w-full object-cover" />
                          ) : (
                            initialsOf(p.name)
                          )}
                        </span>
                        <span className="min-w-0 leading-tight">
                          <span className="block [overflow-wrap:anywhere] font-bold text-ink">{p.name}</span>
                          {p.rankTitle && <span className="mt-0.5 block [overflow-wrap:anywhere] text-[11px] text-ink/45">{p.rankTitle}</span>}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-[13px] text-ink/75">{p.code}</td>
                    <td className="whitespace-nowrap px-4 py-4 text-ink/70">{p.joined}</td>
                    <td className="px-4 py-4">
                      <StatusPill status={p.status} />
                    </td>
                    <td className="px-5 py-3">
                      <span className="relative flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setDetailsId(p.id)}
                          className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-[13px] font-semibold text-ink/80 shadow-sm ring-1 ring-black/10 transition hover:text-copper hover:ring-copper"
                        >
                          <Eye className="h-4 w-4 text-copper" />
                          View details
                        </button>
                        <button
                          type="button"
                          data-row-menu
                          onClick={(e) => openMenu(e, p.id)}
                          aria-label="More actions"
                          aria-expanded={menu?.id === p.id}
                          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-ink/70 shadow-sm ring-1 ring-black/10 transition hover:text-copper hover:ring-copper"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>

                        {copied === p.id && <span className="text-xs font-semibold text-emerald-600">Copied</span>}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows.length > shown && (
            <button
              type="button"
              onClick={() => setShown((n) => n + PAGE)}
              className="mx-auto mt-4 block rounded-xl border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-ink/75 transition hover:border-copper hover:text-copper"
            >
              Show more ({rows.length - shown} left)
            </button>
          )}
        </div>
      )}

      {children}

      {menu && tree.byId.get(menu.id) && (
        <div
          data-row-menu
          style={{ position: "fixed", top: menu.top, bottom: menu.bottom, right: menu.right }}
          className="z-[60] w-52 overflow-hidden rounded-xl bg-white p-1.5 shadow-[0_20px_40px_-12px_rgba(60,30,10,0.4)] ring-1 ring-black/10"
        >
          <button
            type="button"
            onClick={() => copyId(tree.byId.get(menu.id))}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink/80 transition hover:bg-copper/10 hover:text-copper"
          >
            <Copy className="h-4 w-4" />
            Copy partner ID
          </button>
          <button
            type="button"
            onClick={() => {
              setDetailsId(menu.id);
              setMenu(null);
            }}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink/80 transition hover:bg-copper/10 hover:text-copper"
          >
            <Users className="h-4 w-4" />
            Their team ({tree.total.get(menu.id) ?? 0})
          </button>
        </div>
      )}

      {detailsNode && (
        <Details
          p={detailsNode}
          tree={tree}
          onClose={() => setDetailsId(null)}
          onFull={(id) => {
            setDetailsId(null);
            window.dispatchEvent(new CustomEvent("team:focus", { detail: id }));
          }}
        />
      )}
    </section>
  );
}

/* ─────────────────────────────── list view ─────────────────────────────── */

function ListNode({ id, tree, open, toggle, forceOpen, visible, nested }) {
  const p = tree.byId.get(id);
  const kids = (tree.children.get(id) ?? []).filter((k) => !visible || visible.has(k));
  const isOpen = forceOpen || open.has(id);
  const direct = tree.children.get(id)?.length ?? 0;
  const team = tree.total.get(id) ?? 0;

  return (
    <li
      className={
        nested
          ? "relative before:absolute before:-left-5 before:top-9 before:h-0.5 before:w-5 before:bg-copper/20"
          : "relative"
      }
    >
      <div className="group flex items-start gap-3 rounded-2xl bg-white p-3.5 shadow-[0_10px_24px_-18px_rgba(110,60,20,0.5)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_34px_-18px_rgba(110,60,20,0.55)] hover:ring-copper/30 sm:items-center sm:p-4">
        {kids.length > 0 ? (
          <button
            type="button"
            onClick={() => toggle(id)}
            aria-label={isOpen ? "Hide team" : "Show team"}
            aria-expanded={isOpen}
            className={`mt-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ring-1 transition sm:mt-0 ${
              isOpen
                ? "bg-copper text-white ring-copper"
                : "bg-[#fbf7f0] text-copper ring-black/5 hover:bg-copper hover:text-white"
            }`}
          >
            <ChevronRight className={`h-4 w-4 transition duration-300 ${isOpen ? "rotate-90" : ""}`} />
          </button>
        ) : (
          <span className="w-1 shrink-0 sm:w-2" />
        )}

        <Avatar p={p} />

        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-ink">{p.name}</span>
            <span className="rounded-full bg-copper/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-copper-dark">
              {p.code}
            </span>
          </p>
          <p className="mt-1.5 flex flex-wrap items-center gap-2">
            <StatusPill status={p.status} />
            <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${LEVEL_TONES[(p.level - 1) % LEVEL_TONES.length]}`}>
              Level {p.level}
            </span>
            <RankChip p={p} />
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink/55">
            {p.place && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {p.place}
              </span>
            )}
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5" />
              Joined {p.joined}
            </span>
            {p.soldArea > 0 && (
              <span className="inline-flex items-center gap-1 font-semibold text-ink/70">
                <Ruler className="h-3.5 w-3.5" />
                Sold {fmtArea(p.soldArea)} sq. yd
              </span>
            )}
            {p.earned !== 0 && (
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-700">
                <Coins className="h-3.5 w-3.5" />
                You earned {fmtPoints(p.earned)} pts
              </span>
            )}
          </p>
        </div>

        <div className="hidden shrink-0 gap-2 sm:flex">
          {[
            ["Direct", direct],
            ["Team", team],
          ].map(([label, value]) => (
            <span key={label} className="min-w-[64px] rounded-xl bg-[#fbf7f0] px-3 py-2 text-center leading-tight ring-1 ring-black/5">
              <b className="block text-xl font-extrabold tabular-nums text-ink">{value}</b>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-ink/50">{label}</span>
            </span>
          ))}
        </div>
      </div>

      {isOpen && kids.length > 0 && (
        <ul className="relative ml-7 mt-2 space-y-2 border-l-2 border-copper/20 pl-5 sm:ml-10">
          {kids.map((k) => (
            <ListNode key={k} id={k} tree={tree} open={open} toggle={toggle} forceOpen={forceOpen} visible={visible} nested />
          ))}
        </ul>
      )}
    </li>
  );
}

/* ─────────────────────────────── tree view ─────────────────────────────── */

// The Team / Sales strip inside a card.
function CardStats({ team, sold, light = false }) {
  return (
    <div
      className={`mt-3 grid grid-cols-2 divide-x rounded-xl py-2 ${
        light ? "divide-black/10 bg-white text-ink shadow-md" : "divide-black/10 bg-[#fbf7f0] text-ink ring-1 ring-black/5"
      }`}
    >
      <span className="flex items-center justify-center gap-2 px-1">
        <Users className="h-4 w-4 text-copper" />
        <span className="text-left leading-tight">
          <b className="block text-sm font-extrabold tabular-nums">{team}</b>
          <span className="block text-[10px] text-ink/55">{light ? "Total Team" : "Team"}</span>
        </span>
      </span>
      <span className="flex items-center justify-center gap-2 px-1">
        <Ruler className="h-4 w-4 text-copper" />
        <span className="text-left leading-tight">
          <b className="block text-sm font-extrabold tabular-nums">{fmtArea(sold)}</b>
          <span className="block text-[10px] text-ink/55">{light ? "Sq. yd sold" : "Sales"}</span>
        </span>
      </span>
    </div>
  );
}

// The round "-" / "+" button under a card that opens or closes the people below it.
function OpenButton({ isOpen, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? "Hide team" : "Show team"}
      aria-expanded={isOpen}
      className={`absolute -bottom-4 left-1/2 z-10 flex h-8 w-8 -translate-x-1/2 items-center justify-center rounded-full bg-white text-copper shadow-lg ring-1 ring-copper/40 transition hover:bg-copper hover:text-white ${
        disabled ? "cursor-default" : ""
      }`}
    >
      {isOpen ? <Minus className="h-4 w-4" strokeWidth={2.5} /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
    </button>
  );
}

function OrgNode({ id, tree, open, toggle, forceOpen, visible, onDetails }) {
  const p = tree.byId.get(id);
  const kids = (tree.children.get(id) ?? []).filter((k) => !visible || visible.has(k));
  const isOpen = forceOpen || open.has(id);
  const team = tree.total.get(id) ?? 0;
  const canToggle = kids.length > 0 && !forceOpen;

  return (
    <li>
      <div className="group relative w-[196px] rounded-2xl bg-white px-3 pb-4 pt-4 text-center shadow-[0_16px_34px_-18px_rgba(110,60,20,0.55)] ring-1 ring-copper/20 transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_44px_-18px_rgba(110,60,20,0.6)] hover:ring-copper/40">
        <button
          type="button"
          onClick={() => onDetails(id)}
          aria-label={`See details of ${p.name}`}
          className="block w-full text-center"
        >
          <span className="flex justify-center">
            <Avatar p={p} size="h-14 w-14" />
          </span>
          <span className="mt-3 block [overflow-wrap:anywhere] text-sm font-bold text-ink" title={p.name}>
            {p.name}
          </span>
          <span className="mt-0.5 block font-mono text-[11px] font-semibold text-copper-dark/80">{p.code}</span>

          <span className="mt-2.5 flex flex-wrap justify-center gap-1.5">
            <StatusPill status={p.status} />
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${LEVEL_TONES[(p.level - 1) % LEVEL_TONES.length]}`}>
              L{p.level}
            </span>
          </span>
          {p.rankTitle && (
            <span className="mt-2.5 flex justify-center">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-night px-3 py-1 text-[11px] font-semibold text-copper-light">
                <UserRound className="h-3 w-3" />
                {p.rankTitle}
              </span>
            </span>
          )}
        </button>

        <CardStats team={team} sold={p.soldArea ?? 0} />

        {kids.length > 0 && <OpenButton isOpen={isOpen} onClick={() => canToggle && toggle(id)} disabled={!canToggle} />}
      </div>

      {isOpen && kids.length > 0 && (
        <ul>
          {kids.map((k) => (
            <OrgNode key={k} id={k} tree={tree} open={open} toggle={toggle} forceOpen={forceOpen} visible={visible} onDetails={onDetails} />
          ))}
        </ul>
      )}
    </li>
  );
}

function YouCard({ me, teamSize, isOpen, onToggle, hasKids }) {
  return (
    <div className="relative w-[250px] rounded-2xl bg-gradient-to-br from-copper-light via-copper to-copper-dark px-4 pb-6 pt-5 text-center text-white shadow-[0_26px_50px_-18px_rgba(140,72,33,0.75)] ring-1 ring-white/20">
      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
        <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-white/25 blur-2xl" />
        <div className="absolute inset-0 opacity-[0.12]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "14px 14px" }} />
      </div>
      <span className="absolute -right-2.5 -top-2.5 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-b from-[#f9d56a] to-[#e0a21f] text-white shadow-md ring-2 ring-white">
        <Crown className="h-3.5 w-3.5" />
      </span>

      <div className="relative flex justify-center">
        <span className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-white/20 text-2xl font-bold ring-[3px] ring-white/70">
          {me.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={me.avatar} alt="" className="h-full w-full object-cover" />
          ) : (
            initialsOf(me.name)
          )}
        </span>
      </div>
      <p className="relative mt-3 [overflow-wrap:anywhere] text-lg font-bold">{me.name} (You)</p>
      <p className="relative mt-0.5 font-mono text-xs font-semibold text-white/80">{me.code}</p>
      {me.rankTitle && (
        <p className="relative mt-2.5 inline-flex rounded-full bg-black/30 px-3.5 py-1 text-xs font-semibold">{me.rankTitle}</p>
      )}
      <p className="relative mt-2 text-xs text-white/85">{teamSize} in your team</p>

      <div className="relative">
        <CardStats team={teamSize} sold={me.sold ?? 0} light />
      </div>

      {hasKids && <OpenButton isOpen={isOpen} onClick={onToggle} />}
    </div>
  );
}

// The colours of the status dots, explained.
function Legend() {
  return (
    <ul className="space-y-2 rounded-2xl bg-white/90 px-4 py-3.5 text-[13px] text-ink/75 shadow-md ring-1 ring-black/5 backdrop-blur-sm">
      {[
        ["bg-copper", "You (Current User)"],
        ["bg-emerald-500", "Active Partner"],
        ["bg-amber-400", "Unpaid Partner"],
        ["bg-stone-400", "Inactive Partner"],
      ].map(([dot, label]) => (
        <li key={label} className="flex items-center gap-2.5">
          <span className={`h-3 w-3 rounded-full ${dot}`} />
          {label}
        </li>
      ))}
    </ul>
  );
}

// A small picture of the whole team: you on top, then a row of dots per level.
function MiniMap({ nodes, full, onToggleFull }) {
  const levels = [];
  for (const n of nodes) {
    (levels[n.level - 1] ??= []).push(n);
  }
  const dot = { active: "bg-emerald-500", unpaid: "bg-amber-400", off: "bg-stone-400" };

  return (
    <div className="relative w-[210px] rounded-2xl bg-white/90 p-3 shadow-md ring-1 ring-black/5 backdrop-blur-sm">
      <button
        type="button"
        onClick={onToggleFull}
        aria-label={full ? "Close the big view" : "Open the big view"}
        className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-lg bg-white text-ink/70 shadow-sm ring-1 ring-black/10 transition hover:text-copper"
      >
        {full ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
      </button>
      <div className="flex h-[96px] flex-col items-center justify-start gap-2.5 overflow-hidden rounded-xl bg-[#f3ece1] pt-3">
        <span className="h-4 w-4 rounded-md bg-copper shadow" />
        {levels.slice(0, 3).map((row, i) => (
          <span key={i} className="flex max-w-[160px] flex-wrap justify-center gap-1.5">
            {row.slice(0, 12).map((n) => (
              <span key={n.id} className={`h-3 w-3 rounded-full ring-2 ring-white ${dot[n.status] ?? dot.off}`} />
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}

// Two little birds, for the tree's backdrop.
function Birds({ className = "" }) {
  return (
    <svg viewBox="0 0 80 40" fill="none" aria-hidden className={className}>
      <g stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 12c4-5 8-5 11 0 3-5 7-5 11 0" />
        <path d="M44 26c3-4 6-4 8.5 0 2.5-4 5.5-4 8.5 0" />
        <path d="M60 8c2.5-3 5-3 7 0 2-3 4.5-3 7 0" />
      </g>
    </svg>
  );
}

/* ──────────────────────────────── "Your team" ──────────────────────────────── */

// The whole team as an org chart (tree view) or a list, with search, filters,
// zoom and a big view. Shows rank, sold area and what the partner earned.
export default function TeamTree({ nodes, rootId, me }) {
  const [view, setView] = useState("tree");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [soldOnly, setSoldOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [open, setOpen] = useState(() => new Set(nodes.filter((n) => n.level === 1).map((n) => n.id)));
  const [rootOpen, setRootOpen] = useState(true);
  const [detailsId, setDetailsId] = useState(null);
  const [focus, setFocus] = useState(null); // show only this member and the people below them
  const [scale, setScale] = useState(1);
  const [full, setFull] = useState(false);
  const canvas = useRef(null);
  const inner = useRef(null);
  const drag = useRef(null);

  const tree = useMemo(() => buildTree(nodes, rootId), [nodes, rootId]);

  // "View full details" anywhere on the page: scroll here and show that member's team.
  useEffect(() => {
    const onFocus = (e) => {
      setSearch("");
      setFilter("all");
      setLevelFilter("all");
      setSoldOnly(false);
      setFocus(e.detail);
      setRootOpen(true);
      setOpen((prev) => new Set(prev).add(e.detail));
      setTimeout(() => document.getElementById("your-team")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
    };
    window.addEventListener("team:focus", onFocus);
    return () => window.removeEventListener("team:focus", onFocus);
  }, []);

  // The big view: Escape closes it and the page behind does not scroll.
  useEffect(() => {
    if (!full) return;
    const onKey = (e) => e.key === "Escape" && setFull(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [full]);

  const counts = useMemo(
    () => ({
      all: nodes.length,
      active: nodes.filter((n) => n.status === "active").length,
      unpaid: nodes.filter((n) => n.status === "unpaid").length,
    }),
    [nodes],
  );

  const totals = useMemo(
    () => ({
      sold: nodes.reduce((t, n) => t + (n.soldArea ?? 0), 0),
      earned: nodes.reduce((t, n) => t + (n.earned ?? 0), 0),
      levels: nodes.reduce((m, n) => Math.max(m, n.level), 0),
    }),
    [nodes],
  );

  const perLevel = useMemo(
    () => Array.from({ length: totals.levels }, (_, i) => ({ level: i + 1, count: nodes.filter((n) => n.level === i + 1).length })),
    [nodes, totals.levels],
  );

  const extraFilters = (levelFilter !== "all" ? 1 : 0) + (soldOnly ? 1 : 0);

  // The matches and the people above them, so the tree still connects.
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term && filter === "all" && levelFilter === "all" && !soldOnly) return null;
    const keep = new Set();
    for (const n of nodes) {
      if (filter !== "all" && n.status !== filter) continue;
      if (levelFilter !== "all" && n.level !== Number(levelFilter)) continue;
      if (soldOnly && !(n.soldArea > 0)) continue;
      if (term && ![n.name, n.code, n.place].join(" ").toLowerCase().includes(term)) continue;
      for (let id = n.id; id && id !== rootId && !keep.has(id); id = tree.byId.get(id)?.parentId) {
        keep.add(id);
      }
    }
    return keep;
  }, [nodes, search, filter, levelFilter, soldOnly, rootId, tree]);

  const focusNode = focus ? tree.byId.get(focus) : null;
  const roots = focusNode ? [focus] : visible ? tree.roots.filter((r) => visible.has(r)) : tree.roots;

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  /* zoom and panning of the tree */
  const zoomBy = (delta) => setScale((s) => Math.min(1.5, Math.max(0.4, Math.round((s + delta) * 100) / 100)));
  const centre = () => {
    const el = canvas.current;
    if (el) el.scrollTo({ left: Math.max(0, (el.scrollWidth - el.clientWidth) / 2), top: 0, behavior: "smooth" });
  };
  const fit = () => {
    const el = canvas.current;
    const box = inner.current;
    if (!el || !box) return;
    const natural = box.scrollWidth / scale;
    setScale(Math.min(1, Math.max(0.4, Math.round((el.clientWidth / natural) * 100) / 100)));
    setTimeout(centre, 50);
  };
  const reset = () => {
    setScale(1);
    setTimeout(centre, 50);
  };

  // On a phone the tree opens fitted to the screen and centred on you, not scrolled to its left edge.
  useEffect(() => {
    if (view !== "tree") return;
    const el = canvas.current;
    const box = inner.current;
    if (!el || !box) return;
    if (el.clientWidth < 640 && box.scrollWidth > el.clientWidth) {
      setScale(Math.min(1, Math.max(0.4, Math.round((el.clientWidth / box.scrollWidth) * 100) / 100)));
    }
    const t = setTimeout(() => {
      el.scrollLeft = Math.max(0, (el.scrollWidth - el.clientWidth) / 2);
    }, 60);
    return () => clearTimeout(t);
    // only when the tree view opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);
  const onDown = (e) => {
    if (e.target.closest("button, a, input, select")) return;
    const el = canvas.current;
    drag.current = { x: e.clientX, y: e.clientY, left: el.scrollLeft, top: el.scrollTop };
    el.setPointerCapture?.(e.pointerId);
  };
  const onMove = (e) => {
    if (!drag.current) return;
    const el = canvas.current;
    el.scrollLeft = drag.current.left - (e.clientX - drag.current.x);
    el.scrollTop = drag.current.top - (e.clientY - drag.current.y);
  };
  const onUp = () => (drag.current = null);

  const summary = [
    { art: PeopleArt, label: "Team members", value: nodes.length, icon: Users, tone: "bg-copper/10 text-copper", artTone: "text-copper" },
    { art: OrgChartArt, label: "Levels deep", value: totals.levels, icon: Network, tone: "bg-sky-100 text-sky-600", artTone: "text-sky-500" },
    { art: BarsArt, label: "Sq. yards sold by team", value: fmtArea(totals.sold), icon: Ruler, tone: "bg-violet-100 text-violet-600", artTone: "text-violet-500" },
    { art: CoinsArt, label: "Points you earned from team", value: fmtPoints(totals.earned), icon: Coins, tone: "bg-emerald-100 text-emerald-600", artTone: "text-emerald-500" },
  ];

  const detailsNode = detailsId ? tree.byId.get(detailsId) : null;

  return (
    <section id="your-team" className="relative scroll-mt-24 overflow-hidden rounded-3xl bg-gradient-to-br from-white via-[#fffaf3] to-[#fbeedd] p-5 shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 sm:p-7">
      {/* a soft house in the corner */}
      <div
        className="pointer-events-none absolute right-0 top-0 hidden h-[150px] w-[44%] lg:block"
        style={{
          maskImage: "linear-gradient(to right, transparent, #000 50%), linear-gradient(to bottom, #000 45%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 50%), linear-gradient(to bottom, #000 45%, transparent)",
          maskComposite: "intersect",
          WebkitMaskComposite: "source-in",
        }}
        aria-hidden
      >
        <Image
          src="/images/villa.png"
          alt=""
          fill
          sizes="44vw"
          className="object-cover"
          style={{ objectPosition: "55% 40%", filter: "saturate(0.6) sepia(0.2) brightness(1.12) contrast(0.88)" }}
        />
        <div className="absolute inset-0 bg-[#fff3e3]/40" />
      </div>

      {/* heading */}
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <Network className="mt-2 hidden h-8 w-8 shrink-0 text-copper sm:block" strokeWidth={1.5} />
          <div>
            <h2 className="font-display text-3xl font-bold text-ink sm:text-[2.5rem] sm:leading-tight">
              Your <span className="text-copper-dark">team</span>
            </h2>
            <p className="mt-1 max-w-lg text-sm text-ink/60">
              Everyone under you. Open a partner to see the people they brought in.
            </p>
          </div>
        </div>

        {perLevel.length > 0 && (
          <ul className="relative z-10 hidden flex-wrap justify-end gap-2 sm:flex">
            {perLevel.slice(0, 3).map(({ level, count }) => (
              <li
                key={level}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink/80 shadow-md shadow-black/5 ring-1 ring-black/5"
              >
                <Layers className="h-4 w-4 text-copper" />
                Level {level}: {count}
              </li>
            ))}
          </ul>
        )}
      </div>

      {nodes.length === 0 ? (
        <div className="relative mt-6 flex flex-col items-center rounded-3xl border-2 border-dashed border-copper/25 bg-[#fbf7f0]/60 px-6 py-12 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-copper/10 text-copper ring-8 ring-copper/5">
            <Users className="h-9 w-9" strokeWidth={1.6} />
          </span>
          <p className="mt-5 font-display text-2xl font-bold text-ink">Your team is empty for now</p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-ink/60">
            Share your referral link above. Every partner who joins with your code shows up here,
            along with the people they bring in.
          </p>
        </div>
      ) : (
        <>
          {/* what the team adds up to */}
          <div className="relative mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {summary.map(({ art: Art, icon: Icon, label, value, tone, artTone }) => (
              <div key={label} className="relative z-10 flex min-w-0 flex-col items-start gap-3 overflow-hidden rounded-2xl bg-white p-4 shadow-[0_14px_30px_-22px_rgba(110,60,20,0.5)] ring-1 ring-black/5 sm:flex-row sm:items-center sm:gap-3.5 sm:pr-16">
                <Art className={`pointer-events-none absolute right-3 top-3 hidden h-11 w-14 sm:block ${artTone}`} />
                <span className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="relative min-w-0 leading-tight">
                  <b className="block text-3xl font-extrabold tabular-nums text-ink">{value}</b>
                  <span className="mt-1 block text-xs text-ink/55 sm:mt-0.5">{label}</span>
                </span>
              </div>
            ))}
          </div>

          {/* tools */}
          <div className="relative z-20 mt-5 flex flex-col gap-3 rounded-2xl bg-white/70 p-3 ring-1 ring-black/5 lg:flex-row lg:items-center">
            <div className="inline-flex shrink-0 rounded-xl bg-white p-1 shadow-sm ring-1 ring-black/10">
              {[
                ["tree", "Tree view", Network],
                ["list", "List view", LayoutList],
              ].map(([key, label, Icon]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setView(key)}
                  aria-pressed={view === key}
                  className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${
                    view === key
                      ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                      : "text-ink/65 hover:text-copper"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>

            <div className="relative lg:max-w-xs lg:flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-copper/70" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search name, code or city..."
                className="w-full rounded-xl border border-black/10 bg-white py-2.5 pl-10 pr-4 text-sm text-ink outline-none transition placeholder:text-ink/40 focus:border-copper focus:ring-4 focus:ring-copper/15"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {[
                ["all", "All", null],
                ["active", "Active", "bg-emerald-500"],
                ["unpaid", "Unpaid", "bg-amber-400"],
              ].map(([key, label, dot]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  aria-pressed={filter === key}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                    filter === key
                      ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                      : "bg-white text-ink/70 shadow-sm ring-1 ring-black/10 hover:ring-copper"
                  }`}
                >
                  {dot && <span className={`h-2 w-2 rounded-full ${dot}`} />}
                  {label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
                      filter === key ? "bg-white/25 text-white" : "bg-black/5 text-ink/60"
                    }`}
                  >
                    {counts[key]}
                  </span>
                </button>
              ))}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setFiltersOpen((v) => !v)}
                aria-expanded={filtersOpen}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink/80 shadow-sm ring-1 ring-black/10 transition hover:text-copper hover:ring-copper"
              >
                <Filter className="h-4 w-4" />
                More filters
                {extraFilters > 0 && (
                  <span className="rounded-full bg-copper px-1.5 py-0.5 text-[10px] font-bold text-white">{extraFilters}</span>
                )}
              </button>
              {filtersOpen && (
                <>
                  <button type="button" aria-label="Close filters" className="fixed inset-0 z-30 cursor-default" onClick={() => setFiltersOpen(false)} />
                  <div className="absolute left-0 top-full z-40 mt-2 w-64 space-y-4 rounded-2xl bg-white p-4 shadow-[0_24px_50px_-16px_rgba(60,30,10,0.45)] ring-1 ring-black/10">
                    <div className="block">
                      <span className="mb-1.5 block text-xs font-semibold text-ink/60">Level</span>
                      <Select
                        variant="inset"
                        value={String(levelFilter)}
                        onChange={setLevelFilter}
                        ariaLabel="Level"
                        options={[
                          { value: "all", label: "All levels" },
                          ...perLevel.map(({ level, count }) => ({ value: String(level), label: `Level ${level} (${count})` })),
                        ]}
                      />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2.5 text-sm text-ink/75">
                      <input
                        type="checkbox"
                        checked={soldOnly}
                        onChange={(e) => setSoldOnly(e.target.checked)}
                        className="h-4 w-4 rounded border-black/20 accent-[#b5622f]"
                      />
                      Only partners who sold land
                    </label>
                    {extraFilters > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setLevelFilter("all");
                          setSoldOnly(false);
                        }}
                        className="text-xs font-semibold text-copper hover:text-copper-dark"
                      >
                        Clear these filters
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="flex gap-2 lg:ml-auto [&>button]:flex-1 lg:[&>button]:flex-none">
              <button
                type="button"
                onClick={() => setOpen(new Set(tree.children.keys()))}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink/80 shadow-sm ring-1 ring-black/10 transition hover:text-copper hover:ring-copper"
              >
                <Maximize2 className="h-4 w-4" />
                Expand all
              </button>
              <button
                type="button"
                onClick={() => {
                  setOpen(new Set());
                  setRootOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-3 py-2 text-sm font-semibold text-ink/80 shadow-sm ring-1 ring-black/10 transition hover:text-copper hover:ring-copper"
              >
                <Minimize2 className="h-4 w-4" />
                Collapse all
              </button>
            </div>
          </div>

          {focusNode && (
            <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-copper/10 px-4 py-3 ring-1 ring-copper/20">
              <span className="text-sm text-ink/75">
                Showing the team of <b className="text-ink">{focusNode.name}</b> ({focusNode.code})
              </span>
              <button
                type="button"
                onClick={() => setFocus(null)}
                className="rounded-lg bg-white px-3.5 py-1.5 text-sm font-semibold text-copper-dark shadow-sm ring-1 ring-copper/25 transition hover:bg-copper hover:text-white"
              >
                Show whole team
              </button>
            </div>
          )}

          {/* the team */}
          <div className="relative mt-5">
            {roots.length === 0 ? (
              <p className="py-12 text-center text-sm text-ink/55">No one matches. Try a different search or filter.</p>
            ) : view === "tree" ? (
              <>
                {full && <div className="fixed inset-0 z-[79] bg-black/50 backdrop-blur-sm" aria-hidden />}
                <div
                  className={`overflow-hidden rounded-3xl bg-gradient-to-b from-[#fffaf3] to-[#fdf0e1] ring-1 ring-black/5 ${
                    full ? "fixed inset-3 z-[80] shadow-2xl" : "relative h-[580px]"
                  }`}
                >
                  {/* backdrop: soft houses */}
                  <div className="pointer-events-none absolute inset-0" aria-hidden>
                    <div
                      className="absolute bottom-0 right-0 h-[88%] w-[46%]"
                      style={{
                        maskImage: "linear-gradient(to right, transparent, #000 55%), linear-gradient(to top, #000 55%, transparent)",
                        WebkitMaskImage: "linear-gradient(to right, transparent, #000 55%), linear-gradient(to top, #000 55%, transparent)",
                        maskComposite: "intersect",
                        WebkitMaskComposite: "source-in",
                      }}
                    >
                      <Image src="/images/villa.png" alt="" fill sizes="40vw" className="object-cover opacity-25 grayscale-[0.4] sepia" style={{ objectPosition: "40% 55%" }} />
                    </div>
                    <div
                      className="absolute bottom-0 left-0 h-[70%] w-[38%]"
                      style={{
                        maskImage: "linear-gradient(to left, transparent, #000 55%), linear-gradient(to top, #000 50%, transparent)",
                        WebkitMaskImage: "linear-gradient(to left, transparent, #000 55%), linear-gradient(to top, #000 50%, transparent)",
                        maskComposite: "intersect",
                        WebkitMaskComposite: "source-in",
                      }}
                    >
                      <Image src="/images/commercial.png" alt="" fill sizes="30vw" className="object-cover opacity-20 grayscale-[0.4] sepia" />
                    </div>
                    <Birds className="absolute right-[26%] top-[40%] h-10 w-20 text-copper/35" />
                  </div>

                  {/* the tree: drag to move, buttons to zoom */}
                  <div
                    ref={canvas}
                    onPointerDown={onDown}
                    onPointerMove={onMove}
                    onPointerUp={onUp}
                    onPointerCancel={onUp}
                    className="no-scrollbar absolute inset-0 cursor-grab overflow-auto active:cursor-grabbing"
                  >
                    <div ref={inner} style={{ zoom: scale }} className="org-tree mx-auto w-max min-w-full px-10 pb-16 pt-12">
                      <ul>
                        <li>
                          <YouCard
                            me={me}
                            teamSize={nodes.length}
                            hasKids={roots.length > 0}
                            isOpen={rootOpen}
                            onToggle={() => setRootOpen((v) => !v)}
                          />
                          {rootOpen && (
                            <ul>
                              {roots.map((id) => (
                                <OrgNode
                                  key={id}
                                  id={id}
                                  tree={tree}
                                  open={open}
                                  toggle={toggle}
                                  forceOpen={!!visible}
                                  visible={visible}
                                  onDetails={setDetailsId}
                                />
                              ))}
                            </ul>
                          )}
                        </li>
                      </ul>
                    </div>
                  </div>

                  {/* on top of the tree: key, small map, zoom */}
                  <div className="pointer-events-none absolute left-4 top-4 z-10 hidden md:block">
                    <Legend />
                  </div>
                  <div className="absolute right-4 top-4 z-10 hidden md:block">
                    <MiniMap nodes={nodes} full={full} onToggleFull={() => setFull((v) => !v)} />
                  </div>
                  <div className="absolute bottom-4 left-4 z-10 flex flex-col items-start gap-3">
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-1 rounded-2xl bg-white/95 p-1.5 shadow-lg ring-1 ring-black/5">
                        {[
                          [() => zoomBy(0.1), Plus, "Zoom in"],
                          [() => zoomBy(-0.1), Minus, "Zoom out"],
                          [fit, Scan, "Fit the tree on screen"],
                          [centre, LocateFixed, "Centre on you"],
                        ].map(([run, Icon, label]) => (
                          <button
                            key={label}
                            type="button"
                            onClick={run}
                            aria-label={label}
                            title={label}
                            className="flex h-9 w-9 items-center justify-center rounded-xl text-ink/70 transition hover:bg-copper/10 hover:text-copper"
                          >
                            <Icon className="h-4 w-4" />
                          </button>
                        ))}
                      </div>
                      <span className="rounded-lg bg-white/95 px-2.5 py-1 text-xs font-semibold tabular-nums text-ink/70 shadow ring-1 ring-black/5">
                        {Math.round(scale * 100)}%
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={reset}
                      className="inline-flex items-center gap-2 rounded-xl bg-white/95 px-4 py-2.5 text-sm font-semibold text-ink/75 shadow-lg ring-1 ring-black/5 transition hover:text-copper"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reset view
                    </button>
                  </div>

                  {full && (
                    <button
                      type="button"
                      onClick={() => setFull(false)}
                      className="absolute right-4 top-[7.5rem] z-10 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-ink/80 shadow-lg ring-1 ring-black/5 transition hover:text-copper md:hidden"
                    >
                      <X className="h-4 w-4" />
                      Close
                    </button>
                  )}
                </div>
              </>
            ) : (
              <ul className="space-y-2.5">
                {roots.map((id) => (
                  <ListNode key={id} id={id} tree={tree} open={open} toggle={toggle} forceOpen={!!visible} visible={visible} />
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      {detailsNode && (
        <Details
          p={detailsNode}
          tree={tree}
          onClose={() => setDetailsId(null)}
          onFull={(id) => {
            setDetailsId(null);
            window.dispatchEvent(new CustomEvent("team:focus", { detail: id }));
          }}
        />
      )}
    </section>
  );
}
