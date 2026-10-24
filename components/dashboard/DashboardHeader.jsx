"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Gift,
  Home,
  LayoutDashboard,
  LogOut,
  PhoneCall,
  UserRound,
  Users,
  Wallet,
} from "lucide-react";
import { logout } from "@/actions/auth";

const PAGES = [
  { match: "/dashboard/network", icon: Users, title: "My Network", note: "Your team and referrals" },
  { match: "/dashboard/profile", icon: UserRound, title: "My Profile", note: "Your details and account" },
  { match: "/dashboard/commission", icon: Wallet, title: "Commission", note: "Sales and earnings" },
  { match: "/dashboard", icon: LayoutDashboard, title: "Overview", note: "How your account looks today" },
];

// The bar at the top of every dashboard page: where you are, your referral code,
// your status, and a menu for your profile and log out.
export default function DashboardHeader({ name, initials, avatarUrl, active, pending, referralCode }) {
  const pathname = usePathname();
  const page = PAGES.find((p) => pathname === p.match || pathname.startsWith(`${p.match}/`)) ?? PAGES[3];
  const Icon = page.icon;

  const [menu, setMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menu) return;
    const onDown = (e) => !menuRef.current?.contains(e.target) && setMenu(false);
    const onKey = (e) => e.key === "Escape" && setMenu(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [menu]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(referralCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the code stays visible to copy by hand.
    }
  };

  const status = !active
    ? { text: "Inactive", dot: "bg-rose-500", pill: "bg-rose-50 text-rose-700 ring-rose-200" }
    : pending
      ? { text: "Waiting for activation", dot: "bg-amber-500", pill: "bg-amber-50 text-amber-800 ring-amber-200" }
      : { text: "Active", dot: "bg-emerald-500", pill: "bg-[#e4f8ee] text-emerald-800 ring-emerald-300" };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });

  return (
    <header className="z-30 border-b border-black/10 bg-gradient-to-b from-white to-[#fcf6ee] shadow-[0_16px_32px_-22px_rgba(110,60,20,0.4)] backdrop-blur-xl lg:sticky lg:top-0">
      <div className="flex w-full items-center gap-4 px-5 py-4 lg:px-8">
        {/* Where you are */}
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/35 ring-1 ring-white/30">
            <Icon className="h-6 w-6" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-2xl font-bold text-ink sm:text-[1.75rem]">{page.title}</p>
            <p className="mt-1 hidden truncate text-sm text-ink/55 sm:block">{page.note}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
          <span className="hidden items-center gap-2.5 rounded-full bg-[#faf1e6] px-4 py-2.5 text-sm font-medium text-ink/75 ring-1 ring-black/5 xl:inline-flex">
            <CalendarDays className="h-[18px] w-[18px] text-copper" />
            {today}
          </span>

          {referralCode && active && !pending && (
            <button
              type="button"
              onClick={copy}
              title="Copy your referral code"
              className="group hidden items-center gap-3 rounded-full bg-gradient-to-r from-copper-light via-copper to-copper-dark py-1.5 pl-4 pr-1.5 text-white shadow-lg shadow-copper/35 ring-1 ring-white/20 transition hover:-translate-y-0.5 md:inline-flex"
            >
              <Gift className="h-[18px] w-[18px]" />
              <span className="font-sans text-lg font-extrabold tabular-nums tracking-wide">{referralCode}</span>
              <span className="h-6 w-px bg-white/30" />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25 transition group-hover:bg-white/35">
                {copied ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
              </span>
            </button>
          )}

          <span
            className={`hidden items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-semibold ring-1 sm:inline-flex ${status.pill}`}
          >
            <span className={`h-2.5 w-2.5 rounded-full ${status.dot}`} />
            {status.text}
          </span>

          {/* Your menu */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-haspopup="menu"
              className="flex items-center gap-2.5 rounded-full bg-white py-1.5 pl-1.5 pr-3.5 shadow-md shadow-black/5 ring-1 ring-black/10 transition hover:ring-copper"
            >
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-base font-bold text-white">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  initials
                )}
              </span>
              <ChevronDown className={`h-4 w-4 text-ink/50 transition ${menu ? "rotate-180" : ""}`} />
            </button>

            {menu && (
              <div
                role="menu"
                className="fade-up absolute right-0 top-full z-50 mt-3.5 w-[340px] max-w-[calc(100vw-2rem)] overflow-visible rounded-3xl bg-white shadow-[0_40px_80px_-24px_rgba(60,30,10,0.6)] ring-1 ring-copper/20"
              >
                {/* little arrow towards the avatar */}
                <span className="absolute -top-1.5 right-6 h-3.5 w-3.5 rotate-45 rounded-sm bg-[#2a2019] ring-1 ring-black/10" />

                <div className="relative overflow-hidden rounded-t-3xl bg-gradient-to-br from-[#3a2a1f] via-[#251b14] to-[#14100d] px-5 pb-5 pt-5 text-white">
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.12]"
                    style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "18px 18px" }}
                  />
                  <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-copper/35 blur-2xl" />

                  <div className="relative flex items-center gap-4">
                    <span className="relative shrink-0">
                      <span className="flex h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-2xl font-bold text-white shadow-lg ring-[3px] ring-white/80 ring-offset-2 ring-offset-[#2a2019]">
                        {avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          initials
                        )}
                      </span>
                      <span className={`absolute bottom-[4%] right-[4%] h-4 w-4 rounded-full ring-2 ring-[#2a2019] ${status.dot}`} />
                    </span>
                    <div className="min-w-0 leading-tight">
                      <p className="font-display text-xl font-bold leading-snug sm:text-2xl">{name}</p>
                      <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3.5 py-1.5 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/50">
                        <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                        {status.text}
                      </p>
                    </div>
                  </div>

                  {referralCode && active && !pending && (
                    <button
                      type="button"
                      onClick={copy}
                      className="group relative mt-5 flex w-full items-center gap-3 rounded-2xl bg-white/[0.06] p-2.5 text-left ring-1 ring-copper-light/40 transition hover:bg-white/10"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-copper/25 text-copper-light">
                        <Gift className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1 leading-tight">
                        <span className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55">Your referral code</span>
                        <span className="mt-1 block text-xl font-extrabold tabular-nums tracking-wider">{referralCode}</span>
                      </span>
                      <span className="h-9 w-px bg-white/15" />
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 transition ${
                          copied ? "bg-white text-copper-dark ring-white" : "bg-white/10 text-white ring-white/15 group-hover:bg-white/20"
                        }`}
                      >
                        {copied ? <Check className="h-4 w-4" strokeWidth={3} /> : <Copy className="h-4 w-4" />}
                      </span>
                    </button>
                  )}
                </div>

                <div className="p-3">
                  <div className="space-y-2.5">
                    {[
                      { href: "/dashboard/profile", icon: UserRound, label: "My Profile", note: "Your details and account" },
                      { href: "/dashboard/network", icon: Users, label: "My Network", note: "Your team and referrals" },
                      { href: "/dashboard/commission", icon: Wallet, label: "Commission", note: "Points, rank and rewards" },
                    ].map(({ href, icon: ItemIcon, label, note }) => {
                      const here = pathname === href || pathname.startsWith(`${href}/`);
                      return (
                        <a
                          key={label}
                          href={href}
                          role="menuitem"
                          onClick={() => setMenu(false)}
                          className={`group flex items-center gap-3.5 rounded-2xl p-3 ring-1 transition hover:-translate-y-0.5 hover:shadow-md ${
                            here
                              ? "bg-gradient-to-r from-[#fde6d6] to-[#fff1e6] ring-copper/35"
                              : "bg-gradient-to-r from-white to-[#fff8ef] ring-copper/10 hover:ring-copper/30"
                          }`}
                        >
                          <span
                            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition ${
                              here
                                ? "bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                                : "bg-[#fbe9dc] text-copper"
                            }`}
                          >
                            <ItemIcon className="h-[22px] w-[22px]" />
                          </span>
                          <span className="min-w-0 flex-1 leading-tight">
                            <span className={`block text-[15px] font-bold ${here ? "text-[#6b2f0f]" : "text-ink"}`}>{label}</span>
                            <span className="mt-1 block text-[13px] text-ink/55">{note}</span>
                          </span>
                          <ChevronRight className="h-5 w-5 shrink-0 text-copper/70 transition group-hover:translate-x-0.5" />
                        </a>
                      );
                    })}
                  </div>

                  <div className="my-3 h-px bg-black/10" />

                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
                    {[
                      { href: "/contact", icon: PhoneCall, label: "Contact us" },
                      { href: "/", icon: Home, label: "Website" },
                    ].map(({ href, icon: ItemIcon, label }, i) => (
                      <a
                        key={label}
                        href={href}
                        role="menuitem"
                        onClick={() => setMenu(false)}
                        style={{ gridColumn: i === 0 ? 1 : 3 }}
                        className="flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-white to-[#fff6ec] px-3 py-3 text-sm font-bold text-ink ring-1 ring-copper/15 transition hover:-translate-y-0.5 hover:ring-copper/40"
                      >
                        <ItemIcon className="h-[18px] w-[18px] text-copper" />
                        {label}
                      </a>
                    ))}
                    <span className="col-start-2 row-start-1 h-8 w-px bg-black/10" />
                  </div>

                  <div className="my-3 h-px bg-black/10" />

                  <form action={logout}>
                    <button
                      type="submit"
                      role="menuitem"
                      className="group flex w-full items-center gap-3.5 rounded-2xl bg-gradient-to-r from-[#fff0f0] to-[#ffe8ea] px-4 py-3.5 text-left ring-1 ring-rose-200/80 transition hover:ring-rose-300"
                    >
                      <LogOut className="h-5 w-5 text-rose-600" />
                      <span className="flex-1 text-[15px] font-bold text-rose-700">Log out</span>
                      <ChevronRight className="h-5 w-5 text-rose-500/80 transition group-hover:translate-x-0.5" />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
