import Link from "next/link";

const items = [
  ["Overview", "/dashboard"],
  ["Listings", "/dashboard/listings"],
  ["Offers", "/dashboard/offers"],
];

export function DashboardNav() {
  return (
    <nav className="flex gap-2 overflow-x-auto border-b border-border pb-4 text-sm">
      {items.map(([label, href]) => (
        <Link
          key={href}
          href={href}
          className="rounded-md border border-border bg-surface px-3 py-2 font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
        >
          {label}
        </Link>
      ))}
    </nav>
  );
}
