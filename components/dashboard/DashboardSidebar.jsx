"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import {
  Building2,
  Handshake,
  Home,
  LayoutDashboard,
  LogOut,
  Menu,
  PhoneCall,
  UserRound,
  Wallet,
  X,
} from "lucide-react";
import Logo from "../Logo";
import { logout } from "@/actions/auth";

const groups = [
  {
    label: "Menu",
    items: [
      { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
      { icon: UserRound, label: "My Profile", href: "/dashboard/profile" },
      { icon: Wallet, label: "Commission", href: "/dashboard/commission", badge: "Soon" },
    ],
  },
  {
    label: "Explore",
    items: [
      { icon: Building2, label: "Properties", href: "/properties" },
      { icon: Handshake, label: "Partner Program", href: "/opportunities" },
      { icon: PhoneCall, label: "Contact Us", href: "/contact" },
      { icon: Home, label: "Back to Website", href: "/" },
    ],
  },
];

export default function DashboardSidebar({ name, email, initials }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
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
        className={`fixed inset-y-0 left-0 z-50 flex w-[86vw] max-w-sm flex-col lg:w-[272px] lg:max-w-none border-r border-white/5 bg-night transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-6 py-6">
          <Logo />
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="rounded-md p-1.5 text-white/70 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-7 overflow-y-auto px-4 pb-6 pt-2">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
                {group.label}
              </p>
              <ul className="mt-3 space-y-1">
                {group.items.map(({ icon: Icon, label, href, badge }) => {
                  const active = href === pathname;
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
                          className={`h-[18px] w-[18px] transition ${
                            active ? "text-copper-light" : "text-white/50 group-hover:text-copper-light"
                          }`}
                        />
                        {label}
                        {badge && (
                          <span className="ml-auto rounded-full bg-copper/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-copper-light">
                            {badge}
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
          <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white">
              {initials}
            </span>
            <span className="min-w-0 leading-tight">
              <span className="block truncate text-sm font-semibold text-white">
                {name}
              </span>
              <span className="mt-0.5 block truncate text-xs text-white/50">
                {email}
              </span>
            </span>
          </div>
          <form action={logout} className="mt-3">
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
