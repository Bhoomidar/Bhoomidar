"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, Search } from "lucide-react";

const MAX_HEIGHT = 300;

// How the closed field looks. The list always looks the same.
const VARIANTS = {
  // a form field inside a card or pop-up
  field:
    "rounded-2xl border border-black/10 bg-white py-3 text-sm text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.35)]",
  // a bigger field, for the website's contact form
  form: "rounded-xl border border-black/10 bg-white py-3.5 text-[15px] text-ink shadow-sm",
  // next to a search box above a table
  toolbar:
    "rounded-2xl border border-black/10 bg-white py-3.5 text-sm font-medium text-ink shadow-[0_8px_20px_-14px_rgba(110,60,20,0.45)]",
  // a small filter in a heading
  pill: "rounded-xl border border-black/10 bg-white py-2.5 text-sm font-semibold text-ink/80 shadow-sm",
  // inside a small pop-over
  inset: "rounded-lg border border-black/10 bg-[#fbf7f0] py-2 text-sm text-ink",
  // month and year in the calendar
  mini: "rounded-lg bg-[#fbf7f0] py-1.5 text-sm font-semibold text-ink ring-1 ring-black/5 hover:ring-copper/40",
};

const PAD = {
  mini: ["pl-2.5", "pr-2"],
  inset: ["pl-3", "pr-2.5"],
};

const asItem = (o) => (o !== null && typeof o === "object" ? o : { value: o, label: String(o) });

