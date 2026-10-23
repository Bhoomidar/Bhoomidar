import PageHeader from "@/components/admin/PageHeader";
import NetworkTree from "@/components/admin/NetworkTree";
import { getReferralTree } from "@/actions/admin/partners";

export const metadata = { title: "Referral Tree" };

export default async function NetworkPage() {
  const people = await getReferralTree();

  return (
    <>
      <PageHeader
        label="People"
        title="Referral"
        accent="Tree"
        text="Who joined under whom. Open a partner to see everyone they brought in."
      />
      <NetworkTree people={people} />
    </>
  );
}
