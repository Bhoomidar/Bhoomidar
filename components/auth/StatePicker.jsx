"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown, MapPin } from "lucide-react";
import { STATES, findState } from "@/lib/india";
import { iconClass } from "./fields";

const MAX_HEIGHT = 288;
const LIST_WIDTH = 360;

// State field: type to search, or pick from a styled list. Submits the two
// letter state code (UP, MH, ...) under `name`.
export default function StatePicker({
  id,
  name,
  defaultValue = "",
  className,
  autofill = null,
  onChange,
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    onChange?.(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  const [text, setText] = useState(findState(defaultValue)?.name ?? "");
  const [filtering, setFiltering] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [pos, setPos] = useState(null);

  const inputRef = useRef(null);
  const listRef = useRef(null);

  const term = text.trim().toLowerCase();
  const options =
    filtering && term ? STATES.filter((s) => s.name.toLowerCase().includes(term)) : STATES;

  // The pincode lookup can set the state for the partner.
  useEffect(() => {
    const s = autofill && findState(autofill.code);
    if (!s) return;
    setValue(s.code);
    setText(s.name);
    setFiltering(false);
  }, [autofill]);

  // Typed something that is not a state: stop the form and say why.
  useEffect(() => {
    inputRef.current?.setCustomValidity(text && !value ? "Please choose your state from the list." : "");
  }, [text, value]);

  const close = () => {
    setOpen(false);
    setFiltering(false);
    setText(findState(value)?.name ?? "");
  };

  // Close when clicking elsewhere.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!inputRef.current?.contains(e.target) && !listRef.current?.contains(e.target)) close();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, value]);

  // The list is drawn on the page itself, so no card around the field can cut
  // it. It follows the field on scroll and opens upwards when there is no room.
  useLayoutEffect(() => {
    if (!open) return setPos(null);
    const place = () => {
      const r = inputRef.current.getBoundingClientRect();
      const h = Math.min(listRef.current?.scrollHeight ?? MAX_HEIGHT, MAX_HEIGHT);
      let top = r.bottom + 8;
      if (top + h > window.innerHeight - 8 && r.top - 8 - h > 8) top = r.top - 8 - h;
      // Wider than the field itself, so long names like "Dadra and Nagar Haveli..." fit.
      const width = Math.min(Math.max(r.width, LIST_WIDTH), window.innerWidth - 24);
      const left = Math.max(12, Math.min(r.left, window.innerWidth - width - 12));
      setPos({ top, left, width });
    };
    place();
    window.addEventListener("scroll", place, true);
    window.addEventListener("resize", place);
    return () => {
      window.removeEventListener("scroll", place, true);
      window.removeEventListener("resize", place);
    };
  }, [open, options.length]);

  // Keep the highlighted row in view while using the arrow keys.
  useEffect(() => {
    if (open) listRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, open, pos]);

  const openList = () => {
    if (open) return;
    const i = options.findIndex((s) => s.code === value);
    setActive(i >= 0 ? i : 0);
    setOpen(true);
  };

  const choose = (s) => {
    setValue(s.code);
    setText(s.name);
    setFiltering(false);
    setOpen(false);
  };

  const onType = (e) => {
    const next = e.target.value;
    const exact = STATES.find((s) => s.name.toLowerCase() === next.trim().toLowerCase());
    setText(next);
    setFiltering(true);
    setValue(exact?.code ?? "");
    setActive(0);
    setOpen(true);
  };

  const onKeyDown = (e) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) return openList();
      const step = e.key === "ArrowDown" ? 1 : -1;
      setActive((i) => (i + step + options.length) % Math.max(options.length, 1));
    } else if (e.key === "Enter" && open) {
      e.preventDefault();
      if (options[active]) choose(options[active]);
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      close();
    } else if (e.key === "Tab" && open) {
      close();
    }
  };

  return (
    <>
      <MapPin className={iconClass} />
      <input
        ref={inputRef}
        required
        id={id}
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        autoComplete="off"
        placeholder="Select state"
        value={text}
        onChange={onType}
        onFocus={(e) => {
          e.target.select();
          openList();
        }}
        onClick={openList}
        onKeyDown={onKeyDown}
        className={`${className} pr-12`}
      />
      <input type="hidden" name={name} value={value} />
      <ChevronDown
        className={`pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-copper/70 transition ${
          open ? "rotate-180" : ""
        }`}
      />

      {open &&
        createPortal(
          <ul
            ref={listRef}
            id={`${id}-list`}
            role="listbox"
            style={{
              position: "fixed",
              top: pos?.top ?? 0,
              left: pos?.left ?? 0,
              width: pos?.width ?? 280,
              maxHeight: MAX_HEIGHT,
              zIndex: 1000,
              visibility: pos ? "visible" : "hidden",
            }}
            className="overflow-y-auto rounded-2xl bg-white p-2 shadow-[0_30px_60px_-20px_rgba(110,60,20,0.5)] ring-1 ring-black/10"
          >
            {options.length === 0 && (
              <li className="px-4 py-6 text-center text-sm text-ink/55">No state found</li>
            )}
            {options.map((s, i) => {
              const selected = s.code === value;
              return (
                <li
                  key={s.code}
                  role="option"
                  aria-selected={selected}
                  data-active={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(s)}
                  onMouseEnter={() => setActive(i)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl px-4 py-2.5 text-[15px] transition ${
                    i === active ? "bg-copper/10 text-copper-dark" : "text-ink"
                  } ${selected ? "font-semibold" : ""}`}
                >
                  <span className="min-w-0 flex-1 leading-snug">{s.name}</span>
                  {selected ? (
                    <Check className="h-4 w-4 shrink-0 text-copper" strokeWidth={3} />
                  ) : (
                    <span className="shrink-0 font-mono text-[11px] text-ink/35">{s.code}</span>
                  )}
                </li>
              );
            })}
          </ul>,
          document.body,
        )}
    </>
  );
}
