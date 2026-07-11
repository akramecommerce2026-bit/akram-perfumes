/** Client-safe compact formatters for analytics charts (INR, integer paise). */

/** e.g. 1519100 paise -> "₹15.2k"; 39900 -> "₹399"; 12000000 -> "₹1.2L". */
export function formatCompactRupees(paise: number): string {
  const rupees = paise / 100;
  if (rupees >= 10000000) return `₹${(rupees / 10000000).toFixed(1)}Cr`;
  if (rupees >= 100000) return `₹${(rupees / 100000).toFixed(1)}L`;
  if (rupees >= 1000) return `₹${(rupees / 1000).toFixed(1)}k`;
  return `₹${Math.round(rupees)}`;
}

/** Full rupee amount with grouping, no decimals. e.g. 1519100 -> "₹15,191". */
export function formatRupees(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(paise / 100);
}
