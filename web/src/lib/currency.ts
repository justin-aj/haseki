import type { Currency, Money } from "./api/client";

export const CURRENCIES: { code: Currency; label: string; locale: string }[] = [
  { code: "INR", label: "₹ INR", locale: "en-IN" },
  { code: "USD", label: "$ USD", locale: "en-US" },
  { code: "GBP", label: "£ GBP", locale: "en-GB" },
  { code: "AED", label: "AED", locale: "en-AE" },
];

export const CURRENCY_COOKIE = "hsk_cur";

/** Deterministic formatting (explicit locale) so server and client output match. */
export function formatMoney({ currency, amount_minor }: Money): string {
  const locale = CURRENCIES.find((c) => c.code === currency)?.locale ?? "en-IN";
  const major = amount_minor / 100;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: Number.isInteger(major) ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(major);
}

/**
 * Runs before first paint. Picks the cookie value, else guesses the market from the
 * time zone, and sets html[data-currency]. Kept tiny and dependency-free.
 */
export const currencyBootScript = `(function(){try{var m=document.cookie.match(/(?:^|; )${CURRENCY_COOKIE}=([A-Z]{3})/);var c=m&&m[1];if(!c){var z=Intl.DateTimeFormat().resolvedOptions().timeZone||"";c=/^Asia\\/(Kolkata|Calcutta)/.test(z)?"INR":/^Asia\\/(Dubai|Muscat|Qatar|Bahrain|Kuwait|Riyadh)/.test(z)?"AED":/^Europe\\/(London|Belfast)/.test(z)?"GBP":"USD"}if(["INR","USD","GBP","AED"].indexOf(c)<0)c="INR";document.documentElement.dataset.currency=c}catch(e){}})();`;
