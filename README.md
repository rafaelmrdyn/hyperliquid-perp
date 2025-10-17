# 🚀 Hyperliquid Perpetual Trading Platform

A complete React.js and Node.js Express application for trading perpetual futures on Hyperliquid using MetaMask wallet integration.

## 📋 Features

- ✅ **MetaMask Integration**: Secure wallet connection and transaction signing
- ✅ **Perpetual Futures Trading**: Trade perpetual contracts with limit orders
- ✅ **Real-time Market Data**: Fetch live market information from Hyperliquid API
- ✅ **Modern UI**: Beautiful, responsive interface with gradient designs
- ✅ **Secure Backend**: Express API with rate limiting and error handling

## 🏗️ Project Structure

```
hyperliquid/
├── backend/                 # Node.js Express backend
│   ├── src/
│   │   ├── routes/         # API routes
│   │   │   ├── market.js   # Market data endpoints
│   │   │   └── trading.js  # Trading endpoints
│   │   ├── services/       # Business logic
│   │   │   └── hyperliquid.js  # Hyperliquid API integration
│   │   └── server.js       # Express server setup
│   ├── package.json
│   └── .env
│
├── frontend/               # React.js frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── MarketSelector.js
│   │   │   ├── MarketSelector.css
│   │   │   ├── TradingPanel.js
│   │   │   └── TradingPanel.css
│   │   ├── services/       # API services
│   │   │   └── api.js
│   │   ├── utils/          # Utility functions
│   │   │   ├── wallet.js   # MetaMask wallet functions
│   │   │   └── signing.js  # Transaction signing
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   └── .env
│
└── package.json            # Root package.json
```

## 🔧 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** browser extension installed

## 📦 Installation

### 1. Clone the repository

```bash
cd /Users/rafaelmuradyan/repos/hyperliquid
```

### 2. Install dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure environment variables

**Backend** (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
HYPERLIQUID_API_URL=https://api.hyperliquid.xyz
# For testnet use: https://api.hyperliquid-testnet.xyz
```

**Frontend** (`frontend/.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚀 Running the Application

### Option 1: Run both frontend and backend together

From the root directory:
```bash
npm run dev
```

### Option 2: Run separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## 🎯 How to Use

### 1. Connect MetaMask

1. Open the application in your browser
2. Click "Connect MetaMask" button
3. Approve the connection in MetaMask popup
4. Your wallet address will be displayed in the header

### 2. Select a Market

- Browse the available perpetual markets
- Click on any market to select it (e.g., BTC, ETH, SOL)
- The selected market will be highlighted

### 3. Place an Order

1. Choose order type: **Buy/Long** or **Sell/Short**
2. Enter **Price** in USD
3. Enter **Size** (amount of the asset)
4. Review the total value
5. Click the buy/sell button
6. **Sign the transaction** in MetaMask popup
7. Wait for confirmation

## 📡 API Endpoints

### Backend Endpoints

#### Get Market Information
```http
GET /api/market/info
```
Returns all available perpetual markets and their metadata.

#### Place Order
```http
POST /api/trading/order
Content-Type: application/json

{
  "action": {
    "type": "order",
    "orders": [...],
    "grouping": "na"
  },
  "nonce": 1234567890,
  "signature": "0x...",
  "vaultAddress": null
}
```

## 🔐 Security Features

- **MetaMask Signing**: All orders are signed locally in the user's wallet
- **No Private Keys**: Private keys never leave the user's MetaMask wallet
- **Rate Limiting**: Backend API has rate limiting to prevent abuse
- **Input Validation**: All inputs are validated before processing

## 🏗️ Technical Stack

### Backend
- **Express.js**: Web framework
- **Axios**: HTTP client for Hyperliquid API
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management
- **express-rate-limit**: API rate limiting

### Frontend
- **React.js**: UI library
- **Ethers.js v6**: Ethereum wallet integration
- **Axios**: HTTP client for backend API
- **MetaMask**: Wallet provider

## 📚 Hyperliquid API Documentation

For more information about the Hyperliquid API:
- [Official API Documentation](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)
- [Python SDK](https://github.com/hyperliquid-dex/hyperliquid-python-sdk)

## ⚙️ Order Specifications

### Order Structure

```javascript
{
  a: assetIndex,        // Asset index from market info
  b: isBuy,            // true for buy, false for sell
  p: "price",          // Price as string
  s: "size",           // Size as string
  r: false,            // Reduce only (false for opening positions)
  t: {                 // Order type
    limit: {
      tif: "Gtc"      // Time in force: Good til cancelled
    }
  }
}
```

### Signing Process

1. Create action object with order details
2. Generate nonce (current timestamp)
3. Concatenate: `JSON.stringify(action) + nonce`
4. Sign with MetaMask using `signer.signMessage()`
5. Submit signed order to backend

## 🧪 Testing

### Using Testnet

To test without real funds:

1. Change backend `.env`:
```env
HYPERLIQUID_API_URL=https://api.hyperliquid-testnet.xyz
```

2. Get testnet tokens from the [Hyperliquid faucet](https://app.hyperliquid-testnet.xyz/faucet)

## 🐛 Troubleshooting

### MetaMask Not Detected
- Ensure MetaMask extension is installed
- Refresh the page after installing MetaMask
- Check browser console for errors

### Order Fails
- Verify you're connected to the correct network
- Ensure you have sufficient balance
- Check that price and size are valid numbers
- Review backend logs for detailed error messages

### CORS Errors
- Ensure backend is running on port 5000
- Check that CORS is properly configured in `backend/src/server.js`
- Verify frontend `.env` has correct API URL

## 📝 Development

### Backend Development

```bash
cd backend
npm run dev  # Runs with nodemon for auto-reload
```

### Frontend Development

```bash
cd frontend
npm start  # Runs with hot-reload
```

## 🚢 Production Deployment

### Backend

```bash
cd backend
npm start
```

Set environment variables:
- `NODE_ENV=production`
- `HYPERLIQUID_API_URL=https://api.hyperliquid.xyz`

### Frontend

```bash
cd frontend
npm run build
```

Deploy the `build/` directory to your hosting service (Vercel, Netlify, etc.)

Update `REACT_APP_API_URL` to your production backend URL.

## ⚠️ Disclaimer

This application is for educational purposes. Trading perpetual futures involves significant risk. Always:
- Start with testnet
- Trade with caution
- Never invest more than you can afford to lose
- Do your own research (DYOR)

## 📄 License

MIT License - feel free to use this project for learning and development.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions:
- Check the [Hyperliquid documentation](https://hyperliquid.gitbook.io/)
- Review the code comments
- Open an issue in the repository

---

**Built with ❤️ for the Hyperliquid community**

