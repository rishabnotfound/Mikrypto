/**
 * Wallet Details Page
 * Shows detailed information about a specific wallet including transactions and charts
 */

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Wallet as WalletType, Currency } from "@/lib/types";
import { getWalletById } from "@/lib/storage";
import {
  formatCurrency,
  formatCrypto,
  shortenAddress,
  getChainColor,
  generateChartData,
  convertCurrency,
} from "@/lib/utils";
import TransactionHistory from "@/components/TransactionHistory";
import BalanceChart from "@/components/BalanceChart";
import { useSettings } from "@/lib/hooks";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  TrendingUp,
  Activity,
  Calendar,
} from "lucide-react";

export default function WalletDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { settings } = useSettings();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const data = getWalletById(id);
    setWallet(data);
    setLoading(false);

    if (!data) {
      setTimeout(() => router.push("/"), 2000);
    }
  }, [params.id, router]);

  const handleCopyAddress = async () => {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  if (!wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Wallet not found</h2>
          <p className="text-gray-400 mb-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  const chainColor = getChainColor(wallet.chain);
  const chartData = generateChartData(wallet.transactions, 30);

  return (
    <div className="min-h-screen pb-12">
      <div className="container mx-auto px-4 pt-24 md:pt-32">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Link href="/">
            <motion.button
              whileHover={{ scale: 1.05, x: -5 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-tertiary/40 border border-primary/20 hover:border-primary/40 text-white transition-all"
            >
              <ArrowLeft size={20} />
              <span>Back to Dashboard</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Wallet Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-xl border border-primary/30 p-8">
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Coin Logo */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-primary/40 flex items-center justify-center overflow-hidden flex-shrink-0">
                {wallet.coinLogo ? (
                  <img src={wallet.coinLogo} alt={wallet.coin} className="w-12 h-12" />
                ) : (
                  <span className="text-primary font-bold text-2xl">
                    {wallet.coinSymbol.charAt(0)}
                  </span>
                )}
              </div>

              {/* Wallet Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                      {wallet.nickname}
                    </h1>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium border"
                        style={{
                          borderColor: `${chainColor}40`,
                          backgroundColor: `${chainColor}20`,
                          color: chainColor,
                        }}
                      >
                        {wallet.chain}
                      </span>
                      <span className="text-gray-400 text-sm">{wallet.coin}</span>
                    </div>
                  </div>
                </div>

                {/* Balance */}
                <div className="mb-4">
                  <div className="text-4xl font-bold text-white mb-1">
                    {formatCurrency(
                      convertCurrency(wallet.balanceUSD, "USD", settings.preferredCurrency as Currency),
                      settings.preferredCurrency as Currency
                    )}
                  </div>
                  <div className="text-lg text-gray-400">
                    {formatCrypto(wallet.balance, wallet.coinSymbol)}
                  </div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-4 py-2 rounded-lg bg-dark-tertiary/60 border border-primary/20">
                    <span className="text-gray-400 text-sm">
                      {shortenAddress(wallet.address, 8)}
                    </span>
                  </div>
                  <motion.button
                    onClick={handleCopyAddress}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-dark-tertiary/60 border border-primary/20 hover:border-primary/40 transition-all"
                  >
                    {copied ? (
                      <Check size={18} className="text-green-500" />
                    ) : (
                      <Copy size={18} className="text-gray-400" />
                    )}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg bg-dark-tertiary/60 border border-primary/20 hover:border-primary/40 transition-all"
                  >
                    <ExternalLink size={18} className="text-gray-400" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp size={20} className="text-primary" />
              <span className="text-gray-400 text-sm">Balance</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {formatCrypto(wallet.balance, wallet.coinSymbol)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Activity size={20} className="text-primary" />
              <span className="text-gray-400 text-sm">Transactions</span>
            </div>
            <p className="text-2xl font-bold text-white">{wallet.transactions.length}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <Calendar size={20} className="text-primary" />
              <span className="text-gray-400 text-sm">Created</span>
            </div>
            <p className="text-2xl font-bold text-white">
              {new Date(wallet.createdAt).toLocaleDateString()}
            </p>
          </motion.div>
        </div>

        {/* Balance Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8 rounded-2xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Balance Trend</h2>
          <BalanceChart data={chartData} currency={settings.preferredCurrency} />
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-2xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 p-6"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Transaction History</h2>
          <TransactionHistory transactions={wallet.transactions} coinSymbol={wallet.coinSymbol} />
        </motion.div>
      </div>
    </div>
  );
}
