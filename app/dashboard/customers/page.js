import { CalendarDays, Lock, UserCheck, Users } from "lucide-react";
import Reveal from "@/components/Reveal";
import CustomersManager from "@/components/dashboard/CustomersManager";
import { BarsArt, HourglassArt, PeopleArt } from "@/components/dashboard/StatArt";
import { getCurrentPartner } from "@/lib/profile";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "My Customers | Bhoomidar" };

function Heading() {
  return (
    <div className="fade-up">
      <p className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink/70">
        <span className="h-px w-8 bg-copper" />
        Customers
      </p>
      <h1 className="mt-4 font-display text-4xl font-bold leading-[1.2] text-ink sm:text-5xl">
        My <span className="text-copper">Customers</span>
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink/60">
        Register the people you talk to about Bhoomidar. Each one stays locked to you.
      </p>
    </div>
  );
}

const monthOf = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7);
const dayText = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function CustomersPage() {
  const partner = await getCurrentPartner();

  if (partner.pending) {
    return (
      <div className="space-y-8">
        <Heading />
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-white px-7 py-16 text-center shadow-[0_24px_50px_-24px_rgba(110,60,20,0.4)] ring-1 ring-black/5 sm:px-10">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-copper-light/20 blur-3xl" />
            <span className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark text-white shadow-lg shadow-copper/30 ring-8 ring-copper/10">
              <Lock className="h-9 w-9" />
            </span>
            <h2 className="relative mt-6 font-display text-3xl font-bold text-ink">Opens after activation</h2>
            <p className="relative mx-auto mt-3 max-w-md text-base leading-relaxed text-ink/65">
              You can register customers once your joining payment is received and your account is activated.
            </p>
          </div>
        </Reveal>
      </div>
    );
  }

  const { data } = await createAdminClient()
    .from("customers")
    .select("id, full_name, phone, email, aadhaar_last4, created_at")
    .eq("partner_id", partner.user.id)
    .order("created_at", { ascending: false });
  const customers = (data ?? []).map((c) => ({
    id: c.id,
    name: c.full_name,
    phone: c.phone,
    email: c.email,
    last4: c.aadhaar_last4,
    at: c.created_at,
  }));

  const thisMonth = monthOf(new Date());
  const addedThisMonth = customers.filter((c) => monthOf(c.at) === thisMonth).length;
  const latest = customers[0] ?? null;

  const stats = [
    {
      icon: Users,
      art: PeopleArt,
      label: "Total customers",
      value: customers.length,
      note: "locked to you",
      theme: { bg: "from-[#fdebdc] to-[#fff6ec]", ring: "ring-copper/10", chip: "bg-[#f9d6b8] text-copper", art: "text-copper" },
    },
    {
      icon: UserCheck,
      art: BarsArt,
      label: "Added this month",
      value: addedThisMonth,
      note: "new customers",
      theme: { bg: "from-[#dff5e8] to-[#f5fcf8]", ring: "ring-emerald-300/30", chip: "bg-emerald-200/80 text-emerald-700", art: "text-emerald-500" },
    },
    {
      icon: CalendarDays,
      art: HourglassArt,
      label: "Last added",
      value: latest ? dayText(latest.at) : "-",
      note: latest ? latest.name : "no customer yet",
      small: true,
      theme: { bg: "from-[#ece4fb] to-[#f9f6ff]", ring: "ring-violet-300/30", chip: "bg-violet-200/80 text-violet-700", art: "text-violet-500" },
    },
  ];

  const tiles = (
      <Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map(({ icon: Icon, art: Art, label, value, note, small, theme }) => (
            <div
              key={label}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme.bg} p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1 ${theme.ring} transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_50px_-24px_rgba(110,60,20,0.5)]`}
            >
              <Art
                className={`pointer-events-none absolute bottom-3 right-3 h-20 w-24 origin-bottom-right transition duration-500 group-hover:scale-110 ${theme.art}`}
              />
              <div className="relative flex items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${theme.chip}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-[15px] font-semibold text-ink/70">{label}</p>
              </div>
              <p className={`relative mt-4 font-extrabold tabular-nums text-ink ${small ? "text-2xl sm:text-3xl" : "text-4xl"}`}>{value}</p>
              <p className="relative mt-1.5 max-w-[65%] [overflow-wrap:anywhere] text-[15px] text-ink/55">{note}</p>
            </div>
          ))}
        </div>
      </Reveal>
  );

  return <CustomersManager customers={customers} heading={<Heading />} stats={tiles} />;
}
