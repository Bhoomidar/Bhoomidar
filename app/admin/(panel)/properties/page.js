import PageHeader from "@/components/admin/PageHeader";
import PropertiesManager from "@/components/admin/PropertiesManager";
import { getAllProperties } from "@/actions/admin/properties";

export const metadata = { title: "Properties" };

export default async function PropertiesPage() {
  const properties = await getAllProperties();

  return (
    <>
      <PageHeader
        label="Content"
        title="Our"
        accent="Properties"
        text="The property cards and each property's own page (photos, details, facilities). Add, change, hide or re-order them."
      />
      <PropertiesManager properties={properties} />
    </>
  );
}
