/**
 * AddWalletModal Component
 * Modal form to add new wallets with real blockchain addresses
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2 } from "lucide-react";
import { Chain } from "@/lib/types";
import { isValidAddress } from "@/lib/utils";
import { getCoinIdFromChain, refreshWalletData, getCoinLogo } from "@/lib/api";
import { addWallet } from "@/lib/storage";

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CHAINS: Chain[] = [
  "Ethereum",
  "Bitcoin",
  "Binance Smart Chain",
  "Solana",
  "Polygon",
  "Avalanche",
  "Arbitrum",
  "Optimism",
  "Base",
];

const CHAIN_SYMBOLS: Record<Chain, string> = {
  Ethereum: "ETH",
  Bitcoin: "BTC",
  "Binance Smart Chain": "BNB",
  Solana: "SOL",
  Polygon: "MATIC",
  Avalanche: "AVAX",
  Arbitrum: "ETH",
  Optimism: "ETH",
  Base: "ETH",
  Other: "CRYPTO",
};

export default function AddWalletModal({ isOpen, onClose, onSuccess }: AddWalletModalProps) {
  const [nickname, setNickname] = useState("");
  const [address, setAddress] = useState("");
  const [chain, setChain] = useState<Chain>("Ethereum");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate inputs
    if (!nickname.trim()) {
      setError("Please enter a nickname");
      return;
    }

    if (!address.trim()) {
      setError("Please enter a wallet address");
      return;
    }

    if (!isValidAddress(address, chain)) {
      setError("Invalid address format for selected chain");
      return;
    }

    setLoading(true);

    try {
      // Fetch real wallet data from blockchain
      const coinId = getCoinIdFromChain(chain);
      const coinSymbol = CHAIN_SYMBOLS[chain];

      const [walletData, logoUrl] = await Promise.all([
        refreshWalletData(address, chain, coinSymbol),
        getCoinLogo(coinId),
      ]);

      // Add wallet to storage
      addWallet({
        nickname: nickname.trim(),
        address: address.trim(),
        chain,
        coin: chain,
        coinSymbol,
        coinLogo: logoUrl,
        balance: walletData.balance,
        balanceUSD: walletData.balanceUSD,
        transactions: walletData.transactions,
      });

      // Reset form and close
      setNickname("");
      setAddress("");
      setChain("Ethereum");
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to fetch wallet data. Please check the address and try again.");
      console.error("Error adding wallet:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setNickname("");
      setAddress("");
      setError("");
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full max-w-lg"
            >
              <div className="relative overflow-hidden rounded-2xl bg-dark-secondary border border-primary/30 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center">
                      <Plus size={20} className="text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Add New Wallet</h2>
                  </div>

                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-primary/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm"
                    >
                      {error}
                    </motion.div>
                  )}

                  {/* Nickname */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Wallet Nickname
                    </label>
                    <input
                      type="text"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="e.g., My Main Wallet"
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/60 border border-primary/20 focus:border-primary/40 outline-none text-white placeholder-gray-600 transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Chain Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Blockchain Network
                    </label>
                    <select
                      value={chain}
                      onChange={(e) => setChain(e.target.value as Chain)}
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/60 border border-primary/20 focus:border-primary/40 outline-none text-white cursor-pointer transition-all disabled:opacity-50"
                    >
                      {CHAINS.map((c) => (
                        <option key={c} value={c}>
                          {c} ({CHAIN_SYMBOLS[c]})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Wallet Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={
                        chain === "Bitcoin"
                          ? "bc1q... or 1... or 3..."
                          : chain === "Solana"
                          ? "Solana address"
                          : "0x..."
                      }
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/60 border border-primary/20 focus:border-primary/40 outline-none text-white placeholder-gray-600 font-mono text-sm transition-all disabled:opacity-50"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Enter your wallet's public address. We'll fetch the balance and transactions.
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3 pt-4">
                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          <span>Adding Wallet...</span>
                        </>
                      ) : (
                        <>
                          <Plus size={20} />
                          <span>Add Wallet</span>
                        </>
                      )}
                    </motion.button>

                    <motion.button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="px-6 py-3 rounded-xl bg-dark-tertiary border border-primary/20 hover:border-primary/40 text-white font-medium transition-all disabled:opacity-50"
                    >
                      Cancel
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
