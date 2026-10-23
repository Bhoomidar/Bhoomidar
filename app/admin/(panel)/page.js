import {
  ArrowRight,
  Building2,
  Clock,
  FileText,
  Home,
  Inbox,
  PhoneCall,
  UserPlus,
  Users,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { card } from "@/components/admin/ui";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Dashboard" };

const count = (q) => q.then((r) => r.count ?? 0);
const when = (iso) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default async function AdminDashboard() {
  const db = createAdminClient();
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const head = { count: "exact", head: true };

  const [partners, pendingPartners, newPartners, newInquiries, properties, recentPartners, recentInquiries] =
    await Promise.all([
      count(db.from("profiles").select("id", head)),
      count(db.from("profiles").select("id", head).is("activated_at", null).eq("is_active", true)),
      count(db.from("profiles").select("id", head).gte("created_at", weekAgo)),
      count(db.from("inquiries").select("id", head).eq("status", "new")),
      count(db.from("properties").select("id", head).eq("is_active", true)),
      db
        .from("profiles")
        .select("id, full_name, email, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
        .then((r) => r.data ?? []),
      db
        .from("inquiries")
        .select("id, name, phone, interest, status, created_at")
        .order("created_at", { ascending: false })
        .limit(5)
        .then((r) => r.data ?? []),
    ]);

  const stats = [
    { icon: Users, label: "Total partners", value: partners, href: "/admin/partners" },
    { icon: Clock, label: "Payment pending", value: pendingPartners, href: "/admin/partners" },
    { icon: UserPlus, label: "New this week", value: newPartners, href: "/admin/partners" },
    { icon: Inbox, label: "New messages", value: newInquiries, href: "/admin/inquiries" },
    { icon: Building2, label: "Live properties", value: properties, href: "/admin/properties" },
  ];

  const shortcuts = [
    { icon: Home, label: "Home page", text: "Change the main page text and images", href: "/admin/home" },
    { icon: FileText, label: "About page", text: "Change the About page", href: "/admin/about" },
    { icon: PhoneCall, label: "Contact info", text: "Phone, email, address, social links", href: "/admin/contact" },
  ];

  return (
    <>
      <PageHeader
        label="Overview"
        title="Admin"
        accent="Dashboard"
        text="A quick look at your website."
      />

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ icon: Icon, label, value, href }) => (
          <a
            key={label}
            href={href}
            className={`${card} group transition duration-300 hover:-translate-y-1.5`}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#3a2a1f] to-[#17110c] text-copper-light shadow-lg ring-4 ring-copper-light/20">
              <Icon className="h-5 w-5" strokeWidth={1.8} />
            </span>
            <p className="mt-4 font-sans text-4xl font-extrabold tabular-nums text-ink">{value}</p>
            <p className="mt-1 text-sm text-ink/60">{label}</p>
          </a>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className={card}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ink">Newest partners</h2>
            <a href="/admin/partners" className="text-sm font-semibold text-copper">
              See all
            </a>
          </div>
          {recentPartners.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/55">No partners yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-black/5">
              {recentPartners.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-copper-light to-copper-dark text-sm font-bold text-white">
                    {(p.full_name || p.email)[0].toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-sm font-semibold text-ink">
                      {p.full_name || "—"}
                    </span>
                    <span className="block truncate text-xs text-ink/55">{p.email}</span>
                  </span>
                  <span className="shrink-0 text-xs text-ink/50">{when(p.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card}>
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-ink">Latest messages</h2>
            <a href="/admin/inquiries" className="text-sm font-semibold text-copper">
              See all
            </a>
          </div>
          {recentInquiries.length === 0 ? (
            <p className="py-8 text-center text-sm text-ink/55">No messages yet.</p>
          ) : (
            <ul className="mt-4 divide-y divide-black/5">
              {recentInquiries.map((q) => (
                <li key={q.id} className="flex items-center gap-3 py-3">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${q.status === "new" ? "bg-copper" : "bg-black/15"}`}
                  />
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-sm font-semibold text-ink">{q.name}</span>
                    <span className="block truncate text-xs text-ink/55">
                      {q.phone}
                      {q.interest ? ` · ${q.interest}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-ink/50">{when(q.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section>
        <h2 className="font-display text-xl font-bold text-ink">Customize the website</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {shortcuts.map(({ icon: Icon, label, text, href }) => (
            <a
              key={label}
              href={href}
              className="group flex flex-col rounded-2xl bg-gradient-to-br from-[#2a2019] to-night p-5 text-white shadow-xl transition duration-300 hover:-translate-y-1.5"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-b from-copper-light to-copper-dark">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-bold">{label}</h3>
              <p className="mt-1 flex-1 text-sm text-white/65">{text}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-copper-light transition group-hover:gap-3">
                Open <ArrowRight className="h-4 w-4" />
              </span>
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
