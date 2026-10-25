import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Clock,
  ExternalLink,
  FileText,
  Home,
  Inbox,
  PhoneCall,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import Reveal from "@/components/Reveal";
import HeroSlides from "@/components/dashboard/HeroSlides";
import { BarsArt, HourglassArt, MailArt, PeopleArt, TeamArt } from "@/components/dashboard/StatArt";
import { card } from "@/components/admin/ui";
import { getAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Dashboard" };

const count = (q) => q.then((r) => r.count ?? 0);
const when = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

// "Good morning" and so on, by the hour in India.
function greeting() {
  const hour = Number(
    new Date().toLocaleString("en-IN", { hour: "numeric", hour12: false, timeZone: "Asia/Kolkata" }),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default async function AdminDashboard() {
  const admin = await getAdmin();
  const db = createAdminClient();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const head = { count: "exact", head: true };

  const [partners, pendingPartners, newPartners, newInquiries, properties, recentPartners, recentInquiries] =
    await Promise.all([
      count(db.from("profiles").select("id", head)),
      count(db.from("profiles").select("id", head).is("activated_at", null).eq("is_active", true)),
      count(db.from("profiles").select("id", head).gte("created_at", weekAgo)),
      count(db.from("inquiries").select("id", head).eq("status", "new")),
      count(db.from("properties").select("id", head).eq("is_active", true)),
      db
        .from("profiles")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
        .then((r) => r.data ?? []),
      db
        .from("inquiries")
        .select("id, name, phone, interest, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
        .then((r) => r.data ?? []),
    ]);

  const stats = [
    {
      icon: Users,
      art: PeopleArt,
      label: "Total partners",
      value: partners,
      note: "have joined so far",
      href: "/admin/partners",
      theme: { bg: "from-[#fdebdc] to-[#fff6ec]", ring: "ring-copper/10", chip: "bg-[#f9d6b8] text-copper", art: "text-copper" },
    },
    {
      icon: Clock,
      art: HourglassArt,
      label: "Payment pending",
      value: pendingPartners,
      note: "waiting to be activated",
      href: "/admin/partners",
      theme: { bg: "from-[#fff1cf] to-[#fffaf0]", ring: "ring-amber-300/30", chip: "bg-amber-200/80 text-amber-700", art: "text-amber-500" },
    },
    {
      icon: UserPlus,
      art: BarsArt,
      label: "New this week",
      value: newPartners,
      note: "partners in the last 7 days",
      href: "/admin/partners",
      theme: { bg: "from-[#dff5e8] to-[#f5fcf8]", ring: "ring-emerald-300/30", chip: "bg-emerald-200/80 text-emerald-700", art: "text-emerald-500" },
    },
    {
      icon: Inbox,
      art: MailArt,
      label: "New messages",
      value: newInquiries,
      note: "waiting for a reply",
      href: "/admin/inquiries",
      theme: { bg: "from-[#e3ecfd] to-[#f6f9ff]", ring: "ring-sky-300/30", chip: "bg-sky-200/80 text-sky-700", art: "text-sky-500" },
    },
    {
      icon: Building2,
      art: TeamArt,
      label: "Live properties",
      value: properties,
      note: "shown on the website",
      href: "/admin/properties",
      theme: { bg: "from-[#ece4fb] to-[#f9f6ff]", ring: "ring-violet-300/30", chip: "bg-violet-200/80 text-violet-700", art: "text-violet-500" },
    },
  ];

  const shortcuts = [
    { icon: Home, label: "Home page", text: "Change the main page text and images", href: "/admin/home" },
    { icon: FileText, label: "About page", text: "Change the About page", href: "/admin/about" },
    { icon: PhoneCall, label: "Contact info", text: "Phone, email, address, social links", href: "/admin/contact" },
  ];

  const name = (admin?.email ?? "admin").split("@")[0];

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="fade-up relative overflow-hidden rounded-3xl bg-gradient-to-r from-white via-[#fff7ec] to-[#fbeedd] shadow-[0_28px_60px_-30px_rgba(110,60,20,0.5)] ring-1 ring-black/5">
        <div className="relative grid grid-cols-1 lg:min-h-[230px] lg:grid-cols-[1.05fr_1fr]">
          <div className="relative z-10 flex min-w-0 flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:gap-7 sm:p-7 lg:py-6">
            <span className="relative shrink-0">
              <span className="absolute -inset-2.5 rounded-full bg-gradient-to-br from-copper-light/55 to-transparent blur-md" />
              <span className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark font-display text-3xl font-bold text-white shadow-xl ring-[5px] ring-white sm:h-28 sm:w-28 sm:text-4xl">
                {name[0].toUpperCase()}
              </span>
            </span>

            <div className="min-w-0">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-emerald-800 ring-1 ring-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Admin panel
              </span>
              <h1 className="mt-3 break-words font-display text-2xl font-bold leading-tight text-ink [overflow-wrap:anywhere] sm:text-3xl xl:text-[2.1rem]">
                {greeting()}, <span className="text-copper capitalize">{name}</span> <span aria-hidden>👋</span>
              </h1>
              <p className="mt-1.5 text-sm text-ink/60 sm:text-base">Here is a quick look at your website today.</p>

              <div className="mt-3.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs text-ink/60 shadow-sm ring-1 ring-black/10">
                  <Inbox className="h-3.5 w-3.5 text-copper" />
                  New messages
                  <b className="text-sm text-copper-dark">{newInquiries}</b>
                </span>
                <span className="inline-flex items-center gap-2 rounded-lg bg-copper/10 px-3 py-1.5 text-xs font-semibold text-copper-dark ring-1 ring-copper/20">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {pendingPartners} waiting for payment
                </span>
              </div>
            </div>
          </div>

          {/* Soft photos and the two buttons */}
          <div className="relative min-h-[200px] sm:min-h-[230px] lg:min-h-full">
            <HeroSlides />

            <div className="absolute inset-x-4 bottom-4 z-10 flex flex-wrap justify-end gap-2.5 sm:inset-x-auto sm:bottom-5 sm:right-5 sm:gap-3">
              <a
                href="/admin/partners"
                className="group inline-flex flex-1 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-copper/40 transition hover:-translate-y-0.5 sm:flex-none sm:px-5"
              >
                View Partners
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-white px-4 py-3 text-sm font-semibold text-ink shadow-lg shadow-black/10 ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:text-copper sm:inline-flex sm:flex-none sm:px-5"
              >
                <ExternalLink className="h-4 w-4" />
                View Website
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Numbers */}
      <Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {stats.map(({ icon: Icon, art: Art, label, value, note, href, theme }) => (
            <a
              key={label}
              href={href}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ${theme.ring} transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-24px_rgba(110,60,20,0.5)]`}
            >
              <Art
                className={`pointer-events-none absolute bottom-3 right-3 h-20 w-24 origin-bottom-right transition duration-500 group-hover:scale-110 ${theme.art}`}
              />
              <span className={`relative flex h-12 w-12 items-center justify-center rounded-full shadow-sm ${theme.chip}`}>
                <Icon className="h-5 w-5" />
              </span>
              <p className="relative mt-4 text-sm font-medium text-ink/70">{label}</p>
              <p className="relative mt-1 text-4xl font-extrabold tabular-nums text-ink">{value}</p>
              <p className="relative mt-1 max-w-[60%] text-xs text-ink/55">{note}</p>
              <span className="relative mt-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-copper shadow-sm ring-1 ring-copper/25 transition group-hover:bg-copper group-hover:text-white">
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </a>
          ))}
        </div>
      </Reveal>

      {/* Newest partners and latest messages */}
      <Reveal>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className={`${card} flex min-w-0 flex-col !p-5 sm:!p-6`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-[1.7rem]">
                Newest <span className="text-copper">partners</span>
              </h2>
              <a
                href="/admin/partners"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-copper transition hover:text-copper-dark"
              >
                See all
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
            </div>
            {recentPartners.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink/55">No partners yet.</p>
            ) : (
              <ul className="mt-5 space-y-2.5">
                {recentPartners.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-[0_10px_24px_-18px_rgba(110,60,20,0.5)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:ring-copper/30 sm:gap-4 sm:px-4 sm:py-3.5"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white shadow-md">
                      {(p.full_name || p.email)[0].toUpperCase()}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block break-words text-base font-bold text-ink">{p.full_name || "—"}</span>
                      <span className="mt-1 block break-words text-xs text-ink/55 [overflow-wrap:anywhere]">{p.email}</span>
                      <span className="mt-2 inline-block rounded-full bg-[#faf1e6] px-3 py-1 text-[11px] font-semibold text-ink/65 ring-1 ring-black/5 sm:hidden">
                        {when(p.created_at)}
                      </span>
                    </span>
                    <span className="hidden shrink-0 rounded-full bg-[#faf1e6] px-3.5 py-1.5 text-xs font-semibold text-ink/65 ring-1 ring-black/5 sm:inline-block">
                      {when(p.created_at)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-auto flex items-center gap-4 border-t border-black/10 pt-5">
              <TeamArt className="h-20 w-32 shrink-0" />
              <p className="text-sm text-ink/60">
                <b className="text-copper-dark">{newPartners}</b> {newPartners === 1 ? "partner" : "partners"} joined in the last 7 days.
              </p>
            </div>
          </section>

          <section className={`${card} flex min-w-0 flex-col !p-5 sm:!p-6`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-bold text-ink sm:text-[1.7rem]">
                Latest <span className="text-copper">messages</span>
              </h2>
              <a
                href="/admin/inquiries"
                className="group inline-flex items-center gap-1.5 text-sm font-semibold text-copper transition hover:text-copper-dark"
              >
                See all
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </a>
            </div>
            {recentInquiries.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink/55">No messages yet.</p>
            ) : (
              <ul className="mt-5 space-y-2.5">
                {recentInquiries.map((q) => (
                  <li
                    key={q.id}
                    className="flex items-center gap-3 rounded-2xl bg-white px-3 py-3 shadow-[0_10px_24px_-18px_rgba(110,60,20,0.5)] ring-1 ring-black/5 transition duration-300 hover:-translate-y-0.5 hover:ring-copper/30 sm:gap-4 sm:px-4 sm:py-3.5"
                  >
                    <span
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                        q.status === "new"
                          ? "bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md"
                          : "bg-black/5 text-ink/45"
                      }`}
                    >
                      <Inbox className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block break-words text-base font-bold text-ink">{q.name}</span>
                      <span className="mt-1 block break-words text-xs text-ink/55">
                        {q.phone}
                        {q.interest ? ` · ${q.interest}` : ""} · {when(q.created_at)}
                      </span>
                    </span>
                    {q.status === "new" ? (
                      <span className="shrink-0 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-800 ring-1 ring-amber-200">
                        New
                      </span>
                    ) : (
                      <span className="shrink-0 rounded-full bg-black/5 px-4 py-1.5 text-xs font-bold text-ink/50 ring-1 ring-black/5">
                        Seen
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </Reveal>

      {/* Customize the website */}
      <Reveal>
        <section className={card}>
          <h2 className="font-display text-2xl font-bold text-ink sm:text-[1.7rem]">
            Customize the <span className="text-copper">website</span>
          </h2>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
            {shortcuts.map(({ icon: Icon, label, text, href }) => (
              <a
                key={label}
                href={href}
                className="group flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#fdf0e1] to-[#fffaf4] p-3.5 ring-1 ring-copper/10 transition duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:ring-copper/30"
              >
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3a2a1f] to-[#17110c] text-copper-light shadow-md ring-1 ring-black/10 transition group-hover:scale-105">
                  <Icon className="h-6 w-6" strokeWidth={1.7} />
                </span>
                <span className="min-w-0 flex-1 leading-tight">
                  <span className="block text-base font-bold text-ink">{label}</span>
                  <span className="mt-1 block text-xs text-ink/55">{text}</span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-copper transition group-hover:translate-x-1" />
              </a>
            ))}
          </div>
        </section>
      </Reveal>
    </div>
  );
}
