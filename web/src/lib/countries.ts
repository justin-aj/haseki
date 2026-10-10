/** Shipping destinations, most common markets first (brand doc §2.4: India, Gulf, UK, US, Singapore). */
export const priorityCountries = ["IN", "AE", "SA", "QA", "OM", "KW", "BH", "GB", "US", "SG", "CA", "AU"];

const others = [
  "AT", "BE", "CH", "DE", "DK", "ES", "FI", "FR", "IE", "IT", "JP", "LK", "MY", "MV", "NL", "NO", "NZ",
  "PT", "SE", "ZA",
];

export function countryOptions(): { code: string; name: string }[] {
  const names = new Intl.DisplayNames(["en"], { type: "region" });
  const named = (code: string) => ({ code, name: names.of(code) ?? code });
  return [...priorityCountries.map(named), ...others.map(named).sort((a, b) => a.name.localeCompare(b.name))];
}

/** Default destination for a market currency. */
export function defaultCountry(currency: string): string {
  return { INR: "IN", AED: "AE", GBP: "GB", USD: "US" }[currency] ?? "IN";
}
