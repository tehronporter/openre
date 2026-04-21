import Image from "next/image";
import { notFound } from "next/navigation";
import { Bath, BedDouble, Ruler } from "lucide-react";
import { OfferCommandCenter } from "@/components/offers/offer-command-center";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import {
  listingStatusLabels,
  propertyConditionLabels,
  propertyTypeLabels,
} from "@/lib/constants";
import { getOffersForListing, getSellerListing } from "@/lib/data";
import { formatCurrency, formatDate, getSiteUrl } from "@/lib/utils";

export default async function ManageListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ upload?: string }>;
}) {
  const [{ id }, query, user] = await Promise.all([
    params,
    searchParams,
    requireUser(),
  ]);
  const [listing, offers] = await Promise.all([
    getSellerListing(id, user.id),
    getOffersForListing(id),
  ]);
  if (!listing) notFound();

  const url = `${getSiteUrl()}/listings/${listing.slug}`;
  const heroImage = listing.listing_images?.[0];

  return (
    <div className="space-y-8">
      {query.upload === "partial" ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-warning">
          Listing created, but one or more images could not be uploaded. You can
          still publish, share, and compare offers.
        </div>
      ) : null}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
            Offer Command Center
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold">{listing.title}</h1>
            <Badge
              tone={
                listing.status === "under_contract"
                  ? "success"
                  : listing.status === "published"
                    ? "warning"
                    : "neutral"
              }
            >
              {listingStatusLabels[listing.status]}
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            {listing.street}, {listing.city}, {listing.state} {listing.zip}
          </p>
        </div>
        {listing.status === "published" ? <ShareButton url={url} /> : null}
      </div>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="overflow-hidden">
          <div className="relative aspect-[4/3] bg-muted">
            {heroImage ? (
              <Image src={heroImage.image_url} alt="" fill className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No images uploaded
              </div>
            )}
          </div>
          {listing.listing_images && listing.listing_images.length > 1 ? (
            <div className="grid grid-cols-4 gap-2 p-3">
              {listing.listing_images.slice(1, 5).map((image) => (
                <div key={image.id} className="relative aspect-square overflow-hidden rounded-md bg-muted">
                  <Image src={image.image_url} alt="" fill className="object-cover" />
                </div>
              ))}
            </div>
          ) : null}
        </Card>

        <Card className="p-5">
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-xl font-semibold">Listing info</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Created {formatDate(listing.created_at)} · Updated {formatDate(listing.updated_at)}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Fact label="Price expectation" value={formatCurrency(listing.price)} />
              <Fact label="Property type" value={propertyTypeLabels[listing.property_type]} />
              <Fact label="Condition" value={propertyConditionLabels[listing.condition]} />
              <Fact label="Offers received" value={String(offers.length)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <IconFact icon={<BedDouble />} label="Bedrooms" value={listing.bedrooms?.toString() || "-"} />
              <IconFact icon={<Bath />} label="Bathrooms" value={listing.bathrooms?.toString() || "-"} />
              <IconFact
                icon={<Ruler />}
                label="Square feet"
                value={listing.square_feet?.toLocaleString() || "-"}
              />
            </div>
            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="mt-2 leading-7 text-muted-foreground">{listing.description}</p>
            </div>
          </div>
        </Card>
      </section>

      <section>
        <OfferCommandCenter listing={listing} offers={offers} />
      </section>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function IconFact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="text-primary [&_svg]:size-4">{icon}</div>
      <p className="mt-2 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
