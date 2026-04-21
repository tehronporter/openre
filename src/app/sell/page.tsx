import { redirect } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { LinkButton } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getUser } from "@/lib/auth";

export default async function SellPage() {
  const user = await getUser();
  if (user) redirect("/dashboard/listings/new");

  return (
    <>
      <AppHeader />
      <main className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-primary">
            Seller activation
          </p>
          <h1 className="mt-4 text-4xl font-semibold">
            Sell your property with a link buyers can act on.
          </h1>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            Create a listing, publish it, then land in your Offer Command Center
            where you can share the listing and compare every offer.
          </p>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-5">
          {["Enter address", "Add details", "Upload photos", "Publish", "Compare offers"].map(
            (step, index) => (
              <Card key={step} className="p-4">
                <p className="text-sm font-semibold text-primary">Step {index + 1}</p>
                <p className="mt-2 font-medium">{step}</p>
              </Card>
            ),
          )}
        </div>
        <div className="mt-8 flex gap-3">
          <LinkButton href="/auth/sign-up" size="lg">
            Sell Your Property
          </LinkButton>
          <LinkButton href="/auth/sign-in" variant="secondary" size="lg">
            Sign in
          </LinkButton>
        </div>
      </main>
    </>
  );
}
