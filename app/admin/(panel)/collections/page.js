import CollectionsView from "@/components/admin/CollectionsView";
import AutoRefresh from "@/components/dashboard/AutoRefresh";
import { getCollections } from "@/lib/collections";

export const metadata = { title: "Fee Collection" };

export default async function CollectionsPage() {
  const data = await getCollections();
  return (
    <>
      {/* new payments and income cuts show up without a reload */}
      <AutoRefresh seconds={30} />
      <CollectionsView data={data} />
    </>
  );
}
