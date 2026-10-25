"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Building2,
  Check,
  Eye,
  EyeOff,
  ExternalLink,
  Images,
  LayoutGrid,
  List,
  Loader2,
  MapPin,
  MoreVertical,
  Pencil,
  Plus,
  Search,
  Table,
  Tags,
  Trash2,
  X,
} from "lucide-react";
import {
  deleteProperty,
  moveProperty,
  setPropertyActive,
  setPropertyHome,
} from "@/actions/admin/properties";
import { DETAIL_ICONS } from "@/lib/icons";
import { BarsArt, ClipboardArt, HouseArt, HourglassArt, PeopleArt } from "@/components/dashboard/StatArt";
import ConfirmDialog from "../ConfirmDialog";
import Select from "../Select";
import { arr, completeness } from "./PropertyForm";
import Switch from "./Switch";
import { btnGhost, btnPrimary, iconBtn, inputCls, labelCls } from "./ui";

const field =
  "w-full rounded-2xl border border-black/10 bg-white text-sm text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)] outline-none transition placeholder:text-ink/45 focus:border-copper focus:ring-4 focus:ring-copper/15";

const th = "px-3 py-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink/55";

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
          <p className="mt-1 text-4xl font-extrabold tabular-nums text-ink">{value}</p>
        </div>
      </div>
      <p className="relative mt-3 max-w-[62%] text-xs text-ink/55">{note}</p>
    </div>
  );
}

