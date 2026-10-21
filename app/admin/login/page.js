import { redirect } from "next/navigation";
import Logo from "@/components/Logo";
import AdminLoginForm from "@/components/admin/AdminLoginForm";
import { getAdmin } from "@/lib/adminAuth";

export const metadata = {
  title: "Admin Login | Bhoomidar",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc] px-6 py-12">
      <div className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-copper-light/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-96 w-96 rounded-full bg-[#f0c58f]/35 blur-3xl" />

      <div className="fade-up relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo dark size="h-20" />
        </div>
        <div className="rounded-3xl bg-white p-7 shadow-[0_30px_60px_-24px_rgba(110,60,20,0.4)] ring-1 ring-black/5 sm:p-10">
          <span className="inline-block rounded-full bg-copper/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper-dark">
            Admin Panel
          </span>
          <h1 className="mt-4 font-display text-3xl font-bold text-ink">
            Admin <span className="text-copper">login</span>
          </h1>
          <p className="mt-2 text-sm text-ink/60">
            Only the website owner can sign in here.
          </p>
          <AdminLoginForm />
        </div>
      </div>
    </main>
  );
}
