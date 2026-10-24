import PageHeader from "@/components/admin/PageHeader";
import SalesManager from "@/components/admin/SalesManager";
import { getSales, getSellerOptions } from "@/actions/admin/commission";
import { getProperties } from "@/lib/content";

export const metadata = { title: "Sales" };

export default async function SalesPage() {
  const [sales, sellers, properties] = await Promise.all([getSales(), getSellerOptions(), getProperties()]);

  return (
    <>
      <PageHeader
        label="Commission"
        title="Partner"
        accent="Sales"
        text="Record a confirmed sale. The seller and everyone above them in the team get their commission points, and ranks update on their own."
      />
      <SalesManager
        sales={sales}
        sellers={sellers}
        propertyTitles={[...new Set(properties.map((p) => p.title))]}
      />
    </>
  );
}
