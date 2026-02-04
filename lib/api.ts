/**
 * Bitcoin API Service using @mempool/mempool.js
 * Fetches live blockchain data from mempool.space
 */

import mempoolJS from "@mempool/mempool.js";
import { Transaction, Wallet, StoredWallet } from "./types";
import {
  getBalanceCache,
  saveBalanceCache,
  getTxCache,
  saveTxCache,
  prependTxCache,
  appendTxCache,
} from "./storage";

// Initialize mempool.js client
const { bitcoin } = mempoolJS({
  hostname: "mempool.space",
});

const { addresses } = bitcoin;

// CoinGecko API for price data
const COINGECKO_API = "https://api.coingecko.com/api/v3";

// Bitcoin logo URL
const BTC_LOGO = "https://assets.coingecko.com/coins/images/1/large/bitcoin.png";

/**
 * Get current Bitcoin price in USD
 */
export async function getBitcoinPrice(): Promise<number> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=bitcoin&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    const data = await response.json();
    return data.bitcoin?.usd || 0;
  } catch (error) {
    console.error("Error fetching Bitcoin price:", error);
    return 0;
  }
}

/**
 * Get address data from mempool.space
 */
export async function getAddressData(address: string) {
  try {
    const addressInfo = await addresses.getAddress({ address });

    // Calculate balance from chain_stats (in satoshis)
    const fundedSats = addressInfo.chain_stats?.funded_txo_sum || 0;
    const spentSats = addressInfo.chain_stats?.spent_txo_sum || 0;
    const mempoolFunded = addressInfo.mempool_stats?.funded_txo_sum || 0;
    const mempoolSpent = addressInfo.mempool_stats?.spent_txo_sum || 0;

    const balanceSats = (fundedSats - spentSats) + (mempoolFunded - mempoolSpent);
    const balance = balanceSats / 100000000; // Convert satoshis to BTC

    return {
      address: addressInfo.address,
      balance,
      chainStats: addressInfo.chain_stats,
      mempoolStats: addressInfo.mempool_stats,
    };
  } catch (error) {
    console.error("Error fetching address data:", error);
    throw error;
  }
}

/**
 * Get one page of confirmed transactions (25 per page)
 * Use after_txid to get the next page
 */
export async function getAddressTransactionsPage(
  address: string,
  afterTxId?: string
): Promise<{ txs: any[]; hasMore: boolean }> {
  try {
    // Cast to any because mempool.js types don't include after_txid but API supports it
    const txs = await addresses.getAddressTxsChain({ address, after_txid: afterTxId } as any);

    if (!txs || txs.length === 0) {
      return { txs: [], hasMore: false };
    }

    // If we got 25 transactions, there might be more
    return { txs, hasMore: txs.length === 25 };
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return { txs: [], hasMore: false };
  }
}

/**
 * Get first page of transactions (for initial load)
 */
export async function getAddressTransactions(address: string): Promise<any[]> {
  const { txs } = await getAddressTransactionsPage(address);
  return txs;
}

/**
 * Get mempool (unconfirmed) transactions for an address
 */
export async function getAddressMempoolTxs(address: string): Promise<any[]> {
  try {
    const txs = await addresses.getAddressTxsMempool({ address });
    return txs || [];
  } catch (error) {
    console.error("Error fetching mempool transactions:", error);
    return [];
  }
}

/**
 * Get UTXOs for an address
 */
export async function getAddressUtxos(address: string) {
  try {
    const utxos = await addresses.getAddressTxsUtxo({ address });
    return utxos || [];
  } catch (error) {
    console.error("Error fetching UTXOs:", error);
    return [];
  }
}

/**
 * Format a raw transaction from mempool.space to our Transaction type
 */
export function formatTransaction(tx: any, userAddress: string): Transaction {
  // Check if user's address is in inputs (vin) or outputs (vout)
  const hasInputFromUser = tx.vin?.some(
    (input: any) => input.prevout?.scriptpubkey_address === userAddress
  );

  const hasOutputToUser = tx.vout?.some(
    (output: any) => output.scriptpubkey_address === userAddress
  );

  // Determine transaction type and amount
  let type: "send" | "receive" = "receive";
  let amount = 0;
  let fromAddress = "Unknown";
  let toAddress = "Unknown";

  if (hasInputFromUser && !hasOutputToUser) {
    // Pure SEND - user sent all funds away (no change back)
    type = "send";
    const recipientOutput = tx.vout?.find(
      (output: any) => output.scriptpubkey_address !== userAddress
    );
    amount = recipientOutput?.value || 0;
    fromAddress = userAddress;
    toAddress = recipientOutput?.scriptpubkey_address || "Unknown";
  } else if (hasInputFromUser && hasOutputToUser) {
    // SEND with change - user sent funds and got change back
    type = "send";
    const recipientOutput = tx.vout?.find(
      (output: any) => output.scriptpubkey_address !== userAddress
    );
    amount = recipientOutput?.value || 0;
    fromAddress = userAddress;
    toAddress = recipientOutput?.scriptpubkey_address || "Unknown";
  } else if (!hasInputFromUser && hasOutputToUser) {
    // RECEIVE - user received funds
    type = "receive";
    const userOutput = tx.vout?.find(
      (output: any) => output.scriptpubkey_address === userAddress
    );
    amount = userOutput?.value || 0;
    fromAddress = tx.vin?.[0]?.prevout?.scriptpubkey_address || "Unknown";
    toAddress = userAddress;
  }

  // Convert satoshis to BTC
  const amountBTC = amount / 100000000;
  const feeBTC = (tx.fee || 0) / 100000000;

  return {
    id: tx.txid,
    hash: tx.txid,
    type,
    amount: amountBTC,
    timestamp: tx.status?.block_time ? tx.status.block_time * 1000 : Date.now(),
    from: fromAddress,
    to: toAddress,
    status: tx.status?.confirmed ? "confirmed" : "pending",
    fee: feeBTC,
    blockHeight: tx.status?.block_height,
  };
}

