# Hyperliquid API Wallet Setup

## Why API Wallet?

Hyperliquid uses a proprietary signing scheme that requires an API Wallet for programmatic trading. This is the official, documented method for production use.

## Setup Steps

### 1. Generate API Key on Hyperliquid

1. Go to https://app.hyperliquid.xyz
2. Connect your MetaMask wallet (the one you registered: `0x42385FBA2A9875244CDe3F5781bCDf9cc9EB6b5F`)
3. Click "More" → "API"
4. Click "Create API Key"
5. Give it a name (e.g., "Trading Bot")
6. **Important**: Select your main wallet address (`0x42385FBA2A9875244CDe3F5781bCDf9cc9EB6b5F`) as the vault address
7. Authorize the API key
8. Copy the private key (starts with `0x...`)

### 2. Configure Backend

Create or update `/Users/rafaelmuradyan/repos/hyperliquid/backend/.env` file:

```bash
PORT=3001
HYPERLIQUID_API_URL=https://api.hyperliquid.xyz

# Your main wallet address (where you deposited funds)
VAULT_ADDRESS=0x42385FBA2A9875244CDe3F5781bCDf9cc9EB6b5F

# API Wallet private key (from step 1)
API_WALLET_PRIVATE_KEY=0x...paste_your_api_private_key_here...
```

### 3. Restart Backend

```bash
cd /Users/rafaelmuradyan/repos/hyperliquid/backend
npm run dev
```

### 4. Test

1. Open http://localhost:3001
2. Connect MetaMask (just for displaying your address, not for signing)
3. Try placing a small test order

## How It Works

- **Frontend**: Just sends order parameters (asset, price, size) to backend
- **Backend**: Signs orders with API wallet private key
- **Hyperliquid**: Verifies API wallet signature and executes trades on your main wallet
- **Your Funds**: Stay in your main wallet (`0x42385FBA2A9875244CDe3F5781bCDf9cc9EB6b5F`)

## Security

- The API wallet only has permission to trade
- It cannot withdraw funds
- All trades happen on your main wallet
- Keep the API private key secure (never commit to git)