// A styled replacement for <select>. The list is drawn on the page itself, so
// no card, table or pop-up can cut it off, and it opens upwards when there is
// no room below.
//
//  options    ["a", "b"]  or  [{ value, label, hint?, icon?, avatarUrl?, avatar? }]
//  value / onChange(value)   controlled, or defaultValue and read it from a form
//  name       submits the chosen value with a form
//  searchable adds a search box to the list (for long lists)
export default function Select({
  options,
  value,
  defaultValue,
  onChange,
  name,
  id,
  placeholder = "Choose",
  icon: Icon,
  required = false,
  disabled = false,
  searchable = false,
  variant = "field",
  wrapperClassName = "",
  className = "",
  menuMinWidth = 0,
  ariaLabel,
}) {
  const uid = useId();
  const listId = `${uid}-list`;
  const items = useMemo(() => options.map(asItem), [options]);

  const controlled = value !== undefined;
  const [inner, setInner] = useState(defaultValue ?? "");
  const current = controlled ? value : inner;
  const selected = items.find((i) => String(i.value) === String(current));

  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(null);
  const [query, setQuery] = useState("");

  const btnRef = useRef(null);
  const listRef = useRef(null);
  const searchRef = useRef(null);

  const term = query.trim().toLowerCase();
  const shown = searchable && term ? items.filter((i) => `${i.label} ${i.hint ?? ""}`.toLowerCase().includes(term)) : items;

  const openList = () => {
    if (open || disabled) return;
    const i = items.findIndex((it) => String(it.value) === String(current));
    setQuery("");
    setActive(i >= 0 ? i : 0);
    setOpen(true);
  };

  const close = (refocus = true) => {
    setOpen(false);
    if (refocus) btnRef.current?.focus();
  };

  const choose = (item) => {
    if (!controlled) setInner(item.value);
    onChange?.(item.value);
    close();
  };

  // Close when clicking elsewhere.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!btnRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Place the list under the field; follow it on scroll.
  useLayoutEffect(() => {
    if (!open) return setPos(null);
    const place = () => {
      const r = btnRef.current.getBoundingClientRect();
      const h = Math.min(listRef.current?.scrollHeight ?? MAX_HEIGHT, MAX_HEIGHT + (searchable ? 64 : 0));
      let top = r.bottom + 8;
      if (top + h > window.innerHeight - 8 && r.top - 8 - h > 8) top = r.top - 8 - h;
      const width = Math.min(Math.max(r.width, menuMinWidth), window.innerWidth - 24);
      const left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12));
      setPos({ top, left, width });
    };
    place();
    const onScroll = (e) => !listRef.current?.contains(e.target) && place();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open, shown.length, menuMinWidth, searchable]);

  // Keep the highlighted row in view while using the arrow keys.
  useEffect(() => {
    if (open) listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, open, pos]);

  useEffect(() => {
    if (open && searchable) searchRef.current?.focus();
  }, [open, searchable]);

  const onKeyDown = (e) => {
    const k = e.key;
    if (!open) {
      if (k === "ArrowDown" || k === "ArrowUp" || k === "Enter" || k === " ") {
        e.preventDefault();
        openList();
      }
      return;
    }
    if (k === "Escape") {
      e.preventDefault();
      // do not let a pop-up or calendar behind the list close as well
      e.stopPropagation();
      e.nativeEvent.stopPropagation();
      close();
    } else if (k === "ArrowDown" || k === "ArrowUp") {
      e.preventDefault();
      const step = k === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + shown.length) % Math.max(shown.length, 1));
    } else if (k === "Home" || k === "End") {
      if (searchable) return;
      e.preventDefault();
      setActive(k === "Home" ? 0 : shown.length - 1);
    } else if (k === "Enter" || (k === " " && !searchable)) {
      e.preventDefault();
      if (shown[active]) choose(shown[active]);
    } else if (k === "Tab") {
      setOpen(false);
    } else if (!searchable && k.length === 1) {
      // type a letter to jump to the first option that starts with it
      const i = shown.findIndex((it) => it.label.toLowerCase().startsWith(k.toLowerCase()));
      if (i >= 0) setActive(i);
    }
  };

  const [padL, padR] = PAD[variant] ?? [Icon ? "pl-11" : "pl-4", "pr-3.5"];
  const chevron = variant === "mini" ? "h-3.5 w-3.5" : "h-4 w-4";

  return (
    <div className={`relative ${wrapperClassName}`}>
      {Icon && (
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-copper" />
      )}
      <button
        ref={btnRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => (open ? close(false) : openList())}
        onKeyDown={onKeyDown}
        className={`flex w-full cursor-pointer items-center gap-2 text-left outline-none transition focus-visible:border-copper focus-visible:ring-4 focus-visible:ring-copper/15 disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${padL} ${padR} ${
          open ? "border-copper ring-4 ring-copper/15" : ""
        } ${className}`}
      >
        <span className={`min-w-0 flex-1 [overflow-wrap:anywhere] ${selected ? "" : "text-ink/45"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className={`${chevron} shrink-0 text-copper/80 transition ${open ? "rotate-180" : ""}`} />
      </button>

      {name && <input type="hidden" name={name} value={current ?? ""} />}
      {/* lets the browser's "please fill in this field" speech bubble work */}
      {required && (
        <input
          tabIndex={-1}
          aria-hidden
          required
          value={current ?? ""}
          onChange={() => {}}
          onFocus={() => btnRef.current?.focus()}
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0"
        />
      )}

      {open &&
        createPortal(
          <div
            ref={listRef}
            data-select-menu
            onKeyDown={onKeyDown}
            style={{
              position: "fixed",
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              width: pos?.width ?? 240,
              zIndex: 1000,
              visibility: pos ? "visible" : "hidden",
            }}
            className="overflow-hidden rounded-2xl bg-white shadow-[0_30px_60px_-20px_rgba(110,60,20,0.5)] ring-1 ring-black/10"
          >
            {searchable && (
              <div className="border-b border-black/5 p-2">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-copper" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setActive(0);
                    }}
                    placeholder="Search..."
                    aria-label="Search the list"
                    className="w-full rounded-xl bg-[#fbf7f0] py-2 pl-9 pr-3 text-sm text-ink outline-none ring-1 ring-black/5 placeholder:text-ink/40 focus:ring-copper"
                  />
                </div>
              </div>
            )}

            <ul id={listId} role="listbox" style={{ maxHeight: MAX_HEIGHT }} className="overflow-y-auto p-1.5">
              {shown.length === 0 && <li className="px-4 py-6 text-center text-sm text-ink/55">Nothing found</li>}
              {shown.map((item, i) => {
                const isSel = String(item.value) === String(current);
                const ItemIcon = item.icon;
                return (
                  <li
                    key={`${item.value}-${i}`}
                    role="option"
                    aria-selected={isSel}
                    data-active={i === active}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => choose(item)}
                    onMouseEnter={() => setActive(i)}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
                      i === active ? "bg-copper/10 text-copper-dark" : "text-ink"
                    } ${isSel ? "font-semibold" : ""}`}
                  >
                    {item.avatar && (
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-xs font-bold text-white">
                        {item.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.avatarUrl} alt="" className="h-full w-full object-cover" />
                        ) : (
                          (item.label || "?")[0].toUpperCase()
                        )}
                      </span>
                    )}
                    {ItemIcon && !item.avatar && <ItemIcon className="h-[18px] w-[18px] shrink-0 text-copper" />}
                    <span className="min-w-0 flex-1 leading-snug">
                      <span className="block [overflow-wrap:anywhere]">{item.label}</span>
                      {item.hint && <span className="block [overflow-wrap:anywhere] text-xs font-normal text-ink/50">{item.hint}</span>}
                    </span>
                    {isSel && <Check className="h-4 w-4 shrink-0 text-copper" strokeWidth={3} />}
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body,
        )}
    </div>
  );
}

