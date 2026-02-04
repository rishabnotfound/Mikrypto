/**
 * Dashboard Page
 * Main page showing portfolio overview and wallet cards
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import WalletCard from "@/components/WalletCard";
import CurrencySelector from "@/components/CurrencySelector";
import AddWalletModal from "@/components/AddWalletModal";
import { useWallets, useSettings } from "@/lib/hooks";
import { calculateTotalBalance, calculateTotalBTC, convertCurrency, formatCurrency, formatBTC } from "@/lib/utils";
import { Currency } from "@/lib/types";
import {
  TrendingUp,
  Wallet,
  Activity,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { wallets, loading, error, refresh } = useWallets();
  const { settings, setCurrency } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredWallets = wallets.filter(
    (wallet) =>
      wallet.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBalance = calculateTotalBalance(wallets);
  const totalBTC = calculateTotalBTC(wallets);
  const totalTransactions = wallets.reduce((sum, w) => sum + w.transactions.length, 0);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"
        />
        <p className="text-gray-400 text-sm text-center">Loading wallet data from blockchain...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="container mx-auto px-4 pt-6 md:pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="flex flex-col gap-4 mb-4">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1">
                  BTC Tracker
                </h1>
                <p className="text-gray-400 text-sm">Track your Bitcoin wallets</p>
              </div>
              <div className="flex-shrink-0">
                <CurrencySelector value={settings.preferredCurrency} onChange={setCurrency} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3"
          >
            <AlertCircle className="text-red-500 flex-shrink-0" size={18} />
            <span className="text-red-400 text-sm flex-1">{error}</span>
            <button
              onClick={handleRefresh}
              className="px-3 py-1 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors text-sm flex-shrink-0"
            >
              Retry
            </button>
          </motion.div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {/* Total Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 backdrop-blur-xl border border-orange-500/30 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0">
                <TrendingUp size={18} className="text-orange-500" />
              </div>
              <p className="text-gray-400 text-sm">Total Balance</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white truncate">
              {formatCurrency(
                convertCurrency(totalBalance, "USD", settings.preferredCurrency as Currency),
                settings.preferredCurrency as Currency
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">{formatBTC(totalBTC)}</p>
          </motion.div>

          {/* Total Wallets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-orange-500/20 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Wallet size={18} className="text-orange-500" />
              </div>
              <p className="text-gray-400 text-sm">Wallets</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{wallets.length}</p>
          </motion.div>

          {/* Total Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative overflow-hidden rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-orange-500/20 p-4"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                <Activity size={18} className="text-orange-500" />
              </div>
              <p className="text-gray-400 text-sm">Transactions</p>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-white">{totalTransactions}</p>
          </motion.div>
        </div>

        {/* Search and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search wallets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-orange-500/20 focus:border-orange-500/40 outline-none text-white placeholder-gray-500 transition-all text-sm"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-dark-tertiary/40 border border-orange-500/20 text-white hover:border-orange-500/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              <span className="sm:hidden">Refresh</span>
            </motion.button>
            <motion.button
              onClick={() => setIsAddModalOpen(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={18} />
              <span>Add Wallet</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Wallets Grid */}
        {filteredWallets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-tertiary/40 border border-orange-500/20 flex items-center justify-center">
              <Wallet size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              {searchQuery ? "No wallets found" : "No wallets yet"}
            </h3>
            <p className="text-gray-400 text-sm mb-4 px-4">
              {searchQuery
                ? "Try a different search term"
                : "Add your first Bitcoin wallet to get started"}
            </p>
            {!searchQuery && (
              <motion.button
                onClick={() => setIsAddModalOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all"
              >
                Add Your First Wallet
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWallets.map((wallet, index) => (
              <WalletCard
                key={wallet.id}
                wallet={wallet}
                index={index}
                currency={settings.preferredCurrency}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Wallet Modal */}
      <AddWalletModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={refresh}
      />
    </div>
  );
}
