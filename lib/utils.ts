/**
 * Utility functions for Mikrypto
 * Bitcoin-only wallet tracker utilities
 */

import { Currency, Wallet, Transaction, ChartDataPoint } from "./types";

/**
 * Format number as currency with symbol
 */
export function formatCurrency(
  amount: number,
  currency: Currency = "USD",
  decimals: number = 2
): string {
  const symbols: Record<Currency, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    INR: "₹",
    AUD: "A$",
    CAD: "C$",
    CNY: "¥",
  };

  const safeAmount = isNaN(amount) || amount == null ? 0 : amount;
  const symbol = symbols[currency];
  const formatted = safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol}${formatted}`;
}

/**
 * Format Bitcoin amount
 */
export function formatBTC(amount: number): string {
  const safeAmount = isNaN(amount) || amount == null ? 0 : amount;
  return `${safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8,
  })} BTC`;
}

/**
 * Format crypto amount with symbol (kept for compatibility)
 */
export function formatCrypto(amount: number, symbol: string): string {
  const safeAmount = isNaN(amount) || amount == null ? 0 : amount;
  return `${safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 8,
  })} ${symbol}`;
}

/**
 * Shorten wallet address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  if (!address) return "";
  if (address.length <= chars * 2 + 2) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format timestamp to readable date
 */
export function formatDate(timestamp: number, format: "short" | "long" = "short"): string {
  const date = new Date(timestamp);

  if (format === "short") {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Calculate total portfolio value in USD
 */
export function calculateTotalBalance(wallets: Wallet[]): number {
  return wallets.reduce((total, wallet) => {
    const balance = wallet.balanceUSD || 0;
    return total + (isNaN(balance) ? 0 : balance);
  }, 0);
}

/**
 * Calculate total BTC balance
 */
export function calculateTotalBTC(wallets: Wallet[]): number {
  return wallets.reduce((total, wallet) => {
    const balance = wallet.balance || 0;
    return total + (isNaN(balance) ? 0 : balance);
  }, 0);
}

/**
 * Generate chart data from transactions
 */
export function generateChartData(
  transactions: Transaction[],
  days: number = 30,
  currentPrice: number = 0
): ChartDataPoint[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const data: ChartDataPoint[] = [];

  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * dayMs;
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const relevantTxs = transactions.filter((tx) => tx.timestamp <= timestamp);
    const balanceInBTC = relevantTxs.reduce((sum, tx) => {
      return sum + (tx.type === "receive" ? tx.amount : -tx.amount);
    }, 0);

    const balanceInUSD = balanceInBTC * currentPrice;

    data.push({
      date: dateStr,
      balance: Math.max(0, balanceInUSD),
      timestamp,
    });
  }

  return data;
}

/**
 * Convert between currencies
 */
export function convertCurrency(amount: number, from: Currency, to: Currency): number {
  // Exchange rates relative to USD (approximate)
  const rates: Record<Currency, number> = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.5,
    INR: 83.2,
    AUD: 1.52,
    CAD: 1.36,
    CNY: 7.24,
  };

  const usdAmount = amount / rates[from];
  return usdAmount * rates[to];
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Bitcoin orange color
 */
export function getBitcoinColor(): string {
  return "#F7931A";
}

/**
 * Get chain color (kept for compatibility - always returns Bitcoin orange)
 */
export function getChainColor(_chain: string): string {
  return "#F7931A";
}

/**
 * Validate Bitcoin address format
 */
export function isValidBitcoinAddress(address: string): boolean {
  if (!address) return false;
  // Legacy (P2PKH/P2SH) or Bech32 (P2WPKH/P2WSH)
  return (
    /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) ||
    /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(address)
  );
}
