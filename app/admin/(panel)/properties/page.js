import PageHeader from "@/components/admin/PageHeader";
import PropertiesManager from "@/components/admin/PropertiesManager";
import { getAllProperties } from "@/actions/admin/properties";
import { getCategoryRows } from "@/actions/admin/categories";

export const metadata = { title: "Properties" };

export default async function PropertiesPage() {
  const [properties, categories] = await Promise.all([getAllProperties(), getCategoryRows()]);

  return (
    <>
      <PageHeader
        label="Content"
        title="Our"
        accent="Properties"
        text="The property cards and each property's own page (photos, details, facilities). Add, change, hide or re-order them."
      />
      <PropertiesManager properties={properties} categories={categories} />
    </>
  );
}
