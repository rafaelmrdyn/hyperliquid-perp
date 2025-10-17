import { BrowserProvider } from 'ethers';

/**
 * Check if MetaMask is installed
 */
export function isMetaMaskInstalled() {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
}

/**
 * Get the Ethereum provider
 */
export function getProvider() {
  if (!isMetaMaskInstalled()) {
    throw new Error('MetaMask is not installed. Please install MetaMask extension.');
  }
  return new BrowserProvider(window.ethereum);
}

/**
 * Wait for MetaMask to be ready
 */
async function waitForMetaMask(timeout = 3000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    if (window.ethereum && window.ethereum.isMetaMask) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false;
}

/**
 * Connect to MetaMask wallet
 */
export async function connectWallet() {
  try {
    // Check if MetaMask is installed
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed. Please install MetaMask extension from https://metamask.io');
    }

    // Wait for MetaMask to be fully loaded
    const isReady = await waitForMetaMask();
    if (!isReady) {
      throw new Error('MetaMask is not ready. Please reload the page and try again.');
    }

    // Check if ethereum object is available
    if (!window.ethereum) {
      throw new Error('Ethereum provider not found. Please reload the page.');
    }

    // Check if MetaMask is locked
    try {
      const permissionsCheck = await window.ethereum.request({
        method: 'wallet_getPermissions'
      });
      console.log('Current permissions:', permissionsCheck);
    } catch (err) {
      console.log('Could not check permissions:', err.message);
    }
    
    // Request account access with better error handling
    let accounts;
    try {
      console.log('Requesting MetaMask accounts...');
      accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      console.log('MetaMask returned accounts:', accounts);
    } catch (err) {
      console.error('MetaMask request error:', err);
      
      if (err.code === 4001) {
        // User rejected the request
        throw new Error('You rejected the connection. Please try again and click "Connect" in MetaMask.');
      } else if (err.code === -32002) {
        // Request already pending
        throw new Error('Connection request already pending. Please open MetaMask and approve or reject the pending request.');
      } else if (err.code === -32603) {
        // Internal error
        throw new Error('MetaMask internal error. Please unlock MetaMask and try again.');
      } else {
        throw new Error(`MetaMask error (${err.code}): ${err.message || 'Failed to connect. Please unlock MetaMask and try again.'}`);
      }
    }
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found. Please create or import an account in MetaMask.');
    }
    
    console.log('Successfully connected to:', accounts[0]);
    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
}

/**
 * Get current connected account
 */
export async function getAccount() {
  try {
    if (!isMetaMaskInstalled()) {
      return null;
    }
    
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting account:', error);
    return null;
  }
}

/**
 * Get signer for signing transactions
 */
export async function getSigner() {
  const provider = getProvider();
  return provider.getSigner();
}