// A text field that suggests values while you type (a themed <datalist>).
// You can still type anything that is not in the list.
export function Suggest({ options, value, onChange, className = "", wrapperClassName = "", icon: Icon, ...rest }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [pos, setPos] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  const term = String(value ?? "").trim().toLowerCase();
  const shown = options.filter((o) => o.toLowerCase().includes(term) && o.toLowerCase() !== term);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!inputRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || shown.length === 0) return setPos(null);
    const place = () => {
      const r = inputRef.current.getBoundingClientRect();
      const h = Math.min(listRef.current?.scrollHeight ?? 200, 220);
      let top = r.bottom + 8;
      if (top + h > window.innerHeight - 8 && r.top - 8 - h > 8) top = r.top - 8 - h;
      setPos({ top, left: r.left, width: r.width });
    };
    place();
    const onScroll = (e) => !listRef.current?.contains(e.target) && place();
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open, shown.length]);

  const pick = (text) => {
    onChange(text);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open || shown.length === 0) return;
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + shown.length) % shown.length);
    } else if (e.key === "Enter" && active >= 0) {
      e.preventDefault();
      pick(shown[active]);
    } else if (e.key === "Escape") {
      e.stopPropagation();
      e.nativeEvent.stopPropagation();
      setOpen(false);
    }
  };

  return (
    <div className={`relative ${wrapperClassName}`}>
      {Icon && (
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-copper" />
      )}
      <input
        ref={inputRef}
        value={value}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        className={className}
        {...rest}
      />
      {open &&
        shown.length > 0 &&
        createPortal(
          <ul
            ref={listRef}
            data-select-menu
            role="listbox"
            style={{
              position: "fixed",
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              width: pos?.width ?? 240,
              maxHeight: 220,
              zIndex: 1000,
              visibility: pos ? "visible" : "hidden",
            }}
            className="overflow-y-auto rounded-2xl bg-white p-1.5 shadow-[0_30px_60px_-20px_rgba(110,60,20,0.5)] ring-1 ring-black/10"
          >
            {shown.map((o, i) => (
              <li
                key={o}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(o)}
                onMouseEnter={() => setActive(i)}
                className={`cursor-pointer [overflow-wrap:anywhere] rounded-xl px-3 py-2.5 text-sm transition ${
                  i === active ? "bg-copper/10 text-copper-dark" : "text-ink"
                }`}
              >
                {o}
              </li>
            ))}
          </ul>,
          document.body,
        )}
    </div>
  );
}
