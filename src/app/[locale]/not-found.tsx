import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-lg mx-auto py-24 text-center">
      <p
        className="text-8xl font-bold text-muted-foreground/20 mb-6 select-none"
        aria-hidden="true"
      >
        404
      </p>
      <h1 className="text-2xl font-semibold mb-3">Page not found</h1>
      <p className="text-muted-foreground mb-8">
        This page doesn&apos;t exist or has been moved.
      </p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
      >
        Browse all tools
      </Link>
    </div>
  );
}
