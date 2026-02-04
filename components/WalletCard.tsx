/**
 * WalletCard Component
 * Animated card displaying Bitcoin wallet information
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Wallet as WalletType, Currency } from "@/lib/types";
import { formatCurrency, formatBTC, shortenAddress, convertCurrency } from "@/lib/utils";
import { ArrowUpRight, Copy, Check, Bitcoin } from "lucide-react";
import { useState } from "react";

interface WalletCardProps {
  wallet: WalletType;
  index: number;
  currency: string;
}

export default function WalletCard({ wallet, index, currency }: WalletCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyAddress = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Link href={`/wallet/${wallet.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        whileHover={{ scale: 1.02, y: -4 }}
        className="group relative"
      >
        {/* Glass morphism card */}
        <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-dark-tertiary/40 backdrop-blur-xl border border-orange-500/20 hover:border-orange-500/40 transition-all duration-300">
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />

          {/* Card content */}
          <div className="relative p-4 sm:p-5 space-y-3 sm:space-y-4">
            {/* Header with Bitcoin logo */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Bitcoin logo */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5 border border-orange-500/30 flex items-center justify-center flex-shrink-0">
                  <Bitcoin size={20} className="text-orange-500 sm:w-6 sm:h-6" />
                </div>

                {/* Wallet info */}
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-base sm:text-lg truncate">{wallet.nickname}</h3>
                  <span className="inline-block text-xs px-2 py-0.5 rounded-full border border-orange-500/40 bg-orange-500/20 text-orange-500 mt-1">
                    Bitcoin
                  </span>
                </div>
              </div>

              {/* External link icon */}
              <motion.div
                className="text-gray-400 group-hover:text-orange-500 transition-colors flex-shrink-0"
                whileHover={{ scale: 1.1, rotate: 45 }}
              >
                <ArrowUpRight size={18} />
              </motion.div>
            </div>

            {/* Balance */}
            <div className="space-y-0.5">
              <div className="text-xl sm:text-2xl font-bold text-white truncate">
                {formatCurrency(
                  convertCurrency(wallet.balanceUSD, "USD", currency as Currency),
                  currency as Currency
                )}
              </div>
              <div className="text-xs sm:text-sm text-gray-400">{formatBTC(wallet.balance)}</div>
            </div>

            {/* Address */}
            <div className="flex items-center justify-between pt-2 sm:pt-3 border-t border-orange-500/10">
              <span className="text-xs sm:text-sm text-gray-400 font-mono">
                {shortenAddress(wallet.address, 4)}
              </span>

              <motion.button
                onClick={handleCopyAddress}
                whileTap={{ scale: 0.9 }}
                className="p-1.5 sm:p-2 rounded-lg hover:bg-orange-500/10 transition-colors"
              >
                {copied ? (
                  <Check size={14} className="text-green-500 sm:w-4 sm:h-4" />
                ) : (
                  <Copy size={14} className="text-gray-400 sm:w-4 sm:h-4" />
                )}
              </motion.button>
            </div>

            {/* Transaction count */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-gray-500">Transactions</span>
              <span className="text-white font-medium">{wallet.transactions.length}</span>
            </div>
          </div>
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    </Link>
  );
}
