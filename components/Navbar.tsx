/**
 * Navbar Component
 * Mobile-first responsive navigation with glass morphism
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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
      {/* Desktop Navbar - Pill shaped */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 hidden md:block"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-dark-tertiary/60 backdrop-blur-xl rounded-full border border-orange-500/20" />

          <div className="relative flex items-center gap-2 px-4 lg:px-6 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 mr-4 group">
              <div className="w-10 h-10 rounded-full overflow-hidden group-hover:scale-110 transition-transform">
                <Image
                  src="/icon.png"
                  alt="Mikrypto"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white font-bold text-lg hidden lg:block">Mikrypto</span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-1">
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
                      {isActive && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute inset-0 bg-orange-500/20 border border-orange-500/40 rounded-full"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}

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

      {/* Mobile Navbar - Fixed top bar */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 z-50 md:hidden"
      >
        <div className="bg-dark-secondary/95 backdrop-blur-xl border-b border-orange-500/20">
          <div className="flex items-center justify-between px-4 py-3">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full overflow-hidden">
                <Image
                  src="/icon.png"
                  alt="Mikrypto"
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-white font-bold">Mikrypto</span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-white p-2 hover:bg-orange-500/10 rounded-lg transition-colors"
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
                transition={{ duration: 0.2 }}
                className="overflow-hidden border-t border-orange-500/10"
              >
                <div className="px-4 py-3 space-y-1">
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
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                            isActive
                              ? "bg-orange-500/20 text-white border border-orange-500/40"
                              : "text-gray-400 hover:bg-orange-500/5 hover:text-white"
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

      {/* Spacer for mobile navbar */}
      <div className="h-14 md:h-0" />
    </>
  );
}
