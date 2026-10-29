import PageHeader from "@/components/admin/PageHeader";
import PlanManager from "@/components/admin/PlanManager";
import { getPlanAdmin } from "@/actions/admin/plan";

export const metadata = { title: "Commission Plan" };

export default async function PlanPage() {
  const plan = await getPlanAdmin();

  return (
    <>
      <PageHeader
        label="Partners"
        title="Commission"
        accent="Plan"
        text="The ranks and rewards, the bonuses, the closing dates and the referral code pattern. Everything here is used by the website and by every sale you record."
      />
      <PlanManager plan={plan} />
    </>
  );
}
