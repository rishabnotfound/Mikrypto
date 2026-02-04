/**
 * AddWalletModal Component
 * Modal form to add Bitcoin wallet addresses with verification
 */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, Bitcoin } from "lucide-react";
import { verifyAddress } from "@/lib/api";
import { addStoredWallet } from "@/lib/storage";

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddWalletModal({ isOpen, onClose, onSuccess }: AddWalletModalProps) {
  const [nickname, setNickname] = useState("");
  const [address, setAddress] = useState("");
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
      setError("Please enter a Bitcoin wallet address");
      return;
    }

    setLoading(true);

    try {
      // Verify address using mempool.js
      const verification = await verifyAddress(address.trim());

      if (!verification.valid) {
        setError(verification.error || "Invalid Bitcoin address");
        setLoading(false);
        return;
      }

      // Add wallet to storage (only id, nickname, address)
      addStoredWallet(nickname.trim(), address.trim());

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
          <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-full sm:max-w-lg"
            >
              <div className="relative overflow-hidden rounded-t-2xl sm:rounded-2xl bg-dark-secondary border border-orange-500/30 shadow-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-orange-500/20 sticky top-0 bg-dark-secondary z-10">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0">
                      <Bitcoin size={16} className="text-orange-500 sm:w-5 sm:h-5" />
                    </div>
                    <h2 className="text-lg sm:text-xl font-bold text-white">Add Bitcoin Wallet</h2>
                  </div>

                  <button
                    onClick={handleClose}
                    disabled={loading}
                    className="p-2 rounded-lg hover:bg-orange-500/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Error Message */}
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-3 sm:p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-500 text-sm"
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
                      className="w-full px-3 sm:px-4 py-3 rounded-xl bg-dark-tertiary/60 border border-orange-500/20 focus:border-orange-500/40 outline-none text-white placeholder-gray-600 transition-all disabled:opacity-50 text-sm sm:text-base"
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
                      className="w-full px-3 sm:px-4 py-3 rounded-xl bg-dark-tertiary/60 border border-orange-500/20 focus:border-orange-500/40 outline-none text-white placeholder-gray-600 font-mono text-xs sm:text-sm transition-all disabled:opacity-50"
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      Supports Legacy (1...), P2SH (3...), and Bech32 (bc1...)
                    </p>
                  </div>

                  {/* Buttons */}
                  <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 pt-2 sm:pt-4 pb-2">
                    <motion.button
                      type="button"
                      onClick={handleClose}
                      disabled={loading}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full sm:w-auto px-4 sm:px-6 py-3 rounded-xl bg-dark-tertiary border border-orange-500/20 hover:border-orange-500/40 text-white font-medium transition-all disabled:opacity-50 text-sm"
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="w-full sm:flex-1 flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl bg-orange-500 text-white font-medium hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <Bitcoin size={18} />
                          <span>Add Wallet</span>
                        </>
                      )}
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
