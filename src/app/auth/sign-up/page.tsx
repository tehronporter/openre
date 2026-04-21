import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { AuthForm } from "@/components/auth/auth-form";
import { Card } from "@/components/ui/card";

export default function SignUpPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
        <Card className="w-full p-6">
          <h1 className="text-2xl font-semibold">Create your OpenRE account</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Sellers can list directly. Buyers can submit clear offers.
          </p>
          <div className="mt-6">
            <AuthForm mode="sign-up" />
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth/sign-in" className="font-medium text-primary">
              Sign in
            </Link>
          </p>
        </Card>
      </main>
    </>
  );
}
