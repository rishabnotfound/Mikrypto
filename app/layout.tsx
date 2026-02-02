/**
 * Root Layout
 * Main application layout with Navbar, Footer, and global styles
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mikrypto - Bitcoin Wallet Tracker",
  description: "Track and manage your Bitcoin wallets with live blockchain data from Mempool.space",
  keywords: ["bitcoin", "wallet", "tracker", "blockchain", "cryptocurrency", "BTC", "mempool"],
  authors: [{ name: "R", url: "https://github.com/rishabnotfound" }],
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "Mikrypto - Bitcoin Wallet Tracker",
    description: "Track and manage your Bitcoin wallets with live blockchain data from Mempool.space",
    type: "website",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <div className="min-h-screen flex flex-col bg-dark text-text-main">
          {/* Background gradient effects */}
          <div className="fixed inset-0 -z-10 overflow-hidden">
            {/* Radial gradient spots */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "1s" }} />
            <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />

            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(#D6A35C 1px, transparent 1px), linear-gradient(90deg, #D6A35C 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            />
          </div>

          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
