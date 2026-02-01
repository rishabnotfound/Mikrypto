/**
 * API Service for fetching real blockchain data
 * Uses public APIs for prices, balances, and transactions
 */

import { Chain, Transaction } from "./types";

// Free public APIs (no API key required for basic usage)
const COINGECKO_API = "https://api.coingecko.com/api/v3";
const MEMPOOL_API = "https://mempool.space/api";

// Headers for Mempool.space scraping
const MEMPOOL_HEADERS = {
  "referer": "https://mempool.space/",
  "origin": "https://mempool.space",
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36",
};

// Chain to CoinGecko ID mapping
const CHAIN_TO_COINGECKO_ID: Record<string, string> = {
  Ethereum: "ethereum",
  Bitcoin: "bitcoin",
  "Binance Smart Chain": "binancecoin",
  Solana: "solana",
  Polygon: "matic-network",
  Avalanche: "avalanche-2",
  Arbitrum: "arbitrum",
  Optimism: "optimism",
  Base: "base",
};

/**
 * Get current price for a cryptocurrency
 */
export async function getCryptoPrice(coinId: string): Promise<number> {
  try {
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${coinId}&vs_currencies=usd`,
      { next: { revalidate: 60 } } // Cache for 60 seconds
    );
    const data = await response.json();
    return data[coinId]?.usd || 0;
  } catch (error) {
    console.error(`Error fetching price for ${coinId}:`, error);
    return 0;
  }
}

/**
 * Get multiple crypto prices at once
 */
export async function getMultiplePrices(
  coinIds: string[]
): Promise<Record<string, number>> {
  try {
    const ids = coinIds.join(",");
    const response = await fetch(
      `${COINGECKO_API}/simple/price?ids=${ids}&vs_currencies=usd`,
      { next: { revalidate: 60 } }
    );
    const data = await response.json();
    const prices: Record<string, number> = {};
    coinIds.forEach((id) => {
      prices[id] = data[id]?.usd || 0;
    });
    return prices;
  } catch (error) {
    console.error("Error fetching multiple prices:", error);
    return {};
  }
}

/**
 * Get Ethereum balance and transactions (via Mempool-style scraping)
 */
export async function getEthereumData(address: string) {
  try {
    // For Ethereum, we'll use a simple balance check
    // Note: Mempool.space only supports Bitcoin
    // For full functionality, you'd need Etherscan API or similar

    // This is a placeholder - returns 0 balance for now
    // To get real Ethereum data, use Etherscan API with your key
    console.log("Ethereum support coming soon - add Etherscan API key");

    return { balance: 0, transactions: [] };
  } catch (error) {
    console.error("Error fetching Ethereum data:", error);
    return { balance: 0, transactions: [] };
  }
}

/**
 * Get Bitcoin balance and transactions from Mempool.space
 */
export async function getBitcoinData(address: string) {
  try {
    // Get balance
    const balanceResponse = await fetch(`${MEMPOOL_API}/address/${address}`, {
      headers: MEMPOOL_HEADERS,
    });
    const balanceData = await balanceResponse.json();

    // Calculate balance: funded - spent (in satoshis, then convert to BTC)
    const fundedSats = balanceData.chain_stats?.funded_txo_sum || 0;
    const spentSats = balanceData.chain_stats?.spent_txo_sum || 0;
    const balanceSats = fundedSats - spentSats;
    const balance = balanceSats / 100000000; // Convert satoshis to BTC

    // Get transactions
    const txResponse = await fetch(`${MEMPOOL_API}/address/${address}/txs`, {
      headers: MEMPOOL_HEADERS,
    });
    const transactions = await txResponse.json();

    return { balance, transactions: transactions || [] };
  } catch (error) {
    console.error("Error fetching Bitcoin data:", error);
    return { balance: 0, transactions: [] };
  }
}

/**
 * Get Solana balance
 */
export async function getSolanaBalance(address: string): Promise<number> {
  try {
    const response = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    });
    const data = await response.json();
    return data.result?.value ? data.result.value / 1e9 : 0;
  } catch (error) {
    console.error("Error fetching Solana balance:", error);
    return 0;
  }
}

/**
 * Get balance for any chain
 */
export async function getWalletBalance(
  address: string,
  chain: Chain
): Promise<{ balance: number; transactions: any[] }> {
  switch (chain) {
    case "Ethereum":
    case "Arbitrum":
    case "Optimism":
    case "Base":
      return await getEthereumData(address);

    case "Bitcoin":
      return await getBitcoinData(address);

    case "Solana":
      const balance = await getSolanaBalance(address);
      return { balance, transactions: [] };

    case "Binance Smart Chain":
      // Use BSCScan API (similar to Etherscan)
      try {
        const apiKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY || "";
        const response = await fetch(
          `https://api.bscscan.com/api?module=account&action=balance&address=${address}&apikey=${apiKey}`
        );
        const data = await response.json();
        const balance = data.result ? parseFloat(data.result) / 1e18 : 0;
        return { balance, transactions: [] };
      } catch {
        return { balance: 0, transactions: [] };
      }

    case "Polygon":
      // Use PolygonScan API
      try {
        const apiKey = process.env.NEXT_PUBLIC_POLYGONSCAN_API_KEY || "";
        const response = await fetch(
          `https://api.polygonscan.com/api?module=account&action=balance&address=${address}&apikey=${apiKey}`
        );
        const data = await response.json();
        const balance = data.result ? parseFloat(data.result) / 1e18 : 0;
        return { balance, transactions: [] };
      } catch {
        return { balance: 0, transactions: [] };
      }

    default:
      return { balance: 0, transactions: [] };
  }
}

