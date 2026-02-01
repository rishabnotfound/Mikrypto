/**
 * Wallets List Page
 * Shows all wallets in a detailed list view
 */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useWallets, useSettings } from "@/lib/hooks";
import { formatCurrency, formatCrypto, shortenAddress, getChainColor, convertCurrency } from "@/lib/utils";
import { Currency } from "@/lib/types";
import { Search, Wallet, ArrowUpRight, SortAsc, SortDesc } from "lucide-react";

type SortOption = "nickname" | "balance" | "chain" | "transactions";

export default function WalletsPage() {
  const { wallets, loading } = useWallets();
  const { settings } = useSettings();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("balance");
  const [sortAsc, setSortAsc] = useState(false);

  const filteredAndSortedWallets = wallets
    .filter(
      (wallet) =>
        wallet.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.coin.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.chain.toLowerCase().includes(searchQuery.toLowerCase())
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
        case "chain":
          comparison = a.chain.localeCompare(b.chain);
          break;
        case "transactions":
          comparison = b.transactions.length - a.transactions.length;
          break;
      }
      return sortAsc ? comparison : -comparison;
    });

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
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-2">
            <Wallet size={32} className="text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-white">All Wallets</h1>
          </div>
          <p className="text-gray-400">Manage and view all your crypto wallets</p>
        </motion.div>

        {/* Search and Sort */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex flex-col md:flex-row gap-4"
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

          {/* Sort Controls */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-3 rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 focus:border-primary/40 outline-none text-white cursor-pointer"
            >
              <option value="balance">Balance</option>
              <option value="nickname">Name</option>
              <option value="chain">Chain</option>
              <option value="transactions">Transactions</option>
            </select>

            <motion.button
              onClick={() => setSortAsc(!sortAsc)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-3 rounded-xl bg-dark-tertiary/40 border border-primary/20 hover:border-primary/40 text-white transition-all"
            >
              {sortAsc ? <SortAsc size={20} /> : <SortDesc size={20} />}
            </motion.button>
          </div>
        </motion.div>

        {/* Wallets List */}
        {filteredAndSortedWallets.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-dark-tertiary/40 border border-primary/20 flex items-center justify-center">
              <Wallet size={40} className="text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No wallets found</h3>
            <p className="text-gray-400">Try a different search term</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedWallets.map((wallet, index) => {
              const chainColor = getChainColor(wallet.chain);

              return (
                <Link key={wallet.id} href={`/wallet/${wallet.id}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, x: 4 }}
                    className="group relative"
                  >
                    <div className="relative overflow-hidden rounded-2xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 hover:border-primary/40 transition-all duration-300 p-6">
                      <div className="flex items-center gap-6">
                        {/* Coin Logo */}
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {wallet.coinLogo ? (
                            <img
                              src={wallet.coinLogo}
                              alt={wallet.coin}
                              className="w-10 h-10 object-contain"
                            />
                          ) : (
                            <span className="text-primary font-bold text-xl">
                              {wallet.coinSymbol.charAt(0)}
                            </span>
                          )}
                        </div>

                        {/* Wallet Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">
                                {wallet.nickname}
                              </h3>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className="text-xs px-2 py-1 rounded-full border"
                                  style={{
                                    borderColor: `${chainColor}40`,
                                    backgroundColor: `${chainColor}20`,
                                    color: chainColor,
                                  }}
                                >
                                  {wallet.chain}
                                </span>
                                <span className="text-sm text-gray-400">{wallet.coin}</span>
                              </div>
                            </div>

                            <ArrowUpRight
                              size={20}
                              className="text-gray-400 group-hover:text-primary transition-colors"
                            />
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Balance</p>
                              <p className="text-lg font-bold text-white">
                                {formatCurrency(
                                  convertCurrency(wallet.balanceUSD, "USD", settings.preferredCurrency as Currency),
                                  settings.preferredCurrency as Currency
                                )}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 mb-1">Balance ({wallet.coinSymbol})</p>
                              <p className="text-lg font-bold text-white">
                                {wallet.balance.toFixed(4)}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 mb-1">Transactions</p>
                              <p className="text-lg font-bold text-white">
                                {wallet.transactions.length}
                              </p>
                            </div>

                            <div>
                              <p className="text-xs text-gray-500 mb-1">Address</p>
                              <p className="text-sm font-medium text-gray-400">
                                {shortenAddress(wallet.address, 6)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Hover glow */}
                    <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
