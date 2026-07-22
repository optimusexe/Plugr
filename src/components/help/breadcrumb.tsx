import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-[var(--muted)]">
        <li>
          <Link href="/" className="transition hover:text-[var(--accent)]">
            Home
          </Link>
        </li>
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-1.5">
            <svg className="h-3.5 w-3.5 shrink-0 text-black/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
            {item.href ? (
              <Link href={item.href} className="transition hover:text-[var(--accent)]">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-[var(--ink)]" aria-current="page">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
