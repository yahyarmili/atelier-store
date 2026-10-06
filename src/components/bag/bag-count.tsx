"use client";

import { useSyncExternalStore } from "react";
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
