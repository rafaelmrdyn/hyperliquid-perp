import axios from 'axios';

const BASE_URL = process.env.HYPERLIQUID_API_URL || 'https://api-ui.hyperliquid.xyz';

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
    // Log the full payload we're sending
    console.log('🔄 Sending payload to Hyperliquid:');
    console.log('   Full payload:', JSON.stringify(signedOrder, null, 2));
    
    // Try to verify signature locally to see what address Hyperliquid will recover
    try {
      const { verifyTypedData } = await import('ethers');
      
      const connectionId = '0x0000000000000000000000000000000000000000000000000000000000000000';
      
      const domain = {
        name: 'HyperliquidSignTransaction',
        version: '1',
        chainId: 1,
        verifyingContract: '0x0000000000000000000000000000000000000000'
      };
      
      const types = {
        Agent: [
          { name: 'source', type: 'string' },
          { name: 'connectionId', type: 'bytes32' }
        ]
      };
      
      const message = {
        source: JSON.stringify(signedOrder.action),
        connectionId: connectionId
      };
      
      const sig = signedOrder.signature;
      const fullSig = '0x' + sig.r + sig.s + sig.v.toString(16).padStart(2, '0');
      
      const recoveredAddress = verifyTypedData(domain, types, message, fullSig);
      console.log('   🔍 Address recovered from signature:', recoveredAddress);
      console.log('   📝 This is the address Hyperliquid will check');
      
    } catch (verifyError) {
      console.log('   ⚠️  Could not verify signature locally:', verifyError.message);
    }

    console.log('🔄 Sending order to Hyperliquid:', JSON.stringify(signedOrder, null, 2));

    const res = await axios.post(`${BASE_URL}/exchange`, signedOrder, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    console.log('✅ Order placed successfully!');
    return res.data;
  } catch (error) {
    console.error('❌ Error placing order:', error.response?.data || error.message);
    if (error.response) {
      console.error('   Response status:', error.response.status);
      console.error('   Response data:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

