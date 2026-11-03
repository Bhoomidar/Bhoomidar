import { CalendarDays, Network, UserCheck, Users } from "lucide-react";
import CustomersTable from "@/components/admin/CustomersTable";
import PageHeader from "@/components/admin/PageHeader";
import { BarsArt, HourglassArt, OrgChartArt, PeopleArt } from "@/components/dashboard/StatArt";
import { getCustomers } from "@/actions/admin/customers";

export const metadata = { title: "Customers" };

const monthOf = (d) => new Date(d).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" }).slice(0, 7);
const dayText = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

export default async function CustomersPage() {
  const customers = await getCustomers();

  const thisMonth = monthOf(new Date());
  const addedThisMonth = customers.filter((c) => monthOf(c.at) === thisMonth).length;
  const partnersWith = new Set(customers.map((c) => c.partnerId)).size;
  const latest = customers[0] ?? null;

  const stats = [
    {
      icon: Users,
      art: PeopleArt,
      label: "Total customers",
      value: customers.length,
      note: "registered by partners",
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
      icon: Network,
      art: OrgChartArt,
      label: "Partners with customers",
      value: partnersWith,
      note: "have registered at least one",
      theme: { bg: "from-[#e4f0ff] to-[#f5f9ff]", ring: "ring-sky-300/30", chip: "bg-sky-200/80 text-sky-700", art: "text-sky-500" },
    },
    {
      icon: CalendarDays,
      art: HourglassArt,
      label: "Last added",
      value: latest ? dayText(latest.at) : "-",
      note: latest ? `${latest.name} · ${latest.partnerName}` : "no customer yet",
      small: true,
      theme: { bg: "from-[#ece4fb] to-[#f9f6ff]", ring: "ring-violet-300/30", chip: "bg-violet-200/80 text-violet-700", art: "text-violet-500" },
    },
  ];

  return (
    <>
      <PageHeader
        label="People"
        title="Partner"
        accent="Customers"
        text="Customers that partners have registered. Each customer is locked to the partner who registered them first."
      />

      <div className="fade-up grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
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
            <p className="relative mt-1.5 max-w-[65%] [overflow-wrap:anywhere] text-[15px] leading-snug text-ink/55">{note}</p>
          </div>
        ))}
      </div>

      <CustomersTable customers={customers} />
    </>
  );
}
