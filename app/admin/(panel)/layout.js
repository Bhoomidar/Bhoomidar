import { redirect } from "next/navigation";
import AdminHeader from "@/components/admin/AdminHeader";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { getAdmin } from "@/lib/adminAuth";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = {
  title: { template: "%s | Bhoomidar Admin", default: "Admin | Bhoomidar" },
  robots: { index: false, follow: false },
};

export default async function AdminPanelLayout({ children }) {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");

  const { count } = await createAdminClient()
    .from("inquiries")
    .select("id", { count: "exact", head: true })
    .eq("status", "new");

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fbf6ee] to-[#f6ecdc]">
      <AdminSidebar email={admin.email} newInquiries={count ?? 0} />
      <main className="pb-12 pt-[92px] lg:pl-[272px] lg:pt-0">
        <AdminHeader email={admin.email} newInquiries={count ?? 0} />
        <div className="w-full max-w-[1500px] space-y-8 px-5 pt-6 lg:px-8 lg:pt-8">{children}</div>
      </main>
    </div>
  );
}
