import { CURRENCY, LOCALE, TIME_ZONE } from "./tax/rules";

const money = new Intl.NumberFormat(LOCALE, {
  style: "currency",
  currency: CURRENCY,
  minimumFractionDigits: 2,
});

const plain = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });

const dateTime = new Intl.DateTimeFormat(LOCALE, {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: TIME_ZONE,
});

export const formatMoney = (n: number) => money.format(n);
export const formatNumber = (n: number) => plain.format(n);
export const formatPercent = (fraction: number, digits = 2) =>
  `${(fraction * 100).toFixed(digits)}%`;
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

/** SG1234567890 → SG******7890 */
export const maskTaxId = (taxId: string) =>
  taxId.length > 6 ? `${taxId.slice(0, 2)}${"•".repeat(taxId.length - 6)}${taxId.slice(-4)}` : taxId;