/**
 * Validate a Bitcoin address
 */
export function isValidBitcoinAddress(address: string): boolean {
  // Legacy addresses (P2PKH): start with 1
  const legacyRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
  // Bech32 addresses (P2WPKH/P2WSH): start with bc1
  const bech32Regex = /^bc1[a-zA-HJ-NP-Z0-9]{39,59}$/;

  return legacyRegex.test(address) || bech32Regex.test(address);
}

/**
 * Fetch complete wallet data for a stored wallet (with caching)
 */
export async function fetchWalletData(storedWallet: StoredWallet): Promise<Wallet> {
  try {
    const address = storedWallet.address;

    // Check balance cache first (1 hour TTL)
    const balanceCache = getBalanceCache(address);
    const txCache = getTxCache(address);

    let balance: number;
    let balanceUSD: number;
    let transactions: Transaction[];
    let hasMoreTxs: boolean;
    let lastTxId: string | undefined;

    // If balance cache is valid AND has non-zero balance, use it
    // If cached balance is 0, always re-fetch to verify (could be stale bad data)
    if (balanceCache && balanceCache.balance > 0) {
      balance = balanceCache.balance;
      balanceUSD = balanceCache.balanceUSD;
    } else {
      // Fetch fresh balance data
      const [addressData, btcPrice] = await Promise.all([
        getAddressData(address),
        getBitcoinPrice(),
      ]);
      balance = addressData.balance;
      balanceUSD = addressData.balance * btcPrice;
      // Only cache if we got valid data
      if (balance >= 0 && btcPrice > 0) {
        saveBalanceCache(address, balance, balanceUSD);
      }
    }

    // For transactions: always check for new ones (mempool) and merge with cache
    if (txCache && txCache.transactions.length > 0) {
      // We have cached transactions - only fetch mempool (pending) txs
      const mempoolTxs = await getAddressMempoolTxs(address);
      const formattedMempoolTxs = mempoolTxs
        .filter((tx: any) => tx && tx.txid)
        .map((tx: any) => formatTransaction(tx, address));

      // Merge mempool txs with cached (pending txs go first)
      if (formattedMempoolTxs.length > 0) {
        prependTxCache(address, formattedMempoolTxs);
      }

      // Get updated cache
      const updatedCache = getTxCache(address);
      transactions = updatedCache?.transactions || [];
      hasMoreTxs = updatedCache?.hasMore || false;
      lastTxId = updatedCache?.lastTxId;
    } else {
      // No cache - fetch first page of transactions
      const [txsResult, mempoolTxs] = await Promise.all([
        getAddressTransactionsPage(address),
        getAddressMempoolTxs(address),
      ]);

      const allTxs = [...mempoolTxs, ...txsResult.txs];
      transactions = allTxs
        .filter((tx: any) => tx && tx.txid)
        .map((tx: any) => formatTransaction(tx, address));

      hasMoreTxs = txsResult.hasMore;
      lastTxId = txsResult.txs.length > 0
        ? txsResult.txs[txsResult.txs.length - 1]?.txid
        : undefined;

      // Save to cache
      saveTxCache(address, transactions, hasMoreTxs, lastTxId);
    }

    return {
      ...storedWallet,
      balance,
      balanceUSD,
      transactions,
      lastUpdated: Date.now(),
      hasMoreTxs,
      lastTxId,
    };
  } catch (error) {
    console.error("Error fetching wallet data:", error);

    // On error, try to fetch fresh data without caching
    try {
      const [addressData, btcPrice] = await Promise.all([
        getAddressData(storedWallet.address),
        getBitcoinPrice(),
      ]);

      return {
        ...storedWallet,
        balance: addressData.balance,
        balanceUSD: addressData.balance * btcPrice,
        transactions: [],
        lastUpdated: Date.now(),
        hasMoreTxs: false,
      };
    } catch {
      // Complete failure - return zeros
      return {
        ...storedWallet,
        balance: 0,
        balanceUSD: 0,
        transactions: [],
        lastUpdated: Date.now(),
        hasMoreTxs: false,
      };
    }
  }
}

