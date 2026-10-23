import { redirect } from "next/navigation";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import LiveStatus from "@/components/dashboard/LiveStatus";
import { getCurrentPartner, initials } from "@/lib/profile";

export const metadata = { title: "My Dashboard | Bhoomidar" };

export default async function DashboardLayout({ children }) {
  const partner = await getCurrentPartner();
  if (!partner) redirect("/login");

  return (
    <>
      {/* Stays mounted whichever screen is shown, so changes the admin makes
          (payment paid, switched on or off) show up live. */}
      <LiveStatus userId={partner.user.id} active={partner.active} activated={partner.activated} />

      {!partner.active ? (
        // Switched off by the admin: no dashboard access.
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
      ) : (
        <div className="min-h-screen bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc]">
          <DashboardSidebar
            name={partner.name}
            email={partner.email}
            initials={initials(partner.name)}
            avatarUrl={partner.avatarUrl}
          />
          <main className="pb-12 pt-[92px] lg:pl-[272px] lg:pt-0">
            <DashboardHeader
              name={partner.name}
              initials={initials(partner.name)}
              avatarUrl={partner.avatarUrl}
              active={partner.active}
              pending={partner.pending}
              referralCode={partner.referralCode}
            />
            <div className="w-full max-w-[1500px] px-5 pt-6 lg:px-8 lg:pt-8">{children}</div>
          </main>
        </div>
      )}
    </>
  );
}
