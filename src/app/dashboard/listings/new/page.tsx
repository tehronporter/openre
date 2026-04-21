import { ListingForm } from "@/components/listings/listing-form";

export default function NewListingPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
        Seller activation
      </p>
      <h1 className="mt-3 text-3xl font-semibold">Create your listing</h1>
      <p className="mt-3 text-muted-foreground">
        Enter the address, add basic property details, upload photos, and publish
        to open the Offer Command Center.
      </p>
      <div className="mt-8">
        <ListingForm />
      </div>
    </div>
  );
}
