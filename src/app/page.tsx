import { ArrowRight, CheckCircle2, Link as LinkIcon, Scale } from "lucide-react";
import { AppHeader } from "@/components/app-header";
import { ListingCard } from "@/components/listings/listing-card";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getRecentListings } from "@/lib/data";

export default async function Home() {
  const listings = await getRecentListings(3);

  return (
    <>
      <AppHeader />
      <main>
        <section className="border-b border-border bg-background">
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
                Seller-first real estate marketplace
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-6xl">
                Compare real offers and choose your best outcome.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                OpenRE helps owners list directly, share a public listing link,
                invite buyers and investors, and compare offers with more
                transparency.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/sell" size="lg">
                  Sell Your Property <ArrowRight size={18} />
                </LinkButton>
                <LinkButton href="/listings" variant="secondary" size="lg">
                  Browse Listings
                </LinkButton>
              </div>
            </div>
            <Card className="p-6">
              <div className="rounded-md bg-muted p-5">
                <p className="text-sm font-medium text-primary">
                  Offer Command Center
                </p>
                <p className="mt-2 text-3xl font-semibold">$612,000</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Strongest offer · cash · 18 day close
                </p>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  ["Highest price", "$612,000"],
                  ["Fastest close", "14 days"],
                  ["Most recent", "Today"],
                ].map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between rounded-md border border-border bg-white p-4"
                  >
                    <span className="text-sm text-muted-foreground">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            <Value
              icon={<CheckCircle2 />}
              title="List directly"
              text="Create a clean listing and publish when you are ready."
            />
            <Value
              icon={<LinkIcon />}
              title="Share your link"
              text="Invite serious buyers and investors from day one."
            />
            <Value
              icon={<Scale />}
              title="Compare offers"
              text="See price, financing, timing, and status in one decision view."
            />
          </div>
        </section>

        <section className="border-t border-border bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold">Recent listings</h2>
                <p className="mt-2 text-muted-foreground">
                  Marketplace discovery supports seller-driven sharing.
                </p>
              </div>
              <LinkButton href="/listings" variant="secondary">
                View all
              </LinkButton>
            </div>
            {listings.length ? (
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                Listings will appear here after Supabase is configured and
                sellers publish their first properties.
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function Value({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <Card className="p-5">
      <div className="text-primary [&_svg]:size-6">{icon}</div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
    </Card>
  );
}
