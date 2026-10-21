import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import { getCurrentPartner, initials } from "@/lib/profile";

export const metadata = { title: "My Dashboard | Bhoomidar" };

export default async function DashboardLayout({ children }) {
  const partner = await getCurrentPartner();
  if (!partner) redirect("/login");

  // Switched off by the admin: no dashboard access.
  if (!partner.active) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-cream px-6">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-black/5">
          <h1 className="font-display text-2xl font-bold text-ink">Account switched off</h1>
          <p className="mt-3 text-sm text-ink/65">
            Your partner account is not active right now. Please contact us for help.
          </p>
          <a
            href="/contact"
            className="mt-6 inline-block rounded-lg bg-gradient-to-b from-copper-light to-copper-dark px-6 py-3 text-sm font-semibold text-white"
          >
            Contact us
          </a>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc]">
      <DashboardSidebar
        name={partner.name}
        email={partner.email}
        initials={initials(partner.name)}
      />
      <main className="px-5 pb-12 pt-24 lg:pl-[272px] lg:pt-0">
        <div className="mx-auto max-w-6xl lg:px-10 lg:py-12">{children}</div>
      </main>
    </div>
  );
}
