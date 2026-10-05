import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-page flex min-h-[60svh] flex-col items-center justify-center py-24 text-center">
      <p className="title-xs mb-4 text-muted">404</p>
      <h1 className="title-m mb-4">Page not found</h1>
      <p className="body mb-10 max-w-sm text-soft">
        The page you are looking for has moved or does not exist yet.
      </p>
      <Link href="/" className="btn btn-primary">
        Return to the homepage
      </Link>
    </section>
  );
}
