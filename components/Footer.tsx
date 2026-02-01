/**
 * Footer Component
 * Clean footer with attribution and GitHub link
 */

"use client";

import { motion } from "framer-motion";
import { Heart, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-primary/10 bg-dark-secondary/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row items-center justify-between gap-4"
        >
          {/* Attribution */}
          <div className="flex items-center gap-2 text-gray-400">
            <span>Made with</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart size={16} className="text-primary fill-primary" />
            </motion.div>
            <span>by</span>
            <a
              href="https://github.com/rishabnotfound"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-white hover:text-primary transition-colors"
            >
              R
            </a>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6">
            <a
              href="https://github.com/rishabnotfound"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group"
            >
              <Github size={20} className="group-hover:scale-110 transition-transform" />
              <span className="text-sm">GitHub</span>
            </a>

            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Mikrypto
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
