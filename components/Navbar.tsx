/**
 * Navbar Component
 * Glass-morphed pill-shaped navigation bar with smooth animations
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Settings, Home, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/", label: "Dashboard", icon: Home },
  { href: "/wallets", label: "Wallets", icon: Wallet },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Desktop Navbar - Pill shaped with glass morphism */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden md:block"
      >
        <div className="relative">
          {/* Glass morphism background */}
          <div className="absolute inset-0 bg-dark-tertiary/40 backdrop-blur-xl rounded-full border border-primary/20" />

          {/* Navigation content */}
          <div className="relative flex items-center gap-2 px-6 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mr-4 group">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-white font-bold text-lg hidden lg:block">Mikrypto</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-2">
              {navLinks.map(({ href, label, icon: Icon }) => {
                const isActive = pathname === href;

                return (
                  <Link key={href} href={href}>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`relative px-4 py-2 rounded-full transition-colors ${
                        isActive ? "text-white" : "text-gray-400 hover:text-white"
                      }`}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-primary/20 border border-primary/40 rounded-full"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}

                      {/* Link content */}
                      <div className="relative flex items-center gap-2">
                        <Icon size={18} />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                    </motion.div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Navbar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="bg-dark-tertiary/95 backdrop-blur-xl border-b border-primary/20">
          <div className="flex items-center justify-between px-4 py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">M</span>
              </div>
              <span className="text-white font-bold text-lg">Mikrypto</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 hover:bg-primary/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile menu dropdown */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden border-t border-primary/10"
              >
                <div className="px-4 py-4 space-y-2">
                  {navLinks.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;

                    return (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <motion.div
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                            isActive
                              ? "bg-primary/20 text-white border border-primary/40"
                              : "text-gray-400 hover:bg-primary/5 hover:text-white"
                          }`}
                        >
                          <Icon size={20} />
                          <span className="font-medium">{label}</span>
                        </motion.div>
                      </Link>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Spacer for mobile */}
      <div className="h-16 md:h-0" />
    </>
  );
}
