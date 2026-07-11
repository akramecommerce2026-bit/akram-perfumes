"use client";

import { Download, FileSpreadsheet, FileText, Sheet } from "lucide-react";

import { formatRupees } from "@/lib/admin/analytics-format";
import { SHIPMENT_STATUS_LABELS } from "@/types/shipment";
import type { AnalyticsDashboard } from "@/types/admin-analytics";

interface Block {
  title: string;
  columns: string[];
  rows: string[][];
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));
}

function buildBlocks(d: AnalyticsDashboard): Block[] {
  const o = d.overview;
  const c = d.customers;
  return [
    {
      title: "Overview",
      columns: ["Metric", "Value"],
      rows: [
        ["Total revenue", formatRupees(o.totalRevenue.amount)],
        ["Today's revenue", formatRupees(o.todayRevenue.amount)],
        ["Monthly revenue", formatRupees(o.monthRevenue.amount)],
        ["Orders today", String(o.ordersToday)],
        ["Orders this month", String(o.ordersThisMonth)],
        ["Total orders", String(o.totalOrders)],
        ["Average order value", formatRupees(o.averageOrderValue.amount)],
        ["Returning customers", String(o.returningCustomers)],
        ["New customers", String(o.newCustomers)],
        ["Conversion rate", o.conversionRate === null ? "N/A" : `${(o.conversionRate * 100).toFixed(1)}%`],
        ["Pending orders", String(o.pendingOrders)],
        ["Processing orders", String(o.processingOrders)],
        ["Shipped orders", String(o.shippedOrders)],
        ["Delivered orders", String(o.deliveredOrders)],
        ["Cancelled orders", String(o.cancelledOrders)],
      ],
    },
    {
      title: `Orders by status (${d.range.label})`,
      columns: ["Status", "Orders"],
      rows: d.statusBreakdown.map((s) => [SHIPMENT_STATUS_LABELS[s.status], String(s.count)]),
    },
    {
      title: `Best selling products (${d.range.label})`,
      columns: ["Product", "Units sold", "Revenue"],
      rows: d.bestSellers.map((b) => [b.name, String(b.unitsSold), formatRupees(b.revenue.amount)]),
    },
    {
      title: `Revenue by category (${d.range.label})`,
      columns: ["Category", "Revenue"],
      rows: d.categoryRevenue.map((c) => [c.name, formatRupees(c.revenue.amount)]),
    },
    {
      title: "Customer insights",
      columns: ["Metric", "Value"],
      rows: [
        ["Total customers", String(c.totalCustomers)],
        ["Returning customers", String(c.returningCustomers)],
        ["New customers", String(c.newCustomers)],
        ["Repeat purchase rate", `${(c.repeatPurchaseRate * 100).toFixed(1)}%`],
        ["Average customer spend", formatRupees(c.averageCustomerSpend.amount)],
      ],
    },
    {
      title: "Recent orders",
      columns: ["Order", "Customer", "Amount", "Payment", "Shipment", "Date"],
      rows: d.recentOrders.map((r) => [
        r.orderNumber,
        r.customerName,
        formatRupees(r.total.amount),
        r.paymentStatus,
        SHIPMENT_STATUS_LABELS[r.shipmentStatus],
        formatDate(r.createdAt),
      ]),
    },
  ];
}

function csvEscape(value: string): string {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

function toCsv(blocks: Block[]): string {
  const lines: string[] = [];
  for (const block of blocks) {
    lines.push(csvEscape(block.title));
    lines.push(block.columns.map(csvEscape).join(","));
    for (const row of block.rows) lines.push(row.map(csvEscape).join(","));
    lines.push("");
  }
  return lines.join("\n");
}

function esc(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function toHtml(blocks: Block[], title: string): string {
  const tables = blocks
    .map(
      (block) => `
      <h2>${esc(block.title)}</h2>
      <table>
        <thead><tr>${block.columns.map((c) => `<th>${esc(c)}</th>`).join("")}</tr></thead>
        <tbody>${block.rows
          .map((r) => `<tr>${r.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`)
          .join("")}</tbody>
      </table>`,
    )
    .join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${esc(title)}</title>
    <style>
      body{font-family:Arial,Helvetica,sans-serif;color:#1a1a1a;padding:32px;max-width:900px;margin:0 auto}
      h1{font-size:22px;margin:0 0 4px}
      .sub{color:#666;margin:0 0 24px;font-size:13px}
      h2{font-size:15px;margin:24px 0 8px;border-bottom:2px solid #c8962a;padding-bottom:4px}
      table{width:100%;border-collapse:collapse;margin-bottom:8px;font-size:13px}
      th,td{text-align:left;padding:7px 10px;border-bottom:1px solid #e5e5e5}
      th{background:#faf6ec;color:#7a5c12;font-weight:600}
    </style></head><body>
    <h1>Akram Perfumes — Analytics</h1>
    <p class="sub">${esc(title)} · Generated ${esc(formatDate(new Date().toISOString()))}</p>
    ${tables}
  </body></html>`;
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportMenu({ dashboard }: { dashboard: AnalyticsDashboard }) {
  const stamp = new Date().toISOString().slice(0, 10);
  const base = `akram-analytics-${dashboard.range.preset}-${stamp}`;

  function onCsv() {
    download(toCsv(buildBlocks(dashboard)), `${base}.csv`, "text/csv;charset=utf-8");
  }

  function onExcel() {
    download(
      toHtml(buildBlocks(dashboard), dashboard.range.label),
      `${base}.xls`,
      "application/vnd.ms-excel",
    );
  }

  function onPdf() {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(toHtml(buildBlocks(dashboard), dashboard.range.label));
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <details className="group relative">
      <summary className="inline-flex h-9 cursor-pointer list-none items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted [&::-webkit-details-marker]:hidden">
        <Download className="size-4" aria-hidden="true" /> Export
      </summary>
      <div className="absolute right-0 z-20 mt-1 flex w-44 flex-col gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-lg">
        <button type="button" onClick={onCsv} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted">
          <FileText className="size-4 text-muted-foreground" aria-hidden="true" /> CSV
        </button>
        <button type="button" onClick={onExcel} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted">
          <FileSpreadsheet className="size-4 text-muted-foreground" aria-hidden="true" /> Excel
        </button>
        <button type="button" onClick={onPdf} className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted">
          <Sheet className="size-4 text-muted-foreground" aria-hidden="true" /> PDF
        </button>
      </div>
    </details>
  );
}
