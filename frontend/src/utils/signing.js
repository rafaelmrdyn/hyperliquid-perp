/**
 * Create an unsigned order for Hyperliquid
 * Signing will happen on the backend with API wallet
 */
export async function createSignedOrder({ 
  assetIndex, 
  isBuy, 
  size, 
  price, 
  reduceOnly = false 
}) {
  try {
    // Create the order action payload according to Hyperliquid spec
    const action = {
      type: 'order',
      orders: [
        {
          a: assetIndex,           // asset index
          b: isBuy,                // is buy
          p: price,                // price as string
          s: size,                 // size as string
          r: reduceOnly,           // reduce only
          t: { 
            limit: { 
              tif: 'Gtc'          // time in force: Good til cancelled
            } 
          }
        }
      ],
      grouping: 'na'
    };

    const nonce = Date.now();

    console.log('📦 Created unsigned order (backend will sign)');
    console.log('   Action:', JSON.stringify(action).substring(0, 100) + '...');
    console.log('   Nonce:', nonce);
    
    // Return unsigned order - backend will sign with API wallet
    return {
      action,
      nonce
    };
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Format price to match market specifications
 */
export function formatPrice(price, szDecimals = 8) {
  return Number(price).toFixed(szDecimals);
}

/**
 * Format size to match market specifications
 */
export function formatSize(size, szDecimals = 8) {
  return Number(size).toFixed(szDecimals);
}

