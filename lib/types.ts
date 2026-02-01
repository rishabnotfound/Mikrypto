/**
 * Type definitions for Mikrypto
 * Contains all interfaces and types used throughout the application
 */

export type Chain =
  | "Ethereum"
  | "Bitcoin"
  | "Binance Smart Chain"
  | "Solana"
  | "Polygon"
  | "Avalanche"
  | "Arbitrum"
  | "Optimism"
  | "Base"
  | "Other";

export type Currency = "USD" | "EUR" | "GBP" | "JPY" | "INR" | "AUD" | "CAD" | "CNY";

export interface Transaction {
  id: string;
  hash: string;
  type: "send" | "receive";
  amount: number;
  currency: string;
  timestamp: number;
  from: string;
  to: string;
  status: "confirmed" | "pending" | "failed";
  fee?: number;
}

export interface Wallet {
  id: string;
  nickname: string;
  address: string;
  chain: Chain;
  coin: string;
  coinSymbol: string;
  coinLogo: string;
  balance: number;
  balanceUSD: number;
  transactions: Transaction[];
  createdAt: number;
  lastUpdated: number;
}

export interface PortfolioStats {
  totalBalance: number;
  totalWallets: number;
  totalTransactions: number;
  top24hChange: number;
  topPerformer: string;
}

export interface BackupData {
  version: string;
  exportDate: number;
  wallets: Wallet[];
  settings: UserSettings;
}

export interface UserSettings {
  preferredCurrency: Currency;
  theme: "dark" | "black";
  accentColor: string;
  notifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
}

export interface ChartDataPoint {
  date: string;
  balance: number;
  timestamp: number;
}