export default function PropertiesManager({ properties, categories = [] }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [view, setView] = useState("table"); // "table" | "grid" | "list"
  const [menu, setMenu] = useState(null); // the ⋮ menu of a table row: { p, top, right }
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  // The menu is drawn with fixed positioning, so close it whenever the page moves.
  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e) => e.key === "Escape" && close();
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    document.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const openMenu = (e, p) => {
    if (menu?.p.id === p.id) return setMenu(null);
    const r = e.currentTarget.getBoundingClientRect();
    setMenu({ p, top: r.bottom + 8, right: window.innerWidth - r.right });
  };

  const run = (fn) =>
    start(async () => {
      setError("");
      const res = await fn();
      if (res && !res.success) setError(res.error || "Something went wrong.");
      router.refresh();
    });

  const live = properties.filter((p) => p.is_active).length;
  const onHome = properties.filter((p) => p.is_active && p.show_on_home !== false).length;
  const needAttention = properties.filter((p) => completeness(p).done < 4).length;
  const photos = properties.reduce((t, p) => t + (p.image_url ? 1 : 0) + arr(p.gallery).length, 0);

  const filtering = !!search.trim() || category !== "all" || status !== "all";
  const shown = useMemo(() => {
    const term = search.trim().toLowerCase();
    return properties.filter((p) => {
      if (category !== "all" && p.category !== category) return false;
      if (status === "live" && !p.is_active) return false;
      if (status === "hidden" && p.is_active) return false;
      if (!term) return true;
      return [p.title, p.location, p.price, p.category, p.badge].join(" ").toLowerCase().includes(term);
    });
  }, [properties, search, category, status]);

  const stats = [
    {
      icon: Building2,
      art: HouseArt,
      label: "All properties",
      value: properties.length,
      note: `${new Set(properties.map((p) => p.category)).size} types`,
      theme: { bg: "from-[#fdebdc] to-[#fff6ec]", ring: "ring-copper/10", chip: "bg-[#f9d6b8] text-copper" },
    },
    {
      icon: Eye,
      art: BarsArt,
      label: "Live on website",
      value: live,
      note: `${onHome} on the home page`,
      theme: { bg: "from-[#dff5e8] to-[#f5fcf8]", ring: "ring-emerald-300/30", chip: "bg-emerald-200/80 text-emerald-700", art: "text-emerald-500" },
    },
    {
      icon: EyeOff,
      art: HourglassArt,
      label: "Hidden",
      value: properties.length - live,
      note: "switched off for now",
      theme: { bg: "from-[#fff1cf] to-[#fffaf0]", ring: "ring-amber-300/30", chip: "bg-amber-200/80 text-amber-700", art: "text-amber-500" },
    },
    {
      icon: Images,
      art: needAttention > 0 ? ClipboardArt : PeopleArt,
      label: "Photos",
      value: photos,
      note: needAttention > 0 ? `${needAttention} page${needAttention === 1 ? "" : "s"} need more details` : "pages look complete",
      theme: { bg: "from-[#ece4fb] to-[#f9f6ff]", ring: "ring-violet-300/30", chip: "bg-violet-200/80 text-violet-700", art: "text-violet-500" },
    },
  ];

  // Used by the Cards and List views, and on phones in the Table view.
  const cards = shown.map((p) => {
            const i = properties.findIndex((x) => x.id === p.id);
            const comp = completeness(p);
            const photoCount = (p.image_url ? 1 : 0) + arr(p.gallery).length;
            const lines = arr(p.details).filter((d) => d.text);
            const rowView = view === "list";
            return (
              <li
                key={p.id}
                className={`group flex overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-1 hover:ring-copper/30 ${
                  rowView ? "flex-col sm:flex-row" : "flex-col"
                } ${p.is_active ? "" : "opacity-75"}`}
              >
                <div className={`relative shrink-0 bg-[#f1e6d4] ${rowView ? "aspect-[16/9] sm:aspect-auto sm:w-64" : "aspect-[4/3]"}`}>
                  {p.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full min-h-[120px] items-center justify-center text-sm text-ink/40">No image</div>
                  )}
                  <span
                    className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold shadow-md ring-1 ${
                      p.is_active ? "bg-emerald-500 text-white ring-emerald-400" : "bg-white text-ink/60 ring-black/10"
                    }`}
                  >
                    {p.is_active ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    {p.is_active ? "Live" : "Hidden"}
                  </span>
                  {p.badge && (
                    <span className="absolute right-3 top-3 rounded-full bg-[#2f6fd6] px-3 py-1 text-[11px] font-bold text-white shadow-md">
                      {p.badge}
                    </span>
                  )}
                  <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
                    <Images className="h-3 w-3" />
                    {photoCount} photo{photoCount === 1 ? "" : "s"}
                  </span>
                  <span className="absolute bottom-3 right-3 flex h-7 min-w-7 items-center justify-center rounded-full bg-white px-2 text-[11px] font-bold text-copper-dark shadow-md">
                    #{i + 1}
                  </span>
                </div>

                <div className="flex min-w-0 flex-1 flex-col p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-copper/10 px-2.5 py-1 text-[11px] font-bold text-copper-dark ring-1 ring-copper/15">
                      {p.category}
                    </span>
                  </div>
                  <h3 className="mt-2 font-display text-xl font-bold leading-tight text-ink">{p.title}</h3>
                  {p.location && (
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-ink/55">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-copper" />
                      <span className="truncate">{p.location}</span>
                    </p>
                  )}
                  <p className="mt-3 text-2xl font-extrabold tabular-nums text-ink">
                    {p.price} <span className="text-xs font-medium text-ink/50">{p.unit}</span>
                  </p>

                  {lines.length > 0 && (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {lines.slice(0, 4).map((d, k) => {
                        const Icon = DETAIL_ICONS[d.icon] ?? DETAIL_ICONS.MapPin;
                        return (
                          <li key={k} className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-[#faf1e6] px-3 py-1 text-xs text-ink/70 ring-1 ring-black/5">
                            <Icon className="h-3 w-3 shrink-0 text-copper" />
                            <span className="truncate">{d.text}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {/* How complete the property's own page is */}
                  <div className="mt-4" title={comp.missing.length ? `Missing: ${comp.missing.join(", ")}` : "Everything is filled in"}>
                    <div className="flex items-center justify-between text-[11px] font-semibold text-ink/55">
                      <span>Property page</span>
                      <span className={comp.done === comp.total ? "text-emerald-700" : comp.done < 4 ? "text-amber-700" : "text-ink/60"}>
                        {comp.done}/{comp.total} filled
                      </span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-black/10">
                      <div
                        className={`h-full rounded-full ${
                          comp.done === comp.total ? "bg-emerald-500" : comp.done < 4 ? "bg-amber-400" : "bg-gradient-to-r from-copper-light to-copper"
                        }`}
                        style={{ width: `${(comp.done / comp.total) * 100}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-black/5 pt-4">
                    <label className="flex items-center gap-2">
                      <Switch
                        checked={p.is_active}
                        disabled={pending}
                        label="Show on website"
                        onChange={(v) => run(() => setPropertyActive(p.id, v))}
                      />
                      <span className="text-xs font-semibold text-ink/55">{p.is_active ? "Live" : "Hidden"}</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Switch
                        checked={p.show_on_home !== false}
                        disabled={pending}
                        label="Show on the home page"
                        onChange={(v) => run(() => setPropertyHome(p.id, v))}
                      />
                      <span className="text-xs font-semibold text-ink/55">Home</span>
                    </label>

                    <div className="ml-auto flex items-center gap-1.5">
                      <button
                        type="button"
                        className={`${iconBtn} !rounded-xl disabled:opacity-30`}
                        disabled={pending || filtering || i === 0}
                        onClick={() => run(() => moveProperty(p.id, -1))}
                        aria-label="Move earlier"
                        title={filtering ? "Clear the search and filters to re-order" : "Move earlier"}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        className={`${iconBtn} !rounded-xl disabled:opacity-30`}
                        disabled={pending || filtering || i === properties.length - 1}
                        onClick={() => run(() => moveProperty(p.id, 1))}
                        aria-label="Move later"
                        title={filtering ? "Clear the search and filters to re-order" : "Move later"}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </button>
                      {p.slug && (
                        <a
                          href={`/properties/${p.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className={`${iconBtn} !rounded-xl`}
                          aria-label="Open on the website"
                          title="Open on the website"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleting(p)}
                        aria-label="Delete"
                        title="Delete"
                        className={`${iconBtn} !rounded-xl hover:!border-rose-500 hover:!text-rose-600`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <a href={`/admin/properties/${p.id}`} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2 text-sm font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5">
                        <Pencil className="h-4 w-4" />
                        Edit
                      </a>
                    </div>
                  </div>
                </div>
              </li>
            );
          });

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <Stat key={s.label} {...s} />
        ))}
      </div>

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="relative xl:w-[300px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-copper" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, place or price..."
            className={`${field} py-3.5 pl-11 pr-4`}
          />
        </div>
        <Select
          wrapperClassName="xl:w-[200px]"
          variant="toolbar"
          value={category}
          onChange={setCategory}
          ariaLabel="Filter by type"
          menuMinWidth={210}
          options={[{ value: "all", label: "All types" }, ...categories.map((c) => ({ value: c.name, label: c.name }))]}
        />
        <Select
          wrapperClassName="xl:w-[170px]"
          variant="toolbar"
          value={status}
          onChange={setStatus}
          ariaLabel="Filter by status"
          menuMinWidth={170}
          options={[
            { value: "all", label: "All" },
            { value: "live", label: "Live" },
            { value: "hidden", label: "Hidden" },
          ]}
        />
        <p className="text-sm text-ink/60">
          Showing {shown.length} of {properties.length}
        </p>

        <div className="flex items-center gap-3 xl:ml-auto">
          <div className="inline-flex gap-1 rounded-2xl bg-[#faf1e6] p-1 ring-1 ring-black/5">
            {[
              ["table", Table, "Table"],
              ["grid", LayoutGrid, "Cards"],
              ["list", List, "List"],
            ].map(([id, Icon, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setView(id)}
                aria-label={label}
                title={label}
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
                  view === id ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30" : "text-ink/55 hover:text-copper"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
              </button>
            ))}
          </div>
          <a href="/admin/properties/categories" className={`${btnGhost} !rounded-2xl !px-5 !py-3`}>
            <Tags className="h-4 w-4" /> Types
          </a>
          <a href="/admin/properties/new" className={`${btnPrimary} !rounded-2xl !px-5 !py-3`}>
            <Plus className="h-4 w-4" /> Add property
          </a>
        </div>
      </div>

      {error && (
        <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-800 ring-1 ring-rose-200">{error}</p>
      )}

      {shown.length === 0 ? (
        <div className="flex flex-col items-center rounded-3xl bg-white px-6 py-14 text-center shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5">
          <HouseArt className="h-28 w-40" />
          <p className="mt-2 text-sm font-semibold text-ink/65">
            {properties.length === 0 ? "No properties yet. Click “Add property” to create the first one." : "No property matches this."}
          </p>
        </div>
      ) : (
        <>
          {view === "table" && (
            <>
              <div className="hidden overflow-hidden rounded-3xl bg-white shadow-[0_24px_50px_-28px_rgba(110,60,20,0.45)] ring-1 ring-black/5 md:block">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-black/5 bg-gradient-to-b from-white to-[#fcf6ee]">
                      <th className={`${th} pl-6`}>Property</th>
                      <th className={th}>Price</th>
                      <th className={`${th} hidden xl:table-cell`}>Photos</th>
                      <th className={`${th} hidden xl:table-cell`}>Page filled</th>
                      <th className={th}>Live</th>
                      <th className={th}>Home page</th>
                      <th className={`${th} pr-6 text-right`}>Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {shown.map((p) => {
                      const i = properties.findIndex((x) => x.id === p.id);
                      const comp = completeness(p);
                      const photoCount = (p.image_url ? 1 : 0) + arr(p.gallery).length;
                      return (
                        <tr key={p.id} className={`transition hover:bg-[#fffaf3] ${p.is_active ? "" : "opacity-70"}`}>
                          <td className="py-4 pl-6 pr-3">
                            <div className="flex items-center gap-4">
                              <span className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-[#f1e6d4] ring-1 ring-black/10">
                                {p.image_url && (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                                )}
                                <span className="absolute bottom-1 left-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-[10px] font-bold text-copper-dark shadow">
                                  {i + 1}
                                </span>
                              </span>
                              <span className="min-w-0 max-w-[280px] leading-tight">
                                <span className="block truncate text-[15px] font-bold text-ink" title={p.title}>
                                  {p.title}
                                </span>
                                <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                                  <span className="rounded-full bg-copper/10 px-2.5 py-0.5 text-[11px] font-bold text-copper-dark ring-1 ring-copper/15">
                                    {p.category}
                                  </span>
                                  {p.badge && (
                                    <span className="rounded-full bg-[#2f6fd6]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#2f6fd6]">
                                      {p.badge}
                                    </span>
                                  )}
                                </span>
                                {p.location && (
                                  <span className="mt-1.5 flex items-center gap-1 truncate text-xs text-ink/55">
                                    <MapPin className="h-3 w-3 shrink-0 text-copper" />
                                    <span className="truncate">{p.location}</span>
                                  </span>
                                )}
                              </span>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4">
                            <span className="block text-base font-extrabold tabular-nums text-ink">{p.price}</span>
                            <span className="mt-0.5 block text-xs text-ink/50">{p.unit}</span>
                          </td>
                          <td className="hidden px-3 py-4 xl:table-cell">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#faf1e6] px-3 py-1.5 text-xs font-semibold text-ink/70 ring-1 ring-black/5">
                              <Images className="h-3.5 w-3.5 text-copper" />
                              {photoCount}
                            </span>
                          </td>
                          <td className="hidden px-3 py-4 xl:table-cell" title={comp.missing.length ? `Missing: ${comp.missing.join(", ")}` : "Everything is filled in"}>
                            <span className="block w-28">
                              <span className="flex items-center justify-between text-[11px] font-semibold text-ink/55">
                                <span className={comp.done === comp.total ? "text-emerald-700" : comp.done < 4 ? "text-amber-700" : "text-ink/60"}>
                                  {comp.done}/{comp.total}
                                </span>
                              </span>
                              <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-black/10">
                                <span
                                  className={`block h-full rounded-full ${
                                    comp.done === comp.total ? "bg-emerald-500" : comp.done < 4 ? "bg-amber-400" : "bg-gradient-to-r from-copper-light to-copper"
                                  }`}
                                  style={{ width: `${(comp.done / comp.total) * 100}%` }}
                                />
                              </span>
                            </span>
                          </td>
                          <td className="px-3 py-4">
                            <div className="flex items-center gap-2.5">
                              <Switch
                                checked={p.is_active}
                                disabled={pending}
                                label={`Show ${p.title} on the website`}
                                onChange={(v) => run(() => setPropertyActive(p.id, v))}
                              />
                              <span
                                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${
                                  p.is_active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-black/5 text-ink/55 ring-black/10"
                                }`}
                              >
                                {p.is_active ? "Live" : "Hidden"}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-4">
                            <Switch
                              checked={p.show_on_home !== false}
                              disabled={pending}
                              label={`Show ${p.title} on the home page`}
                              onChange={(v) => run(() => setPropertyHome(p.id, v))}
                            />
                          </td>
                          <td className="py-4 pl-3 pr-6">
                            <div className="flex items-center justify-end gap-2">
                              <a href={`/admin/properties/${p.id}`} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-2 text-[13px] font-semibold text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5">
                                <Pencil className="h-4 w-4" />
                                Edit
                              </a>
                              <button
                                type="button"
                                onClick={(e) => openMenu(e, p)}
                                aria-label={`More actions for ${p.title}`}
                                aria-haspopup="menu"
                                aria-expanded={menu?.p.id === p.id}
                                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border bg-white shadow-sm transition hover:border-copper hover:text-copper ${
                                  menu?.p.id === p.id ? "border-copper text-copper" : "border-black/10 text-ink/70"
                                }`}
                              >
                                <MoreVertical className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Phones: the same cards as the Cards view */}
              <ul className="grid gap-5 sm:grid-cols-2 md:hidden">{cards}</ul>
            </>
          )}

          {view !== "table" && (
            <ul className={view === "grid" ? "grid gap-5 sm:grid-cols-2 2xl:grid-cols-3" : "space-y-4"}>{cards}</ul>
          )}
        </>
      )}

      {filtering && properties.length > 1 && (
        <p className="text-center text-xs text-ink/45">To re-order the cards, clear the search and filters first.</p>
      )}

      {menu &&
        (() => {
          const p = menu.p;
          const i = properties.findIndex((x) => x.id === p.id);
          const item =
            "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-[#fbeedd] hover:text-copper-dark disabled:pointer-events-none disabled:opacity-40";
          return (
            <>
              <button type="button" aria-label="Close menu" onClick={() => setMenu(null)} className="fixed inset-0 z-40 cursor-default" />
              <div
                role="menu"
                style={{ top: menu.top, right: menu.right }}
                className="fade-up fixed z-50 w-60 rounded-2xl bg-white p-2 shadow-[0_30px_60px_-20px_rgba(60,30,10,0.55)] ring-1 ring-copper/20"
              >
                <button
                  type="button"
                  role="menuitem"
                  disabled={pending || filtering || i === 0}
                  title={filtering ? "Clear the search and filters to re-order" : undefined}
                  className={item}
                  onClick={() => {
                    setMenu(null);
                    run(() => moveProperty(p.id, -1));
                  }}
                >
                  <ArrowUp className="h-[18px] w-[18px] text-copper" />
                  Move up
                </button>
                <button
                  type="button"
                  role="menuitem"
                  disabled={pending || filtering || i === properties.length - 1}
                  title={filtering ? "Clear the search and filters to re-order" : undefined}
                  className={item}
                  onClick={() => {
                    setMenu(null);
                    run(() => moveProperty(p.id, 1));
                  }}
                >
                  <ArrowDown className="h-[18px] w-[18px] text-copper" />
                  Move down
                </button>
                {p.slug && (
                  <a
                    href={`/properties/${p.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                    onClick={() => setMenu(null)}
                    className={item}
                  >
                    <ExternalLink className="h-[18px] w-[18px] text-copper" />
                    Open on the website
                  </a>
                )}
                <div className="my-1.5 h-px bg-black/10" />
                <button
                  type="button"
                  role="menuitem"
                  className={`${item} hover:!bg-rose-50 hover:!text-rose-700`}
                  onClick={() => {
                    setMenu(null);
                    setDeleting(p);
                  }}
                >
                  <Trash2 className="h-[18px] w-[18px] text-rose-500" />
                  Delete
                </button>
              </div>
            </>
          );
        })()}

            {deleting && (
        <ConfirmDialog
          tone="danger"
          icon={Trash2}
          title="Delete this property?"
          text={
            <>
              <b className="text-ink">{deleting.title}</b> and its photos on the website will be removed for good. To keep
              it but hide it, switch it off instead.
            </>
          }
          confirmText="Yes, delete"
          busy={pending}
          onConfirm={() => {
            const p = deleting;
            start(async () => {
              setError("");
              const res = await deleteProperty(p.id);
              if (res && !res.success) setError(res.error || "Could not delete.");
              setDeleting(null);
              router.refresh();
            });
          }}
          onCancel={() => setDeleting(null)}
        />
      )}
    </div>
  );
}
