/**
 * Wallets List Page
 * Shows all Bitcoin wallets in a detailed list view
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useWallets, useSettings } from "@/lib/hooks";
import { formatCurrency, formatBTC, shortenAddress, convertCurrency } from "@/lib/utils";
import { Currency } from "@/lib/types";
import { Search, Wallet, ArrowUpRight, SortAsc, SortDesc, Bitcoin, RefreshCw } from "lucide-react";

type SortOption = "nickname" | "balance" | "transactions";

export default function WalletsPage() {
  const { wallets, loading, refresh } = useWallets();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("balance");
  const [sortAsc, setSortAsc] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const filteredAndSortedWallets = wallets
    .filter(
      (wallet) =>
        wallet.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "nickname":
          comparison = a.nickname.localeCompare(b.nickname);
          break;
        case "balance":
          comparison = b.balanceUSD - a.balanceUSD;
          break;
        case "transactions":
          comparison = b.transactions.length - a.transactions.length;
          break;
      }
      return sortAsc ? comparison : -comparison;
    });

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
      <div className="container mx-auto px-4 pt-4 md:pt-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 sm:gap-3 mb-1">
            <Wallet size={24} className="text-orange-500 sm:w-8 sm:h-8" />
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">All Wallets</h1>
          </div>
          <p className="text-gray-400 text-sm">Manage and view all your Bitcoin wallets</p>
        </motion.div>

        {/* Search and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 flex flex-col sm:flex-row gap-3"
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

          {/* Sort Controls */}
          <div className="flex gap-2">
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              whileTap={{ scale: 0.95 }}
              className="flex-1 sm:flex-none px-4 py-3 rounded-xl bg-dark-tertiary/40 border border-orange-500/20 hover:border-orange-500/40 text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              <span className="sm:hidden">Refresh</span>
            </motion.button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="flex-1 sm:flex-none px-3 py-3 rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-orange-500/20 focus:border-orange-500/40 outline-none text-white cursor-pointer text-sm"
            >
              <option value="balance">Balance</option>
              <option value="nickname">Name</option>
              <option value="transactions">Txns</option>
            </select>

            <motion.button
              onClick={() => setSortAsc(!sortAsc)}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-3 rounded-xl bg-dark-tertiary/40 border border-orange-500/20 hover:border-orange-500/40 text-white transition-all"
            >
              {sortAsc ? <SortAsc size={18} /> : <SortDesc size={18} />}
            </motion.button>
          </div>
        </motion.div>

        {/* Wallets List */}
        {filteredAndSortedWallets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-tertiary/40 border border-orange-500/20 flex items-center justify-center">
              <Wallet size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No wallets found</h3>
            <p className="text-gray-400 text-sm px-4">
              {searchQuery ? "Try a different search term" : "Add some Bitcoin wallets to get started"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {filteredAndSortedWallets.map((wallet, index) => (
              <Link key={wallet.id} href={`/wallet/${wallet.id}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileTap={{ scale: 0.99 }}
                  className="group relative"
                >
                  <div className="relative overflow-hidden rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300 p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Bitcoin Logo */}
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                        <Bitcoin size={24} className="text-orange-500" />
                      </div>

                      {/* Wallet Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-white truncate mb-1">
                              {wallet.nickname}
                            </h3>
                            <span className="inline-block text-xs px-2 py-0.5 rounded-full border border-orange-500/40 bg-orange-500/20 text-orange-500">
                              Bitcoin
                            </span>
                          </div>

                          <ArrowUpRight
                            size={18}
                            className="text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0"
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mt-3">
                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Balance</p>
                            <p className="text-sm sm:text-base font-bold text-white truncate">
                              {formatCurrency(
                                convertCurrency(wallet.balanceUSD, "USD", settings.preferredCurrency as Currency),
                                settings.preferredCurrency as Currency
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">BTC</p>
                            <p className="text-sm sm:text-base font-bold text-white truncate">
                              {wallet.balance.toFixed(4)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500 mb-0.5">Txns</p>
                            <p className="text-sm sm:text-base font-bold text-white">
                              {wallet.transactions.length}
                            </p>
                          </div>

                          <div className="hidden sm:block">
                            <p className="text-xs text-gray-500 mb-0.5">Address</p>
                            <p className="text-xs font-medium text-gray-400 font-mono">
                              {shortenAddress(wallet.address, 6)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 -z-10 rounded-xl bg-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
