/**
 * AddWalletModal Component
 * Modal form to add Bitcoin wallet addresses with verification
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Loader2, Bitcoin } from "lucide-react";
import { refreshWalletData, getCoinLogo } from "@/lib/api";
import { addWallet } from "@/lib/storage";

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWalletModal({ isOpen, onClose, onSuccess }: AddWalletModalProps) {
  const [nickname, setNickname] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
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
      setError("Please enter a Bitcoin wallet address");
      return;
    }

    setLoading(true);
    setVerifying(true);

    try {
      // Step 1: Verify address using API
      const verifyResponse = await fetch('/api/verify-address', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: address.trim() }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyData.valid) {
        setError(verifyData.error || 'Invalid Bitcoin address');
        setLoading(false);
        setVerifying(false);
        return;
      }

      setVerifying(false);

      // Step 2: Fetch wallet data from blockchain
      const [walletData, logoUrl] = await Promise.all([
        refreshWalletData(address.trim(), "Bitcoin", "BTC"),
        getCoinLogo("bitcoin"),
      ]);

      // Step 3: Add wallet to storage
      addWallet({
        nickname: nickname.trim(),
        address: address.trim(),
        chain: "Bitcoin",
        coin: "Bitcoin",
        coinSymbol: "BTC",
        coinLogo: logoUrl,
        balance: walletData.balance,
        balanceUSD: walletData.balanceUSD,
        transactions: walletData.transactions,
      });

      // Reset form and close
      setNickname("");
      setAddress("");
      onSuccess();
      onClose();
    } catch (err) {
      setError("Failed to add wallet. Please check the address and try again.");
      console.error("Error adding wallet:", err);
    } finally {
      setLoading(false);
      setVerifying(false);
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
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center">
                      <Bitcoin size={20} className="text-orange-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Add Bitcoin Wallet</h2>
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
                      placeholder="e.g., My Main Bitcoin Wallet"
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/60 border border-primary/20 focus:border-primary/40 outline-none text-white placeholder-gray-600 transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Bitcoin Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                      Bitcoin Wallet Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="bc1q... or 1... or 3..."
                      disabled={loading}
                      className="w-full px-4 py-3 rounded-xl bg-dark-tertiary/60 border border-primary/20 focus:border-primary/40 outline-none text-white placeholder-gray-600 font-mono text-sm transition-all disabled:opacity-50"
                    />
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-gray-500">
                        Supports all Bitcoin address formats: Legacy (1...), P2SH (3...), and Bech32 (bc1...)
                      </p>
                      {verifying && (
                        <p className="text-xs text-orange-500 flex items-center gap-1">
                          <Loader2 size={12} className="animate-spin" />
                          Verifying address on blockchain...
                        </p>
                      )}
                    </div>
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
                          <span>{verifying ? 'Verifying Address...' : 'Fetching Data...'}</span>
                        </>
                      ) : (
                        <>
                          <Bitcoin size={20} />
                          <span>Add Bitcoin Wallet</span>
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
