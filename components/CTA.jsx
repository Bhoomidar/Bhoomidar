import Image from "next/image";
import { ArrowRight, IndianRupee } from "lucide-react";
import Reveal from "./Reveal";

export default function CTA({ c }) {
  return (
    <section className="relative overflow-hidden bg-night">
      <Image
        src={c.cta_image}
        alt=""
        fill
        sizes="100vw"
        className="object-cover object-[center_45%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#060d18]/90 via-[#060d18]/55 to-transparent" />

      <div className="container-x relative flex flex-col items-start justify-between gap-8 py-12 lg:min-h-[280px] lg:flex-row lg:items-center">
        <Reveal className="max-w-lg">
          <h2 className="font-display text-4xl font-bold leading-[1.12] text-white sm:text-5xl">
            {c.cta_title_1}
            <span className="block text-copper-light">{c.cta_title_accent}</span>
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/80 lg:text-base">
            {c.cta_text}
          </p>
        </Reveal>

        <Reveal delay={150} className="w-full max-w-sm lg:w-80">
          <div className="rounded-2xl bg-white p-5 shadow-2xl">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-copper/30 bg-copper/10 text-copper">
                <IndianRupee className="h-5 w-5" />
              </span>
              <span className="leading-tight">
                <span className="block text-xs text-ink/60">{c.cta_fee_label}</span>
                <span className="block text-3xl font-bold text-ink">{c.cta_fee}</span>
              </span>
            </div>
            <a
              href="/register"
              className="mt-4 flex items-center justify-center gap-3 rounded-lg bg-gradient-to-b from-copper to-copper-dark px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-copper/30 transition hover:brightness-110"
            >
              {c.cta_button} <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
