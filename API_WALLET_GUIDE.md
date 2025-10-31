# Hyperliquid API Wallet - Automatic Setup

## What is an API Wallet?

An **API wallet** is a separate Ethereum wallet that is authorized to place trades on behalf of your main wallet on Hyperliquid. This is the secure way to enable programmatic trading.

### Key Points:
- 🔐 **Separate wallet**: The API wallet is different from your MetaMask wallet
- ✅ **Authorized by you**: Your main wallet signs an authorization message
- 📈 **Trading only**: API wallet can only place trades, NOT withdraw funds
- 🔑 **Managed by the app**: The app creates and stores the API wallet securely

## How It Works

### 1. **Connect MetaMask**
When you connect your MetaMask wallet to the app, it checks if you have an API wallet.

### 2. **Automatic Creation**
If you don't have an API wallet:
- The backend generates a new random Ethereum wallet
- This wallet is stored securely in `backend/api-wallets.json`
- The wallet is mapped to your main wallet address

### 3. **Authorization**
To authorize the API wallet:
- MetaMask will prompt you to sign an authorization message
- This uses EIP-712 typed data signing
- The signed authorization is sent to Hyperliquid
- Hyperliquid confirms the API wallet can trade on your behalf

### 4. **Ready to Trade**
Once authorized:
- All orders are signed by the API wallet (not your MetaMask)
- You can place trades without MetaMask popups for every order
- The API wallet uses your main wallet's account for trading

## Technical Flow

```
┌─────────────────┐
│  User connects  │
│    MetaMask     │
└────────┬────────┘
         │
         ▼
┌─────────────────────┐
│  Backend checks:    │
│  API wallet exists? │
└────────┬────────────┘
         │
    ┌────┴────┐
    │   NO    │
    ▼         │
┌──────────────────┐  │
│  Generate new    │  │
│  API wallet      │  │
│  (random key)    │  │
└─────────┬────────┘  │
          │           │
          ▼           │
┌──────────────────┐  │
│  Frontend signs  │  │
│  authorization   │  │
│  (EIP-712)       │  │
└─────────┬────────┘  │
          │           │
          ▼           │
┌──────────────────┐  │
│  Send to         │  │
│  Hyperliquid     │  │
│  /exchange       │  │
└─────────┬────────┘  │
          │           │
    ┌─────┴─────┐     │
    │    YES    │◄────┘
    ▼           
┌──────────────────┐
│  Ready to trade! │
│  API wallet      │
│  signs orders    │
└──────────────────┘
```

## Files

### Backend
- `backend/src/services/apiWalletManager.js` - Creates and manages API wallets
- `backend/src/services/signer.js` - Signs orders using Hyperliquid SDK
- `backend/src/routes/apiWallet.js` - API endpoints for wallet management
- `backend/api-wallets.json` - Secure storage of API wallet keys

### Frontend
- `frontend/src/components/ApiWalletSetup.js` - UI for wallet creation flow
- `frontend/src/utils/apiWalletAuth.js` - Signs authorization with MetaMask
- `frontend/src/services/api.js` - API calls for wallet management

## Security

### ✅ Safe
- API wallet can only place trades
- API wallet cannot withdraw funds
- Authorization is signed by your main wallet
- Private keys are stored server-side (not in frontend)

### ⚠️ Important
- Keep `backend/api-wallets.json` secure
- Do not commit `api-wallets.json` to git (already in `.gitignore`)
- In production, use environment variables or secure key management
- Consider encrypting the API wallet private keys at rest

## Benefits

1. **Better UX**: No MetaMask popup for every order
2. **Faster Trading**: Orders are signed instantly
3. **Secure**: API wallet has limited permissions
4. **Standard Pattern**: This is how Hyperliquid recommends programmatic trading

## Running the App

```bash
# Start backend
cd backend
npm run dev

# The app serves the frontend at http://localhost:3001

# On first connection:
# 1. Connect MetaMask
# 2. API wallet setup modal appears
# 3. Sign authorization in MetaMask
# 4. Start trading!
```

## Troubleshooting

### "API wallet not authorized"
- Make sure you signed the authorization message in MetaMask
- Check backend logs for errors
- Try disconnecting and reconnecting your wallet

### "No API wallet found"
- The app should auto-create one on first connection
- Check if `backend/api-wallets.json` exists
- Check backend logs for errors

### "Failed to place order"
- Ensure your main wallet is registered on Hyperliquid
- Visit https://app.hyperliquid.xyz to register and deposit
- Check that API wallet authorization was successful

## Architecture

The app uses the **official Hyperliquid SDK** (`hyperliquid` npm package) to:
- Initialize SDK with API wallet credentials
- Convert frontend order format to SDK format
- Sign and place orders automatically
- Handle asset mapping (index → coin name)
- Apply correct price tick sizes

This is much more reliable than manually implementing the signing and API calls!

