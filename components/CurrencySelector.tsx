/**
 * CurrencySelector Component
 * Dropdown to select preferred currency
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Currency } from "@/lib/types";
import { ChevronDown } from "lucide-react";

interface CurrencySelectorProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

const currencies: { value: Currency; label: string; symbol: string }[] = [
  { value: "USD", label: "US Dollar", symbol: "$" },
  { value: "EUR", label: "Euro", symbol: "€" },
  { value: "GBP", label: "British Pound", symbol: "£" },
  { value: "INR", label: "Indian Rupee", symbol: "₹" },
  { value: "JPY", label: "Japanese Yen", symbol: "¥" },
  { value: "AUD", label: "Australian Dollar", symbol: "A$" },
  { value: "CAD", label: "Canadian Dollar", symbol: "C$" },
  { value: "CNY", label: "Chinese Yuan", symbol: "¥" },
];

export default function CurrencySelector({ value, onChange }: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedCurrency = currencies.find((c) => c.value === value) || currencies[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative z-50">
      {/* Selector button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-tertiary/40 backdrop-blur-xl border border-primary/20 hover:border-primary/40 transition-all text-white"
      >
        <span className="text-lg">{selectedCurrency.symbol}</span>
        <span className="font-medium">{selectedCurrency.value}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full mt-2 right-0 min-w-[200px] rounded-xl bg-dark-tertiary/95 backdrop-blur-xl border border-primary/30 shadow-2xl overflow-hidden z-[100]"
          >
            <div className="py-2">
              {currencies.map((currency) => (
                <motion.button
                  key={currency.value}
                  onClick={() => {
                    onChange(currency.value);
                    setIsOpen(false);
                  }}
                  whileHover={{ backgroundColor: "rgba(214, 163, 92, 0.1)" }}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors ${
                    value === currency.value
                      ? "bg-primary/20 text-white"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <span className="text-xl">{currency.symbol}</span>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{currency.value}</div>
                    <div className="text-xs text-gray-500">{currency.label}</div>
                  </div>
                  {value === currency.value && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
