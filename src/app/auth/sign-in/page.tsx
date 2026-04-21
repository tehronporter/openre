import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { AuthForm } from "@/components/auth/auth-form";
import { Card } from "@/components/ui/card";

export default function SignInPage() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md items-center px-4 py-12">
        <Card className="w-full p-6">
          <h1 className="text-2xl font-semibold">Sign in</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Continue to your listings, offers, and conversations.
          </p>
          <div className="mt-6">
            <AuthForm mode="sign-in" />
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            New to OpenRE?{" "}
            <Link href="/auth/sign-up" className="font-medium text-primary">
              Create an account
            </Link>
          </p>
        </Card>
      </main>
    </>
  );
}
