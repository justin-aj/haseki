"use client";

import { useSyncExternalStore } from "react";
import type { Currency } from "./api/client";
import { CURRENCY_COOKIE } from "./currency";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function getSnapshot(): Currency {
  return (document.documentElement.dataset.currency as Currency) ?? "INR";
}

export function setCurrency(code: Currency) {
  document.documentElement.dataset.currency = code;
  document.cookie = `${CURRENCY_COOKIE}=${code}; path=/; max-age=31536000; samesite=lax`;
  listeners.forEach((l) => l());
}

/** Visitor's market currency. Server snapshot is INR; the client value comes from the boot script. */
export function useCurrency(): Currency {
  return useSyncExternalStore(subscribe, getSnapshot, () => "INR");
}
