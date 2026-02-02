/**
 * TransactionHistory Component
 * Displays list of transactions with animations and filtering
 */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Transaction, Currency } from "@/lib/types";
import { formatCurrency, formatDate, shortenAddress } from "@/lib/utils";
import { convertCurrencyAsync } from "@/lib/currency";
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Filter } from "lucide-react";

interface TransactionHistoryProps {
  transactions: Transaction[];
  coinSymbol: string;
  currentPrice: number; // Current crypto price in USD
  currency: Currency; // User's preferred currency
}

type FilterType = "all" | "send" | "receive";

export default function TransactionHistory({
  transactions,
  coinSymbol,
  currentPrice,
  currency
}: TransactionHistoryProps) {
  const [filter, setFilter] = useState<FilterType>("all");
  const [convertedAmounts, setConvertedAmounts] = useState<Map<string, number>>(new Map());

  // Convert all transaction amounts to user's preferred currency
  useEffect(() => {
    const convertAmounts = async () => {
      const amounts = new Map<string, number>();

      for (const tx of transactions) {
        const amountInUSD = (tx.amount || 0) * currentPrice; // Convert crypto to USD
        const converted = await convertCurrencyAsync(amountInUSD, "USD", currency);
        amounts.set(tx.id, converted);
      }

      setConvertedAmounts(amounts);
    };

    convertAmounts();
  }, [transactions, currentPrice, currency]);

  const filteredTransactions = transactions.filter((tx) => {
    if (filter === "all") return true;
    return tx.type === filter;
  });

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "confirmed":
        return <CheckCircle size={16} className="text-green-500" />;
      case "pending":
        return <Clock size={16} className="text-yellow-500" />;
      case "failed":
        return <XCircle size={16} className="text-red-500" />;
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "confirmed":
        return "text-green-500 bg-green-500/10 border-green-500/30";
      case "pending":
        return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
      case "failed":
        return "text-red-500 bg-red-500/10 border-red-500/30";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter buttons */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter size={18} className="text-gray-400" />
        {(["all", "send", "receive"] as FilterType[]).map((type) => (
          <motion.button
            key={type}
            onClick={() => setFilter(type)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
              filter === type
                ? "bg-primary/20 text-white border border-primary/40"
                : "bg-dark-tertiary/40 text-gray-400 hover:text-white border border-transparent"
            }`}
          >
            {type}
          </motion.button>
        ))}
        <div className="ml-auto text-sm text-gray-400">
          {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* Transaction list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-12 text-gray-500"
            >
              No transactions found
            </motion.div>
          ) : (
            filteredTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ scale: 1.01 }}
                className="group relative"
              >
                {/* Glass morphism card */}
                <div className="relative overflow-hidden rounded-xl bg-dark-tertiary/40 backdrop-blur-xl border border-primary/10 hover:border-primary/30 transition-all duration-300 p-4">
                  {/* Transaction content */}
                  <div className="flex items-center gap-4">
                    {/* Type icon */}
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        tx.type === "receive"
                          ? "bg-green-500/10 border border-green-500/30"
                          : "bg-red-500/10 border border-red-500/30"
                      }`}
                    >
                      {tx.type === "receive" ? (
                        <ArrowDownLeft className="text-green-500" size={20} />
                      ) : (
                        <ArrowUpRight className="text-red-500" size={20} />
                      )}
                    </div>

                    {/* Transaction details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium capitalize">{tx.type}</span>
                            <div
                              className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border ${getStatusColor(
                                tx.status
                              )}`}
                            >
                              {getStatusIcon(tx.status)}
                              <span className="capitalize">{tx.status}</span>
                            </div>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            {formatDate(tx.timestamp, "long")}
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-lg font-bold ${
                              tx.type === "receive" ? "text-green-500" : "text-white"
                            }`}
                          >
                            {tx.type === "receive" ? "+" : "-"}
                            {(tx.amount || 0).toFixed(4)} {coinSymbol}
                          </div>
                          <div className="text-sm text-gray-400">
                            {formatCurrency(convertedAmounts.get(tx.id) || 0, currency)}
                          </div>
                        </div>
                      </div>

                      {/* Addresses */}
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <span>From: {shortenAddress(tx.from, 4)}</span>
                        <span>→</span>
                        <span>To: {shortenAddress(tx.to, 4)}</span>
                      </div>

                      {/* Transaction hash */}
                      <div className="mt-2 text-xs text-gray-600">
                        Hash: {shortenAddress(tx.hash, 6)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover glow */}
                <div className="absolute inset-0 -z-10 rounded-xl bg-primary/10 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
