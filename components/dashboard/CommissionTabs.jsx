"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, Gift, History, LayoutDashboard, Trophy } from "lucide-react";

const ICONS = { overview: LayoutDashboard, bonuses: Gift, rank: Trophy, history: History };

// The commission page split in a few tabs, so a partner sees one thing at a time.
//   tabs:   [{ id, label, hint, alias? }]   alias = other #hash names that open this tab
//   panels: { [id]: the content of that tab }  (all are rendered, only the open one is shown)
export default function CommissionTabs({ tabs, panels }) {
  const [active, setActive] = useState(tabs[0].id);
  const listRef = useRef(null);

  // A link like "#plan" opens that tab and brings the tabs into view.
  const fromHash = () => {
    const hash = window.location.hash.replace("#", "");
    const hit = tabs.find((t) => t.id === hash || t.alias?.includes(hash));
    if (!hit) return;
    setActive(hit.id);
    requestAnimationFrame(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  useEffect(() => {
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const open = (id) => {
    setActive(id);
    try {
      window.history.replaceState(null, "", `#${id}`);
    } catch {}
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div ref={listRef} role="tablist" aria-label="Commission sections" className="relative z-10 scroll-mt-28 grid grid-cols-4 gap-1.5 rounded-2xl bg-white p-1.5 shadow-sm ring-1 ring-black/5 sm:gap-2 sm:p-2">
        {tabs.map((t) => {
          const Icon = ICONS[t.id] ?? Clock;
          const on = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => open(t.id)}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2.5 text-center transition sm:flex-row sm:gap-2.5 sm:px-4 sm:py-3 ${
                on
                  ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30"
                  : "text-ink/65 hover:bg-copper/10 hover:text-copper-dark"
              }`}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="min-w-0 leading-tight">
                <span className="block text-[11px] font-bold sm:text-sm">
                  {t.short ? (
                    <>
                      <span className="sm:hidden">{t.short}</span>
                      <span className="hidden sm:inline">{t.label}</span>
                    </>
                  ) : (
                    t.label
                  )}
                </span>
                {t.hint && <span className={`hidden text-[11px] sm:block ${on ? "text-white/80" : "text-ink/45"}`}>{t.hint}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" hidden={t.id !== active}>
          {panels[t.id]}
        </div>
      ))}
    </div>
  );
}
