/**
 * Local Storage Management System
 * Only stores wallet id, nickname, address - nothing else
 * All other data (balance, transactions) is fetched live from blockchain
 */

import { StoredWallet, UserSettings, BackupData, Transaction } from "./types";

const STORAGE_KEYS = {
  WALLETS: "mikrypto_wallets",
  SETTINGS: "mikrypto_settings",
  BALANCE_CACHE: "mikrypto_balance_cache",
  TX_CACHE: "mikrypto_tx_cache",
  VERSION: "1.0.0",
};

// Cache duration: 1 hour in milliseconds
const BALANCE_CACHE_TTL = 60 * 60 * 1000;

const DEFAULT_SETTINGS: UserSettings = {
  preferredCurrency: "USD",
  theme: "black",
  notifications: true,
  autoRefresh: false,
  refreshInterval: 60000,
};

const isBrowser = typeof window !== "undefined";

/**
 * Get all stored wallets from local storage
 */
export function getStoredWallets(): StoredWallet[] {
  if (!isBrowser) return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.WALLETS);
    if (!data) return [];

    const parsed = JSON.parse(data);
    // Migrate old format if needed - only keep id, nickname, address, createdAt
    return parsed.map((w: any) => ({
      id: w.id,
      nickname: w.nickname,
      address: w.address,
      createdAt: w.createdAt || Date.now(),
    }));
  } catch (error) {
    console.error("Error loading wallets:", error);
    return [];
  }
}

/**
 * Save wallets to local storage (only minimal data)
 */
export function saveStoredWallets(wallets: StoredWallet[]): void {
  if (!isBrowser) return;

  try {
    // Only save the minimal required fields
    const minimal = wallets.map((w) => ({
      id: w.id,
      nickname: w.nickname,
      address: w.address,
      createdAt: w.createdAt,
    }));
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(minimal));
  } catch (error) {
    console.error("Error saving wallets:", error);
  }
}

/**
 * Add a new wallet
 */
export function addStoredWallet(nickname: string, address: string): StoredWallet {
  const wallets = getStoredWallets();
  const newWallet: StoredWallet = {
    id: `wallet_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    nickname,
    address,
    createdAt: Date.now(),
  };

  wallets.push(newWallet);
  saveStoredWallets(wallets);
  return newWallet;
}

/**
 * Update an existing wallet (only nickname can be updated)
 */
export function updateStoredWallet(id: string, nickname: string): StoredWallet | null {
  const wallets = getStoredWallets();
  const index = wallets.findIndex((w) => w.id === id);

  if (index === -1) return null;

  wallets[index].nickname = nickname;
  saveStoredWallets(wallets);
  return wallets[index];
}

/**
 * Delete a wallet (also clears its cache)
 */
export function deleteStoredWallet(id: string): boolean {
  const wallets = getStoredWallets();
  const wallet = wallets.find((w) => w.id === id);
  const filtered = wallets.filter((w) => w.id !== id);

  if (filtered.length === wallets.length) return false;

  saveStoredWallets(filtered);

  // Clear cache for deleted wallet
  if (wallet) {
    clearAddressCache(wallet.address);
  }

  return true;
}

/**
 * Get a single wallet by ID
 */
export function getStoredWalletById(id: string): StoredWallet | null {
  const wallets = getStoredWallets();
  return wallets.find((w) => w.id === id) || null;
}

/**
 * Get user settings
 */
export function getSettings(): UserSettings {
  if (!isBrowser) return DEFAULT_SETTINGS;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? { ...DEFAULT_SETTINGS, ...JSON.parse(data) } : DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error loading settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save user settings
 */
export function saveSettings(settings: Partial<UserSettings>): void {
  if (!isBrowser) return;

  try {
    const current = getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

/**
 * Export all data as JSON backup
 */
export function exportBackup(): BackupData {
  return {
    version: STORAGE_KEYS.VERSION,
    exportDate: Date.now(),
    wallets: getStoredWallets(),
    settings: getSettings(),
  };
}

/**
 * Import backup from JSON
 */
export function importBackup(backup: BackupData): { success: boolean; message: string } {
  try {
    if (!backup.version || !backup.wallets) {
      return { success: false, message: "Invalid backup format" };
    }

    // Only import minimal wallet data
    const minimalWallets = backup.wallets.map((w: any) => ({
      id: w.id,
      nickname: w.nickname,
      address: w.address,
      createdAt: w.createdAt || Date.now(),
    }));

    saveStoredWallets(minimalWallets);
    if (backup.settings) {
      saveSettings(backup.settings);
    }

    return {
      success: true,
      message: `Imported ${backup.wallets.length} wallets successfully`,
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Import failed",
    };
  }
}

/**
 * Download backup as JSON file
 */
export function downloadBackup(): void {
  if (!isBrowser) return;

  const backup = exportBackup();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `mikrypto-backup-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Clear all data (including caches)
 */
export function clearAllData(): void {
  if (!isBrowser) return;

  localStorage.removeItem(STORAGE_KEYS.WALLETS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.BALANCE_CACHE);
  localStorage.removeItem(STORAGE_KEYS.TX_CACHE);
}

/**
 * Search wallets by nickname
 */
export function searchStoredWallets(query: string): StoredWallet[] {
  const wallets = getStoredWallets();
  const lowerQuery = query.toLowerCase();

  return wallets.filter((wallet) =>
    wallet.nickname.toLowerCase().includes(lowerQuery) ||
    wallet.address.toLowerCase().includes(lowerQuery)
  );
}

// ============================================
// CACHING FUNCTIONS
// ============================================

interface BalanceCacheEntry {
  balance: number;
  balanceUSD: number;
  timestamp: number;
}

interface BalanceCache {
  [address: string]: BalanceCacheEntry;
}

interface TxCacheEntry {
  transactions: Transaction[];
  lastTxId?: string;
  hasMore: boolean;
}

interface TxCache {
  [address: string]: TxCacheEntry;
}

/**
 * Get balance cache for an address
 */
export function getBalanceCache(address: string): BalanceCacheEntry | null {
  if (!isBrowser) return null;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.BALANCE_CACHE);
    if (!data) return null;

    const cache: BalanceCache = JSON.parse(data);
    const entry = cache[address];

    if (!entry) return null;

    // Check if cache is still valid (1 hour TTL)
    if (Date.now() - entry.timestamp > BALANCE_CACHE_TTL) {
      return null; // Cache expired
    }

    return entry;
  } catch (error) {
    console.error("Error reading balance cache:", error);
    return null;
  }
}

