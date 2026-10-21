import Image from "next/image";
import { Check } from "lucide-react";
import Logo from "../Logo";

const perks = [
  "Earn 2% to 4% commission on sales",
  "Bonus and monthly rewards",
  "Clear rules, clear earnings",
];

// Split screen used by the login and register pages.
export default function AuthShell({ children }) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-night lg:block">
        <Image
          src="/images/partner.png"
          alt=""
          fill
          priority
          sizes="52vw"
          className="zoom-in-slow object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#060d18]/95 via-[#060d18]/40 to-[#060d18]/60" />

        <div className="relative flex h-full flex-col justify-between p-12">
          <Logo size="h-16" />

          <div className="fade-up max-w-md">
            <h2 className="font-display text-5xl font-bold leading-[1.15] text-white">
              Grow Your Income
              <span className="block text-copper-light">With Bhoomidar</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-white/80">
              Join our partner network, help people find good land, and earn
              for every sale.
            </p>
            <ul className="mt-8 space-y-4">
              {perks.map((perk) => (
                <li
                  key={perk}
                  className="flex items-center gap-3.5 text-[15px] font-medium text-white"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      <section className="relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc] px-6 py-10">
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-copper-light/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#f0c58f]/25 blur-3xl" />

        <div className="relative mb-8 lg:hidden">
          <Logo dark size="h-20" />
        </div>

        <div className="fade-up relative w-full max-w-md">{children}</div>
      </section>
    </main>
  );
}
