import { notFound } from "next/navigation";
import { OfferCommandCenter } from "@/components/offers/offer-command-center";
import { requireUser } from "@/lib/auth";
import { getOffersForListing, getSellerListing } from "@/lib/data";

export default async function ListingOffersPage({
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

  return (
    <div className="space-y-4">
      {query.upload === "partial" ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-warning">
          Listing published, but one or more images failed to upload. Your
          listing is live and you can still share it.
        </div>
      ) : null}
      <OfferCommandCenter listing={listing} offers={offers} />
    </div>
  );
}
