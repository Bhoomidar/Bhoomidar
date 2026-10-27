"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Building2,
  ChevronRight,
  Handshake,
  Home,
  Info,
  LayoutDashboard,
  LogIn,
  Menu,
  PhoneCall,
  X,
} from "lucide-react";
import Logo from "./Logo";
import { createClient } from "@/lib/supabase/client";
import { siteNavLinks } from "@/lib/data";

const LINK_ICONS = {
  Home,
  Properties: Building2,
  Partners: Handshake,
  About: Info,
  Contact: PhoneCall,
};

// One navbar for the whole site, partner page included. A "Partners" menu link
// leads to the partner page; the right side is Login + Contact Us.
export default function Navbar() {
  const links = siteNavLinks;
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);

  // Logged-in partners see "My Dashboard" instead of Login and the main button.
  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data }) => setUser(data.session?.user ?? null))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Phone menu: close on page change or Escape, and stop the page behind from scrolling.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const home = true; // every page has the same floating pill bar as the home page
  const wide = true;
  const showLogin = !user;
  const primaryHref = user ? "/dashboard" : "/contact";
  const primaryLabel = user ? "My Dashboard" : "Contact Us";

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          home
            ? scrolled
              ? "bg-transparent pt-2 lg:pt-3"
              : "bg-transparent pt-3 lg:pt-5"
            : scrolled
              ? "bg-night/90 shadow-lg shadow-black/20 backdrop-blur-md"
              : "bg-transparent"
        }`}
      >
        <div className={`container-x ${home ? "max-lg:!px-4 lg:!max-w-none lg:!px-[4.2vw]" : wide ? "lg:!max-w-none lg:!px-[4.2vw]" : ""}`}>
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            home
              ? `relative rounded-2xl border px-3 backdrop-blur-xl lg:rounded-full lg:px-5 ${
                  scrolled
                    ? "border-white/15 bg-night/85 py-2 shadow-[0_18px_44px_-14px_rgba(0,0,0,0.75)] lg:py-2.5"
                    : "border-white/20 bg-white/[0.07] py-2.5 shadow-[0_18px_44px_-18px_rgba(0,0,0,0.6)] lg:py-3.5"
                }`
              : scrolled
                ? "py-2"
                : "py-3"
          }`}
        >
          {home && (
            <span className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-copper-light/70 to-transparent" />
          )}
          <Logo size={home ? "h-8 sm:h-12" : "h-10 sm:h-12"} />

          <nav className={`hidden items-center lg:flex ${home ? "gap-1.5 rounded-full bg-black/20 p-1.5 ring-1 ring-white/10" : "gap-9"}`}>
            {links.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={
                  home
                    ? `rounded-full px-4 py-2 text-sm font-medium transition ${
                        link.href === pathname
                          ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                          : "text-white/85 hover:bg-white/10 hover:text-white"
                      }`
                    : `relative text-sm font-medium transition hover:text-copper-light ${
                        link.href === pathname
                          ? "text-copper-light after:absolute after:-bottom-2 after:left-0 after:right-0 after:h-0.5 after:rounded-full after:bg-copper-light"
                          : "text-white/90"
                      }`
                }
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-5 lg:flex">
            {showLogin && (
              <a
                href="/login"
                className={
                  home
                    ? "rounded-full border border-white/25 px-5 py-2.5 text-sm font-medium text-white transition hover:border-copper-light hover:text-copper-light"
                    : "text-sm font-medium text-white/90 transition hover:text-copper-light"
                }
              >
                Login
              </a>
            )}
            <a
              href={primaryHref}
              className={`btn-shimmer inline-flex items-center gap-2 bg-gradient-to-b from-copper-light to-copper-dark px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:brightness-110 ${home ? "rounded-full shadow-copper/40" : "rounded-lg shadow-black/20"}`}
            >
              {primaryLabel}
            </a>
          </div>

          <button
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20 lg:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        </div>
      </header>

      {/* Phone menu. Kept outside <header> because the header's blur would
          otherwise trap a fixed panel inside it. */}
      <div className="lg:hidden">
        <button
          aria-label="Close menu"
          tabIndex={open ? 0 : -1}
          onClick={() => setOpen(false)}
          className={`fixed inset-0 z-[55] bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${
            open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        />

        <aside
          aria-hidden={!open}
          className={`fixed inset-y-0 right-0 z-[60] flex w-[86vw] max-w-sm flex-col overflow-hidden border-l border-white/10 bg-night shadow-2xl transition-transform duration-300 ease-out ${
            open ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-copper/25 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-16 h-56 w-56 rounded-full bg-copper-light/10 blur-3xl" />

          <div className="relative flex items-center justify-between px-5 pb-4 pt-5">
            <Logo size="h-10" />
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              tabIndex={open ? 0 : -1}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="relative flex-1 overflow-y-auto px-4 pb-4 pt-2">
            <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/35">
              Menu
            </p>
            <ul className="space-y-1.5">
              {links.map((link, i) => {
                const Icon = LINK_ICONS[link.label] ?? Home;
                const active = link.href === pathname;
                return (
                  <li
                    key={link.label}
                    style={{ transitionDelay: open ? `${120 + i * 45}ms` : "0ms" }}
                    className={`transition duration-300 ${
                      open ? "translate-x-0 opacity-100" : "translate-x-6 opacity-0"
                    }`}
                  >
                    <a
                      href={link.href}
                      tabIndex={open ? 0 : -1}
                      onClick={() => setOpen(false)}
                      className={`group flex items-center gap-4 rounded-2xl px-3 py-3 text-[15px] font-semibold transition ${
                        active
                          ? "bg-gradient-to-r from-copper/30 to-copper/5 text-copper-light ring-1 ring-copper/30"
                          : "text-white/85 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                          active
                            ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                            : "bg-white/8 text-copper-light group-hover:bg-white/12"
                        }`}
                      >
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      {link.label}
                      <ChevronRight
                        className={`ml-auto h-4 w-4 ${active ? "text-copper-light" : "text-white/30"}`}
                      />
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="relative space-y-3 border-t border-white/10 p-5">
            {showLogin && (
              <a
                href="/login"
                tabIndex={open ? 0 : -1}
                onClick={() => setOpen(false)}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/25 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <LogIn className="h-4 w-4" />
                Login
              </a>
            )}
            <a
              href={primaryHref}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-copper-light to-copper-dark px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:brightness-110"
            >
              {user && <LayoutDashboard className="h-4 w-4" />}
              {primaryLabel}
            </a>
          </div>
        </aside>
      </div>
    </>
  );
}
