/**
 * Dashboard Page
 * Main page showing portfolio overview and wallet cards
 */

"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import WalletCard from "@/components/WalletCard";
import CurrencySelector from "@/components/CurrencySelector";
import AddWalletModal from "@/components/AddWalletModal";
import { useWallets, useSettings } from "@/lib/hooks";
import { calculateTotalBalance, convertCurrency, formatCurrency } from "@/lib/utils";
import { Wallet as WalletType, Currency } from "@/lib/types";
import {
  TrendingUp,
  Wallet,
  Activity,
  Plus,
  Search,
  Download,
  Upload,
} from "lucide-react";

export default function DashboardPage() {
  const { wallets, loading, refresh } = useWallets();
  const { settings, setCurrency } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const filteredWallets = wallets.filter(
    (wallet) =>
      wallet.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.coin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wallet.chain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBalance = calculateTotalBalance(wallets);
  const totalTransactions = wallets.reduce((sum, w) => sum + w.transactions.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 pt-24 md:pt-32">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Portfolio Dashboard
              </h1>
              <p className="text-gray-400">Track and manage your crypto wallets</p>
            </div>
            <CurrencySelector value={settings.preferredCurrency} onChange={setCurrency} />
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Total Balance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-xl border border-primary/30 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                <TrendingUp size={24} className="text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400 text-sm">Total Balance</p>
              <p className="text-3xl font-bold text-white">
                {formatCurrency(
                  convertCurrency(totalBalance, "USD", settings.preferredCurrency as Currency),
                  settings.preferredCurrency as Currency
                )}
              </p>
            </div>
          </motion.div>

          {/* Total Wallets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative overflow-hidden rounded-2xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Wallet size={24} className="text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400 text-sm">Total Wallets</p>
              <p className="text-3xl font-bold text-white">{wallets.length}</p>
            </div>
          </motion.div>

          {/* Total Transactions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative overflow-hidden rounded-2xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Activity size={24} className="text-primary" />
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-gray-400 text-sm">Total Transactions</p>
              <p className="text-3xl font-bold text-white">{totalTransactions}</p>
            </div>
          </motion.div>
        </div>

        {/* Search and Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col md:flex-row gap-4 mb-6"
        >
          {/* Search */}
          <div className="flex-1 relative">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search wallets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 focus:border-primary/40 outline-none text-white placeholder-gray-500 transition-all"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <motion.button
              onClick={() => setIsAddModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-3 rounded-xl bg-primary/20 border border-primary/40 text-white hover:bg-primary/30 transition-all flex items-center gap-2"
            >
              <Plus size={20} />
              <span className="hidden md:inline">Add Wallet</span>
            </motion.button>
          </div>
        </motion.div>

        {/* Wallets Grid */}
        {filteredWallets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-dark-tertiary/40 border border-primary/20 flex items-center justify-center">
              <Wallet size={40} className="text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {searchQuery ? "No wallets found" : "No wallets yet"}
            </h3>
            <p className="text-gray-400 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Add your first wallet to get started"}
            </p>
            {!searchQuery && (
              <motion.button
                onClick={() => setIsAddModalOpen(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-all"
              >
                Add Your First Wallet
              </motion.button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
