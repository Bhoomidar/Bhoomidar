"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Select from "./Select";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const POP_WIDTH = 304;

const pad = (n) => String(n).padStart(2, "0");
const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const toText = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : "");
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();
const todayISO = () => {
  const n = new Date();
  return toISO(n.getFullYear(), n.getMonth(), n.getDate());
};

// "25102026" -> "25/10/2026" while the person types.
const maskText = (raw) => {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("/");
};

// "25/10/2026" -> "2026-10-25" when it is a real date inside min..max, otherwise "".
const parseText = (text, min, max) => {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!m) return "";
  const [d, mo, y] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  if (mo < 0 || mo > 11 || d < 1 || d > daysIn(y, mo)) return "";
  const iso = toISO(y, mo, d);
  return iso >= min && iso <= max ? iso : "";
};

// A date field: type it (dd/mm/yyyy) or pick it from a themed calendar.
// `value` and `onChange` use yyyy-mm-dd, like <input type="date"> does.
export default function DatePicker({
  id,
  value = "",
  onChange,
  min,
  max,
  required = false,
  placeholder = "dd/mm/yyyy",
  message = "Enter a valid date as dd/mm/yyyy.",
  className = "",
  wrapperClassName = "",
}) {
  const thisYear = new Date().getFullYear();
  const lo = min ?? `${thisYear - 30}-01-01`;
  const hi = max ?? `${thisYear + 1}-12-31`;
  const minYear = Number(lo.slice(0, 4));
  const maxYear = Number(hi.slice(0, 4));

  const [text, setText] = useState(toText(value));
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(() => {
    const start = value || todayISO();
    return { y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 };
  });
  const [pos, setPos] = useState(null);

  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const popRef = useRef(null);

  // The parent changed the date (for example the form was cleared).
  useEffect(() => {
    if (value !== parseText(text, lo, hi)) setText(toText(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // A half-typed or impossible date blocks the form with a clear message.
  useEffect(() => {
    inputRef.current?.setCustomValidity(text && !value ? message : "");
  }, [text, value, message]);

  // Drawn on the page itself, so no card or pop-up around the field can cut it.
  useLayoutEffect(() => {
    if (!open) return setPos(null);
    const place = () => {
      const r = wrapRef.current.getBoundingClientRect();
      const h = popRef.current?.offsetHeight ?? 400;
      const left = Math.max(12, Math.min(r.left, window.innerWidth - POP_WIDTH - 12));
      let top = r.bottom + 8;
      if (top + h > window.innerHeight - 8 && r.top - 8 - h > 8) top = r.top - 8 - h;
      setPos({ top, left });
    };
    place();
    const onScroll = (e) => !popRef.current?.contains(e.target) && place();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open, view.y, view.m]);

  // Close when clicking elsewhere (the month and year lists count as inside).
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (
        !wrapRef.current?.contains(e.target) &&
        !popRef.current?.contains(e.target) &&
        !e.target.closest?.("[data-select-menu]")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const set = (iso) => {
    onChange?.(iso);
    if (iso) setView({ y: Number(iso.slice(0, 4)), m: Number(iso.slice(5, 7)) - 1 });
  };

  const onType = (e) => {
    const next = maskText(e.target.value);
    setText(next);
    set(parseText(next, lo, hi));
  };

  const pick = (iso) => {
    setText(toText(iso));
    set(iso);
    setOpen(false);
    inputRef.current?.focus();
  };

  const go = (delta) =>
    setView(({ y, m }) => {
      const t = y * 12 + m + delta;
      return { y: Math.floor(t / 12), m: t % 12 };
    });

  const onKeyDown = (e) => {
    if (e.key === "Escape" && open) {
      // only the calendar closes, not a pop-up behind it
      e.stopPropagation();
      e.nativeEvent.stopPropagation();
      setOpen(false);
      inputRef.current?.focus();
    }
  };

  const canPrev = view.y * 12 + view.m > minYear * 12;
  const canNext = view.y * 12 + view.m < maxYear * 12 + 11;
  const blanks = new Date(view.y, view.m, 1).getDay();
  const days = Array.from({ length: daysIn(view.y, view.m) }, (_, i) => i + 1);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);
  const today = todayISO();

  const nav =
    "flex h-9 w-9 items-center justify-center rounded-full text-ink/70 transition enabled:hover:bg-copper/10 enabled:hover:text-copper disabled:opacity-30";

  return (
    <div ref={wrapRef} className={`relative ${wrapperClassName}`}>
      <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-copper" />
      <input
        ref={inputRef}
        id={id}
        required={required}
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        placeholder={placeholder}
        value={text}
        onChange={onType}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        onKeyDown={onKeyDown}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={className}
      />
      <button
        type="button"
        tabIndex={-1}
        aria-label="Open calendar"
        onClick={() => setOpen((v) => !v)}
        className="absolute right-2.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink/45 transition hover:bg-copper/10 hover:text-copper"
      >
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {open &&
        createPortal(
          <div
            ref={popRef}
            role="dialog"
            aria-label="Choose a date"
            onKeyDown={onKeyDown}
            style={{
              position: "fixed",
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              width: POP_WIDTH,
              zIndex: 1000,
              visibility: pos ? "visible" : "hidden",
            }}
            className="rounded-3xl bg-white p-4 shadow-[0_30px_60px_-20px_rgba(110,60,20,0.5)] ring-1 ring-black/10"
          >
            <div className="flex items-center justify-between gap-2">
              <button type="button" className={nav} disabled={!canPrev} onClick={() => go(-1)} aria-label="Previous month">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center gap-2">
                <Select
                  variant="mini"
                  ariaLabel="Month"
                  value={view.m}
                  onChange={(m) => setView((v) => ({ ...v, m: Number(m) }))}
                  options={MONTHS.map((name, i) => ({ value: i, label: name }))}
                  menuMinWidth={150}
                />
                <Select
                  variant="mini"
                  ariaLabel="Year"
                  value={view.y}
                  onChange={(y) => setView((v) => ({ ...v, y: Number(y) }))}
                  options={years.map((y) => ({ value: y, label: String(y) }))}
                  menuMinWidth={100}
                />
              </div>
              <button type="button" className={nav} disabled={!canNext} onClick={() => go(1)} aria-label="Next month">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wider text-copper">
              {WEEKDAYS.map((d) => (
                <span key={d} className="py-1">
                  {d}
                </span>
              ))}
            </div>

            <div className="mt-1 grid grid-cols-7 gap-y-1 text-center">
              {Array.from({ length: blanks }, (_, i) => (
                <span key={`b${i}`} />
              ))}
              {days.map((d) => {
                const iso = toISO(view.y, view.m, d);
                const disabled = iso < lo || iso > hi;
                const selected = iso === value;
                const isToday = iso === today;
                return (
                  <button
                    key={d}
                    type="button"
                    disabled={disabled}
                    onClick={() => pick(iso)}
                    aria-label={`${d} ${MONTHS[view.m]} ${view.y}`}
                    aria-pressed={selected}
                    className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                      selected
                        ? "bg-gradient-to-b from-copper-light to-copper-dark font-bold text-white shadow-md shadow-copper/40"
                        : disabled
                          ? "text-ink/20"
                          : isToday
                            ? "bg-copper/10 font-bold text-copper-dark ring-1 ring-copper/40 hover:bg-copper/20"
                            : "text-ink hover:bg-copper/10 hover:text-copper"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-sm">
              {required ? (
                <span className="text-xs text-ink/45">Type it or pick a day</span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setText("");
                    set("");
                    setOpen(false);
                  }}
                  className="font-semibold text-copper hover:text-copper-dark"
                >
                  Clear
                </button>
              )}
              <button
                type="button"
                disabled={today < lo || today > hi}
                onClick={() => pick(today)}
                className="rounded-full bg-copper/10 px-3.5 py-1.5 font-semibold text-copper-dark transition hover:bg-copper/20 disabled:opacity-40"
              >
                Today
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