/**
 * Save balance to cache
 */
export function saveBalanceCache(address: string, balance: number, balanceUSD: number): void {
  if (!isBrowser) return;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.BALANCE_CACHE);
    const cache: BalanceCache = data ? JSON.parse(data) : {};

    cache[address] = {
      balance,
      balanceUSD,
      timestamp: Date.now(),
    };

    localStorage.setItem(STORAGE_KEYS.BALANCE_CACHE, JSON.stringify(cache));
  } catch (error) {
    console.error("Error saving balance cache:", error);
  }
}

/**
 * Get transaction cache for an address
 */
export function getTxCache(address: string): TxCacheEntry | null {
  if (!isBrowser) return null;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.TX_CACHE);
    if (!data) return null;

    const cache: TxCache = JSON.parse(data);
    return cache[address] || null;
  } catch (error) {
    console.error("Error reading tx cache:", error);
    return null;
  }
}

/**
 * Save transactions to cache
 */
export function saveTxCache(
  address: string,
  transactions: Transaction[],
  hasMore: boolean,
  lastTxId?: string
): void {
  if (!isBrowser) return;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.TX_CACHE);
    const cache: TxCache = data ? JSON.parse(data) : {};

    cache[address] = {
      transactions,
      lastTxId,
      hasMore,
    };

    localStorage.setItem(STORAGE_KEYS.TX_CACHE, JSON.stringify(cache));
  } catch (error) {
    console.error("Error saving tx cache:", error);
  }
}

/**
 * Add new transactions to cache (prepend to existing)
 */
export function prependTxCache(address: string, newTxs: Transaction[]): void {
  if (!isBrowser) return;

  try {
    const existing = getTxCache(address);
    if (!existing) {
      saveTxCache(address, newTxs, false);
      return;
    }

    // Merge new transactions with existing, avoiding duplicates
    const existingIds = new Set(existing.transactions.map((tx) => tx.id));
    const uniqueNewTxs = newTxs.filter((tx) => !existingIds.has(tx.id));

    const merged = [...uniqueNewTxs, ...existing.transactions];
    saveTxCache(address, merged, existing.hasMore, existing.lastTxId);
  } catch (error) {
    console.error("Error prepending tx cache:", error);
  }
}

/**
 * Append more transactions to cache (for pagination)
 */
export function appendTxCache(
  address: string,
  moreTxs: Transaction[],
  hasMore: boolean,
  lastTxId?: string
): void {
  if (!isBrowser) return;

  try {
    const existing = getTxCache(address);
    if (!existing) {
      saveTxCache(address, moreTxs, hasMore, lastTxId);
      return;
    }

    // Append to existing, avoiding duplicates
    const existingIds = new Set(existing.transactions.map((tx) => tx.id));
    const uniqueMoreTxs = moreTxs.filter((tx) => !existingIds.has(tx.id));

    const merged = [...existing.transactions, ...uniqueMoreTxs];
    saveTxCache(address, merged, hasMore, lastTxId);
  } catch (error) {
    console.error("Error appending tx cache:", error);
  }
}

/**
 * Clear cache for a specific address
 */
export function clearAddressCache(address: string): void {
  if (!isBrowser) return;

  try {
    // Clear balance cache
    const balanceData = localStorage.getItem(STORAGE_KEYS.BALANCE_CACHE);
    if (balanceData) {
      const balanceCache: BalanceCache = JSON.parse(balanceData);
      delete balanceCache[address];
      localStorage.setItem(STORAGE_KEYS.BALANCE_CACHE, JSON.stringify(balanceCache));
    }

    // Clear tx cache
    const txData = localStorage.getItem(STORAGE_KEYS.TX_CACHE);
    if (txData) {
      const txCache: TxCache = JSON.parse(txData);
      delete txCache[address];
      localStorage.setItem(STORAGE_KEYS.TX_CACHE, JSON.stringify(txCache));
    }
  } catch (error) {
    console.error("Error clearing address cache:", error);
  }
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  if (!isBrowser) return;

  localStorage.removeItem(STORAGE_KEYS.BALANCE_CACHE);
  localStorage.removeItem(STORAGE_KEYS.TX_CACHE);
}
