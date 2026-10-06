"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useBagCount } from "@/components/bag/bag-count";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from "@/components/icons";
import { navigation } from "@/lib/catalog";

// Routes whose first section is a full-bleed image the header floats over.
const OVERLAY_ROUTES = new Set(["/"]);

export function SiteHeader() {
  const pathname = usePathname();
  const overlay = OVERLAY_ROUTES.has(pathname);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDialogElement>(null);
  const bagCount = useBagCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu after client-side navigation.
  useEffect(() => {
    menuRef.current?.close();
  }, [pathname]);

  const transparent = overlay && !scrolled;

  return (
    <>
      <header
        data-transparent={transparent || undefined}
        className="sticky top-0 z-40 h-header bg-paper text-ink transition-colors duration-700 ease-luxe data-transparent:bg-transparent data-transparent:text-paper data-transparent:hover:bg-paper data-transparent:hover:text-ink"
      >
        <div className="container-page grid h-full grid-cols-[1fr_auto_1fr] items-center">
          <div className="flex items-center gap-2 -ml-2.5">
            <button
              type="button"
              className="inline-flex h-10 items-center gap-2 px-2.5 transition-opacity duration-300 ease-luxe hover:opacity-60"
              aria-haspopup="dialog"
              onClick={() => menuRef.current?.showModal()}
            >
              <MenuIcon />
              <span className="title-xs hidden md:inline">Menu</span>
            </button>
            <Link href="/search" className="btn-icon md:hidden" aria-label="Search">
              <SearchIcon />
            </Link>
          </div>

          <Link
            href="/"
            className="wordmark text-2xl lg:text-[1.75rem]"
            aria-label="Atelier — home"
          >
            Atelier
          </Link>

          <nav aria-label="Account" className="flex items-center justify-end -mr-2.5">
            <Link href="/search" className="btn-icon hidden md:inline-flex" aria-label="Search">
              <SearchIcon />
            </Link>
            <Link href="/account" className="btn-icon" aria-label="Account">
              <UserIcon />
            </Link>
            <Link
              href="/bag"
              className="btn-icon relative"
              aria-label={`Shopping bag, ${bagCount} ${bagCount === 1 ? "item" : "items"}`}
            >
              <BagIcon />
              {bagCount > 0 && (
                <span
                  aria-hidden="true"
                  className="caption absolute top-1 right-0.5 min-w-3.5 rounded-full bg-ink px-1 text-center text-paper tabular-nums"
                >
                  {bagCount > 99 ? "99+" : bagCount}
                </span>
              )}
            </Link>
          </nav>
        </div>
      </header>

      {/* Pull overlay pages up under the header so the hero sits behind it. */}
      {overlay && <div aria-hidden="true" className="-mt-header" />}

      <dialog
        ref={menuRef}
        aria-label="Menu"
        className="menu-drawer"
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-header items-center justify-between px-gutter">
            <span className="wordmark text-xl">Atelier</span>
            <button
              type="button"
              className="btn-icon -mr-2.5"
              aria-label="Close menu"
              onClick={() => menuRef.current?.close()}
            >
              <CloseIcon />
            </button>
          </div>
          <nav aria-label="Main" className="flex-1 overflow-y-auto px-gutter py-6">
            <ul className="space-y-5">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="title-m link-quiet">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="hairline-t space-y-4 px-gutter py-8">
            <Link href="/account" className="link-muted block">
              My account
            </Link>
            <Link href="/client-services" className="link-muted block">
              Client services
            </Link>
            <Link href="/stores" className="link-muted block">
              Store locator
            </Link>
          </div>
        </div>
      </dialog>
    </>
  );
}
