/**
 * Settings Page
 * User preferences, backup/restore, and data management
 */

"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useSettings, useBackup } from "@/lib/hooks";
import {
  Download,
  Upload,
  Trash2,
  Settings as SettingsIcon,
  Database,
  Palette,
  RefreshCw,
} from "lucide-react";
import { clearAllData, clearAllCaches } from "@/lib/storage";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { exportBackup, importBackup, importing } = useBackup();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClearCache = () => {
    clearAllCaches();
    setCacheCleared(true);
    setTimeout(() => {
      setCacheCleared(false);
      window.location.reload();
    }, 1000);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await importBackup(file);
    setImportMessage({
      type: result.success ? "success" : "error",
      text: result.message,
    });

    setTimeout(() => setImportMessage(null), 5000);

    if (result.success) {
      window.location.reload();
    }
  };

  const handleClearData = () => {
    clearAllData();
    setShowClearConfirm(false);
    window.location.reload();
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="container mx-auto px-4 pt-4 md:pt-28 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <SettingsIcon size={24} className="text-primary sm:w-8 sm:h-8" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-gray-400 text-sm">Manage your preferences and data</p>
        </motion.div>

        {/* Import Message */}
        {importMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`mb-6 p-4 rounded-xl border ${
              importMessage.type === "success"
                ? "bg-green-500/10 border-green-500/30 text-green-500"
                : "bg-red-500/10 border-red-500/30 text-red-500"
            }`}
          >
            {importMessage.text}
          </motion.div>
        )}

        <div className="space-y-6">
          {/* Currency Preferences */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 p-4 sm:p-6 overflow-visible"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Palette size={20} className="text-primary sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Display Preferences</h2>
            </div>

            <div className="space-y-4">
              {/* Auto Refresh */}
              <div className="flex flex-col pt-4 border-t border-primary/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-white font-medium mb-1">Auto Refresh</p>
                    <p className="text-sm text-gray-400">Automatically update wallet balances</p>
                  </div>
                  <button
                    onClick={() => updateSettings({ autoRefresh: !settings.autoRefresh })}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      settings.autoRefresh ? "bg-primary" : "bg-gray-600"
                    }`}
                  >
                    <motion.div
                      animate={{ x: settings.autoRefresh ? 24 : 2 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="absolute top-1 w-6 h-6 rounded-full bg-white"
                    />
                  </button>
                </div>

                {/* Refresh Interval Slider */}
                {settings.autoRefresh && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-primary/10"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm text-gray-400">Refresh Interval</p>
                      <p className="text-sm text-primary font-medium">
                        {settings.refreshInterval} minutes
                      </p>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="120"
                      step="15"
                      value={settings.refreshInterval}
                      onChange={(e) =>
                        updateSettings({ refreshInterval: parseInt(e.target.value) })
                      }
                      className="w-full h-2 bg-dark-tertiary rounded-lg appearance-none cursor-pointer accent-primary slider"
                      style={{
                        background: `linear-gradient(to right, #D6A35C 0%, #D6A35C ${
                          ((settings.refreshInterval - 30) / (120 - 30)) * 100
                        }%, #1A1A1A ${
                          ((settings.refreshInterval - 30) / (120 - 30)) * 100
                        }%, #1A1A1A 100%)`,
                      }}
                    />
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>30 min</span>
                      <span>1 hr</span>
                      <span>2 hrs</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.section>

          {/* Backup & Restore */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Database size={20} className="text-primary sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Backup & Restore</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Export your wallet data as JSON or import from a previous backup
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Export Backup */}
                <motion.button
                  onClick={exportBackup}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all group"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    <Download size={18} className="text-primary sm:w-5 sm:h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm sm:text-base">Export Backup</p>
                    <p className="text-xs sm:text-sm text-gray-400">Download as JSON</p>
                  </div>
                </motion.button>

                {/* Import Backup */}
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  whileTap={{ scale: 0.98 }}
                  disabled={importing}
                  className="flex items-center gap-3 p-3 sm:p-4 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all group disabled:opacity-50"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                    {importing ? (
                      <RefreshCw size={18} className="text-primary animate-spin sm:w-5 sm:h-5" />
                    ) : (
                      <Upload size={18} className="text-primary sm:w-5 sm:h-5" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium text-sm sm:text-base">
                      {importing ? "Importing..." : "Import Backup"}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-400">Restore from JSON</p>
                  </div>
                </motion.button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </div>
            </div>
          </motion.section>

          {/* Cache Management */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-orange-500/20 p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <RefreshCw size={20} className="text-orange-500 sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Cache Management</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Clear cached balance and transaction data to fetch fresh data from the blockchain.
              </p>

              <motion.button
                onClick={handleClearCache}
                disabled={cacheCleared}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-500 hover:bg-orange-500/20 transition-all font-medium text-sm disabled:opacity-50"
              >
                {cacheCleared ? "Cache Cleared!" : "Clear Cache"}
              </motion.button>
            </div>
          </motion.section>

          {/* Danger Zone */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-red-500/30 p-4 sm:p-6"
          >
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <Trash2 size={20} className="text-red-500 sm:w-6 sm:h-6" />
              <h2 className="text-lg sm:text-xl font-bold text-white">Danger Zone</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Permanently delete all wallet data. This action cannot be undone.
              </p>

              {!showClearConfirm ? (
                <motion.button
                  onClick={() => setShowClearConfirm(true)}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-all font-medium text-sm"
                >
                  Clear All Data
                </motion.button>
              ) : (
                <div className="p-3 sm:p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-white font-medium mb-3 sm:mb-4 text-sm">
                    Are you sure? This will delete all wallets and settings.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    <motion.button
                      onClick={handleClearData}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 sm:px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all text-sm"
                    >
                      Yes, Delete Everything
                    </motion.button>
                    <motion.button
                      onClick={() => setShowClearConfirm(false)}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 sm:px-6 py-2 rounded-lg bg-dark-tertiary border border-primary/20 text-white hover:border-primary/40 transition-all text-sm"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
