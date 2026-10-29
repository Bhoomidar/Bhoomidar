import PageHeader from "@/components/admin/PageHeader";
import PayoutsManager from "@/components/admin/PayoutsManager";
import { getPayoutsOverview } from "@/actions/admin/commission";

export const metadata = { title: "Points & Payouts" };

export default async function PayoutsPage() {
  const overview = await getPayoutsOverview();

  return (
    <>
      <PageHeader
        label="Commission"
        title="Points &"
        accent="Payouts"
        text="Each partner's commission points, and what is still to come on the closing dates. When you pay a partner, mark it here and those points leave their balance. Share the partnership and C.T.O. bonus once a month."
      />
      <PayoutsManager overview={overview} />
    </>
  );
}
