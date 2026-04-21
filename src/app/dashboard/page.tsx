import { Activity, Home, Scale } from "lucide-react";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { requireUser } from "@/lib/auth";
import { getBuyerOffers, getSellerListings } from "@/lib/data";
import { formatCurrency, formatDate } from "@/lib/utils";

type ListingWithOffers = Awaited<ReturnType<typeof getSellerListings>>[number] & {
  offers?: { id: string; status: string; created_at: string }[];
};

export default async function DashboardPage() {
  const user = await requireUser();
  const [sellerListings, buyerOffers] = await Promise.all([
    getSellerListings(user.id),
    getBuyerOffers(user.id),
  ]);
  const listings = sellerListings as ListingWithOffers[];
  const recentOffer = listings
    .flatMap((listing) =>
      (listing.offers || []).map((offer) => ({ ...offer, listing })),
    )
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at))[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold">Seller dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Manage listings, see offer activity, and get to your Offer Command Center.
          </p>
        </div>
        <LinkButton href="/dashboard/listings/new">Sell Your Property</LinkButton>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={<Home />} label="Listings" value={String(listings.length)} />
        <Metric
          icon={<Scale />}
          label="Total offers"
          value={String(listings.reduce((sum, listing) => sum + (listing.offers?.length || 0), 0))}
        />
        <Metric
          icon={<Activity />}
          label="Buyer offers"
          value={String(buyerOffers.length)}
        />
      </div>

      {listings.length ? (
        <Card className="overflow-hidden">
          <div className="border-b border-border p-5">
            <h2 className="text-xl font-semibold">Your listings</h2>
          </div>
          <div className="divide-y divide-border">
            {listings.slice(0, 5).map((listing) => (
              <div
                key={listing.id}
                className="flex flex-col justify-between gap-4 p-5 md:flex-row md:items-center"
              >
                <div>
                  <p className="font-semibold">{listing.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatCurrency(listing.price)} · {listing.city}, {listing.state} ·{" "}
                    {listing.offers?.length || 0} offers
                  </p>
                </div>
                <div className="flex gap-2">
                  <LinkButton href={`/dashboard/listings/${listing.id}/offers`} variant="secondary">
                    Command Center
                  </LinkButton>
                  <LinkButton href={`/dashboard/listings/${listing.id}`} variant="ghost">
                    Manage
                  </LinkButton>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No listings yet"
          description="Start with your property address, add details and photos, then publish and share your listing link."
          action={<LinkButton href="/dashboard/listings/new">Create listing</LinkButton>}
        />
      )}

      {recentOffer ? (
        <Card className="p-5">
          <h2 className="text-xl font-semibold">Recent offer activity</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Latest offer on {recentOffer.listing.title} submitted {formatDate(recentOffer.created_at)}.
          </p>
        </Card>
      ) : null}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="p-5">
      <div className="text-primary [&_svg]:size-5">{icon}</div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-3xl font-semibold">{value}</p>
    </Card>
  );
}
