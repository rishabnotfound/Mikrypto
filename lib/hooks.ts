/**
 * Custom React Hooks for Mikrypto
 * State management and data fetching hooks
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { Wallet, UserSettings, Currency } from "./types";
import * as storage from "./storage";

/**
 * Hook for managing wallets
 */
export function useWallets() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWallets = useCallback(() => {
    setLoading(true);
    const data = storage.getWallets();
    setWallets(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const addWallet = useCallback((wallet: Omit<Wallet, "id" | "createdAt" | "lastUpdated">) => {
    const newWallet = storage.addWallet(wallet);
    setWallets((prev) => [...prev, newWallet]);
    return newWallet;
  }, []);

  const updateWallet = useCallback((id: string, updates: Partial<Wallet>) => {
    const updated = storage.updateWallet(id, updates);
    if (updated) {
      setWallets((prev) => prev.map((w) => (w.id === id ? updated : w)));
    }
    return updated;
  }, []);

  const deleteWallet = useCallback((id: string) => {
    const success = storage.deleteWallet(id);
    if (success) {
      setWallets((prev) => prev.filter((w) => w.id !== id));
    }
    return success;
  }, []);

  const refresh = useCallback(() => {
    loadWallets();
  }, [loadWallets]);

  return {
    wallets,
    loading,
    addWallet,
    updateWallet,
    deleteWallet,
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

  const setCurrency = useCallback((currency: Currency) => {
    updateSettings({ preferredCurrency: currency });
  }, [updateSettings]);

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
 * Hook for wallet search
 */
export function useWalletSearch(query: string) {
  const [results, setResults] = useState<Wallet[]>([]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const searchResults = storage.searchWallets(query);
    setResults(searchResults);
  }, [query]);

  return results;
}
