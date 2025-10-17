import React, { useState, useEffect } from 'react';
import './App.css';
import { connectWallet, getAccount, isMetaMaskInstalled } from './utils/wallet';
import { getMarketInfo } from './services/api';
import TradingPanel from './components/TradingPanel';
import MarketSelector from './components/MarketSelector';

function App() {
  const [account, setAccount] = useState(null);
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if already connected
    const checkConnection = async () => {
      try {
        const connectedAccount = await getAccount();
        if (connectedAccount) {
          setAccount(connectedAccount);
          loadMarkets();
        }
      } catch (err) {
        console.log('Not connected yet:', err.message);
      }
    };
    
    // Check MetaMask installation
    if (!isMetaMaskInstalled()) {
      console.warn('MetaMask is not installed');
    } else {
      console.log('MetaMask detected!');
      checkConnection();
    }
  }, []);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const data = await getMarketInfo();
      
      // Extract market data
      const marketList = data[0].universe.map((asset, index) => ({
        name: asset.name,
        index: index,
        szDecimals: asset.szDecimals
      }));
      
      setMarkets(marketList);
      if (marketList.length > 0) {
        setSelectedMarket(marketList[0]);
      }
      setError(null);
    } catch (err) {
      console.error('Error loading markets:', err);
      setError('Failed to load markets');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!isMetaMaskInstalled()) {
      setError('MetaMask is not installed!');
      alert('Please install MetaMask browser extension to use this application!\n\nVisit: https://metamask.io/download/');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const connectedAccount = await connectWallet();
      if (connectedAccount) {
        setAccount(connectedAccount);
        await loadMarkets();
      }
    } catch (err) {
      console.error('Error connecting wallet:', err);
      const errorMessage = err.message || 'Failed to connect to MetaMask. Please try again.';
      setError(errorMessage);
      
      // Show user-friendly alert
      if (err.message?.includes('rejected')) {
        alert('Connection rejected. Please approve the connection in MetaMask to continue.');
      } else if (err.message?.includes('pending')) {
        alert('Connection request is already pending. Please check your MetaMask extension.');
      } else {
        alert(`Failed to connect: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🚀 Hyperliquid Perpetual Trading</h1>
        {!account ? (
          <button onClick={handleConnect} disabled={loading} className="connect-btn">
            {loading ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        ) : (
          <div className="wallet-info">
            <span className="wallet-badge">
              {account.slice(0, 6)}...{account.slice(-4)}
            </span>
          </div>
        )}
      </header>

      <main className="App-main">
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {!account ? (
          <div className="welcome-card">
            <h2>Welcome to Hyperliquid Trading</h2>
            <p>Connect your MetaMask wallet to start trading perpetual futures</p>
            <ul className="features-list">
              <li>✅ Trade perpetual futures</li>
              <li>✅ Secure MetaMask integration</li>
              <li>✅ Real-time market data</li>
            </ul>
          </div>
        ) : (
          <div className="trading-container">
            {loading && markets.length === 0 ? (
              <div className="loading">Loading markets...</div>
            ) : (
              <>
                <MarketSelector
                  markets={markets}
                  selectedMarket={selectedMarket}
                  onSelectMarket={setSelectedMarket}
                />
                {selectedMarket && (
                  <TradingPanel
                    market={selectedMarket}
                    account={account}
                  />
                )}
              </>
            )}
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>
          Powered by <a href="https://hyperliquid.xyz" target="_blank" rel="noopener noreferrer">Hyperliquid</a>
        </p>
      </footer>
    </div>
  );
}

export default App;

