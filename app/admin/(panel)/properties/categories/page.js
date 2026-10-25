import { ArrowLeft } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import CategoriesManager from "@/components/admin/CategoriesManager";
import { getCategoryRows } from "@/actions/admin/categories";

export const metadata = { title: "Property types" };

export default async function CategoriesPage() {
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
        title="Property"
        accent="types"
        text="Residential, Villa, Plots... Add your own types, give each an icon and set their order. They show on every property and as filter tabs on the website."
      />

      <CategoriesManager categories={categories} />
    </div>
  );
}
