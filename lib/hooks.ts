/**
 * Custom React Hooks for Mikrypto
 * Handles live data fetching and state management
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, StoredWallet, UserSettings, Currency } from "./types";
import * as storage from "./storage";
import { fetchAllWalletsData, fetchWalletData } from "./api";

/**
 * Hook for managing wallets with live blockchain data
 */
export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWallets = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Get stored wallets (just id, nickname, address)
      const storedWallets = storage.getStoredWallets();

      if (storedWallets.length === 0) {
        setWallets([]);
        setLoading(false);
        return;
      }

      // Fetch live blockchain data for all wallets
      const walletsWithData = await fetchAllWalletsData(storedWallets);
      setWallets(walletsWithData);
    } catch (err) {
      console.error("Error loading wallets:", err);
      setError("Failed to load wallet data");
      // Still show wallets with zero balances on error
      const storedWallets = storage.getStoredWallets();
      setWallets(
        storedWallets.map((sw) => ({
          ...sw,
          balance: 0,
          balanceUSD: 0,
          transactions: [],
          lastUpdated: Date.now(),
        }))
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const addWallet = useCallback(async (nickname: string, address: string): Promise<Wallet> => {
    // Add to storage (just id, nickname, address)
    const storedWallet = storage.addStoredWallet(nickname, address);

    // Fetch live data for the new wallet
    const walletWithData = await fetchWalletData(storedWallet);

    // Update state
    setWallets((prev) => [...prev, walletWithData]);

    return walletWithData;
  }, []);

  const updateWallet = useCallback((id: string, nickname: string) => {
    const updated = storage.updateStoredWallet(id, nickname);
    if (updated) {
      setWallets((prev) =>
        prev.map((w) => (w.id === id ? { ...w, nickname } : w))
      );
    }
    return updated;
  }, []);

  const deleteWallet = useCallback((id: string) => {
    const success = storage.deleteStoredWallet(id);
    if (success) {
      setWallets((prev) => prev.filter((w) => w.id !== id));
    }
    return success;
  }, []);

  const refresh = useCallback(() => {
    loadWallets();
  }, [loadWallets]);

  const refreshSingle = useCallback(async (id: string) => {
    const storedWallet = storage.getStoredWalletById(id);
    if (!storedWallet) return null;

    const walletWithData = await fetchWalletData(storedWallet);
    setWallets((prev) =>
      prev.map((w) => (w.id === id ? walletWithData : w))
    );
    return walletWithData;
  }, []);

  return {
    wallets,
    loading,
    error,
    addWallet,
    updateWallet,
    deleteWallet,
    refresh,
    refreshSingle,
  };
}

/**
 * Hook for a single wallet with live data
 */
export function useWallet(id: string) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWallet = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const storedWallet = storage.getStoredWalletById(id);

      if (!storedWallet) {
        setWallet(null);
        setLoading(false);
        return;
      }

      const walletWithData = await fetchWalletData(storedWallet);
      setWallet(walletWithData);
    } catch (err) {
      console.error("Error loading wallet:", err);
      setError("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const refresh = useCallback(() => {
    loadWallet();
  }, [loadWallet]);

  return {
    wallet,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook for managing user settings
 */
export function useSettings() {
  const [settings, setSettings] = useState<UserSettings>(storage.getSettings());

  const updateSettings = useCallback((updates: Partial<UserSettings>) => {
    storage.saveSettings(updates);
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const setCurrency = useCallback(
    (currency: Currency) => {
      updateSettings({ preferredCurrency: currency });
    },
    [updateSettings]
  );

  return {
    settings,
    updateSettings,
    setCurrency,
  };
}

/**
 * Hook for handling backup/restore
 */
export function useBackup() {
  const [importing, setImporting] = useState(false);

  const exportBackup = useCallback(() => {
    storage.downloadBackup();
  }, []);

  const importBackup = useCallback(async (file: File) => {
    setImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const result = storage.importBackup(data);
      setImporting(false);
      return result;
    } catch (error) {
      setImporting(false);
      return {
        success: false,
        message: "Failed to parse backup file",
      };
    }
  }, []);

  return {
    exportBackup,
    importBackup,
    importing,
  };
}

/**
 * Hook for wallet search (searches stored wallets)
 */
export function useWalletSearch(query: string) {
  const [results, setResults] = useState<StoredWallet[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = storage.searchStoredWallets(query);
    setResults(searchResults);
  }, [query]);

  return results;
}
