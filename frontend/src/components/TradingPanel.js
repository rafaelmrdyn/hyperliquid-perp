import React, { useState, useEffect } from 'react';
import './TradingPanel.css';
import { createSignedOrder, formatPrice, formatSize } from '../utils/signing';
import { placeOrder, getMarketInfo } from '../services/api';

function TradingPanel({ market, account }) {
  const [orderType, setOrderType] = useState('buy');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);

  // Fetch current market price when market changes
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        setPriceLoading(true);
        const data = await getMarketInfo();
        // Get the price data for the current market (index 1 in the response array)
        if (data[1] && data[1][market.index]) {
          const marketData = data[1][market.index];
          // Use mid price (average of bid and ask)
          const midPrice = marketData.midPx || marketData.markPx;
          if (midPrice) {
            setCurrentPrice(parseFloat(midPrice));
          }
        }
      } catch (err) {
        console.error('Error fetching current price:', err);
      } finally {
        setPriceLoading(false);
      }
    };

    fetchCurrentPrice();
    // Refresh price every 10 seconds
    const interval = setInterval(fetchCurrentPrice, 10000);
    return () => clearInterval(interval);
  }, [market]);

  // Auto-fill current price
  const handleUseMarketPrice = () => {
    if (currentPrice) {
      setPrice(currentPrice.toString());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!price || !size) {
      setError('Please enter both price and size');
      return;
    }

    if (parseFloat(price) <= 0 || parseFloat(size) <= 0) {
      setError('Price and size must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Format the values
      const formattedPrice = formatPrice(price, market.szDecimals);
      const formattedSize = formatSize(size, market.szDecimals);

      // Create unsigned order (backend will sign with API wallet)
      const unsignedOrder = await createSignedOrder({
        assetIndex: market.index,
        isBuy: orderType === 'buy',
        size: formattedSize,
        price: formattedPrice,
        reduceOnly: false
      });

      // Place order through backend (backend will sign it)
      const result = await placeOrder(unsignedOrder);
      
      console.log('Order result:', result);
      
      if (result.status === 'ok') {
        setSuccess(`✅ Order placed successfully! ${orderType.toUpperCase()} ${formattedSize} ${market.name} @ $${formattedPrice}`);
        setPrice('');
        setSize('');
      } else {
        // Show detailed error from Hyperliquid
        const errorMsg = result.response || 'Failed to place order';
        
        // Check for common errors and provide helpful messages
        if (errorMsg.includes('does not exist')) {
          setError(
            `❌ Wallet Not Registered: Your wallet (${account.substring(0, 6)}...${account.substring(account.length - 4)}) is not registered on Hyperliquid. ` +
            `Please visit https://app.hyperliquid.xyz to register and deposit funds first.`
          );
        } else if (errorMsg.includes('insufficient')) {
          setError(`❌ Insufficient Funds: ${errorMsg}`);
        } else if (errorMsg.includes('signature')) {
          setError(`❌ Signature Error: ${errorMsg}`);
        } else {
          setError(`❌ ${errorMsg}`);
        }
      }
    } catch (err) {
      console.error('Error placing order:', err);
      setError(err.response?.data?.message || err.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trading-panel">
      <div className="panel-header">
        <h2>{market.name} Perpetual</h2>
        <span className="market-badge">PERP</span>
      </div>

      <div className="order-type-selector">
        <button
          className={`order-type-btn ${orderType === 'buy' ? 'active buy' : ''}`}
          onClick={() => setOrderType('buy')}
        >
          Buy / Long
        </button>
        <button
          className={`order-type-btn ${orderType === 'sell' ? 'active sell' : ''}`}
          onClick={() => setOrderType('sell')}
        >
          Sell / Short
        </button>
      </div>

      {error && <div className="message error-message">{error}</div>}
      {success && <div className="message success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="order-form">
        <div className="form-group">
          <label>
            Price (USD)
            {currentPrice && (
              <span className="current-price">
                Market: ${currentPrice.toFixed(market.szDecimals || 2)}
                <button
                  type="button"
                  className="use-market-btn"
                  onClick={handleUseMarketPrice}
                  disabled={loading || priceLoading}
                >
                  Use
                </button>
              </span>
            )}
          </label>
          <input
            type="number"
            step="any"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder={currentPrice ? `Market: $${currentPrice.toFixed(2)}` : "Enter price"}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Size ({market.name})</label>
          <input
            type="number"
            step="any"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="Enter size"
            disabled={loading}
          />
        </div>

        <div className="order-summary">
          <div className="summary-row">
            <span>Total:</span>
            <span className="summary-value">
              {price && size ? `$${(parseFloat(price) * parseFloat(size)).toFixed(2)}` : '-'}
            </span>
          </div>
        </div>

        <button
          type="submit"
          className={`submit-btn ${orderType}`}
          disabled={loading || !price || !size}
        >
          {loading ? 'Placing Order...' : `${orderType === 'buy' ? 'Buy' : 'Sell'} ${market.name}`}
        </button>
      </form>

      <div className="trading-info">
        <p>🔐 Orders are signed securely with your MetaMask wallet</p>
        <p>📊 Trading perpetual futures with limit orders (GTC)</p>
      </div>
    </div>
  );
}

export default TradingPanel;

