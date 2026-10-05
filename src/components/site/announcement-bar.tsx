import Link from "next/link";

export function AnnouncementBar() {
  return (
    <div className="surface-inverse">
      <p className="container-page flex h-10 items-center justify-center gap-1 text-center">
        <span className="hidden sm:inline">
          Complimentary express shipping and returns.
        </span>
        <Link href="/new-in" className="link">
          Discover the new season
        </Link>
      </p>
    </div>
  );
}
