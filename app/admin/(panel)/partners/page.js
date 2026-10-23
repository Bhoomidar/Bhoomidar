import PageHeader from "@/components/admin/PageHeader";
import PartnersTable from "@/components/admin/PartnersTable";
import { getPartners } from "@/actions/admin/partners";
import { getPayment } from "@/lib/payment";

export const metadata = { title: "Partners" };

export default async function PartnersPage() {
  const partners = await getPartners();
  const pay = await getPayment();

  return (
    <>
      <PageHeader
        label="People"
        title="Our"
        accent="Partners"
        text="Everyone who signed up. Switch a partner off to stop them from logging in."
      />
      <PartnersTable partners={partners} fee={pay.amount} />
    </>
  );
}