/**
 * Fetch wallet data for multiple wallets (with caching)
 */
export async function fetchAllWalletsData(storedWallets: StoredWallet[]): Promise<Wallet[]> {
  // Get BTC price once for all wallets
  const btcPrice = await getBitcoinPrice();

  // Fetch all wallet data
  const wallets: Wallet[] = [];

  for (const storedWallet of storedWallets) {
    try {
      const wallet = await fetchWalletData(storedWallet);

      // If we got 0 balance but have a valid BTC price, double check by fetching fresh
      if (wallet.balance === 0 && btcPrice > 0) {
        try {
          const addressData = await getAddressData(storedWallet.address);
          if (addressData.balance > 0) {
            wallet.balance = addressData.balance;
            wallet.balanceUSD = addressData.balance * btcPrice;
            saveBalanceCache(storedWallet.address, wallet.balance, wallet.balanceUSD);
          }
        } catch {
          // Keep the 0 balance if re-fetch fails
        }
      }

      wallets.push(wallet);

      // Small delay between requests to avoid rate limiting
      if (storedWallets.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
    } catch (error) {
      console.error(`Error fetching data for wallet ${storedWallet.nickname}:`, error);

      // Try to fetch fresh data on error
      try {
        const addressData = await getAddressData(storedWallet.address);
        wallets.push({
          ...storedWallet,
          balance: addressData.balance,
          balanceUSD: addressData.balance * btcPrice,
          transactions: [],
          lastUpdated: Date.now(),
          hasMoreTxs: false,
        });
      } catch {
        // Complete failure
        wallets.push({
          ...storedWallet,
          balance: 0,
          balanceUSD: 0,
          transactions: [],
          lastUpdated: Date.now(),
          hasMoreTxs: false,
        });
      }
    }
  }

  return wallets;
}

/**
 * Load more transactions for a wallet (pagination) - with caching
 */
export async function loadMoreTransactions(
  address: string,
  afterTxId: string
): Promise<{ transactions: Transaction[]; hasMore: boolean; lastTxId?: string }> {
  try {
    const { txs, hasMore } = await getAddressTransactionsPage(address, afterTxId);

    const transactions = txs
      .filter((tx: any) => tx && tx.txid)
      .map((tx: any) => formatTransaction(tx, address));

    const newLastTxId = txs.length > 0 ? txs[txs.length - 1]?.txid : undefined;

    // Append to cache
    if (transactions.length > 0) {
      appendTxCache(address, transactions, hasMore, newLastTxId);
    }

    return { transactions, hasMore, lastTxId: newLastTxId };
  } catch (error) {
    console.error("Error loading more transactions:", error);
    return { transactions: [], hasMore: false };
  }
}

/**
 * Force refresh wallet data (bypass cache)
 */
export async function forceRefreshWalletData(storedWallet: StoredWallet): Promise<Wallet> {
  const address = storedWallet.address;

  try {
    // Fetch everything fresh
    const [addressData, txsResult, mempoolTxs, btcPrice] = await Promise.all([
      getAddressData(address),
      getAddressTransactionsPage(address),
      getAddressMempoolTxs(address),
      getBitcoinPrice(),
    ]);

    const balance = addressData.balance;
    const balanceUSD = addressData.balance * btcPrice;

    const allTxs = [...mempoolTxs, ...txsResult.txs];
    const transactions = allTxs
      .filter((tx: any) => tx && tx.txid)
      .map((tx: any) => formatTransaction(tx, address));

    const hasMoreTxs = txsResult.hasMore;
    const lastTxId = txsResult.txs.length > 0
      ? txsResult.txs[txsResult.txs.length - 1]?.txid
      : undefined;

    // Update caches
    saveBalanceCache(address, balance, balanceUSD);
    saveTxCache(address, transactions, hasMoreTxs, lastTxId);

    return {
      ...storedWallet,
      balance,
      balanceUSD,
      transactions,
      lastUpdated: Date.now(),
      hasMoreTxs,
      lastTxId,
    };
  } catch (error) {
    console.error("Error force refreshing wallet data:", error);
    throw error;
  }
}

/**
 * Verify a Bitcoin address exists on the blockchain
 */
export async function verifyAddress(address: string): Promise<{
  valid: boolean;
  error?: string;
  data?: any;
}> {
  // First check format
  if (!isValidBitcoinAddress(address)) {
    return { valid: false, error: "Invalid Bitcoin address format" };
  }

  try {
    const addressData = await getAddressData(address);
    return { valid: true, data: addressData };
  } catch (error: any) {
    if (error.message?.includes("400") || error.message?.includes("404")) {
      return { valid: false, error: "Address not found on blockchain" };
    }
    return { valid: false, error: "Failed to verify address" };
  }
}

/**
 * Get Bitcoin logo URL
 */
export function getBitcoinLogo(): string {
  return BTC_LOGO;
}
