import Image from "next/image";
import { redirect } from "next/navigation";
import { ArrowLeft, Building2, Coins, LayoutDashboard, Network } from "lucide-react";
import Logo from "@/components/Logo";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdmin } from "@/lib/adminAuth";

export const metadata = {
  title: "Admin Login | Bhoomidar",
  robots: { index: false, follow: false },
};

// What the owner can do from the panel, shown next to the form on a big screen.
const DOES = [
  { icon: Network, title: "Partners and teams", text: "Activate partners and see every referral tree." },
  { icon: Coins, title: "Sales and commission", text: "Record a sale and the points reach everyone above." },
  { icon: Building2, title: "Properties and website", text: "Change photos, prices, plans and text yourself." },
];

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <main className="min-h-screen lg:grid lg:grid-cols-[1.05fr_1fr]">
      {/* the dark side: a big screen only */}
      <aside className="relative hidden overflow-hidden bg-night lg:block">
        <Image
          src="/images/hero.png"
          alt=""
          fill
          priority
          sizes="52vw"
          className="object-cover object-[70%_50%]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0b0806]/80 via-[#0b0806]/75 to-[#0b0806]/95" />
        <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-copper/25 blur-3xl" />

        <div className="relative flex h-full flex-col justify-between p-12 xl:p-16">
          <Logo size="h-16" />

          <div className="fade-up max-w-lg">
            <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.26em] text-copper-light">
              <span className="h-px w-9 bg-copper-light" />
              Owner access
            </p>
            <h2 className="mt-5 font-display text-5xl font-bold leading-[1.1] text-white xl:text-6xl">
              Run Bhoomidar
              <span className="block text-copper-light">from one place</span>
            </h2>

            <ul className="mt-10 space-y-4">
              {DOES.map(({ icon: Icon, title, text }) => (
                <li key={title} className="flex items-center gap-4 rounded-2xl bg-white/[0.06] p-3.5 ring-1 ring-white/10 backdrop-blur-sm">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30">
                    <Icon className="h-[22px] w-[22px]" strokeWidth={1.7} />
                  </span>
                  <span className="leading-tight">
                    <span className="block text-base font-semibold text-white">{title}</span>
                    <span className="mt-1 block text-sm text-white/65">{text}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-white/45">Bhoomidar &middot; Trusted Land, Brighter Tomorrow</p>
        </div>
      </aside>

      {/* the form */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc] px-6 py-12 lg:min-h-0">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-copper-light/25 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-[#f0c58f]/35 blur-3xl" />

        <div className="fade-up relative w-full max-w-md">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo dark size="h-16" />
          </div>

          <div className="overflow-hidden rounded-3xl bg-white shadow-[0_40px_80px_-30px_rgba(110,60,20,0.5)] ring-1 ring-black/5">
            <div className="relative overflow-hidden bg-gradient-to-br from-[#3a2a1f] via-[#251b14] to-[#14100d] px-7 py-7 text-white sm:px-9">
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.1]"
                style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "20px 20px" }}
              />
              <div className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-copper/40 blur-3xl" />
              <div className="relative flex items-center gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-copper-light to-copper-dark text-white shadow-lg shadow-copper/40">
                  <LayoutDashboard className="h-6 w-6" strokeWidth={1.7} />
                </span>
                <div className="leading-tight">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-copper-light">Admin panel</p>
                  <h1 className="mt-1.5 font-display text-3xl font-bold">
                    Admin <span className="text-copper-light">login</span>
                  </h1>
                </div>
              </div>
            </div>

            <div className="p-7 sm:p-9">
              <p className="text-sm text-ink/60">Only the website owner can sign in here.</p>
              <AdminLoginForm />
            </div>
          </div>

          <a
            href="/"
            className="group mx-auto mt-6 flex w-fit items-center gap-2 text-sm font-medium text-ink/60 transition hover:text-copper"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            Back to the website
          </a>
        </div>
      </section>
    </main>
  );
}
