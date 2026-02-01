/**
 * WalletCard Component
 * Animated card displaying wallet information with glass morphism
 */

"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Wallet as WalletType, Currency } from "@/lib/types";
import { formatCurrency, formatCrypto, shortenAddress, getChainColor, convertCurrency } from "@/lib/utils";
import { ArrowUpRight, Copy, Check } from "lucide-react";
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

  const chainColor = getChainColor(wallet.chain);

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
        <div className="relative overflow-hidden rounded-2xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 hover:border-primary/40 transition-all duration-300">
          {/* Animated gradient overlay */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
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
          <div className="relative p-6 space-y-4">
            {/* Header with coin logo and chain */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                {/* Coin logo */}
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/30 flex items-center justify-center overflow-hidden">
                  {wallet.coinLogo ? (
                    <img
                      src={wallet.coinLogo}
                      alt={wallet.coin}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <span className="text-primary font-bold text-lg">
                      {wallet.coinSymbol.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Wallet info */}
                <div>
                  <h3 className="text-white font-bold text-lg">{wallet.nickname}</h3>
                  <div className="flex items-center gap-2 mt-1">
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
                  </div>
                </div>
              </div>

              {/* External link icon */}
              <motion.div
                className="text-gray-400 group-hover:text-primary transition-colors"
                whileHover={{ scale: 1.1, rotate: 45 }}
              >
                <ArrowUpRight size={20} />
              </motion.div>
            </div>

            {/* Balance */}
            <div className="space-y-1">
              <div className="text-3xl font-bold text-white">
                {formatCurrency(
                  convertCurrency(wallet.balanceUSD, "USD", currency as Currency),
                  currency as Currency
                )}
              </div>
              <div className="text-sm text-gray-400">
                {formatCrypto(wallet.balance, wallet.coinSymbol)}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center justify-between pt-3 border-t border-primary/10">
              <span className="text-sm text-gray-400">
                {shortenAddress(wallet.address, 6)}
              </span>

              <motion.button
                onClick={handleCopyAddress}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
              >
                {copied ? (
                  <Check size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} className="text-gray-400" />
                )}
              </motion.button>
            </div>

            {/* Transaction count */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Transactions</span>
              <span className="text-white font-medium">{wallet.transactions.length}</span>
            </div>
          </div>
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 -z-10 rounded-2xl bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </motion.div>
    </Link>
  );
}
