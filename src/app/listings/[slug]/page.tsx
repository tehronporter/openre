import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { OfferForm } from "@/components/offers/offer-form";
import { ShareButton } from "@/components/share-button";
import { Badge } from "@/components/ui/badge";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  propertyConditionLabels,
  propertyTypeLabels,
} from "@/lib/constants";
import { getUser } from "@/lib/auth";
import { getListingBySlug } from "@/lib/data";
import { formatCurrency, getSiteUrl } from "@/lib/utils";

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [listing, user] = await Promise.all([getListingBySlug(slug), getUser()]);
  if (!listing) notFound();

  const isSeller = user?.id === listing.seller_id;
  const listingUrl = `${getSiteUrl()}/listings/${listing.slug}`;

  async function requireAuthForMessage() {
    "use server";
    redirect("/auth/sign-in");
  }

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="grid gap-3 md:grid-cols-2">
              {(listing.listing_images || []).slice(0, 4).map((image, index) => (
                <div
                  key={image.id}
                  className={index === 0 ? "relative aspect-[4/3] md:col-span-2" : "relative aspect-[4/3]"}
                >
                  <Image
                    src={image.image_url}
                    alt=""
                    fill
                    className="rounded-lg object-cover"
                    priority={index === 0}
                  />
                </div>
              ))}
              {!listing.listing_images?.length ? (
                <div className="flex aspect-[4/3] items-center justify-center rounded-lg bg-muted text-muted-foreground md:col-span-2">
                  No photos uploaded yet
                </div>
              ) : null}
            </div>

            <div className="mt-8">
              <div className="flex flex-wrap gap-2">
                <Badge>{propertyTypeLabels[listing.property_type]}</Badge>
                <Badge>{propertyConditionLabels[listing.condition]}</Badge>
              </div>
              <h1 className="mt-4 text-4xl font-semibold">{listing.title}</h1>
              <p className="mt-2 text-xl text-muted-foreground">
                {listing.city}, {listing.state} {listing.zip}
              </p>
              <p className="mt-5 text-3xl font-semibold">{formatCurrency(listing.price)}</p>
            </div>

            <Card className="mt-8 p-5">
              <h2 className="text-xl font-semibold">Property details</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <Fact label="Bedrooms" value={listing.bedrooms?.toString() || "Optional"} />
                <Fact label="Bathrooms" value={listing.bathrooms?.toString() || "Optional"} />
                <Fact label="Square feet" value={listing.square_feet?.toLocaleString() || "Optional"} />
              </div>
              <p className="mt-5 leading-7 text-muted-foreground">{listing.description}</p>
            </Card>
          </div>

          <aside className="space-y-4">
            <Card className="p-5">
              <h2 className="text-xl font-semibold">Listing actions</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Submit a clear offer or start a simple text conversation around
                this listing.
              </p>
              <div className="mt-5">
                <ShareButton url={listingUrl} />
              </div>
              {isSeller ? (
                <div className="mt-5 rounded-md border border-border bg-muted p-3 text-sm">
                  You own this listing. Offer submission is disabled.
                </div>
              ) : user ? (
                <LinkButton
                  href={`/dashboard/messages?listing=${listing.id}&seller=${listing.seller_id}&buyer=${user.id}`}
                  variant="secondary"
                  className="mt-3 w-full"
                >
                  <MessageCircle size={16} /> Message seller
                </LinkButton>
              ) : (
                <form action={requireAuthForMessage}>
                  <button className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-4 text-sm font-medium">
                    <MessageCircle size={16} /> Sign in to message seller
                  </button>
                </form>
              )}
            </Card>
            {isSeller ? null : user ? (
              <OfferForm listingId={listing.id} />
            ) : (
              <Card className="p-5">
                <h2 className="text-xl font-semibold">Submit an offer</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Sign in to submit a direct offer to the seller.
                </p>
                <LinkButton href="/auth/sign-in" className="mt-4 w-full">
                  Sign in to offer
                </LinkButton>
              </Card>
            )}
          </aside>
        </div>
      </main>
    </>
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
