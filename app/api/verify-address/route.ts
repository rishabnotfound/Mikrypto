/**
 * Bitcoin Address Verification API
 * Verifies if a Bitcoin address is valid using mempool.js
 */

import { NextRequest, NextResponse } from "next/server";
import mempoolJS from "@mempool/mempool.js";

// Initialize mempool.js client
const { bitcoin } = mempoolJS({
  hostname: "mempool.space",
});

const { addresses } = bitcoin;

// Validate Bitcoin address format
function isValidBitcoinAddress(address: string): boolean {
  const legacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  const bech32Regex = /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/;
  return legacyRegex.test(address) || bech32Regex.test(address);
}

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { valid: false, error: "Address is required" },
        { status: 400 }
      );
    }

    // Verify address format first
    if (!isValidBitcoinAddress(address)) {
      return NextResponse.json(
        { valid: false, error: "Invalid Bitcoin address format" },
        { status: 400 }
      );
    }

    // Verify address exists on blockchain using mempool.js
    try {
      const addressInfo = await addresses.getAddress({ address });

      return NextResponse.json({
        valid: true,
        address: addressInfo.address,
        chain_stats: addressInfo.chain_stats,
        mempool_stats: addressInfo.mempool_stats,
      });
    } catch (apiError: any) {
      // Address format is valid but doesn't exist on blockchain yet
      // This is still a valid address, it just has no transactions
      if (apiError.message?.includes("400") || apiError.message?.includes("404")) {
        return NextResponse.json({
          valid: true,
          address: address,
          chain_stats: {
            funded_txo_count: 0,
            funded_txo_sum: 0,
            spent_txo_count: 0,
            spent_txo_sum: 0,
            tx_count: 0,
          },
          mempool_stats: {
            funded_txo_count: 0,
            funded_txo_sum: 0,
            spent_txo_count: 0,
            spent_txo_sum: 0,
            tx_count: 0,
          },
        });
      }
      throw apiError;
    }
  } catch (error) {
    console.error("Address verification error:", error);
    return NextResponse.json(
      { valid: false, error: "Failed to verify address" },
      { status: 500 }
    );
  }
}
