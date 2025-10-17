import { getSigner } from './wallet';
import { Signature } from 'ethers';

/**
 * Create a signed order for Hyperliquid
 * Uses simple message signing - Hyperliquid will verify the signature on their end
 */
export async function createSignedOrder({ 
  address, 
  assetIndex, 
  isBuy, 
  size, 
  price, 
  reduceOnly = false 
}) {
  try {
    const signer = await getSigner();
    
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
    
    // Create the message exactly as Hyperliquid expects
    // Format: stringified action object concatenated with nonce
    const actionString = JSON.stringify(action);
    const messageToSign = actionString + nonce.toString();
    
    console.log('📝 Message to sign:', messageToSign.substring(0, 150) + '...');
    console.log('📝 Message length:', messageToSign.length);
    
    // Sign with MetaMask - this uses Ethereum's personal_sign
    const signatureHex = await signer.signMessage(messageToSign);
    
    console.log('✍️ Signature created:', signatureHex);
    
    // Parse signature into r, s, v components (Hyperliquid expects this format)
    const sig = Signature.from(signatureHex);
    const signature = {
      r: sig.r,
      s: sig.s,
      v: sig.v
    };
    
    console.log('✍️ Signature components:', signature);
    console.log('📍 User address:', address);
    
    // Return the complete signed order in Hyperliquid format
    return {
      action,
      nonce,
      signature,
      vaultAddress: null  // null means user's own account (not a vault)
    };
  } catch (error) {
    console.error('Error creating signed order:', error);
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

