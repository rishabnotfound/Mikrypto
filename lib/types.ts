/**
 * Type definitions for Mikrypto
 * Bitcoin-only wallet tracker
 */

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "INR" | "AUD" | "CAD" | "CNY";

/**
 * Transaction from mempool.space API
 */
export interface Transaction {
  id: string;
  hash: string;
  type: "send" | "receive";
  amount: number; // in BTC
  timestamp: number;
  from: string;
  to: string;
  status: "confirmed" | "pending";
  fee?: number; // in BTC
  blockHeight?: number;
}

/**
 * Stored wallet data (minimal - only what we need to persist)
 */
export interface StoredWallet {
  id: string;
  nickname: string;
  address: string;
  createdAt: number;
}

/**
 * Full wallet data with live blockchain data
 */
export interface Wallet extends StoredWallet {
  balance: number; // in BTC
  balanceUSD: number;
  transactions: Transaction[];
  lastUpdated: number;
  // Pagination
  hasMoreTxs?: boolean;
  lastTxId?: string;
}

/**
 * User settings
 */
export interface UserSettings {
  preferredCurrency: Currency;
  theme: "dark" | "black";
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

/**
 * Backup data format
 */
export interface BackupData {
  version: string;
  exportDate: number;
  wallets: StoredWallet[];
  settings: UserSettings;
}

/**
 * Chart data point for balance history
 */
export interface ChartDataPoint {
  date: string;
  balance: number;
  timestamp: number;
}
