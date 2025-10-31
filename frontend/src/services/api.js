import axios from 'axios';

// Use relative URL when served from Express, or localhost for development
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * Get market information from backend
 */
export async function getMarketInfo() {
  try {
    const response = await axios.get(`${API_BASE_URL}/market/info`);
    return response.data;
  } catch (error) {
    console.error('Error fetching market info:', error);
    throw error;
  }
}

/**
 * Place an order through backend using API wallet
 */
export async function placeOrder(userAddress, action, nonce) {
  try {
    const response = await axios.post(`${API_BASE_URL}/trading/order`, {
      userAddress,
      action,
      nonce
    });
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
}

/**
 * Check if user has an API wallet
 */
export async function checkApiWallet(userAddress) {
  try {
    const response = await axios.get(`${API_BASE_URL}/wallet/check/${userAddress}`);
    return response.data;
  } catch (error) {
    console.error('Error checking API wallet:', error);
    throw error;
  }
}

/**
 * Create a new API wallet for user
 */
export async function createApiWallet(userAddress) {
  try {
    const response = await axios.post(`${API_BASE_URL}/wallet/create`, { userAddress });
    return response.data;
  } catch (error) {
    console.error('Error creating API wallet:', error);
    throw error;
  }
}

/**
 * Authorize API wallet with signed data
 */
export async function authorizeApiWallet(userAddress, apiWalletAddress, signedAction) {
  try {
    const response = await axios.post(`${API_BASE_URL}/wallet/authorize`, {
      userAddress,
      apiWalletAddress,
      signedAction
    });
    return response.data;
  } catch (error) {
    console.error('Error authorizing API wallet:', error);
    throw error;
  }
}

