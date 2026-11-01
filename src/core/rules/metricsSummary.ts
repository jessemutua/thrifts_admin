// src/core/rules/metricsSummary.ts
// The Metrics page as plain text, ready to paste into an investor update or a WhatsApp message.
// Pure: imports only the formatting rules.
import { formatCount, formatDate, formatKes } from './formatRules.ts';

type Input = {
  generatedAt: string;
  merchants: { stores: number; mainShops: number; sellingLast30Days: number };
  stock: { valueKes: number; units: number; shopsWithStock: number };
  products: { live: number };
  sales: {
    allTime: { count: number; totalKes: number; avgBasketKes: number };
    last30: { count: number; totalKes: number };
    growthPct: number | null;
    mpesaSharePct: number | null;
  };
};

export function growthText(pct: number | null): string {
  if (pct === null) return 'no sales in the 30 days before';
  return `${pct >= 0 ? '+' : ''}${pct}% on the 30 days before`;
}

export function metricsSummary(m: Input): string {
  return [
    `Thrifts, ${formatDate(m.generatedAt)}`,
    `Merchants: ${formatCount(m.merchants.mainShops)} businesses, ${formatCount(m.merchants.stores)} stores; ${formatCount(m.merchants.sellingLast30Days)} sold in the last 30 days`,
    `Stock on the platform: ${formatKes(m.stock.valueKes)} at selling price (${formatCount(m.stock.units)} units, ${formatCount(m.products.live)} products, ${formatCount(m.stock.shopsWithStock)} stores)`,
    `Sales processed: ${formatKes(m.sales.allTime.totalKes)} from ${formatCount(m.sales.allTime.count)} sales (average ${formatKes(m.sales.allTime.avgBasketKes)})`,
    `Last 30 days: ${formatKes(m.sales.last30.totalKes)} from ${formatCount(m.sales.last30.count)} sales, ${growthText(m.sales.growthPct)}`,
    m.sales.mpesaSharePct === null ? '' : `M-Pesa share of sales value: ${m.sales.mpesaSharePct}%`,
  ].filter(Boolean).join('\n');
}
