import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { PropertyPageForm } from "@/components/admin/PropertyForm";
import { card } from "@/components/admin/ui";
import { getPropertyById } from "@/actions/admin/properties";

export const metadata = { title: "Edit property" };

export default async function EditPropertyPage({ params }) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <a
          href="/admin/properties"
          className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-copper shadow-sm ring-1 ring-black/10 transition hover:-translate-x-0.5 hover:ring-copper"
        >
          <ArrowLeft className="h-4 w-4" />
          All properties
        </a>
        {property.slug && (
          <a
            href={`/properties/${property.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm ring-1 ring-black/10 transition hover:text-copper hover:ring-copper"
          >
            <ExternalLink className="h-4 w-4 text-copper" />
            Open on the website
          </a>
        )}
      </div>

      <PageHeader
        label="Content"
        title="Edit"
        accent="property"
        text={property.title}
      />

      <div className={card}>
        {/* key: opening another property starts with a fresh form */}
        <PropertyPageForm key={property.id} initial={property} />
      </div>
    </div>
  );
}
