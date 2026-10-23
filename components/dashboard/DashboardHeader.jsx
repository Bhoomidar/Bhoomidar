"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Check,
  ChevronDown,
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
      : { text: "Active", dot: "bg-emerald-500", pill: "bg-emerald-50 text-emerald-800 ring-emerald-200" };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });

  return (
    <header className="z-30 border-b border-black/5 bg-white/80 backdrop-blur-xl lg:sticky lg:top-0">
      <div className="flex w-full items-center gap-4 px-5 py-3.5 lg:px-8">
        {/* Where you are */}
        <div className="flex min-w-0 items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
            <Icon className="h-5 w-5" />
          </span>
          <div className="min-w-0 leading-tight">
            <p className="truncate font-display text-xl font-bold text-ink">{page.title}</p>
            <p className="mt-0.5 hidden truncate text-xs text-ink/55 sm:block">{page.note}</p>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2.5 sm:gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-[#fbf7f0] px-3.5 py-2 text-xs font-semibold text-ink/65 ring-1 ring-black/5 xl:inline-flex">
            <CalendarDays className="h-4 w-4 text-copper" />
            {today}
          </span>

          {referralCode && active && !pending && (
            <button
              type="button"
              onClick={copy}
              title="Copy your referral code"
              className="group hidden items-center gap-2.5 rounded-full bg-gradient-to-r from-copper-light to-copper-dark py-1.5 pl-3.5 pr-1.5 text-white shadow-md shadow-copper/30 transition hover:-translate-y-0.5 md:inline-flex"
            >
              <Gift className="h-4 w-4" />
              <span className="font-sans text-sm font-extrabold tabular-nums tracking-wider">{referralCode}</span>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 transition group-hover:bg-white/35">
                {copied ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <Copy className="h-3.5 w-3.5" />}
              </span>
            </button>
          )}

          <span
            className={`hidden items-center gap-2 rounded-full px-3.5 py-2 text-xs font-bold ring-1 sm:inline-flex ${status.pill}`}
          >
            <span className={`h-2 w-2 rounded-full ${status.dot}`} />
            {status.text}
          </span>

          {/* Your menu */}
          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setMenu((v) => !v)}
              aria-expanded={menu}
              aria-haspopup="menu"
              className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-2.5 shadow-sm ring-1 ring-black/10 transition hover:ring-copper"
            >
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white">
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
                className="absolute right-0 top-full z-50 mt-3 w-64 overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-20px_rgba(110,60,20,0.5)] ring-1 ring-black/10"
              >
                <div className="border-b border-black/5 bg-[#fbf7f0] px-4 py-3.5">
                  <p className="truncate text-sm font-bold text-ink">{name}</p>
                  <p className={`mt-1.5 inline-flex items-center gap-1.5 text-xs font-semibold ${status.pill.split(" ")[1]}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                    {status.text}
                  </p>
                </div>
                <div className="p-2">
                  {[
                    { href: "/dashboard/profile", icon: UserRound, label: "My Profile" },
                    { href: "/contact", icon: PhoneCall, label: "Contact us" },
                    { href: "/", icon: Home, label: "Back to website" },
                  ].map(({ href, icon: ItemIcon, label }) => (
                    <a
                      key={label}
                      href={href}
                      role="menuitem"
                      onClick={() => setMenu(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-ink/80 transition hover:bg-copper/10 hover:text-copper"
                    >
                      <ItemIcon className="h-4 w-4" />
                      {label}
                    </a>
                  ))}
                  <form action={logout} className="mt-1 border-t border-black/5 pt-1">
                    <button
                      type="submit"
                      role="menuitem"
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-rose-700 transition hover:bg-rose-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
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
