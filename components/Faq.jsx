"use client";

import { useState } from "react";
import Image from "next/image";
import { ArrowRight, Minus, Plus } from "lucide-react";
import Reveal from "./Reveal";
import { LeafArt } from "@/components/dashboard/StatArt";

// Home page questions. One answer is open at a time; the first one starts open.
// The questions come from the admin panel (FAQs page).
export default function Faq({ c, faqs, hideHelp = false }) {
  const [open, setOpen] = useState(0);

  // Search engines can show these as answers. "<" is escaped so nothing in the text can close the tag.
  const schema = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  }).replace(/</g, "\\u003c");

  return (
    <section id="faq" className="relative overflow-hidden bg-gradient-to-b from-[#fdf3e4] to-[#fbe7d0] pb-56 pt-20 lg:pb-32 lg:pt-28">
      <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-[#f0c58f]/25 blur-3xl" />

      {/* a big soft circle, with the house standing in front of it */}
      <div
        className="pointer-events-none absolute -bottom-[7vw] left-[1.5%] hidden aspect-square w-[34vw] rounded-full border border-white/70 bg-gradient-to-b from-[#fbd9b6]/60 to-[#fbd9b6]/10 lg:block"
        aria-hidden
      />
      {c.homefaq_image && (
        <div
          className="pointer-events-none absolute bottom-0 left-[-3%] w-[92vw] translate-y-[4.5%] sm:w-[70vw] lg:w-[44vw]"
          aria-hidden
        >
          <Image
            src={c.homefaq_image}
            alt=""
            width={1536}
            height={1024}
            sizes="(min-width: 1024px) 44vw, 92vw"
            className="h-auto w-full"
          />
        </div>
      )}
      <LeafArt className="pointer-events-none absolute -right-3 top-[62%] hidden h-32 w-24 -rotate-12 opacity-70 lg:block" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schema }} />

      <div className="container-x lg:!max-w-none lg:!px-[4.2vw] relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
            <span className="h-px w-8 bg-copper" />
            {c.homefaq_label}
          </p>
          <h2 className="mt-4 font-display text-4xl font-bold leading-[1.12] text-ink sm:text-5xl">
            {c.homefaq_title_1}
            <span className="block text-copper">{c.homefaq_title_accent}</span>
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink/70">{c.homefaq_text}</p>

          {!hideHelp && (
          <div className="mt-8 max-w-md rounded-2xl bg-white/70 p-6 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.35)] ring-1 ring-white/80 backdrop-blur-sm lg:mt-10 lg:max-w-[31rem]">
            <p className="font-display text-xl font-bold text-ink">{c.homefaq_help_title}</p>
            <p className="mt-2 text-sm leading-relaxed text-ink/65">{c.homefaq_help_text}</p>
            <a
              href="/contact"
              className="group mt-5 inline-flex items-center gap-2.5 rounded-lg bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:-translate-y-0.5"
            >
              {c.homefaq_help_button}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </a>
          </div>
          )}
        </Reveal>

        <Reveal delay={100}>
          <ul className="space-y-2.5 lg:space-y-3">
            {faqs.map((f, i) => {
              const isOpen = open === i;
              return (
                <li
                  key={f.id}
                  className={`overflow-hidden rounded-xl bg-white/80 shadow-[0_12px_26px_-20px_rgba(110,60,20,0.35)] ring-1 backdrop-blur-sm transition ${
                    isOpen ? "ring-copper/30" : "ring-white/80 hover:ring-copper/25"
                  }`}
                >
                  <h3>
                    <button
                      type="button"
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-${f.id}`}
                      className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left font-display text-[17px] font-bold text-ink sm:px-6 sm:text-xl lg:py-[14px]"
                    >
                      {f.question}
                      <span
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition duration-300 ${
                          isOpen ? "bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-md shadow-copper/30" : "bg-[#fbe6d3] text-copper"
                        }`}
                      >
                        {isOpen ? <Minus className="h-4 w-4" strokeWidth={2.5} /> : <Plus className="h-4 w-4" strokeWidth={2.5} />}
                      </span>
                    </button>
                  </h3>
                  <div
                    id={`faq-${f.id}`}
                    role="region"
                    className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl whitespace-pre-line px-5 pb-5 pt-1 text-[15px] leading-relaxed text-ink/70 sm:px-6">
                        {f.answer}
                      </p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
