"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  FileText,
  Handshake,
  Home,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  CircleHelp,
  MessageSquareQuote,
  Network,
  PhoneCall,
  ShieldCheck,
  Building2,
  Coins,
  Trophy,
  ShoppingBag,
  Users,
  Wallet,
  X,
} from "lucide-react";
import Logo from "../Logo";
import { adminLogout } from "@/actions/admin/auth";

const groups = [
  {
    label: "Overview",
    items: [
      { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
      { icon: Users, label: "Partners", href: "/admin/partners" },
      { icon: Network, label: "Referral Tree", href: "/admin/network" },
      { icon: ShoppingBag, label: "Sales", href: "/admin/sales" },
      { icon: Trophy, label: "Commission Plan", href: "/admin/plan" },
      { icon: Coins, label: "Points & Payouts", href: "/admin/payouts" },
      { icon: Wallet, label: "Payment Details", href: "/admin/payment" },
      { icon: Inbox, label: "Inquiries", href: "/admin/inquiries", badgeKey: "inquiries" },
    ],
  },
  {
    label: "Customize Website",
    items: [
      { icon: Home, label: "Home Page", href: "/admin/home" },
      { icon: FileText, label: "About Page", href: "/admin/about" },
      { icon: Handshake, label: "Partner Page", href: "/admin/partner-page" },
      { icon: PhoneCall, label: "Contact Info", href: "/admin/contact" },
    ],
  },
  {
    label: "Content",
    items: [
      { icon: Building2, label: "Properties", href: "/admin/properties" },
      { icon: MessageSquareQuote, label: "Testimonials", href: "/admin/testimonials" },
      { icon: CircleHelp, label: "FAQs", href: "/admin/faqs" },
    ],
  },
];

export default function AdminSidebar({ email, newInquiries }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const badges = { inquiries: newInquiries };

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-night px-5 py-3 lg:hidden">
        <Logo />
        <button
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-white"
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open && (
        <button
          aria-label="Close menu"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-sm flex-col overflow-hidden border-r border-white/5 bg-gradient-to-b from-[#1a130e] via-[#120d0a] to-[#0d0907] transition-transform duration-300 lg:w-[272px] lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-copper/15 blur-3xl" />

        <div className="relative px-5 pb-2 pt-6">
          <div className="flex items-center justify-between">
            <Logo />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="rounded-md p-1.5 text-white/70 lg:hidden"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-copper/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-copper-light ring-1 ring-copper/30">
            <ShieldCheck className="h-3 w-3" />
            Admin Panel
          </span>
        </div>

        <nav className="relative flex-1 overflow-y-auto px-4 pb-4 pt-3">
          {groups.map((group, gi) => (
            <div key={group.label} className={gi > 0 ? "mt-5 border-t border-white/10 pt-5" : ""}>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/40">
                {group.label}
              </p>
              <ul className="mt-3 space-y-1.5">
                {group.items.map(({ icon: Icon, label, href, badgeKey }) => {
                  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                  const count = badgeKey ? badges[badgeKey] : 0;
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`group flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-[15px] font-medium transition ${
                          active
                            ? "bg-gradient-to-r from-copper/35 via-copper/15 to-copper/5 text-copper-light shadow-[0_0_28px_-8px_rgba(217,139,82,0.7)] ring-1 ring-copper/60"
                            : "text-white/75 hover:bg-white/[0.06] hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`h-5 w-5 shrink-0 transition ${
                            active ? "text-copper-light" : "text-white/55 group-hover:text-copper-light"
                          }`}
                          strokeWidth={1.7}
                        />
                        {label}
                        {count > 0 && (
                          <span className="ml-auto rounded-full bg-copper px-2 py-0.5 text-[10px] font-bold text-white">
                            {count}
                          </span>
                        )}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="relative space-y-3 border-t border-white/10 p-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="group flex items-center gap-3 rounded-2xl bg-white/[0.06] p-3 ring-1 ring-white/10 transition hover:bg-white/10 hover:ring-copper/40"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white shadow-md ring-2 ring-white/20">
              {(email?.[0] ?? "A").toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 leading-tight">
              <span className="block truncate text-sm font-semibold text-white">View website</span>
              <span className="mt-1 block truncate text-xs text-white/50">{email}</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-white/40 transition group-hover:text-copper-light" />
          </a>

          <form action={adminLogout}>
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-2xl border border-rose-500/45 bg-rose-500/[0.06] px-4 py-3 text-sm font-semibold text-rose-400 transition hover:bg-rose-500/15 hover:text-rose-300"
            >
              <LogOut className="h-5 w-5" strokeWidth={1.8} />
              Log out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
