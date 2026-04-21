import Link from "next/link";
import { LogOut } from "lucide-react";
import { getUser } from "@/lib/auth";
import { Button, LinkButton } from "@/components/ui/button";
import { signOut } from "@/app/actions/auth";

export async function AppHeader() {
  const user = await getUser();

  return (
    <header className="border-b border-border bg-background/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold tracking-normal">
          OpenRE
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/listings" className="hover:text-foreground">
            Browse
          </Link>
          <Link href="/sell" className="hover:text-foreground">
            Sell
          </Link>
          {user ? (
            <Link href="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <form action={signOut}>
              <Button variant="ghost" size="sm" aria-label="Sign out">
                <LogOut size={16} />
                Sign out
              </Button>
            </form>
          ) : (
            <>
              <LinkButton href="/auth/sign-in" variant="ghost" size="sm">
                Sign in
              </LinkButton>
              <LinkButton href="/sell" size="sm">
                Sell Your Property
              </LinkButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
