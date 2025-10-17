# Hyperliquid Trading Frontend

React.js frontend for Hyperliquid perpetual trading with MetaMask integration.

## Features

- MetaMask wallet connection
- Market selection interface
- Order placement form (Buy/Sell)
- Transaction signing with MetaMask
- Responsive design

## Components

### App.js
Main application component that handles wallet connection and market data loading.

### MarketSelector
Displays available perpetual markets in a grid layout. Users can select which market to trade.

### TradingPanel
Order entry form where users can:
- Select Buy/Long or Sell/Short
- Enter price and size
- View total order value
- Submit orders for MetaMask signing

## Utilities

### wallet.js
Functions for MetaMask integration:
- `connectWallet()`: Connect to MetaMask
- `getAccount()`: Get current account
- `getSigner()`: Get ethers.js signer

### signing.js
Functions for order signing:
- `createSignedOrder()`: Create and sign an order with MetaMask
- `formatPrice()`: Format price to correct decimals
- `formatSize()`: Format size to correct decimals

### api.js
Backend API calls:
- `getMarketInfo()`: Fetch market data
- `placeOrder()`: Submit signed order

## Running

```bash
npm install
npm start
```

## Environment Variables

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Building for Production

```bash
npm run build
```

The optimized build will be in the `build/` directory.

