import { ArrowRight, Wallet } from "lucide-react";
import Reveal from "@/components/Reveal";

export const metadata = { title: "Commission | Bhoomidar" };

export default function CommissionPage() {
  return (
    <div>
      <div className="fade-up">
        <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
          <span className="h-px w-8 bg-copper" />
          Earnings
        </p>
        <h1 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
          My <span className="text-copper">Commission</span>
        </h1>
      </div>

      <Reveal className="mt-8">
        <div className="relative overflow-hidden rounded-3xl bg-white px-7 py-16 text-center shadow-[0_24px_50px_-24px_rgba(110,60,20,0.4)] ring-1 ring-black/5 sm:px-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-copper-light/20 blur-3xl" />
          <span className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 ring-8 ring-copper/10">
            <Wallet className="h-9 w-9" />
          </span>
          <h2 className="relative mt-6 font-display text-3xl font-bold text-ink">
            Coming soon
          </h2>
          <p className="relative mx-auto mt-3 max-w-md text-base leading-relaxed text-ink/65">
            Your sales and commission details will show here soon.
          </p>
          <a
            href="/opportunities#rewards"
            className="group relative mt-8 inline-flex items-center gap-3 rounded-lg border border-copper px-6 py-3 text-sm font-semibold text-copper transition hover:bg-copper hover:text-white"
          >
            See how commission works
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </a>
        </div>
      </Reveal>
    </div>
  );
}
