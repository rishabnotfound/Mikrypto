/**
 * Settings Page
 * User preferences, backup/restore, and data management
 */

"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useSettings, useBackup } from "@/lib/hooks";
import CurrencySelector from "@/components/CurrencySelector";
import {
  Download,
  Upload,
  Trash2,
  Settings as SettingsIcon,
  Database,
  Palette,
  RefreshCw,
} from "lucide-react";
import { clearAllData } from "@/lib/storage";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings();
  const { exportBackup, importBackup, importing } = useBackup();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importMessage, setImportMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 pt-24 md:pt-32 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon size={32} className="text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">Settings</h1>
          </div>
          <p className="text-gray-400">Manage your preferences and data</p>
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
            className="rounded-2xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 p-6 overflow-visible"
          >
            <div className="flex items-center gap-3 mb-6">
              <Palette size={24} className="text-primary" />
              <h2 className="text-2xl font-bold text-white">Display Preferences</h2>
            </div>

            <div className="space-y-4">
              {/* Currency Selector */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium mb-1">Preferred Currency</p>
                  <p className="text-sm text-gray-400">
                    Choose your default currency for displaying balances
                  </p>
                </div>
                <CurrencySelector
                  value={settings.preferredCurrency}
                  onChange={(currency) => updateSettings({ preferredCurrency: currency })}
                />
              </div>

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
            className="rounded-2xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Database size={24} className="text-primary" />
              <h2 className="text-2xl font-bold text-white">Backup & Restore</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Export your wallet data as JSON or import from a previous backup
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Backup */}
                <motion.button
                  onClick={exportBackup}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Download size={20} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">Export Backup</p>
                    <p className="text-sm text-gray-400">Download as JSON</p>
                  </div>
                </motion.button>

                {/* Import Backup */}
                <motion.button
                  onClick={() => fileInputRef.current?.click()}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={importing}
                  className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/30 hover:bg-primary/20 transition-all group disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                    {importing ? (
                      <RefreshCw size={20} className="text-primary animate-spin" />
                    ) : (
                      <Upload size={20} className="text-primary" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="text-white font-medium">
                      {importing ? "Importing..." : "Import Backup"}
                    </p>
                    <p className="text-sm text-gray-400">Restore from JSON</p>
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

          {/* Danger Zone */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-dark-tertiary/40 backdrop-blur-xl border border-red-500/30 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Trash2 size={24} className="text-red-500" />
              <h2 className="text-2xl font-bold text-white">Danger Zone</h2>
            </div>

            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Permanently delete all wallet data. This action cannot be undone.
              </p>

              {!showClearConfirm ? (
                <motion.button
                  onClick={() => setShowClearConfirm(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full md:w-auto px-6 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 transition-all font-medium"
                >
                  Clear All Data
                </motion.button>
              ) : (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                  <p className="text-white font-medium mb-4">
                    Are you sure? This will delete all wallets and settings.
                  </p>
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleClearData}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all"
                    >
                      Yes, Delete Everything
                    </motion.button>
                    <motion.button
                      onClick={() => setShowClearConfirm(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-6 py-2 rounded-lg bg-dark-tertiary border border-primary/20 text-white hover:border-primary/40 transition-all"
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
