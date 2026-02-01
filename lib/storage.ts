/**
 * Local Storage Management System
 * Handles wallet data persistence, backup, and restore functionality
 */

import { Wallet, UserSettings, BackupData, Currency } from "./types";

const STORAGE_KEYS = {
  WALLETS: "mikrypto_wallets",
  SETTINGS: "mikrypto_settings",
  VERSION: "1.0.0",
};

/**
 * Default user settings
 */
const DEFAULT_SETTINGS: UserSettings = {
  preferredCurrency: "USD",
  theme: "black",
  accentColor: "#FF0000",
  notifications: true,
  autoRefresh: false,
  refreshInterval: 60000,
};

/**
 * Check if running in browser
 */
const isBrowser = typeof window !== "undefined";

/**
 * Get all wallets from local storage
 */
export function getWallets(): Wallet[] {
  if (!isBrowser) return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.WALLETS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error loading wallets:", error);
    return [];
  }
}

/**
 * Save wallets to local storage
 */
export function saveWallets(wallets: Wallet[]): void {
  if (!isBrowser) return;

  try {
    localStorage.setItem(STORAGE_KEYS.WALLETS, JSON.stringify(wallets));
  } catch (error) {
    console.error("Error saving wallets:", error);
  }
}

/**
 * Add a new wallet
 */
export function addWallet(wallet: Omit<Wallet, "id" | "createdAt" | "lastUpdated">): Wallet {
  const wallets = getWallets();
  const newWallet: Wallet = {
    ...wallet,
    id: `wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    lastUpdated: Date.now(),
  };

  wallets.push(newWallet);
  saveWallets(wallets);
  return newWallet;
}

/**
 * Update an existing wallet
 */
export function updateWallet(id: string, updates: Partial<Wallet>): Wallet | null {
  const wallets = getWallets();
  const index = wallets.findIndex((w) => w.id === id);

  if (index === -1) return null;

  wallets[index] = {
    ...wallets[index],
    ...updates,
    lastUpdated: Date.now(),
  };

  saveWallets(wallets);
  return wallets[index];
}

/**
 * Delete a wallet
 */
export function deleteWallet(id: string): boolean {
  const wallets = getWallets();
  const filtered = wallets.filter((w) => w.id !== id);

  if (filtered.length === wallets.length) return false;

  saveWallets(filtered);
  return true;
}

/**
 * Get a single wallet by ID
 */
export function getWalletById(id: string): Wallet | null {
  const wallets = getWallets();
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
    wallets: getWallets(),
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

    saveWallets(backup.wallets);
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
 * Clear all data
 */
export function clearAllData(): void {
  if (!isBrowser) return;

  localStorage.removeItem(STORAGE_KEYS.WALLETS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
}

/**
 * Search wallets by nickname or coin
 */
export function searchWallets(query: string): Wallet[] {
  const wallets = getWallets();
  const lowerQuery = query.toLowerCase();

  return wallets.filter(
    (wallet) =>
      wallet.nickname.toLowerCase().includes(lowerQuery) ||
      wallet.coin.toLowerCase().includes(lowerQuery) ||
      wallet.coinSymbol.toLowerCase().includes(lowerQuery) ||
      wallet.chain.toLowerCase().includes(lowerQuery)
  );
}
