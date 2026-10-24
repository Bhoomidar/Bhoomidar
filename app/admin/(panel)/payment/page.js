import PageHeader from "@/components/admin/PageHeader";
import PaymentEditor from "@/components/admin/PaymentEditor";
import { getContent } from "@/lib/content";

export const metadata = { title: "Payment Details" };

export default async function PaymentSettingsPage() {
  const content = await getContent();

  return (
    <>
      <PageHeader
        label="Money"
        title="Payment"
        accent="Details"
        text="What a new partner pays, where to pay, and who to call. Partners see this on their dashboard until you activate them. You can change it any time."
      />
      <PaymentEditor initial={content} />
    </>
  );
}
