import {
  ArrowRight,
  CheckCircle2,
  Link as LinkIcon,
  Radio,
  Scale,
  ShieldCheck,
} from "lucide-react";
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
                Open-market real estate offers
              </p>
              <h1 className="mt-5 text-5xl font-semibold leading-[1.02] tracking-normal text-foreground sm:text-6xl">
                See every offer. No pressure. Just the best deal.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">
                Real estate is changing. Sellers no longer need to rely on a
                single agent or a single offer.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                OpenRE gives owners a direct marketplace where buyers, investors,
                and agents can compete openly while the seller stays in control.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <LinkButton href="/sell" size="lg">
                  Get Offers on Your Property <ArrowRight size={18} />
                </LinkButton>
                <LinkButton href="/listings" variant="secondary" size="lg">
                  Browse Listings
                </LinkButton>
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground">
                No contracts. No pressure. Just offers.
              </p>
            </div>
            <Card className="p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-success">
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-30" />
                    <span className="relative inline-flex size-2 rounded-full bg-success" />
                  </span>
                  3 offers received
                </div>
                <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <Radio size={16} className="text-primary" />
                  Live marketplace
                </div>
              </div>
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
              text="Create your listing without agents or contracts."
            />
            <Value
              icon={<LinkIcon />}
              title="Share your link"
              text="Send your property to buyers, investors, and agents."
            />
            <Value
              icon={<Scale />}
              title="Compare offers"
              text="See all offers side-by-side and choose the best outcome."
            />
          </div>
        </section>

        <section className="border-y border-border bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <h2 className="text-3xl font-semibold">How OpenRE Works</h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                OpenRE turns a listing into a competitive offer process that the
                seller controls from start to finish.
              </p>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                [
                  "1",
                  "List your property",
                  "Publish a clean, shareable listing for the open market.",
                ],
                [
                  "2",
                  "Receive competing offers",
                  "Buyers, investors, and agents can submit direct offers.",
                ],
                [
                  "3",
                  "Choose the best deal",
                  "Compare price, terms, and timing before making a decision.",
                ],
              ].map(([step, title, text]) => (
                <Card key={step} className="p-5">
                  <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {step}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {text}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-background">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
                Built for seller control
              </p>
              <h2 className="mt-3 text-3xl font-semibold">
                Why OpenRE is different
              </h2>
              <p className="mt-3 leading-7 text-muted-foreground">
                Traditional portals mostly organize listings. OpenRE focuses on
                exposing your deal to the market and helping you compare the
                offers that come back.
              </p>
            </div>
            <Card className="p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "No forced agent contracts",
                  "Multiple offers, not just one",
                  "Full transparency on deal terms",
                  "You stay in control",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-md border border-border bg-white p-4"
                  >
                    <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
                    <p className="text-sm font-medium">{item}</p>
                  </div>
                ))}
              </div>
            </Card>
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
              <div className="mt-8 rounded-lg border border-dashed border-border p-8 text-center">
                <h3 className="text-xl font-semibold">
                  Be the first to list and start receiving offers
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Put your property in front of buyers, investors, and agents so
                  the market can compete for your deal.
                </p>
                <LinkButton href="/sell" className="mt-5">
                  List Your Property
                </LinkButton>
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
