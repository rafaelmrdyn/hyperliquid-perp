import React, { useState, useEffect } from 'react';
import './ApiWalletSetup.css';
import { checkApiWallet, createApiWallet, authorizeApiWallet } from '../services/api';
import { signAgentApproval } from '../utils/apiWalletAuth';

function ApiWalletSetup({ account, onComplete }) {
  const [status, setStatus] = useState('checking'); // checking, needsSetup, creating, authorizing, done, error
  const [apiWalletAddress, setApiWalletAddress] = useState(null);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    checkExistingWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account]);

  const checkExistingWallet = async () => {
    try {
      setStatus('checking');
      const result = await checkApiWallet(account);
      
      if (result.exists && result.authorized) {
        console.log('✅ API wallet already authorized:', result.apiWalletAddress);
        setApiWalletAddress(result.apiWalletAddress);
        setStatus('done');
        onComplete();
      } else if (result.exists && !result.authorized) {
        console.log('⚠️  API wallet exists but not authorized:', result.apiWalletAddress);
        setApiWalletAddress(result.apiWalletAddress);
        setStatus('needsAuthorization');
        setStep(2);
      } else {
        setStatus('needsSetup');
      }
    } catch (err) {
      console.error('Error checking API wallet:', err);
      setError('Failed to check API wallet status');
      setStatus('error');
    }
  };

  const handleCreateWallet = async () => {
    try {
      setStatus('creating');
      setError(null);
      
      console.log('🔑 Creating API wallet...');
      const result = await createApiWallet(account);
      
      if (result.success) {
        console.log('✅ API wallet created:', result.apiWalletAddress);
        setApiWalletAddress(result.apiWalletAddress);
        setStep(2);
        
        // Automatically proceed to authorization
        setTimeout(() => handleAuthorize(result.apiWalletAddress), 500);
      } else {
        throw new Error(result.message || 'Failed to create API wallet');
      }
    } catch (err) {
      console.error('Error creating API wallet:', err);
      setError(err.message || 'Failed to create API wallet');
      setStatus('error');
    }
  };

  const handleAuthorize = async (walletAddress = apiWalletAddress) => {
    try {
      setStatus('authorizing');
      setError(null);
      
      console.log('🔐 Checking MetaMask chain...');
      
      // Check if MetaMask is on Arbitrum One (chainId 42161)
      try {
        const currentChainId = await window.ethereum.request({ method: 'eth_chainId' });
        console.log('   Current chainId:', currentChainId);
        
        if (currentChainId !== '0xa4b1') { // 0xa4b1 = 42161 (Arbitrum One)
          console.log('   Switching to Arbitrum One (chainId 42161)...');
          
          try {
            // Try to switch to Arbitrum One
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0xa4b1' }],
            });
            console.log('   ✅ Switched to Arbitrum One');
          } catch (switchError) {
            // This error code indicates that the chain has not been added to MetaMask
            if (switchError.code === 4902) {
              console.log('   Chain not found, adding Arbitrum One...');
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                  {
                    chainId: '0xa4b1',
                    chainName: 'Arbitrum One',
                    nativeCurrency: {
                      name: 'Ether',
                      symbol: 'ETH',
                      decimals: 18,
                    },
                    rpcUrls: ['https://arb1.arbitrum.io/rpc'],
                    blockExplorerUrls: ['https://arbiscan.io'],
                  },
                ],
              });
              console.log('   ✅ Added and switched to Arbitrum One');
            } else {
              throw switchError;
            }
          }
        } else {
          console.log('   ✅ Already on Arbitrum One');
        }
      } catch (chainError) {
        console.error('Chain switching error:', chainError);
        if (chainError.code === 4001) {
          throw new Error('Please approve the chain switch to Arbitrum One in MetaMask to continue');
        }
        throw chainError;
      }
      
      console.log('📝 Requesting authorization signature from MetaMask...');
      
      // Sign agent approval with MetaMask
      const signedApproval = await signAgentApproval(account, walletAddress);
      
      console.log('📤 Sending signed approval to backend...');
      
      // Send to backend to authorize on Hyperliquid
      const result = await authorizeApiWallet(account, walletAddress, signedApproval);
      
      if (result.success) {
        console.log('✅ API wallet authorized successfully!');
        setStatus('done');
        setTimeout(() => onComplete(), 1000);
      } else {
        throw new Error(result.message || 'Failed to authorize API wallet');
      }
    } catch (err) {
      console.error('Error authorizing API wallet:', err);
      console.error('Error response:', err.response);
      console.error('Error response data:', err.response?.data);
      
      // Extract error message from backend response
      let errorMsg = 'Failed to authorize API wallet';
      
      if (err.response?.data) {
        // Try different possible error message locations
        errorMsg = err.response.data.error || 
                  err.response.data.message || 
                  err.response.data.response ||
                  JSON.stringify(err.response.data);
      } else if (err.message?.includes('rejected')) {
        errorMsg = 'Authorization rejected. Please approve the signature in MetaMask to continue.';
      } else if (err.message?.includes('chain switch')) {
        errorMsg = err.message;
      } else if (err.message) {
        errorMsg = err.message;
      }
      
      console.log('Extracted error message:', errorMsg);
      
      setError(errorMsg);
      setStatus('needsAuthorization');
    }
  };

  if (status === 'checking') {
    return (
      <div className="api-wallet-setup">
        <div className="setup-content">
          <div className="loading-spinner"></div>
          <p>Checking API wallet status...</p>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="api-wallet-setup">
        <div className="setup-content success">
          <div className="success-icon">✅</div>
          <h2>API Wallet Ready!</h2>
          <p className="wallet-address">
            {apiWalletAddress?.slice(0, 10)}...{apiWalletAddress?.slice(-8)}
          </p>
          <p>Loading trading interface...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="api-wallet-setup">
      <div className="setup-content">
        <h2>🔑 API Wallet Setup</h2>
        <p className="subtitle">
          Create an API wallet to sign trades automatically without MetaMask popups
        </p>

        <div className="setup-steps">
          <div className={`step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-info">
              <h3>Create API Wallet</h3>
              <p>Generate a secure wallet for automated trading</p>
            </div>
          </div>

          <div className={`step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-info">
              <h3>Authorize Agent</h3>
              <p>Sign once to approve API wallet for trading</p>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            ⚠️ {error}
          </div>
        )}

        {status === 'needsSetup' && (
          <button 
            className="setup-btn primary"
            onClick={handleCreateWallet}
          >
            Create API Wallet
          </button>
        )}

        {(status === 'creating') && (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Creating API wallet...</p>
          </div>
        )}

        {(status === 'needsAuthorization' || status === 'authorizing') && (
          <>
            {status === 'authorizing' ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Authorizing API wallet...</p>
                <p className="hint">Please check MetaMask and sign the approval</p>
              </div>
            ) : (
              <button 
                className="setup-btn primary"
                onClick={() => handleAuthorize()}
              >
                Authorize API Wallet
              </button>
            )}
          </>
        )}

        <div className="info-box">
          <h4>Why API Wallet?</h4>
          <ul>
            <li>✅ Sign trades automatically (no popups)</li>
            <li>✅ Faster order execution</li>
            <li>✅ Works on behalf of your main wallet</li>
            <li>✅ One-time authorization</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ApiWalletSetup;
