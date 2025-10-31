import { Hyperliquid } from 'hyperliquid';
import { Wallet } from 'ethers';
import { getApiWallet } from './apiWalletManager.js';

const sdkInstances = new Map();

/**
 * Get or create SDK instance for a specific user's API wallet
 */
function getSDK(userAddress) {
  if (sdkInstances.has(userAddress)) {
    return sdkInstances.get(userAddress);
  }
  
  // Get user's API wallet from storage
  const apiWalletData = getApiWallet(userAddress);
  
  if (!apiWalletData) {
    throw new Error(`No API wallet found for ${userAddress}. Please create one first.`);
  }
  
  if (!apiWalletData.authorized) {
    throw new Error(`API wallet not authorized for ${userAddress}. Please authorize it first.`);
  }
  
  const privateKey = apiWalletData.apiWalletPrivateKey;
  const apiWallet = new Wallet(privateKey);
  const vaultAddress = apiWalletData.userAddress; // Main wallet address (registered on Hyperliquid)
  
  console.log('🔧 Initializing Hyperliquid SDK...');
  console.log('   User (Vault):', vaultAddress);
  console.log('   API Wallet (Agent):', apiWallet.address);
  
  // API wallet trades on behalf of the registered main wallet
  const sdk = new Hyperliquid({
    privateKey: privateKey,
    walletAddress: vaultAddress, // Use main wallet as the trading account
    testnet: false,
    enableWs: false
  });
  
  sdkInstances.set(userAddress, sdk);
  return sdk;
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
export async function signAndPlaceOrder(userAddress, action, nonce) {
  if (!userAddress) {
    throw new Error('userAddress is required');
  }

  try {
    const sdk = getSDK(userAddress);
    
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
    
    // Place order using SDK (it will automatically format to correct decimals)
    // Don't pass vaultAddress - the SDK will use the wallet's own account
    const result = await sdk.exchange.placeOrder(sdkOrder);
    
    console.log('📥 Hyperliquid response:', JSON.stringify(result, null, 2));
    
    // Check if the result indicates an error
    if (result && result.status === 'err') {
      console.error('❌ Order failed:', result.response);
      throw new Error(result.response || 'Order placement failed');
    }
    
    console.log('✅ Order placed successfully!');
    
    return result;
    
  } catch (error) {
    console.error('❌ Error placing order:', error.message || error);
    if (error.response) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}
