import type { CurrencyCode, Money } from "@/types/money";

const MINOR_UNITS_PER_MAJOR: Record<CurrencyCode, number> = {
  INR: 100,
};

const LOCALE_BY_CURRENCY: Record<CurrencyCode, string> = {
  INR: "en-IN",
};

/** Create a Money value from an integer amount in minor units (paise). */
export function createMoney(amount: number, currency: CurrencyCode = "INR"): Money {
  return { amount: Math.round(amount), currency };
}

export function multiplyMoney(value: Money, factor: number): Money {
  return { amount: Math.round(value.amount * factor), currency: value.currency };
}

export function addMoney(a: Money, b: Money): Money {
  assertSameCurrency(a, b);
  return { amount: a.amount + b.amount, currency: a.currency };
}

export function sumMoney(values: readonly Money[], currency: CurrencyCode = "INR"): Money {
  return values.reduce<Money>((acc, value) => addMoney(acc, value), { amount: 0, currency });
}

export function isSameCurrency(a: Money, b: Money): boolean {
  return a.currency === b.currency;
}

/** Format money for display, e.g. { amount: 49900, currency: "INR" } -> "₹499". */
export function formatMoney(value: Money): string {
  const major = value.amount / MINOR_UNITS_PER_MAJOR[value.currency];
  return new Intl.NumberFormat(LOCALE_BY_CURRENCY[value.currency], {
    style: "currency",
    currency: value.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(major);
}

function assertSameCurrency(a: Money, b: Money): void {
  if (a.currency !== b.currency) {
    throw new Error(`Cannot combine amounts in different currencies: ${a.currency} and ${b.currency}`);
  }
}
