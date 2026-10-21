import InquiriesList from "@/components/admin/InquiriesList";
import PageHeader from "@/components/admin/PageHeader";
import { getInquiries } from "@/actions/admin/inquiries";

export const metadata = { title: "Inquiries" };

export default async function InquiriesPage() {
  const inquiries = await getInquiries();

  return (
    <>
      <PageHeader
        label="People"
        title="Contact"
        accent="Messages"
        text="Messages sent from the Contact page form."
      />
      <InquiriesList inquiries={inquiries} />
    </>
  );
}
