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
  Building2,
  Coins,
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-sm flex-col border-r border-white/5 bg-night transition-transform duration-300 lg:w-[272px] lg:max-w-none lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 pb-2 pt-6">
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
          <span className="mt-4 inline-block rounded-full bg-copper/20 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-copper-light">
            Admin Panel
          </span>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 pb-6 pt-4">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
                {group.label}
              </p>
              <ul className="mt-2.5 space-y-1">
                {group.items.map(({ icon: Icon, label, href, badgeKey }) => {
                  const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
                  const count = badgeKey ? badges[badgeKey] : 0;
                  return (
                    <li key={label}>
                      <a
                        href={href}
                        onClick={() => setOpen(false)}
                        className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                          active
                            ? "bg-gradient-to-r from-copper/30 to-copper/5 text-copper-light ring-1 ring-copper/30"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        <Icon
                          className={`h-[18px] w-[18px] ${
                            active ? "text-copper-light" : "text-white/50 group-hover:text-copper-light"
                          }`}
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

        <div className="border-t border-white/10 p-4">
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10"
          >
            <ExternalLink className="h-4 w-4" />
            View website
          </a>
          <p className="mt-3 truncate px-1 text-center text-xs text-white/45">{email}</p>
          <form action={adminLogout} className="mt-2">
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Log out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
