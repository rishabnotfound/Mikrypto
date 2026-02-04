<p align="center">
      <img
        src="./public/logo.png"
        width="200"
        height="200"
      />
    </p>

# <p align="center">Mikrypto</p>

A professional **Bitcoin wallet tracker** with **live blockchain data** from Mempool.space

# Preview

<img width="1469" height="833" alt="Screenshot 2026-02-04 at 8 46 55 PM" src="https://github.com/user-attachments/assets/8dbd78bb-ff10-4694-bef5-158110e7c6db" />

## Features

- **Bitcoin-Only Support** - Track Bitcoin wallets exclusively
- **Live Data** - Real-time Bitcoin balances from Mempool.space
- **Live BTC Price** - Real-time Bitcoin prices from CoinGecko
- **Transaction History** - Fetch actual Bitcoin transactions with send/receive detection
- **Balance Charts** - 30-day balance trend graphs in your preferred currency
- **Address Verification** - Validates Bitcoin addresses before adding
- **Backup/Restore** - Export and import wallet data as JSON
- **Multi-Currency Support** - View balances in USD, EUR, GBP, INR, JPY, AUD, CAD, CNY with real exchange rates
- **Fully Responsive** - Optimized for all devices

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Framer Motion** (Animations)
- **Recharts** (Charts)
- **Real APIs**: Mempool.space (Bitcoin data), fawazahmed0 CDN (currency rates)

## How to Use

1. Click **"Add Wallet"** button
2. Enter wallet nickname
3. Paste your Bitcoin wallet address
4. Address is verified via Mempool.space API
5. Click **"Add Wallet"** - it will fetch live balance and transaction history!

## Supported Bitcoin Address Formats

- **Legacy (P2PKH)**: Starts with `1` (e.g., `1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa`)
- **P2SH**: Starts with `3` (e.g., `3J98t1WpEZ73CNmYviecrnyiWrnqRhWNLy`)
- **Bech32 (SegWit)**: Starts with `bc1` (e.g., `bc1q3kdnhs37nyh0qghxkkwrmpd63d9jd93l9dn948`)

## Data Management

- **Add Wallets**: Enter real Bitcoin addresses (verified before adding)
- **Live Sync**: Balances and transactions update from Mempool.space
- **Backup**: Export as JSON from Settings
- **Restore**: Import from JSON backup
- **Storage**: Local storage (private, no server)

## Author

Made with ❤️ by [R](https://github.com/rishabnotfound)

## License

[MIT](LICENSE)
