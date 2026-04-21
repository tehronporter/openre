import { notFound } from "next/navigation";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
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

  return (
    <div className="space-y-6">
      {query.upload === "partial" ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-warning">
          Listing created, but one or more images could not be uploaded. You can
          continue managing the listing and retry photos later.
        </div>
      ) : null}
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-semibold">{listing.title}</h1>
            <Badge tone={listing.status === "published" ? "success" : "neutral"}>
              {listing.status}
            </Badge>
          </div>
          <p className="mt-2 text-muted-foreground">
            {formatCurrency(listing.price)} · {listing.city}, {listing.state} · Updated{" "}
            {formatDate(listing.updated_at)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {listing.status === "published" ? <ShareButton url={url} /> : null}
          <LinkButton href={`/dashboard/listings/${listing.id}/offers`}>
            Offer Command Center
          </LinkButton>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Offer count</p>
          <p className="mt-1 text-3xl font-semibold">{offers.length}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Images</p>
          <p className="mt-1 text-3xl font-semibold">{listing.listing_images?.length || 0}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-muted-foreground">Public link</p>
          <p className="mt-1 truncate text-sm font-medium">{listing.status === "published" ? url : "Publish to share"}</p>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="text-xl font-semibold">Listing summary</h2>
        <p className="mt-3 leading-7 text-muted-foreground">{listing.description}</p>
      </Card>
    </div>
  );
}
