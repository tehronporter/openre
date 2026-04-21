import { Archive, ExternalLink } from "lucide-react";
import { archiveListing } from "@/app/actions/listings";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { Button, LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getSellerListings } from "@/lib/data";
import { formatCurrency, getSiteUrl } from "@/lib/utils";

type ListingWithOffers = Awaited<ReturnType<typeof getSellerListings>>[number] & {
  offers?: { id: string; status: string; created_at: string }[];
};

export default async function DashboardListingsPage() {
  const user = await requireUser();
  const listings = (await getSellerListings(user.id)) as ListingWithOffers[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold">Listings</h1>
          <p className="mt-2 text-muted-foreground">
            Share listings and jump directly into offer comparison.
          </p>
        </div>
        <LinkButton href="/dashboard/listings/new">Create listing</LinkButton>
      </div>

      {listings.length ? (
        <div className="grid gap-4">
          {listings.map((listing) => {
            const url = `${getSiteUrl()}/listings/${listing.slug}`;
            return (
              <Card key={listing.id} className="p-5">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-semibold">{listing.title}</h2>
                      <Badge tone={listing.status === "published" ? "success" : "neutral"}>
                        {listing.status}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatCurrency(listing.price)} · {listing.city}, {listing.state} ·{" "}
                      {listing.offers?.length || 0} offers
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {listing.status === "published" ? <ShareButton url={url} /> : null}
                    <LinkButton href={`/dashboard/listings/${listing.id}/offers`} variant="secondary">
                      Offer Command Center
                    </LinkButton>
                    {listing.status === "published" ? (
                      <LinkButton href={`/listings/${listing.slug}`} variant="ghost">
                        <ExternalLink size={16} /> View
                      </LinkButton>
                    ) : null}
                    <form action={archiveListing}>
                      <input type="hidden" name="id" value={listing.id} />
                      <Button variant="ghost" type="submit">
                        <Archive size={16} /> Archive
                      </Button>
                    </form>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          title="No listings yet"
          description="Start with the seller activation flow and publish your first shareable listing."
          action={<LinkButton href="/dashboard/listings/new">Create listing</LinkButton>}
        />
      )}
    </div>
  );
}
