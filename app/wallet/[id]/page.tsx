/**
 * Wallet Details Page
 * Shows detailed information about a specific wallet with live blockchain data
 */

"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { Currency, Transaction } from "@/lib/types";
import { useWallet, useSettings } from "@/lib/hooks";
import { deleteStoredWallet } from "@/lib/storage";
import {
  formatCurrency,
  formatBTC,
  shortenAddress,
  convertCurrency,
} from "@/lib/utils";
import TransactionHistory from "@/components/TransactionHistory";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  TrendingUp,
  Activity,
  Calendar,
  RefreshCw,
  Trash2,
  Bitcoin,
} from "lucide-react";

export default function WalletDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { settings } = useSettings();
  const { wallet, loading, error, refresh } = useWallet(params.id as string);

  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Local state for transactions with pagination
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [hasMoreTxs, setHasMoreTxs] = useState(false);
  const [lastTxId, setLastTxId] = useState<string | undefined>();

  // Sync transactions from wallet when it loads/updates
  useEffect(() => {
    if (wallet) {
      setTransactions(wallet.transactions);
      setHasMoreTxs(wallet.hasMoreTxs || false);
      setLastTxId(wallet.lastTxId);
    }
  }, [wallet]);

  const handleCopyAddress = async () => {
    if (!wallet) return;
    await navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const handleDelete = () => {
    if (!wallet) return;
    deleteStoredWallet(wallet.id);
    router.push("/");
  };

  const openInMempool = () => {
    if (!wallet) return;
    window.open(`https://mempool.space/address/${wallet.address}`, "_blank");
  };

  const handleLoadMoreTxs = (
    newTxs: Transaction[],
    hasMore: boolean,
    newLastTxId?: string
  ) => {
    setTransactions((prev) => [...prev, ...newTxs]);
    setHasMoreTxs(hasMore);
    setLastTxId(newLastTxId);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full"
        />
        <p className="text-gray-400 text-sm text-center">Loading wallet data...</p>
      </div>
    );
  }

  if (!wallet) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">Wallet not found</h2>
          <p className="text-gray-400 text-sm mb-4">This wallet doesn't exist or was deleted.</p>
          <Link href="/">
            <button className="px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm">
              Go to Dashboard
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="container mx-auto px-4 pt-4 md:pt-28">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-4"
        >
          <Link href="/">
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-dark-tertiary/40 border border-orange-500/20 hover:border-orange-500/40 text-white transition-all text-sm"
            >
              <ArrowLeft size={18} />
              <span>Back</span>
            </motion.button>
          </Link>
        </motion.div>

        {/* Error Banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {/* Wallet Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 backdrop-blur-xl border border-orange-500/30 p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              {/* Bitcoin Logo */}
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-orange-500/30 to-orange-500/10 border-2 border-orange-500/40 flex items-center justify-center flex-shrink-0">
                <Bitcoin size={28} className="text-orange-500" />
              </div>

              {/* Wallet Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <h1 className="text-xl sm:text-2xl font-bold text-white truncate mb-1">
                      {wallet.nickname}
                    </h1>
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium border border-orange-500/40 bg-orange-500/20 text-orange-500">
                      Bitcoin
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <motion.button
                      onClick={handleRefresh}
                      disabled={isRefreshing}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg bg-dark-tertiary/60 border border-orange-500/20 hover:border-orange-500/40 transition-all disabled:opacity-50"
                    >
                      <RefreshCw
                        size={16}
                        className={`text-gray-400 ${isRefreshing ? "animate-spin" : ""}`}
                      />
                    </motion.button>
                    <motion.button
                      onClick={() => setShowDeleteConfirm(true)}
                      whileTap={{ scale: 0.95 }}
                      className="p-2 rounded-lg bg-dark-tertiary/60 border border-red-500/20 hover:border-red-500/40 transition-all"
                    >
                      <Trash2 size={16} className="text-red-400" />
                    </motion.button>
                  </div>
                </div>

                {/* Balance */}
                <div className="mb-3">
                  <div className="text-2xl sm:text-3xl font-bold text-white mb-0.5">
                    {formatCurrency(
                      convertCurrency(wallet.balanceUSD, "USD", settings.preferredCurrency as Currency),
                      settings.preferredCurrency as Currency
                    )}
                  </div>
                  <div className="text-sm text-gray-400">{formatBTC(wallet.balance)}</div>
                </div>

                {/* Address */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="px-3 py-1.5 rounded-lg bg-dark-tertiary/60 border border-orange-500/20">
                    <span className="text-gray-400 text-xs font-mono">
                      {shortenAddress(wallet.address, 6)}
                    </span>
                  </div>
                  <motion.button
                    onClick={handleCopyAddress}
                    whileTap={{ scale: 0.95 }}
                    className="p-1.5 rounded-lg bg-dark-tertiary/60 border border-orange-500/20 hover:border-orange-500/40 transition-all"
                  >
                    {copied ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <Copy size={14} className="text-gray-400" />
                    )}
                  </motion.button>
                  <motion.button
                    onClick={openInMempool}
                    whileTap={{ scale: 0.95 }}
                    className="p-1.5 rounded-lg bg-dark-tertiary/60 border border-orange-500/20 hover:border-orange-500/40 transition-all"
                    title="View on Mempool.space"
                  >
                    <ExternalLink size={14} className="text-gray-400" />
                  </motion.button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-orange-500/20 p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <TrendingUp size={14} className="text-orange-500" />
              <span className="text-gray-400 text-xs">Balance</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-white truncate">
              {wallet.balance.toFixed(4)}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-orange-500/20 p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Activity size={14} className="text-orange-500" />
              <span className="text-gray-400 text-xs">Txns</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-white">
              {transactions.length}
              {hasMoreTxs && "+"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-orange-500/20 p-3 sm:p-4"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <Calendar size={14} className="text-orange-500" />
              <span className="text-gray-400 text-xs">Added</span>
            </div>
            <p className="text-sm sm:text-lg font-bold text-white">
              {new Date(wallet.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </p>
          </motion.div>
        </div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-orange-500/20 p-4"
        >
          <h2 className="text-lg font-bold text-white mb-4">Transactions</h2>
          <TransactionHistory
            transactions={transactions}
            currency={settings.preferredCurrency as Currency}
            walletAddress={wallet.address}
            hasMore={hasMoreTxs}
            lastTxId={lastTxId}
            onLoadMore={handleLoadMoreTxs}
          />
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={() => setShowDeleteConfirm(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-secondary border border-red-500/30 rounded-xl p-4 sm:p-6 max-w-sm w-full"
            >
              <h3 className="text-lg font-bold text-white mb-2">Delete Wallet</h3>
              <p className="text-gray-400 text-sm mb-4">
                Remove "{wallet.nickname}" from tracking? This won't affect your actual Bitcoin.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-dark-tertiary border border-gray-600 text-white hover:border-gray-500 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </div>
  );
}
