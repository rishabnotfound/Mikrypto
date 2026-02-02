/**
 * Currency Conversion Utility
 * Uses fawazahmed0 currency API for real-time conversion with exact rates
 */

interface ExchangeRateCache {
  rates: Record<string, number>;
  timestamp: number;
}

let exchangeRateCache: ExchangeRateCache | null = null;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch latest exchange rates from CDN
 */
async function fetchExchangeRates(): Promise<Record<string, number>> {
  try {
    // Check cache first
    if (
      exchangeRateCache &&
      Date.now() - exchangeRateCache.timestamp < CACHE_DURATION
    ) {
      return exchangeRateCache.rates;
    }

    // Fetch from fawazahmed0 currency API CDN
    const response = await fetch(
      'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json'
    );
    const data = await response.json();

    if (data.usd) {
      // The API returns rates where USD = 1, and other currencies are relative to USD
      // We need to invert this to get USD per currency
      const rates: Record<string, number> = { USD: 1 };

      // Add common fiat currencies
      if (data.usd.eur) rates.EUR = data.usd.eur;
      if (data.usd.gbp) rates.GBP = data.usd.gbp;
      if (data.usd.jpy) rates.JPY = data.usd.jpy;
      if (data.usd.inr) rates.INR = data.usd.inr;
      if (data.usd.aud) rates.AUD = data.usd.aud;
      if (data.usd.cad) rates.CAD = data.usd.cad;
      if (data.usd.cny) rates.CNY = data.usd.cny;

      exchangeRateCache = {
        rates,
        timestamp: Date.now(),
      };
      return rates;
    }

    // Fallback to static rates if API fails
    return getFallbackRates();
  } catch (error) {
    console.error('Error fetching exchange rates:', error);
    return getFallbackRates();
  }
}

/**
 * Fallback static exchange rates (relative to USD)
 */
function getFallbackRates(): Record<string, number> {
  return {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.5,
    INR: 83.2,
    AUD: 1.52,
    CAD: 1.36,
    CNY: 7.24,
  };
}

/**
 * Convert amount from one currency to another
 * @param amount - Amount to convert
 * @param from - Source currency code (e.g., "USD", "EUR")
 * @param to - Target currency code (e.g., "GBP", "INR")
 * @returns Promise with converted amount
 */
export async function convertCurrencyAsync(
  amount: number,
  from: string,
  to: string
): Promise<number> {
  try {
    // If same currency, no conversion needed
    if (from === to) {
      return amount;
    }

    const rates = await fetchExchangeRates();

    // The rates are "how many of this currency per 1 USD"
    // To convert: amount in FROM currency -> USD -> TO currency
    const fromRate = rates[from.toUpperCase()] || 1;
    const toRate = rates[to.toUpperCase()] || 1;

    // Convert to USD first, then to target currency
    const usdAmount = amount / fromRate;
    const convertedAmount = usdAmount * toRate;

    return convertedAmount;
  } catch (error) {
    console.error(`Error converting ${from} to ${to}:`, error);
    return amount; // Return original amount on error
  }
}

/**
 * Synchronous currency conversion using cached rates
 */
export function convertCurrencySync(
  amount: number,
  from: string,
  to: string
): number {
  if (from === to) {
    return amount;
  }

  const rates = exchangeRateCache?.rates || getFallbackRates();
  const fromRate = rates[from.toUpperCase()] || 1;
  const toRate = rates[to.toUpperCase()] || 1;

  const usdAmount = amount / fromRate;
  return usdAmount * toRate;
}
