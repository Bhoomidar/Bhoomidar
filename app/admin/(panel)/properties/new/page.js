import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { PropertyPageForm } from "@/components/admin/PropertyForm";
import { card } from "@/components/admin/ui";
import { getCategoryRows } from "@/actions/admin/categories";

export const metadata = { title: "Add property" };

export default async function NewPropertyPage() {
  const categories = await getCategoryRows();
  return (
    <div className="space-y-6">
      <a
        href="/admin/properties"
        className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-copper shadow-sm ring-1 ring-black/10 transition hover:-translate-x-0.5 hover:ring-copper"
      >
        <ArrowLeft className="h-4 w-4" />
        All properties
      </a>

      <PageHeader
        label="Content"
        title="Add"
        accent="property"
        text="Fill in the card first. The property's own page (photos, details, facilities) is optional and you can add it later."
      />

      <div className={card}>
        <PropertyPageForm initial={{}} categories={categories} />
      </div>
    </div>
  );
}
