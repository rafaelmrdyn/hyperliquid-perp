# Hyperliquid Trading Backend

Express.js backend API for Hyperliquid perpetual trading.

## API Endpoints

### Market Data

#### GET /api/market/info
Get all market information including available perpetual markets.

**Response:**
```json
[
  {
    "universe": [
      {
        "name": "BTC",
        "szDecimals": 5,
        ...
      }
    ]
  }
]
```

### Trading

#### POST /api/trading/order
Place a new order.

**Request Body:**
```json
{
  "action": {
    "type": "order",
    "orders": [
      {
        "a": 0,
        "b": true,
        "p": "50000",
        "s": "0.1",
        "r": false,
        "t": {
          "limit": {
            "tif": "Gtc"
          }
        }
      }
    ],
    "grouping": "na"
  },
  "nonce": 1234567890,
  "signature": "0x...",
  "vaultAddress": null
}
```

**Response:**
```json
{
  "status": "ok",
  "response": {
    "type": "order",
    "data": {...}
  }
}
```

## Running

```bash
npm install
npm run dev
```

## Environment Variables

```env
PORT=5000
HYPERLIQUID_API_URL=https://api.hyperliquid.xyz
```

