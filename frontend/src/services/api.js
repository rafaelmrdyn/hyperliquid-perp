import axios from 'axios';

// Use relative URL when served from Express, or localhost for development
const API_BASE_URL = 'https://hyperliquid-perp.onrender.com/api';

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
 * Place an order through backend
 */
export async function placeOrder(signedOrder) {
  try {
    const response = await axios.post(`${API_BASE_URL}/trading/order`, signedOrder);
    return response.data;
  } catch (error) {
    console.error('Error placing order:', error);
    throw error;
  }
}

