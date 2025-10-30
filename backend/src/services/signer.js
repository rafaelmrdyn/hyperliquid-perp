import { Hyperliquid } from 'hyperliquid';
import { Wallet } from 'ethers';

let sdkInstance = null;

/**
 * Get or create SDK instance with proper configuration
 */
function getSDK() {
  if (!sdkInstance) {
    const privateKey = process.env.API_WALLET_PRIVATE_KEY;
    const vaultAddress = process.env.VAULT_ADDRESS;
    
    if (!privateKey || privateKey === 'YOUR_API_PRIVATE_KEY_HERE') {
      throw new Error('API_WALLET_PRIVATE_KEY not configured');
    }
    
    // Get API wallet address from private key
    const apiWallet = new Wallet(privateKey);
    
    console.log('🔧 Initializing Hyperliquid SDK...');
    console.log('   API Wallet:', apiWallet.address);
    console.log('   Vault Address:', vaultAddress);
    
    sdkInstance = new Hyperliquid({
      privateKey: privateKey,
      walletAddress: apiWallet.address, // API wallet address
      testnet: false, // mainnet
      enableWs: false // disable WebSocket for now
    });
  }
  return sdkInstance;
}

/**
 * Convert raw Hyperliquid order format to SDK format
 */
function convertOrderFormat(rawOrder, assetName) {
  return {
    coin: assetName,
    is_buy: rawOrder.b,
    sz: rawOrder.s,
    limit_px: rawOrder.p,
    order_type: rawOrder.t,
    reduce_only: rawOrder.r
  };
}

/**
 * Place order using official Hyperliquid SDK
 */
export async function signAndPlaceOrder(action, nonce) {
  const vaultAddress = process.env.VAULT_ADDRESS;
  
  if (!vaultAddress) {
    throw new Error('VAULT_ADDRESS not configured');
  }

  try {
    const sdk = getSDK();
    
    console.log('📦 Received action:', JSON.stringify(action, null, 2));
    
    // Convert raw order format to SDK format
    // We need to map asset index to coin name
    const assetIndex = action.orders[0].a;
    
    // Common perpetuals mapping (use exact SDK format)
    const assetMap = {
      0: 'BTC-PERP',
      1: 'ETH-PERP',
      2: 'SOL-PERP',
      3: 'ARB-PERP',
      4: 'MATIC-PERP',
      5: 'DOGE-PERP'
    };
    
    const coinName = assetMap[assetIndex] || `ASSET-${assetIndex}`;
    
    console.log(`📝 Asset index ${assetIndex} → ${coinName}`);
    
    // Convert order format
    const rawOrder = action.orders[0];
    
    // Round price to appropriate tick size based on asset
    // BTC-PERP tick size is $1, ETH-PERP is $0.1, others vary
    let price = parseFloat(rawOrder.p);
    if (coinName === 'BTC-PERP') {
      price = Math.round(price); // BTC tick size = $1
    } else if (coinName === 'ETH-PERP') {
      price = Math.round(price * 10) / 10; // ETH tick size = $0.1
    } else {
      price = Math.round(price * 100) / 100; // Default tick size = $0.01
    }
    
    const sdkOrder = {
      coin: coinName,
      is_buy: rawOrder.b,
      sz: parseFloat(rawOrder.s),
      limit_px: price,
      order_type: rawOrder.t,
      reduce_only: rawOrder.r
    };
    
    console.log(`📊 Price adjusted for tick size: ${rawOrder.p} → ${price}`);
    
    console.log('📤 Placing order via SDK:', JSON.stringify(sdkOrder, null, 2));
    console.log('🏦 Vault address:', vaultAddress);
    
    // Place order using SDK (it will automatically format to correct decimals)
    // Don't pass vaultAddress - the SDK will use the wallet's own account
    const result = await sdk.exchange.placeOrder(sdkOrder);
    
    console.log('✅ Order placed successfully!', JSON.stringify(result, null, 2));
    
    return result;
    
  } catch (error) {
    console.error('❌ Error placing order:', error.message || error);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}
