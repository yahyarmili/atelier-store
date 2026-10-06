"use client";

import { useEffect, useSyncExternalStore } from "react";
import { BAG_CHANGE_EVENT, BAG_COUNT_COOKIE } from "@/lib/bag";

// The header badge reads a non-httpOnly hint cookie on the client so catalog
// pages stay static. The /bag page is the source of truth.

const pattern = new RegExp(`(?:^|;\\s*)${BAG_COUNT_COOKIE}=(\\d{1,4})`);

function getSnapshot() {
  return Number(pattern.exec(document.cookie)?.[1] ?? 0);
}

function subscribe(onChange: () => void) {
  // Cookie Store API where supported (catches Set-Cookie from any Server
  // Action), plus our own event and focus as fallbacks.
  const cookieStore = (window as { cookieStore?: EventTarget }).cookieStore;
  cookieStore?.addEventListener("change", onChange);
  window.addEventListener(BAG_CHANGE_EVENT, onChange);
  window.addEventListener("focus", onChange);
  return () => {
    cookieStore?.removeEventListener("change", onChange);
    window.removeEventListener(BAG_CHANGE_EVENT, onChange);
    window.removeEventListener("focus", onChange);
  };
}

export function notifyBagChange() {
  window.dispatchEvent(new Event(BAG_CHANGE_EVENT));
}

export function useBagCount() {
  return useSyncExternalStore(subscribe, getSnapshot, () => 0);
}

/**
 * Rendered by /bag with the freshly priced count: corrects the hint cookie when
 * stock changed since the last bag write (Server Components can't set cookies).
 */
export function BagCountSync({ count }: { count: number }) {
  useEffect(() => {
    if (getSnapshot() === count || !document.cookie.includes(`${BAG_COUNT_COOKIE}=`)) return;
    const secure = location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${BAG_COUNT_COOKIE}=${count}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax${secure}`;
    notifyBagChange();
  }, [count]);
  return null;
}
