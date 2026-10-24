import PageHeader from "@/components/admin/PageHeader";
import SettingsEditor from "@/components/admin/SettingsEditor";
import { getContent } from "@/lib/content";
import { ABOUT_TABS } from "@/lib/siteContent";

export const metadata = { title: "About Page" };

export default async function AboutCustomizePage() {
  const content = await getContent();

  return (
    <>
      <PageHeader
        label="Customize"
        title="About"
        accent="Page"
        text="Change the text and images of the About page."
      />
      <SettingsEditor tabs={ABOUT_TABS} initial={content} siteHref="/about" siteLabel="Open the About page" />
    </>
  );
}
