/**
 * Currency + Money value object.
 *
 * Money is stored in the smallest currency unit (paise for INR) as an integer
 * to avoid floating-point rounding errors — the correct choice for a system
 * that will eventually process real orders and payments.
 */

export type CurrencyCode = "INR";

export interface Money {
  /** Amount in the smallest currency unit (paise for INR). Always an integer. */
  readonly amount: number;
  readonly currency: CurrencyCode;
}
