/**
 * Bitcoin Address Verification API
 * Verifies if a Bitcoin address is valid using Mempool.space API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { address } = await request.json();

    if (!address) {
      return NextResponse.json(
        { valid: false, error: 'Address is required' },
        { status: 400 }
      );
    }

    // Verify address format first (basic client-side check)
    const isBitcoinAddress =
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(address) || // Legacy/P2SH
      /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/.test(address); // Bech32

    if (!isBitcoinAddress) {
      return NextResponse.json(
        { valid: false, error: 'Invalid Bitcoin address format' },
        { status: 400 }
      );
    }

    // Verify address exists on blockchain using Mempool.space API
    const response = await fetch(
      `https://mempool.space/api/address/${address}`,
      {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mikrypto Bitcoin Tracker',
        },
      }
    );

    if (response.status === 400) {
      return NextResponse.json(
        { valid: false, error: 'Invalid Bitcoin address' },
        { status: 400 }
      );
    }

    if (response.status === 404) {
      return NextResponse.json(
        { valid: false, error: 'Address not found on blockchain' },
        { status: 404 }
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { valid: false, error: 'Failed to verify address' },
        { status: 500 }
      );
    }

    const data = await response.json();

    // Address is valid and exists on blockchain
    return NextResponse.json({
      valid: true,
      address: data.address,
      chain_stats: data.chain_stats,
      mempool_stats: data.mempool_stats,
    });
  } catch (error) {
    console.error('Address verification error:', error);
    return NextResponse.json(
      { valid: false, error: 'Failed to verify address' },
      { status: 500 }
    );
  }
}
