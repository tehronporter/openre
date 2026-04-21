import { AppHeader } from "@/components/app-header";
import { ListingCard } from "@/components/listings/listing-card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { propertyTypeLabels, propertyTypes } from "@/lib/constants";
import { getFilteredListings } from "@/lib/data";

export default async function ListingsPage({
  searchParams,
}: {
  searchParams: Promise<{
    location?: string;
    property_type?: string;
    min_price?: string;
    max_price?: string;
  }>;
}) {
  const params = await searchParams;
  const listings = await getFilteredListings(params);

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold">Browse listings</h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Public discovery helps buyers find opportunities, while sellers can
              also share listing links directly.
            </p>
          </div>
        </div>

        <form className="mt-8 grid gap-3 rounded-lg border border-border bg-surface p-4 md:grid-cols-5">
          <Input name="location" placeholder="City, state, or ZIP" defaultValue={params.location} />
          <Select name="property_type" defaultValue={params.property_type || ""}>
            <option value="">Any property type</option>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {propertyTypeLabels[type]}
              </option>
            ))}
          </Select>
          <Input name="min_price" type="number" placeholder="Min price" defaultValue={params.min_price} />
          <Input name="max_price" type="number" placeholder="Max price" defaultValue={params.max_price} />
          <Button type="submit">Search</Button>
        </form>

        {listings.length ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="mt-8">
            <EmptyState
              title="No listings found"
              description="Try adjusting your filters or check back as more sellers share properties."
            />
          </div>
        )}
      </main>
    </>
  );
}
