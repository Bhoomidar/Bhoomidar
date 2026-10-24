"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import Select from "@/components/Select";
import { iconClass } from "./fields";

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
const POP_WIDTH = 304;
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const pad = (n) => String(n).padStart(2, "0");
const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
const toText = (iso) => (iso ? `${iso.slice(8, 10)}/${iso.slice(5, 7)}/${iso.slice(0, 4)}` : "");
const daysIn = (y, m) => new Date(y, m + 1, 0).getDate();

// "01121995" -> "01/12/1995" while the person types.
function maskText(raw) {
  const d = raw.replace(/\D/g, "").slice(0, 8);
  return [d.slice(0, 2), d.slice(2, 4), d.slice(4)].filter(Boolean).join("/");
}

// "01/12/1995" -> "1995-12-01" when it is a real date inside min..max, otherwise "".
function parseText(text, min, max) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!m) return "";
  const [d, mo, y] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  if (mo < 0 || mo > 11 || d < 1 || d > daysIn(y, mo)) return "";
  const iso = toISO(y, mo, d);
  return iso >= min && iso <= max ? iso : "";
}

// Date of birth field: type it (dd/mm/yyyy) or pick it from a calendar that
// lets you jump straight to a month and year. Submits as yyyy-mm-dd under `name`.
export default function DobPicker({
  id,
  name,
  defaultValue = "",
  min,
  max,
  className,
  hint = "You must be 18 or older",
  message = "Enter a valid date of birth as dd/mm/yyyy. You must be 18 or older.",
}) {
  const [value, setValue] = useState(defaultValue);
  const [text, setText] = useState(toText(defaultValue));
  const [open, setOpen] = useState(false);

  const minYear = Number(min.slice(0, 4));
  const maxYear = Number(max.slice(0, 4));
  const [view, setView] = useState(() => {
    const start = defaultValue || toISO(Math.min(maxYear, new Date().getFullYear() - 30), 0, 1);
    return { y: Number(start.slice(0, 4)), m: Number(start.slice(5, 7)) - 1 };
  });

  const inputRef = useRef(null);
  const popRef = useRef(null);
  const [pos, setPos] = useState(null);

  // The calendar is drawn on the page itself (not inside the form), so no panel
  // or card around the field can cover or cut it. It follows the field on scroll,
  // and opens upwards when there is no room below.
  useLayoutEffect(() => {
    if (!open) return setPos(null);
    const place = () => {
      const r = inputRef.current.getBoundingClientRect();
      const h = popRef.current?.offsetHeight ?? 400;
      const left = Math.max(12, Math.min(r.left, window.innerWidth - POP_WIDTH - 12));
      let top = r.bottom + 8;
      if (top + h > window.innerHeight - 8 && r.top - 8 - h > 8) top = r.top - 8 - h;
      setPos({ top, left });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, view.y, view.m]);

  // A half-typed or impossible date blocks the form with a clear message.
  useEffect(() => {
    inputRef.current?.setCustomValidity(
      text && !value ? message : "",
    );
  }, [text, value]);

  // Close when clicking elsewhere or pressing Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      // the month and year lists are drawn outside the calendar, so ignore them
      if (
        !inputRef.current?.contains(e.target) &&
        !popRef.current?.contains(e.target) &&
        !e.target.closest?.("[data-select-menu]")
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onType = (e) => {
    const next = maskText(e.target.value);
    const iso = parseText(next, min, max);
    setText(next);
    setValue(iso);
    if (iso) setView({ y: Number(iso.slice(0, 4)), m: Number(iso.slice(5, 7)) - 1 });
  };

  const pick = (d) => {
    const iso = toISO(view.y, view.m, d);
    setValue(iso);
    setText(toText(iso));
    setOpen(false);
  };

  const clear = () => {
    setValue("");
    setText("");
    setOpen(false);
  };

  const go = (delta) =>
    setView(({ y, m }) => {
      const t = y * 12 + m + delta;
      return { y: Math.floor(t / 12), m: t % 12 };
    });

  const canPrev = view.y * 12 + view.m > minYear * 12;
  const canNext = view.y * 12 + view.m < Number(max.slice(0, 4)) * 12 + Number(max.slice(5, 7)) - 1;

  const blanks = new Date(view.y, view.m, 1).getDay();
  const days = Array.from({ length: daysIn(view.y, view.m) }, (_, i) => i + 1);
  const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => maxYear - i);

  const nav =
    "flex h-9 w-9 items-center justify-center rounded-full text-ink/70 transition enabled:hover:bg-copper/10 enabled:hover:text-copper disabled:opacity-30";

  return (
    <>
      <CalendarDays className={iconClass} />
      <input
        ref={inputRef}
        required
        id={id}
        inputMode="numeric"
        autoComplete="off"
        maxLength={10}
        placeholder="dd/mm/yyyy"
        value={text}
        onChange={onType}
        onFocus={() => setOpen(true)}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        title={hint}
        className={className}
      />
      <input type="hidden" name={name} value={value} />

      {open &&
        createPortal(
        <div
          ref={popRef}
          role="dialog"
          aria-label="Choose date of birth"
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
              const disabled = iso < min || iso > max;
              const selected = iso === value;
              return (
                <button
                  key={d}
                  type="button"
                  disabled={disabled}
                  onClick={() => pick(d)}
                  aria-label={`${d} ${MONTHS[view.m]} ${view.y}`}
                  aria-pressed={selected}
                  className={`mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition ${
                    selected
                      ? "bg-gradient-to-b from-copper-light to-copper-dark font-bold text-white shadow-md shadow-copper/40"
                      : disabled
                        ? "text-ink/20"
                        : "text-ink hover:bg-copper/10 hover:text-copper"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-black/5 pt-3 text-xs">
            <button type="button" onClick={clear} className="font-semibold text-copper hover:text-copper-dark">
              Clear
            </button>
            <span className="text-ink/50">{hint}</span>
          </div>
        </div>,
        document.body,
        )}
    </>
  );
}
