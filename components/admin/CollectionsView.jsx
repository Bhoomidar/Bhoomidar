import { Clock, Coins, CreditCard, IndianRupee, Sigma, Users, UserCheck, Wallet } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import CollectionsTable from "@/components/admin/CollectionsTable";
import Reveal from "@/components/Reveal";
import { card } from "@/components/admin/ui";
import { formatRupees } from "@/lib/partnerFee";

const monthName = (key) =>
  new Date(`${key}-01T12:00:00+05:30`).toLocaleDateString("en-IN", { month: "short", year: "numeric", timeZone: "Asia/Kolkata" });

// The Fee Collection screen. `data` is what getCollections() returns (null when it could not be loaded).
export default function CollectionsView({ data }) {
  const header = (
    <PageHeader
      label="Money"
      title="Fee"
      accent="Collection"
      text="The joining amount: how much came in, how much was cut from income, and how much is still to come. This page updates by itself."
    />
  );

  if (!data) {
    return (
      <>
        {header}
        <p className="mt-6 rounded-2xl bg-amber-50 px-5 py-4 text-sm text-amber-900 ring-1 ring-amber-200">
          Could not load the numbers right now. Please refresh in a moment.
        </p>
      </>
    );
  }

  const { fee, assumed, totals, rows, months, amounts } = data;

  const cards = [
    {
      icon: Sigma,
      label: "Total joining amount",
      value: formatRupees(totals.received + totals.fromIncome + totals.pending),
      note: "received + cut from income + still to come",
      theme: "from-[#fdebdc] to-[#fff6ec] ring-copper/10",
      chip: "bg-[#f9d6b8] text-copper",
    },
    {
      icon: IndianRupee,
      label: "Total received",
      value: formatRupees(totals.received),
      note: `cash, UPI or bank, from ${totals.paidIds + totals.creditIds} activated IDs`,
      theme: "from-[#dff5e8] to-[#f5fcf8] ring-emerald-300/30",
      chip: "bg-emerald-200/80 text-emerald-700",
    },
    {
      icon: Coins,
      label: "Cut from income",
      value: formatRupees(totals.fromIncome),
      note: `taken from the earnings of ${totals.incomeIds} ${totals.incomeIds === 1 ? "partner" : "partners"}`,
      theme: "from-[#e0f4f4] to-[#f5fcfc] ring-teal-300/30",
      chip: "bg-teal-200/80 text-teal-700",
    },
    {
      icon: Clock,
      label: "Still to come",
      value: formatRupees(totals.pending),
      note: `${formatRupees(totals.unpaidDue)} unpaid IDs + ${formatRupees(totals.creditOwed)} on credit`,
      theme: "from-[#fff1cf] to-[#fffaf0] ring-amber-300/30",
      chip: "bg-amber-200/80 text-amber-700",
    },
    {
      icon: Users,
      label: "Total IDs",
      value: totals.ids,
      note: `joining amount is ${formatRupees(fee)}`,
      theme: "from-[#fdebdc] to-[#fff6ec] ring-copper/10",
      chip: "bg-[#f9d6b8] text-copper",
    },
    {
      icon: UserCheck,
      label: "Paid IDs",
      value: totals.paidIds,
      note: "joining amount fully cleared",
      theme: "from-[#e3ecfd] to-[#f6f9ff] ring-sky-300/30",
      chip: "bg-sky-200/80 text-sky-700",
    },
    {
      icon: CreditCard,
      label: "On credit",
      value: totals.creditIds,
      note: `${formatRupees(totals.creditOwed)} left to pay`,
      theme: "from-[#ece4fb] to-[#f9f6ff] ring-violet-300/30",
      chip: "bg-violet-200/80 text-violet-700",
    },
    {
      icon: Wallet,
      label: "Unpaid IDs",
      value: totals.unpaidIds,
      note: `${formatRupees(totals.unpaidDue)} not received yet`,
      theme: "from-[#f3efea] to-[#fdfbf8] ring-black/5",
      chip: "bg-stone-200 text-stone-700",
    },
  ];

  return (
    <div className="space-y-8">
      {header}

      <Reveal>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ icon: Icon, label, value, note, theme, chip }) => (
            <div key={label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${theme} p-5 shadow-[0_18px_40px_-24px_rgba(110,60,20,0.4)] ring-1`}>
              <div className="flex items-center gap-3">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-sm ${chip}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-ink/70">{label}</p>
              </div>
              <p className="mt-4 [overflow-wrap:anywhere] text-3xl font-extrabold tabular-nums text-ink sm:text-4xl">{value}</p>
              <p className="mt-1.5 text-sm text-ink/55">{note}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className={card}>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-[1.7rem]">
              Month by <span className="text-copper">month</span>
            </h2>
            <p className="mt-1 text-sm text-ink/55">Cash received, counted in the month the ID was activated.</p>
            {months.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink/55">No IDs yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-2xl bg-white ring-1 ring-black/5">
                <table className="w-full text-xs sm:text-sm">
                  <thead className="bg-[#f6f0e7] text-xs font-semibold text-ink/60">
                    <tr>
                      <th className="px-3 py-3 text-left sm:px-4">Month</th>
                      <th className="px-2 py-3 text-right sm:px-3">Joined</th>
                      <th className="px-2 py-3 text-right sm:px-3">Active</th>
                      <th className="px-3 py-3 text-right sm:px-4">Received</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-black/5">
                    {months.map((m) => (
                      <tr key={m.key}>
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-ink sm:px-4">{monthName(m.key)}</td>
                        <td className="px-2 py-3 text-right tabular-nums text-ink/70 sm:px-3">{m.joined}</td>
                        <td className="px-2 py-3 text-right tabular-nums text-ink/70 sm:px-3">{m.activated}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-bold tabular-nums text-emerald-700 sm:px-4">{formatRupees(m.received)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className={card}>
            <h2 className="font-display text-2xl font-bold text-ink sm:text-[1.7rem]">
              How much each <span className="text-copper">ID paid</span>
            </h2>
            <p className="mt-1 text-sm text-ink/55">How many IDs cleared each amount (cash and income cut together).</p>
            {amounts.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink/55">Nobody has paid yet.</p>
            ) : (
              <ul className="mt-4 space-y-2.5">
                {amounts.map(({ amount, count }) => (
                  <li key={amount} className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-black/5">
                    <span className="min-w-0 leading-tight">
                      <b className="block text-lg font-extrabold tabular-nums text-ink">{formatRupees(amount)}</b>
                      <span className="mt-0.5 block text-xs text-ink/55">each</span>
                    </span>
                    <span className="shrink-0 text-right leading-tight">
                      <b className="block text-lg font-extrabold tabular-nums text-copper-dark">
                        {count} {count === 1 ? "ID" : "IDs"}
                      </b>
                      <span className="mt-0.5 block text-xs text-ink/55">{formatRupees(amount * count)} in all</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </Reveal>

      <Reveal>
        <CollectionsTable rows={rows} />
      </Reveal>

      {assumed > 0 && (
        <p className="text-xs text-ink/50">
          {assumed} {assumed === 1 ? "ID was" : "IDs were"} activated before amounts were saved, so {assumed === 1 ? "it is" : "they are"} counted at the joining amount ({formatRupees(fee)}).
        </p>
      )}
    </div>
  );
}
