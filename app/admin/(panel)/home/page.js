import PageHeader from "@/components/admin/PageHeader";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { getContent } from "@/lib/content";
import { HOME_TABS } from "@/lib/siteContent";

export const metadata = { title: "Home Page" };

export default async function HomeCustomizePage() {
  const content = await getContent();

  return (
    <>
      <PageHeader
        label="Customize"
        title="Home"
        accent="Page"
        text="Change the text and images of each section. Press Save and the website updates right away."
      />
      <SettingsEditor tabs={HOME_TABS} initial={content} siteHref="/" siteLabel="Open the home page" />
    </>
  );
}
