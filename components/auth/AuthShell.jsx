import Image from "next/image";
import { Check, Home, TrendingUp, Users } from "lucide-react";
import Logo from "../Logo";

const perks = [
  "Earn 2% to 4% commission on sales",
  "Bonus and monthly rewards",
  "Clear rules, clear earnings",
];

// Page around the login and register forms. By default it is split in two with a
// picture on the left. `bare` drops the picture and centres a narrow form (login);
// `wide` drops it and gives the page to a long form (register).
// What the login page tells a visitor on a big screen, next to the form.
const loginPoints = [
  { icon: Users, title: "Grow your network", text: "Connect and earn together" },
  { icon: TrendingUp, title: "Earn rewards", text: "Get paid for successful deals" },
  { icon: Home, title: "Be a part of change", text: "Trusted land for a brighter tomorrow" },
];

export default function AuthShell({ children, wide = false, bare = false }) {
  const noImage = wide || bare;
  return (
    <main className={wide ? "min-h-screen lg:grid lg:grid-cols-[minmax(320px,31.5%)_1fr]" : bare ? "min-h-screen lg:grid lg:h-screen lg:grid-cols-[1.05fr_1fr] lg:overflow-hidden" : "grid min-h-screen lg:grid-cols-[1.05fr_1fr]"}>
      {wide && (
        <aside className="relative hidden self-start overflow-hidden bg-gradient-to-b from-[#fff3e2] via-[#fde6cb] to-[#f8d6b0] lg:sticky lg:top-0 lg:block lg:h-screen">
          {/* the house and trees, cut out, along the left and bottom edge */}
          <div
            className="pointer-events-none absolute -left-10 bottom-0 right-0 h-[52%]"
            style={{
              maskImage: "linear-gradient(to top, #000 55%, transparent)",
              WebkitMaskImage: "linear-gradient(to top, #000 55%, transparent)",
            }}
            aria-hidden
          >
            <Image
              src="/images/signupbg.png"
              alt=""
              fill
              priority
              sizes="40vw"
              className="object-cover object-left-bottom"
            />
          </div>

          <div className="relative z-10 flex h-full flex-col items-center px-8 pt-12 text-center xl:px-12 [@media(max-height:820px)]:pt-7">
            <Logo dark size="h-[72px]" className="[@media(max-height:820px)]:[&_img]:h-14" />

            <h2 className="mt-14 font-display text-[2.6rem] font-bold leading-[1.08] tracking-tight text-ink xl:text-[3.3rem] [@media(max-height:820px)]:mt-8">
              Trusted land
              <span className="block text-[#b5622f]">Brighter</span>
              <span className="block text-[#b5622f]">tomorrow</span>
            </h2>
            <p className="mt-5 max-w-[24rem] text-[15px] leading-[1.6] text-ink/70 xl:text-base">
              Be a part of a growing network. Connect people with the right land and build a brighter future together.
            </p>

            <ul className="mt-7 w-full max-w-[26rem] space-y-4 text-left [@media(max-height:820px)]:mt-5 [@media(max-height:820px)]:space-y-3">
              {loginPoints.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-center gap-4 rounded-2xl bg-[#fffdf9] py-2.5 pl-2.5 pr-5 shadow-[0_14px_30px_-20px_rgba(110,60,20,0.5)] ring-1 ring-copper/15">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
                    <Icon className="h-[22px] w-[22px]" strokeWidth={1.7} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-base font-semibold text-ink">{title}</span>
                    <span className="mt-1 block text-sm text-ink/60">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}

      {bare && (
        <aside className="relative hidden overflow-hidden bg-gradient-to-b from-[#fffaf3] to-[#f8eddd] lg:block">
          {/* the house, cut out, standing on the bottom edge */}
          <div className="pointer-events-none absolute -bottom-2 -right-[6%] left-[14%] h-[48%]" aria-hidden>
            <Image
              src="/images/loginBg.png"
              alt=""
              fill
              priority
              sizes="52vw"
              className="object-contain object-right-bottom"
            />
          </div>

          <div className="relative z-10 flex h-full flex-col px-16 py-9 xl:px-24 [@media(max-height:820px)]:py-6">
            <Logo dark size="h-[88px]" className="[@media(max-height:820px)]:[&_img]:h-16" />

            <div className="fade-up mt-7 max-w-xl [@media(max-height:820px)]:mt-5">
              <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.3em] text-copper-dark/80">
                <span className="h-px w-9 bg-gradient-to-r from-copper to-transparent" />
                Partner program
              </p>

              <h2 className="mt-4 font-display text-5xl font-bold leading-[1.08] tracking-tight text-ink xl:text-[4rem]">
                Trusted land
                <span className="-mb-3 block bg-gradient-to-r from-[#c2703a] via-[#a85a2a] to-[#7d3d17] bg-clip-text pb-3 text-transparent">
                  Brighter tomorrow
                </span>
              </h2>
              <span className="mt-4 flex items-center gap-1.5">
                <span className="h-1 w-14 rounded-full bg-gradient-to-r from-copper-light to-copper-dark" />
                <span className="h-1 w-1.5 rounded-full bg-copper/50" />
                <span className="h-1 w-1.5 rounded-full bg-copper/25" />
              </span>

              <p className="mt-5 max-w-[24rem] text-[17px] leading-[1.7] text-ink/65">
                Be a part of a growing network. Connect people with the right land and build a{" "}
                <b className="font-semibold text-ink/85">brighter future</b> together.
              </p>

              <ul className="mt-6 space-y-3">
                {loginPoints.map(({ icon: Icon, title, text }) => (
                  <li
                    key={title}
                    className="group flex w-[22.5rem] max-w-full items-center gap-4 rounded-2xl bg-[#fffdf9] py-2.5 pl-2.5 pr-5 shadow-[0_14px_30px_-20px_rgba(110,60,20,0.5)] ring-1 ring-copper/15 transition hover:-translate-y-0.5 hover:ring-copper/35"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-md shadow-copper/30">
                      <Icon className="h-[22px] w-[22px]" strokeWidth={1.7} />
                    </span>
                    <span className="leading-tight">
                      <span className="block text-[17px] font-bold text-ink">{title}</span>
                      <span className="mt-1 block text-sm text-ink/60">{text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      )}

      {!noImage && (
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
      )}

      <section
        className={`relative flex flex-col items-center overflow-hidden bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc] px-6 py-10 ${
          wide ? "min-h-screen lg:px-10 lg:py-6 xl:px-14" : bare ? "min-h-screen justify-center py-10 lg:h-screen lg:min-h-0 lg:py-4" : "justify-center"
        }`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-copper-light/20 blur-3xl" />
        {bare && <div className="pointer-events-none absolute -right-48 top-[6%] hidden h-[90%] w-[26rem] rounded-full bg-[#f3e6d4]/45 lg:block" />}
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-80 w-80 rounded-full bg-[#f0c58f]/25 blur-3xl" />

        {wide ? (
          <div className="relative z-10 w-full max-w-3xl lg:hidden">
            {/* logo, and a way to log in */}
            <div className="flex items-center justify-between gap-3">
              <Logo dark size="h-10 sm:h-12" />
              <p className="flex shrink-0 items-center gap-2.5 text-[11px] leading-tight text-ink/60 sm:gap-3 sm:text-xs">
                <span className="whitespace-nowrap">
                  Already have
                  <br />
                  an account?
                </span>
                <a
                  href="/login"
                  className="whitespace-nowrap rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-copper-dark shadow-sm ring-1 ring-copper/30 transition hover:bg-copper hover:text-white sm:px-5"
                >
                  Log in
                </a>
              </p>
            </div>

            {/* the words, with the house on the right */}
            <div className="relative mb-4 mt-5 h-[400px] sm:h-[470px]">
              <Image
                src="/images/signupmobilebg.png"
                alt=""
                width={1448}
                height={1086}
                priority
                sizes="(max-width: 768px) 110vw, 760px"
                className="pointer-events-none absolute -right-[6%] bottom-0 w-[104%] max-w-none"
              />
              <div className="relative">
                <h1 className="font-display text-[2.5rem] font-bold leading-[1.06] tracking-tight text-ink sm:text-6xl">
                  Trusted land
                  <span className="block text-[#b5622f]">Brighter</span>
                  <span className="block text-[#b5622f]">tomorrow</span>
                </h1>
                <p className="mt-3 max-w-[14rem] text-[13px] leading-snug text-ink/70 sm:max-w-sm sm:text-base">
                  Be a part of a growing network. Connect people with the right land and build a brighter future together.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className={`relative lg:hidden ${bare ? "mb-5" : "mb-8"}`}>
            <Logo dark size={bare ? "h-16" : "h-20"} />
          </div>
        )}

        <div className={`fade-up relative w-full ${wide ? "max-w-3xl lg:max-w-[960px]" : bare ? "max-w-md lg:max-w-[480px]" : "max-w-md"}`}>
          {children}
        </div>
      </section>
    </main>
  );
}
