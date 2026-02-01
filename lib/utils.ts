/**
 * Utility functions for Mikrypto
 * Formatting, calculations, and helper functions
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

  // Handle null, undefined, or NaN
  const safeAmount = isNaN(amount) || amount == null ? 0 : amount;

  const symbol = symbols[currency];
  const formatted = safeAmount.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return `${symbol}${formatted}`;
}

/**
 * Format crypto amount with symbol
 */
export function formatCrypto(amount: number, symbol: string): string {
  // Handle null, undefined, or NaN
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
 * Calculate total portfolio value
 */
export function calculateTotalBalance(wallets: Wallet[]): number {
  return wallets.reduce((total, wallet) => {
    const balance = wallet.balanceUSD || 0;
    return total + (isNaN(balance) ? 0 : balance);
  }, 0);
}

/**
 * Generate chart data from transactions
 */
export function generateChartData(transactions: Transaction[], days: number = 30): ChartDataPoint[] {
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const data: ChartDataPoint[] = [];

  for (let i = days; i >= 0; i--) {
    const timestamp = now - (i * dayMs);
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    const relevantTxs = transactions.filter(tx => tx.timestamp <= timestamp);
    const balance = relevantTxs.reduce((sum, tx) => {
      return sum + (tx.type === "receive" ? tx.amount : -tx.amount);
    }, 0);

    data.push({
      date: dateStr,
      balance: Math.max(0, balance),
      timestamp,
    });
  }

  return data;
}

/**
 * Convert between currencies
 * Note: Using approximate exchange rates. For production, use live exchange rate API
 */
export function convertCurrency(
  amount: number,
  from: Currency,
  to: Currency
): number {
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

  // Convert from -> USD -> to
  const usdAmount = amount / rates[from];
  return usdAmount * rates[to];
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Calculate percentage change
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Get chain color
 */
export function getChainColor(chain: string): string {
  const colors: Record<string, string> = {
    Ethereum: "#627EEA",
    Bitcoin: "#F7931A",
    "Binance Smart Chain": "#F3BA2F",
    Solana: "#14F195",
    Polygon: "#8247E5",
    Avalanche: "#E84142",
    Arbitrum: "#28A0F0",
    Optimism: "#FF0420",
    Base: "#0052FF",
    Other: "#666666",
  };

  return colors[chain] || colors.Other;
}

/**
 * Validate wallet address format
 */
export function isValidAddress(address: string, chain: string): boolean {
  if (!address) return false;

  switch (chain) {
    case "Ethereum":
    case "Binance Smart Chain":
    case "Polygon":
    case "Arbitrum":
    case "Optimism":
    case "Base":
      return /^0x[a-fA-F0-9]{40}$/.test(address);
    case "Bitcoin":
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(address);
    case "Solana":
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
    default:
      return address.length > 20;
  }
}
