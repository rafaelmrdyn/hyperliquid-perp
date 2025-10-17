# 🚀 Quick Start Guide

Get started with Hyperliquid trading in 5 minutes!

## Step 1: Install Dependencies

```bash
# From the root directory
cd backend
npm install

cd ../frontend
npm install
```

## Step 2: Start the Backend

```bash
cd backend
npm run dev
```

You should see:
```
🚀 Backend server running on port 5000
📡 Hyperliquid API: https://api.hyperliquid.xyz
```

## Step 3: Start the Frontend

Open a new terminal:

```bash
cd frontend
npm start
```

The browser will automatically open to `http://localhost:3000`

## Step 4: Connect MetaMask

1. Click **"Connect MetaMask"** button
2. Approve the connection in the MetaMask popup
3. Your wallet address appears in the header

## Step 5: Place Your First Order

1. **Select a market** (e.g., BTC, ETH, SOL)
2. Choose **Buy/Long** or **Sell/Short**
3. Enter:
   - **Price**: e.g., `50000`
   - **Size**: e.g., `0.01`
4. Click the order button
5. **Sign in MetaMask** when prompted
6. Done! ✅

## 🧪 Testing Safely

### Use Testnet First!

1. Edit `backend/.env`:
   ```env
   HYPERLIQUID_API_URL=https://api.hyperliquid-testnet.xyz
   ```

2. Restart the backend

3. Get testnet tokens from [Hyperliquid Faucet](https://app.hyperliquid-testnet.xyz/faucet)

## 🎯 Trading Tips

- **Start small**: Test with tiny amounts first
- **Check totals**: Review the order total before submitting
- **Watch gas**: MetaMask will show the signing (no gas fees for signing)
- **Be patient**: Wait for order confirmation

## ⚠️ Common Issues

### "MetaMask not detected"
- Install MetaMask browser extension
- Refresh the page

### "Failed to place order"
- Check backend is running (port 5000)
- Verify you're connected in MetaMask
- Check browser console for errors

### CORS errors
- Ensure backend is running
- Check frontend `.env` has `REACT_APP_API_URL=http://localhost:5000/api`

## 📚 Next Steps

- Read the full [README.md](./README.md)
- Explore the [Hyperliquid API docs](https://hyperliquid.gitbook.io/hyperliquid-docs/for-developers/api)
- Review the code to understand the signing process

---

**Happy Trading! 🎉**

