import axios from 'axios';

const BASE_URL = process.env.HYPERLIQUID_API_URL || 'https://api.hyperliquid.xyz';

/**
 * Get all market information including meta and asset contexts
 */
export async function getMarketInfo() {
  try {
    const res = await axios.post(`https://api.hyperliquid.xyz/info`, {
      type: 'metaAndAssetCtxs'
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching market info:', error.message);
    throw error;
  }
}

/**
 * Place an order on Hyperliquid
 */
export async function placeOrder(signedOrder) {
  try {
    // Send the order exactly as received from frontend
    console.log('🔄 Sending payload to Hyperliquid:', JSON.stringify(signedOrder, null, 2));
    
    const res = await axios.post(`${BASE_URL}/exchange`, signedOrder, {
      headers: { 'Content-Type': 'application/json' }
    });
    return res.data;
  } catch (error) {
    console.error('❌ Error placing order:', error.response?.data || error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
}