/**
 * Format Bitcoin transaction from Mempool.space to our Transaction type
 */
export function formatBitcoinTransaction(tx: any, address: string): Transaction {
  // Check if user's address is in inputs (vin) or outputs (vout)
  const hasInputFromUser = tx.vin?.some(
    (input: any) => input.prevout?.scriptpubkey_address === address
  );

  const hasOutputToUser = tx.vout?.some(
    (output: any) => output.scriptpubkey_address === address
  );

  // Determine transaction type and amount
  let type: "send" | "receive" = "receive";
  let amount = 0;
  let fromAddress = "Unknown";
  let toAddress = "Unknown";

  if (hasInputFromUser && !hasOutputToUser) {
    // Pure SEND - user sent all funds away (no change back)
    type = "send";
    // Amount = first output to someone else
    const recipientOutput = tx.vout?.find(
      (output: any) => output.scriptpubkey_address !== address
    );
    amount = recipientOutput?.value || 0;
    fromAddress = address;
    toAddress = recipientOutput?.scriptpubkey_address || "Unknown";
  } else if (hasInputFromUser && hasOutputToUser) {
    // SEND with change - user sent funds and got change back
    type = "send";
    // Amount = output to OTHER address (not user's change address)
    const recipientOutput = tx.vout?.find(
      (output: any) => output.scriptpubkey_address !== address
    );
    amount = recipientOutput?.value || 0;
    fromAddress = address;
    toAddress = recipientOutput?.scriptpubkey_address || "Unknown";
  } else if (!hasInputFromUser && hasOutputToUser) {
    // RECEIVE - user received funds
    type = "receive";
    // Amount = output TO user's address
    const userOutput = tx.vout?.find(
      (output: any) => output.scriptpubkey_address === address
    );
    amount = userOutput?.value || 0;
    fromAddress = tx.vin?.[0]?.prevout?.scriptpubkey_address || "Unknown";
    toAddress = address;
  }

  // Convert satoshis to BTC
  const amountBTC = amount / 100000000;

  return {
    id: tx.txid || `tx_${Date.now()}`,
    hash: tx.txid || "",
    type,
    amount: amountBTC,
    currency: "BTC",
    timestamp: (tx.status?.block_time || Date.now() / 1000) * 1000,
    from: fromAddress,
    to: toAddress,
    status: tx.status?.confirmed ? "confirmed" : "pending",
    fee: (tx.fee || 0) / 100000000, // Convert fee to BTC
  };
}

/**
 * Format Ethereum transaction (placeholder for future implementation)
 */
export function formatEthereumTransaction(tx: any, address: string): Transaction {
  const isReceive = tx.to?.toLowerCase() === address.toLowerCase();

  const value = parseFloat(tx.value || "0");
  const gasUsed = parseFloat(tx.gasUsed || "0");
  const gasPrice = parseFloat(tx.gasPrice || "0");
  const timestamp = parseInt(tx.timeStamp || "0");

  return {
    id: tx.hash || `tx_${Date.now()}`,
    hash: tx.hash || "",
    type: isReceive ? "receive" : "send",
    amount: isNaN(value) ? 0 : value / 1e18,
    currency: "ETH",
    timestamp: isNaN(timestamp) ? Date.now() : timestamp * 1000,
    from: tx.from || "",
    to: tx.to || "",
    status: tx.isError === "0" ? "confirmed" : "failed",
    fee: isNaN(gasUsed) || isNaN(gasPrice) ? 0 : (gasUsed * gasPrice) / 1e18,
  };
}

/**
 * Get coin logo URL from CoinGecko
 */
export async function getCoinLogo(coinId: string): Promise<string> {
  try {
    const response = await fetch(`${COINGECKO_API}/coins/${coinId}`);
    const data = await response.json();
    return data.image?.large || data.image?.small || "";
  } catch (error) {
    console.error(`Error fetching logo for ${coinId}:`, error);
    return "";
  }
}

/**
 * Get coin ID from chain name
 */
export function getCoinIdFromChain(chain: Chain): string {
  return CHAIN_TO_COINGECKO_ID[chain] || chain.toLowerCase();
}

/**
 * Refresh wallet data (balance and price)
 */
export async function refreshWalletData(
  address: string,
  chain: Chain,
  coinSymbol: string
) {
  try {
    const coinId = getCoinIdFromChain(chain);

    // Fetch balance and price in parallel
    const [{ balance, transactions }, price] = await Promise.all([
      getWalletBalance(address, chain),
      getCryptoPrice(coinId),
    ]);

    const balanceUSD = balance * price;

    // Format transactions based on chain
    const formattedTransactions: Transaction[] = transactions
      .slice(0, 50)
      .filter((tx: any) => tx && (tx.txid || tx.hash)) // Filter out invalid transactions
      .map((tx: any) => {
        // Use Bitcoin formatter for Bitcoin, Ethereum formatter for others
        if (chain === "Bitcoin") {
          return formatBitcoinTransaction(tx, address);
        }
        return formatEthereumTransaction(tx, address);
      });

    return {
      balance: balance || 0,
      balanceUSD: balanceUSD || 0,
      transactions: formattedTransactions || [],
    };
  } catch (error) {
    console.error("Error refreshing wallet data:", error);
    return {
      balance: 0,
      balanceUSD: 0,
      transactions: [],
    };
  }
}
